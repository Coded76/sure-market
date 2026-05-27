import axios from 'axios'
import { AppError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { logAPIRequest } from '@/server/logger'
import Transaction from '@/models/Transaction'
import { WalletService } from './WalletService'
import { connectDB } from '@/lib/db'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''

interface PaystackInitializePaymentResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyPaymentResponse {
  status: boolean
  message: string
  data: {
    id: number
    reference: string
    amount: number
    paid_at: string
    status: string
    customer: any
    metadata?: {
      userId?: string
      orderId?: string
    }
  }
}

export class PaystackService {
  /**
   * Initialize a payment transaction
   */
  static async initializePayment(data: {
    amount: number // in lowest denomination (cents for USD, kobo for NGN)
    email: string
    userId: string
    currency?: string
    metadata?: Record<string, any>
  }): Promise<{
    authorizationUrl: string
    accessCode: string
    reference: string
  }> {
    const startTime = Date.now()

    try {
      const response = await axios.post<PaystackInitializePaymentResponse>(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          amount: data.amount,
          email: data.email,
          currency: data.currency || 'USD',
          metadata: {
            userId: data.userId,
            ...data.metadata,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      const duration = Date.now() - startTime

      // Log successful call
      await logAPIRequest('paystack', '/transaction/initialize', 'POST', {
        statusCode: 200,
        success: true,
        responseBody: response.data,
        duration,
        userId: data.userId,
      })

      if (!response.data.status) {
        throw new AppError(
          400,
          response.data.message || 'Failed to initialize payment',
          ERROR_CODES.PAYMENT_FAILED
        )
      }

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      }
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Paystack payment initialization failed', { error })

      await logAPIRequest('paystack', '/transaction/initialize', 'POST', {
        statusCode: error instanceof AppError ? 400 : 500,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        duration,
        userId: data.userId,
      })

      throw new AppError(
        500,
        'Failed to initialize payment',
        ERROR_CODES.PAYMENT_FAILED
      )
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(reference: string): Promise<{
    success: boolean
    amount: number
    reference: string
    userId?: string
  }> {
    const startTime = Date.now()

    try {
      const response = await axios.get<PaystackVerifyPaymentResponse>(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      const duration = Date.now() - startTime

      const success = response.data.status && response.data.data.status === 'success'

      // Log API call
      await logAPIRequest('paystack', `/transaction/verify/${reference}`, 'GET', {
        statusCode: 200,
        success,
        responseBody: response.data,
        duration,
      })

      if (!success) {
        throw new AppError(
          400,
          'Payment verification failed',
          ERROR_CODES.PAYMENT_VERIFICATION_FAILED
        )
      }

      return {
        success: true,
        amount: response.data.data.amount,
        reference: response.data.data.reference,
        userId: response.data.data.metadata?.userId,
      }
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Paystack payment verification failed', { error })

      await logAPIRequest('paystack', `/transaction/verify/${reference}`, 'GET', {
        statusCode: error instanceof AppError ? 400 : 500,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        duration,
      })

      throw new AppError(
        500,
        'Failed to verify payment',
        ERROR_CODES.PAYMENT_VERIFICATION_FAILED
      )
    }
  }

  /**
   * Create a payment transaction record and top up wallet
   * Call this after payment verification
   */
  static async processPaymentSuccess(
    userId: string,
    amount: number,
    paystackReference: string
  ): Promise<void> {
    await connectDB()

    // Create transaction record
    await WalletService.topUp(userId, amount, {
      paymentGateway: 'paystack',
      paymentGatewayReference: paystackReference,
      paymentMethod: 'card',
    })

    logger.info('Payment processed successfully', {
      userId,
      amount,
      reference: paystackReference,
    })
  }

  /**
   * Handle failed payment
   */
  static async handlePaymentFailure(
    userId: string,
    amount: number,
    paystackReference: string,
    reason?: string
  ): Promise<void> {
    await connectDB()

    // Create failed transaction record
    await Transaction.create({
      userId,
      type: 'topup',
      amount,
      currency: 'USD',
      status: 'failed',
      description: `Failed payment: ${reason || 'Unknown reason'}`,
      paymentGateway: 'paystack',
      paymentGatewayReference: paystackReference,
      failureReason: reason,
    })

    logger.warn('Payment failed', {
      userId,
      amount,
      reference: paystackReference,
      reason,
    })
  }

  /**
   * Get payment public key (for frontend)
   */
  static getPublicKey(): string {
    return PAYSTACK_PUBLIC_KEY
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    body: any,
    signature: string
  ): boolean {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex')

    return hash === signature
  }
}
