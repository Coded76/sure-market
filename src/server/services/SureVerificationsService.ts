import axios, { AxiosError } from 'axios'
import { AppError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { logAPIRequest } from '@/server/logger'

const BASE_URL = process.env.SUREVERIFICATIONS_BASE_URL || 'https://api.sureverifications.com/v1'
const API_KEY = process.env.SUREVERIFICATIONS_API_KEY || ''

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

/**
 * Wrapper for API calls with retry logic
 */
async function apiCall<T>(
  method: 'GET' | 'POST',
  endpoint: string,
  data?: any,
  retryCount: number = 0
): Promise<T> {
  const startTime = Date.now()
  const url = `${BASE_URL}${endpoint}`

  try {
    const config: any = {
      method,
      url,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }

    if (data) {
      config.data = data
    }

    const response = await axios(config)
    const duration = Date.now() - startTime

    // Log successful API call
    await logAPIRequest('sureverifications', endpoint, method, {
      statusCode: response.status,
      success: true,
      responseBody: response.data,
      duration,
      retryCount,
    })

    return response.data
  } catch (error) {
    const duration = Date.now() - startTime
    const axiosError = error as AxiosError

    logger.error(`SureVerifications API Error: ${endpoint}`, {
      status: axiosError.response?.status,
      message: axiosError.message,
      retryCount,
    })

    // Log failed API call
    await logAPIRequest('sureverifications', endpoint, method, {
      statusCode: axiosError.response?.status || 0,
      success: false,
      errorMessage: axiosError.message,
      errorStack: axiosError.stack,
      duration,
      retryCount,
    })

    // Retry logic for transient errors
    if (
      retryCount < MAX_RETRIES &&
      (axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ENOTFOUND' ||
        axiosError.response?.status === 429 ||
        axiosError.response?.status === 503 ||
        axiosError.response?.status === 504)
    ) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount)
      logger.warn(`Retrying after ${delay}ms`, { endpoint, retryCount })
      await new Promise((resolve) => setTimeout(resolve, delay))
      return apiCall<T>(method, endpoint, data, retryCount + 1)
    }

    // Throw specific error
    if (axiosError.response?.status === 401) {
      throw new AppError(
        500,
        'Provider API authentication failed',
        ERROR_CODES.PROVIDER_ERROR
      )
    }

    if (axiosError.response?.status === 429) {
      throw new AppError(
        429,
        'Too many requests to provider',
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      )
    }

    if (axiosError.response?.status === 404) {
      throw new AppError(
        404,
        'Resource not found on provider',
        ERROR_CODES.PROVIDER_ERROR
      )
    }

    throw new AppError(
      500,
      'Provider API error',
      ERROR_CODES.PROVIDER_ERROR
    )
  }
}

export class SureVerificationsService {
  /**
   * Get provider balance
   */
  static async getBalance(): Promise<{
    balance: number
    currency: string
  }> {
    const result = await apiCall<any>('GET', '/balance')
    return {
      balance: result.balance || 0,
      currency: result.currency || 'USD',
    }
  }

  /**
   * Get supported countries
   */
  static async getCountries(): Promise<
    Array<{
      code: string
      name: string
      flag: string
    }>
  > {
    const result = await apiCall<any>('GET', '/countries')
    return result.countries || []
  }

  /**
   * Get services for Server 1 (Local)
   */
  static async getServicesLocal(countryCode?: string): Promise<
    Array<{
      id: string
      name: string
      price: number
    }>
  > {
    const endpoint = countryCode
      ? `/services/local?country=${countryCode}`
      : '/services/local'
    const result = await apiCall<any>('GET', endpoint)
    return result.services || []
  }

  /**
   * Get services for Server 2 (Global)
   */
  static async getServicesGlobal(countryCode?: string): Promise<
    Array<{
      id: string
      name: string
      price: number
    }>
  > {
    const endpoint = countryCode
      ? `/services/global?country=${countryCode}`
      : '/services/global'
    const result = await apiCall<any>('GET', endpoint)
    return result.services || []
  }

