'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  const bg = {
    success: 'rgba(16,185,129,0.12)',
    error:   'rgba(239,68,68,0.12)',
    info:    'rgba(0,212,255,0.12)',
  }[toast.type]

  const border = {
    success: 'rgba(16,185,129,0.25)',
    error:   'rgba(239,68,68,0.25)',
    info:    'rgba(0,212,255,0.25)',
  }[toast.type]

  const icon = { success: '✅', error: '❌', info: 'ℹ️' }[toast.type]

  return (
    <div
      className="animate-fade-up"
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${border}`,
        borderLeft: `3px solid ${border}`,
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 13,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 260,
        maxWidth: 380,
        cursor: 'pointer',
      }}
      onClick={() => onRemove(toast.id)}
    >
      <span>{icon}</span>
      <span style={{ flex: 1, color: 'var(--text)' }}>{toast.message}</span>
      <span style={{ color: 'var(--text3)', fontSize: 16 }}>✕</span>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(ts => [...ts, { id, message, type }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  const success = useCallback((msg: string) => add(msg, 'success'), [add])
  const error   = useCallback((msg: string) => add(msg, 'error'),   [add])
  const info    = useCallback((msg: string) => add(msg, 'info'),    [add])

  return { toasts, remove, success, error, info }
}
