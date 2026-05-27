'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Request failed'); return }
      setSent(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
        We sent a password reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. The link expires in 15 minutes.
      </p>
      <Link href="/login" style={{ display: 'block', textAlign: 'center', color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>← Back to sign in</Link>
    </div>
  )

  return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Reset password</h1>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Enter your email and we&apos;ll send a reset link.
      </p>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ef4444' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 22 }}>
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        <Link href="/login" style={{ color: 'var(--text2)', textDecoration: 'none' }}>← Back to sign in</Link>
      </p>
    </div>
  )
}
