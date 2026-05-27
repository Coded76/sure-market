'use client'

import { useEffect, useState } from 'react'
import type { Transaction } from '@/types'

const FUND_METHODS = [
  { key: 'crypto', icon: '₿', label: 'Cryptocurrency', sub: 'BTC, ETH, USDT, LTC', color: '#f59e0b' },
  { key: 'card',   icon: '💳', label: 'Card Payment',   sub: 'Visa, Mastercard',   color: '#7c3aed' },
  { key: 'bank',   icon: '🏦', label: 'Bank Transfer',  sub: 'Wire, ACH',          color: '#00d4ff' },
]

const QUICK_AMOUNTS = [10, 25, 50, 100, 200]

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [totalDeposited, setTotalDeposited] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [method, setMethod] = useState('crypto')
  const [amount, setAmount] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/wallet/balance').then(r => r.ok ? r.json() : null),
      fetch('/api/wallet/transactions').then(r => r.ok ? r.json() : null),
    ]).then(([b, t]) => {
      if (b?.balance !== undefined) { setBalance(b.balance); setTotalDeposited(b.totalDeposited ?? totalDeposited) }
      if (t?.transactions?.length) setTransactions(t.transactions)
    })
  }, [])

  async function handleTopUp() {
    showToast('⚠️ Wallet top-up with Paystack will be enabled soon.')
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 4000) }

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">{toast}</div>
      )}

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),var(--bg3))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Available balance</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 34, fontWeight: 700, marginBottom: 4 }}>${balance.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>Ready to spend</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),var(--bg3))', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Total deposited</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 34, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 4 }}>${totalDeposited.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>All time</div>
        </div>
      </div>

      {/* Top-up section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Fund wallet</h3>
      </div>

      {/* Payment method */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {FUND_METHODS.map(m => (
          <button key={m.key} onClick={() => setMethod(m.key)} style={{ background: method === m.key ? `${m.color}18` : 'var(--bg2)', border: `1px solid ${method === m.key ? m.color + '40' : 'var(--border)'}`, borderRadius: 12, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: method === m.key ? m.color : 'var(--text)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {QUICK_AMOUNTS.map(a => (
          <button key={a} onClick={() => setAmount(String(a))} style={{ padding: '6px 14px', background: amount === String(a) ? '#7c3aed' : 'var(--bg3)', border: `1px solid ${amount === String(a) ? 'transparent' : 'var(--border)'}`, borderRadius: 8, color: amount === String(a) ? '#fff' : 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-jetbrains)' }}>
            ${a}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontFamily: 'var(--font-jetbrains)', fontSize: 14 }}>$</span>
          <input type="number" min="1" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="form-input" style={{ paddingLeft: 28 }} />
        </div>
        <button onClick={handleTopUp} disabled={!amount} className="btn-primary" style={{ width: 'auto', padding: '11px 28px', whiteSpace: 'nowrap' }}>
          Top up →
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
                {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 14, fontWeight: 600, color: tx.type === 'credit' ? 'var(--accent-green)' : 'var(--danger)', flexShrink: 0 }}>
              {tx.type === 'credit' ? '+' : '−'}${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
