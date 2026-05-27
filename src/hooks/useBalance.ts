'use client'

import { useState, useEffect, useCallback } from 'react'

interface BalanceState {
  balance: number | null
  loading: boolean
  error: string | null
}

export function useBalance() {
  const [state, setState] = useState<BalanceState>({ balance: null, loading: true, error: null })

  const refetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/wallet/balance')
      if (!res.ok) throw new Error('Failed to fetch balance')
      const data = await res.json()
      setState({ balance: data.balance ?? null, loading: false, error: null })
    } catch (err: any) {
      setState({ balance: null, loading: false, error: err.message })
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { ...state, refetch }
}
