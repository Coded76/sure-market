'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Login failed'); return }
      // Token is set via httpOnly cookie by the route handler
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome back</h1>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Sign in to your SureMarket account</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />or<span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* <button style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px', color: 'var(--text)', fontFamily: 'var(--font-sora)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button> */}

      <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text2)' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Create one free</Link>
      </p>
    </div>
  )
}
