'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Transaction } from '@/types'

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000]

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [totalDeposited, setTotalDeposited] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    loadWalletData()
  }, [])

  // Handle Paystack callback on page load
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference) {
      verifyPayment(reference)
    }
  }, [searchParams])

  async function loadWalletData() {
    Promise.all([
      fetch('/api/wallet/balance').then(r => r.ok ? r.json() : null),
      fetch('/api/wallet/transactions').then(r => r.ok ? r.json() : null),
    ]).then(([b, t]) => {
      if (b?.balance !== undefined) {
        setBalance(b.balance)
        setTotalDeposited(b.totalDeposited ?? 0)
      }
      if (t?.transactions?.length) setTransactions(t.transactions)
    })
  }

  const verifyPayment = useCallback(async (reference: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/wallet/topup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`✅ Wallet funded with ₦${data.amount.toLocaleString()}`)
        loadWalletData()
      } else {
        showToast(`❌ ${data.message || 'Payment verification failed'}`)
      }
    } catch {
      showToast('❌ Failed to verify payment')
    } finally {
      setLoading(false)
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/wallet')
    }
  }, [loadWalletData])

  async function handleTopUp() {
    const value = Number(amount)
    if (!value || value < 100) {
      showToast('⚠️ Minimum top-up is ₦100')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value }),
      })
      const data = await res.json()
      if (res.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      } else {
        showToast(`❌ ${data.message || 'Failed to initiate payment'}`)
      }
    } catch {
      showToast('❌ Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 5000) }

  const fmt = (n: number) => `₦${n.toLocaleString('en-NG')}`

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">{toast}</div>
      )}

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),var(--bg3))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Available balance</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 34, fontWeight: 700, marginBottom: 4 }}>{fmt(balance)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>Ready to spend</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),var(--bg3))', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Total deposited</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 34, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 4 }}>{fmt(totalDeposited)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>All time</div>
        </div>
      </div>

      {/* Top-up section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Fund wallet</h3>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
        Pay with card, bank transfer, or USSD via Paystack. Money reflects instantly.
      </p>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {QUICK_AMOUNTS.map(a => (
          <button key={a} onClick={() => setAmount(String(a))} style={{ padding: '6px 14px', background: amount === String(a) ? '#7c3aed' : 'var(--bg3)', border: `1px solid ${amount === String(a) ? 'transparent' : 'var(--border)'}`, borderRadius: 8, color: amount === String(a) ? '#fff' : 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-jetbrains)' }}>
            {fmt(a)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontFamily: 'var(--font-jetbrains)', fontSize: 14 }}>₦</span>
          <input type="number" min="100" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="form-input" style={{ paddingLeft: 28 }} />
        </div>
        <button onClick={handleTopUp} disabled={!amount || loading} className="btn-primary" style={{ width: 'auto', padding: '11px 28px', whiteSpace: 'nowrap' }}>
          {loading ? 'Please wait…' : 'Top up →'}
        </button>
      </div>

      {/* Transaction history */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Transaction history</h3>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{transactions.length} transactions</span>
      </div>

      <div className="card" style={{ padding: '4px 16px 0' }}>
        {transactions.map((tx, i) => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: tx.type === 'credit' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, color: tx.type === 'credit' ? 'var(--accent-green)' : 'var(--danger)' }}>
              {tx.type === 'credit' ? '↓' : '↑'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
              <small style={{ color: 'var(--text2)', fontSize: 11 }}>
                {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 14, fontWeight: 600, color: tx.type === 'credit' ? 'var(--accent-green)' : 'var(--danger)', flexShrink: 0 }}>
              {tx.type === 'credit' ? '+' : '−'}{fmt(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
