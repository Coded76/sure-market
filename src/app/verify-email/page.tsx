'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(180)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  function handleInput(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[i] = val
    setCode(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  async function handleVerify() {
    const fullCode = code.join('')
    if (fullCode.length !== 6) { setError('Enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Invalid code'); return }
      router.push('/login?verified=1')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div className="card animate-fade-up" style={{ padding: '40px 36px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 20, fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>
        ✉️ Check your inbox
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>Verify your email</h1>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, maxWidth: '100%' }}>
        {code.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{ flex: 1, minWidth: 0, maxWidth: '60px', background: 'var(--bg3)', border: `1px solid ${d ? 'var(--accent-purple)' : 'var(--border2)'}`, borderRadius: 10, padding: '14px 8px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-jetbrains)', fontSize: 22, fontWeight: 600, outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box' }}
          />
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 22, display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {countdown > 0
            ? <><a href="#" style={{ color: 'var(--text3)', pointerEvents: 'none' }}>Resend code</a> · <span style={{ color: 'var(--text3)' }}>{mins}:{String(secs).padStart(2,'0')} remaining</span></>
            : <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Resend code</a>
          }
        </span>
      </p>

      <button className="btn-primary" onClick={handleVerify} disabled={loading || code.join('').length !== 6}>
        {loading ? 'Verifying…' : 'Verify & continue →'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13 }}>
        <Link href="/login" style={{ color: 'var(--text2)', textDecoration: 'none' }}>← Back to sign in</Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="card" style={{ padding: 40 }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
