'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null })

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.status === 401) {
        setState({ user: null, loading: false, error: null })
        return
      }
      if (!res.ok) throw new Error('Failed to fetch profile')
      const user: User = await res.json()
      setState({ user, loading: false, error: null })
    } catch (err: any) {
      setState({ user: null, loading: false, error: err.message })
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({ user: null, loading: false, error: null })
    router.push('/login')
  }

  return { ...state, logout, refetch: fetchProfile }
}
