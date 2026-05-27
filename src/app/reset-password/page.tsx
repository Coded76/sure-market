'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [strength, setStrength] = useState(0)

  function calcStrength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    setStrength(s)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!token) { setError('Invalid or expired reset link'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Reset failed'); return }
      router.push('/login?reset=1')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthColors = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!token) return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Invalid reset link</h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        This password reset link is missing or has expired. Request a new one below.
      </p>
      <Link href="/forgot-password" style={{ display: 'inline-block', padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 9, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
        Request new link →
      </Link>
    </div>
  )

  return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Set new password</h1>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Choose a strong password for your account.
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">New password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={e => { setPassword(e.target.value); calcStrength(e.target.value) }}
            required
            minLength={8}
          />
          {password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--bg4)', transition: 'background .3s' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="form-label">Confirm new password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {confirm && password !== confirm && (
            <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>Passwords do not match</p>
          )}
        </div>
        <button className="btn-primary" type="submit" disabled={loading || password !== confirm || password.length < 8}>
          {loading ? 'Updating password…' : 'Set new password →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        <Link href="/login" style={{ color: 'var(--text2)', textDecoration: 'none' }}>← Back to sign in</Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="card" style={{ padding: 40 }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
