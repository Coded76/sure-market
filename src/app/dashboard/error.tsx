'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', padding: 32,
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>💥</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Failed to load this page</h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, maxWidth: 360, marginBottom: 24 }}>
        {error.message || 'Something went wrong loading this section. Try again or contact support.'}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={reset}
          style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          style={{ padding: '9px 22px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 9, color: 'var(--text)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
        >
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
