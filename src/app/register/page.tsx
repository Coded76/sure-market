'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', referralCode: '' })
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'password') calcStrength(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Registration failed'); return }
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthColors = ['var(--danger)', 'var(--warn)', 'var(--warn)', 'var(--accent-green)', 'var(--accent-green)']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Create account</h1>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Join thousands buying verified digital accounts</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label className="form-label">First name</label>
            <input className="form-input" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input className="form-input" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Email address</label>
          <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Password</label>
          <input className="form-input" name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
          {form.password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--bg4)', transition: 'background .3s' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 22 }}>
          <label className="form-label">Referral code <span style={{ textTransform: 'none', color: 'var(--text3)', fontSize: 10 }}>(optional)</span></label>
          <input className="form-input" name="referralCode" placeholder="SURE-XXXXX" value={form.referralCode} onChange={handleChange} />
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text2)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  )
}