  /**
   * Get pricing for Server 1 (Local)
   */
  static async getPriceLocal(service: string, country: string): Promise<{
    price: number
    currency: string
  }> {
    const result = await apiCall<any>(
      'GET',
      `/price/local?service=${service}&country=${country}`
    )
    return {
      price: result.price || 0,
      currency: result.currency || 'USD',
    }
  }

  /**
   * Get pricing options for Server 2 (Global)
   */
  static async getPriceGlobal(service: string, country: string): Promise<{
    price: number
    currency: string
  }> {
    const result = await apiCall<any>(
      'GET',
      `/price/global?service=${service}&country=${country}`
    )
    return {
      price: result.price || 0,
      currency: result.currency || 'USD',
    }
  }

  /**
   * Purchase number from Server 1 (Local)
   */
  static async purchaseNumberLocal(data: {
    service: string
    country: string
  }): Promise<{
    id: string
    phone_number: string
  }> {
    const result = await apiCall<any>('POST', '/purchase/local', data)

    if (!result.id || !result.phone_number) {
      throw new AppError(
        500,
        'Invalid provider response',
        ERROR_CODES.INVALID_PROVIDER_RESPONSE
      )
    }

    return {
      id: result.id,
      phone_number: result.phone_number,
    }
  }

  /**
   * Purchase number from Server 2 (Global)
   */
  static async purchaseNumberGlobal(data: {
    service: string
    country: string
  }): Promise<{
    id: string
    phone_number: string
  }> {
    const result = await apiCall<any>('POST', '/purchase/global', data)

    if (!result.id || !result.phone_number) {
      throw new AppError(
        500,
        'Invalid provider response',
        ERROR_CODES.INVALID_PROVIDER_RESPONSE
      )
    }

    return {
      id: result.id,
      phone_number: result.phone_number,
    }
  }

  /**
   * Purchase number - unified interface
   */
  static async purchaseNumber(
    server: 'local' | 'global',
    data: { service: string; country: string }
  ): Promise<{
    id: string
    phone_number: string
  }> {
    if (server === 'local') {
      return this.purchaseNumberLocal(data)
    } else {
      return this.purchaseNumberGlobal(data)
    }
  }

  /**
   * Get SMS content
   */
  static async getSMS(
    server: 'local' | 'global',
    orderId: string
  ): Promise<{
    sms?: string
    status?: string
  }> {
    const endpoint = `/sms?id=${orderId}&server=${server}`
    const result = await apiCall<any>('GET', endpoint)
    return {
      sms: result.sms,
      status: result.status,
    }
  }

  /**
   * Cancel verification
   */
  static async cancelVerification(
    server: 'local' | 'global',
    orderId: string
  ): Promise<{
    success: boolean
  }> {
    const endpoint = `/cancel`
    const result = await apiCall<any>('POST', endpoint, {
      id: orderId,
      server,
    })
    return {
      success: result.success || false,
    }
  }

  /**
   * Get all supported countries with caching potential
   */
  static async getSupportedCountries(): Promise<Map<string, any>> {
    try {
      const countries = await this.getCountries()
      const map = new Map()
      countries.forEach((c) => {
        map.set(c.code, c)
      })
      return map
    } catch (error) {
      logger.error('Failed to fetch countries from provider', { error })
      return new Map() // Return empty map on failure
    }
  }

  /**
   * Validate if service is available
   */
  static async isServiceAvailable(
    server: 'local' | 'global',
    service: string,
    country: string
  ): Promise<boolean> {
    try {
      const services =
        server === 'local'
          ? await this.getServicesLocal(country)
          : await this.getServicesGlobal(country)

      return services.some((s) => s.id === service)
    } catch {
      return false
    }
  }

  /**
   * Check provider connectivity
   */
  static async healthCheck(): Promise<boolean> {
    try {
      await this.getBalance()
      return true
    } catch {
      return false
    }
  }
}
