import { useEffect, useState } from 'react'
import {
  authAPI,
  walletAPI,
  ordersAPI,
  userAPI,
} from '@/lib/api-client'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: any
}

/**
 * Generic async hook
 */
function useAsync<T>(
  asyncFunction: () => Promise<any>,
  immediate = true
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  useEffect(() => {
    if (!immediate) return

    let mounted = true

    ;(async () => {
      try {
        const response = await asyncFunction()
        if (mounted) {
          setState({
            data: response.data,
            loading: false,
            error: response.error,
          })
        }
      } catch (error) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error,
          })
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [asyncFunction, immediate])

  return state
}

/**
 * Get current user profile
 */
export function useProfile() {
  return useAsync(() => userAPI.getProfile())
}

/**
 * Get wallet balance
 */
export function useWalletBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const response = await walletAPI.getBalance()
      if (response.data) {
        setBalance(response.data.balance)
      }
      setError(response.error || null)
    } catch (err) {
      setError(err as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return { balance, loading, error, refetch: fetchBalance }
}

/**
 * Get user's orders
 */
export function useOrders(limit = 50, skip = 0) {
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getHistory(limit, skip)
      if (response.data) {
        setOrders(response.data.orders)
        setTotal(response.data.total)
      }
      setError(response.error || null)
    } catch (err) {
      setError(err as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [limit, skip])

  return { orders, total, loading, error, refetch: fetchOrders }
}

/**
 * Poll for order status
 */
export function useOrderStatus(orderId: string, pollInterval = 5000) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!orderId) return

    const fetchStatus = async () => {
      try {
        const response = await ordersAPI.getStatus(orderId)
        if (response.data) {
          setStatus(response.data)
        }
        setError(response.error || null)
      } catch (err) {
        setError(err as any)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Poll for updates
    const interval = setInterval(fetchStatus, pollInterval)

    return () => clearInterval(interval)
  }, [orderId, pollInterval])

  return { status, loading, error }
}

/**
 * Get single order
 */
export function useOrder(orderId: string) {
  return useAsync(() => ordersAPI.getOrder(orderId))
}

/**
 * Hook for authentication state
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authAPI.getToken()
    if (token) {
      setToken(token)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    if (response.data?.token) {
      setToken(response.data.token)
      setIsAuthenticated(true)
    }
    return response
  }

  const register = async (data: any) => {
    const response = await authAPI.register(data)
    if (response.data?.token) {
      setToken(response.data.token)
      setIsAuthenticated(true)
    }
    return response
  }

  const logout = () => {
    authAPI.logout()
    setToken(null)
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    token,
    loading,
    login,
    register,
    logout,
  }
}

/**
 * Hook for retry logic
 */
export function useRetry<T>(
  asyncFunction: () => Promise<any>,
  maxRetries = 3
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [retries, setRetries] = useState(0)

  const execute = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }))
      const response = await asyncFunction()
      setState({
        data: response.data,
        loading: false,
        error: response.error,
      })
    } catch (error) {
      if (retries < maxRetries) {
        setRetries((prev) => prev + 1)
        setTimeout(execute, 1000 * Math.pow(2, retries)) // Exponential backoff
      } else {
        setState({
          data: null,
          loading: false,
          error,
        })
      }
    }
  }

  useEffect(() => {
    execute()
  }, [])

  const retry = () => {
    setRetries(0)
    execute()
  }

  return { ...state, retry, retries }
}
