'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body style={{ background: '#0a0c10', color: '#f0f4ff', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', textAlign: 'center', padding: 24,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#8b95b0', fontSize: 13, lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}>
            An unexpected error occurred. Try refreshing the page or returning to the dashboard.
          </p>
          {error.digest && (
            <code style={{ background: '#10131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: '#4a5568', marginBottom: 24 }}>
              Error ID: {error.digest}
            </code>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              style={{ padding: '10px 22px', background: '#10131a', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 9, color: '#f0f4ff', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
