import Cookies from 'js-cookie'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'suremarket_token'

interface ApiError {
  error: {
    message: string
    code: string
  }
}

interface ApiResponse<T> {
  data?: T
  error?: ApiError
  status: number
}

interface AuthTokenResponse {
  token: string
}

/**
 * Make API request with automatic token handling
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}/api/v1${endpoint}`
  const token = Cookies.get(TOKEN_KEY)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    return {
      data: !data.error ? data : undefined,
      error: data.error,
      status: response.status,
    }
  } catch (error) {
    return {
      error: {
        error: {
          message: 'Network error',
          code: 'NETWORK_ERROR',
        },
      },
      status: 0,
    }
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  register: async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    country?: string
  }): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await request<AuthTokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response.data?.token) {
      Cookies.set(TOKEN_KEY, response.data.token, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      })
    }

    return response
  },

  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await request<AuthTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.data?.token) {
      Cookies.set(TOKEN_KEY, response.data.token, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      })
    }

    return response
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY)
  },

  getToken: () => Cookies.get(TOKEN_KEY),
}

/**
 * Wallet API
 */
export const walletAPI = {
  getBalance: (): Promise<ApiResponse<any>> =>
    request('/wallet/balance', { method: 'GET' }),

  getTransactions: (
    type?: string,
    status?: string,
    limit = 50,
    skip = 0
  ): Promise<ApiResponse<any>> =>
    request(
      `/wallet/transactions?type=${type}&status=${status}&limit=${limit}&skip=${skip}`,
      { method: 'GET' }
    ),
}

/**
 * Orders API
 */
export const ordersAPI = {
  create: (data: {
    serviceType: 'local' | 'global'
    service: string
    country: string
    price: number
  }): Promise<ApiResponse<any>> =>
    request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrder: (orderId: string): Promise<ApiResponse<any>> =>
    request(`/orders/${orderId}`, { method: 'GET' }),

  getSMS: (orderId: string): Promise<ApiResponse<any>> =>
    request(`/orders/${orderId}/sms`, { method: 'GET' }),

  getStatus: (orderId: string): Promise<ApiResponse<any>> =>
    request(`/orders/${orderId}/status`, { method: 'GET' }),

  getHistory: (limit = 50, skip = 0): Promise<ApiResponse<any>> =>
    request(`/orders?limit=${limit}&skip=${skip}`, { method: 'GET' }),

  cancel: (orderId: string, reason?: string): Promise<ApiResponse<any>> =>
    request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

/**
 * User Profile API
 */
export const userAPI = {
  getProfile: (): Promise<ApiResponse<any>> =>
    request('/user/profile', { method: 'GET' }),

  updateProfile: (data: {
    firstName?: string
    lastName?: string
    country?: string
    phoneNumber?: string
    bio?: string
  }): Promise<ApiResponse<any>> =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> =>
    request('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  generateApiKey: (): Promise<ApiResponse<any>> =>
    request('/user/api-key/regenerate', { method: 'POST' }),
}

/**
 * Admin API
 */
export const adminAPI = {
  getUsers: (
    page = 1,
    limit = 20,
    status?: string,
    search?: string
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status }),
      ...(search && { search }),
    })
    return request(`/admin/users?${params}`, { method: 'GET' })
  },

  manageUser: (
    userId: string,
    action: 'suspend' | 'activate' | 'refund',
    options?: {
      reason?: string
      amount?: number
    }
  ): Promise<ApiResponse<any>> =>
    request(`/admin/users/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ action, ...options }),
    }),

  getStats: (): Promise<ApiResponse<any>> =>
    request('/admin/stats', { method: 'GET' }),

  getTransactions: (
    page = 1,
    limit = 50
  ): Promise<ApiResponse<any>> =>
    request(
      `/admin/transactions?page=${page}&limit=${limit}`,
      { method: 'GET' }
    ),

  getOrders: (page = 1, limit = 50): Promise<ApiResponse<any>> =>
    request(`/admin/orders?page=${page}&limit=${limit}`, { method: 'GET' }),
}

/**
 * Services API
 */
export const servicesAPI = {
  getCountries: (): Promise<ApiResponse<any>> =>
    request('/services/countries', { method: 'GET' }),

  getServices: (
    server: 'local' | 'global',
    country?: string
  ): Promise<ApiResponse<any>> =>
    request(
      `/services/${server}${country ? `?country=${country}` : ''}`,
      { method: 'GET' }
    ),

  getPrice: (
    server: 'local' | 'global',
    service: string,
    country: string
  ): Promise<ApiResponse<any>> =>
    request(
      `/services/price/${server}?service=${service}&country=${country}`,
      { method: 'GET' }
    ),

  checkHealth: (): Promise<ApiResponse<any>> =>
    request('/services/health', { method: 'GET' }),
}

export default {
  authAPI,
  walletAPI,
  ordersAPI,
  userAPI,
  adminAPI,
  servicesAPI,
}