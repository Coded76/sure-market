/**
 * SureVerifications API Client
 * Base URL: https://api.sureverifications.com/v1
 * Docs:     https://docs.sureverifications.com
 *
 * All server-side calls use SUREVERIFICATIONS_API_KEY from env.
 * Never expose this key on the client.
 */

import {
  Product,
  ProductsResponse,
  Order,
  OrdersResponse,
  CreateOrderPayload,
  WalletBalance,
  Transaction,
  ApiError,
} from '@/types'

const BASE_URL =
  process.env.SUREVERIFICATIONS_BASE_URL ||
  'https://sureverifications.com/api/v1'

const API_KEY = process.env.SUREVERIFICATIONS_API_KEY || ''

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  userToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Platform-level key (server-side only)
    'X-API-Key': API_KEY,
    ...(options.headers as Record<string, string>),
  }

  // If a per-user token is passed (e.g. from session), attach it too
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    // Next.js cache hints
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    let err: ApiError
    try {
      err = await res.json()
    } catch {
      err = { message: `HTTP ${res.status}: ${res.statusText}`, statusCode: res.status }
    }
    throw err
  }

  return res.json()
}

// ─── Products ────────────────────────────────────────────────────────────────

/** List all available products, optionally filtered by category */
export async function getProducts(params?: {
  category?: string
  page?: number
  pageSize?: number
}): Promise<ProductsResponse> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))

  const query = qs.toString() ? `?${qs}` : ''
  return apiFetch<ProductsResponse>(`/products${query}`)
}

/** Get a single product by ID */
export async function getProduct(productId: string): Promise<Product> {
  return apiFetch<Product>(`/products/${productId}`)
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/** Place a new order */
export async function createOrder(
  payload: CreateOrderPayload,
  userToken: string
): Promise<Order> {
  return apiFetch<Order>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    userToken
  )
}

/** Get all orders for the authenticated user */
export async function getOrders(
  userToken: string,
  params?: { status?: string; page?: number; pageSize?: number }
): Promise<OrdersResponse> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))

  const query = qs.toString() ? `?${qs}` : ''
  return apiFetch<OrdersResponse>(`/orders${query}`, {}, userToken)
}

/** Get a single order with its credentials */
export async function getOrder(
  orderId: string,
  userToken: string
): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`, {}, userToken)
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

/** Get the user's current wallet balance */
export async function getBalance(userToken: string): Promise<WalletBalance> {
  return apiFetch<WalletBalance>('/wallet/balance', {}, userToken)
}

/** Get wallet transaction history */
export async function getTransactions(
  userToken: string,
  params?: { page?: number; pageSize?: number }
): Promise<{ transactions: Transaction[]; total: number }> {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))

  const query = qs.toString() ? `?${qs}` : ''
  return apiFetch(`/wallet/transactions${query}`, {}, userToken)
}

/** Initiate a wallet top-up */
export async function initiateTopUp(
  amount: number,
  method: 'crypto' | 'card' | 'bank',
  userToken: string
): Promise<{ paymentUrl: string; reference: string }> {
  return apiFetch(
    '/wallet/topup',
    {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    },
    userToken
  )
}

// ─── Auth (platform's own auth endpoints) ────────────────────────────────────

export async function registerUser(data: {
  firstName: string
  lastName: string
  email: string
  password: string
  referralCode?: string
}): Promise<{ message: string }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginUser(data: {
  email: string
  password: string
}): Promise<{ token: string; user: import('@/types').User }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function verifyEmail(data: {
  email: string
  code: string
}): Promise<{ message: string }> {
  return apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function getUserProfile(
  userToken: string
): Promise<import('@/types').User> {
  return apiFetch('/user/profile', {}, userToken)
}

export async function updateUserProfile(
  data: Partial<import('@/types').User>,
  userToken: string
): Promise<import('@/types').User> {
  return apiFetch(
    '/user/profile',
    { method: 'PATCH', body: JSON.stringify(data) },
    userToken
  )
}

export async function regenerateApiKey(
  userToken: string
): Promise<{ apiKey: string }> {
  return apiFetch('/user/api-key/regenerate', { method: 'POST' }, userToken)
}
