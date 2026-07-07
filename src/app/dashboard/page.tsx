'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order, DashboardStats } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  us_numbers: '📱', facebook: '📘', instagram: '📸',
  twitter: '🐦', whatsapp: '💬', tiktok: '🎵',
}
const CATEGORY_COLORS: Record<string, string> = {
  us_numbers: '#00d4ff', facebook: '#1877f2', instagram: '#e1306c',
  twitter: '#1da1f2', whatsapp: '#25d366', tiktok: '#ee1d52',
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="card animate-fade-up" style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', fontFamily: 'var(--font-jetbrains)', marginBottom: 4, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>↑ {sub}</div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: string }> = {
    delivered: { cls: 'pill-success', icon: '✓' },
    pending:   { cls: 'pill-pending', icon: '◷' },
    processing:{ cls: 'pill-pending', icon: '◷' },
    failed:    { cls: 'pill-failed',  icon: '✕' },
  }
  const { cls, icon } = map[status] || { cls: 'pill-info', icon: '•' }
  return <span className={`pill ${cls}`}>{icon} {status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    walletBalance: 0,
    accountsOwned: 0,
    ordersThisMonth: 0,
    spentThisMonth: 0,
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.ok ? r.json() : null),
      fetch('/api/orders?pageSize=5').then(r => r.ok ? r.json() : null),
    ]).then(([s, o]) => {
      if (!s) setError('Unable to load dashboard stats')
      if (s) setStats(s)
      setOrders(o?.orders || [])
    }).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Orders', value: String(stats.totalOrders), sub: `+${stats.ordersThisMonth} this month`, color: 'var(--accent)' },
    { label: 'Total Spent', value: `₦${stats.totalSpent.toLocaleString('en-NG')}`, sub: `+₦${stats.spentThisMonth.toLocaleString('en-NG')} this month`, color: 'var(--accent-green)' },
    { label: 'Wallet Balance', value: `₦${stats.walletBalance.toLocaleString('en-NG')}`, sub: 'Available now' },
    { label: 'Accounts Owned', value: String(stats.accountsOwned), sub: 'Active accounts', color: '#a78bfa' },
  ]

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }} className="stagger">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent orders */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent orders</h3>
        <Link href="/dashboard/orders" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Product', 'Qty', 'Amount', 'Status', 'Date', ''].map(h => (
              <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--text2)' }}>{o.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[o.category]}</span>
                    {o.productName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>{o.quantity}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-jetbrains)', fontSize: 13 }}>₦{o.totalPrice.toLocaleString('en-NG')}</td>
                <td style={{ padding: '12px 16px' }}><StatusPill status={o.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button title="Copy credentials" style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 15, padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>⎘</button>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '20px 16px', color: 'var(--text2)', fontSize: 13 }}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Quick actions</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {/* Shop, Wallet, Notifications, Support (Telegram) */}
        <Link href="/dashboard/shop" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🛍</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Browse Shop</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Buy accounts and numbers</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/wallet" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-green)18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💳</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Wallet</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Review balance and transactions</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/notifications" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔔</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Read recent account alerts</div>
            </div>
          </div>
        </Link>
        <a href="https://t.me/suremarket_support" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#229ed918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📨</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Support</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Chat with us on Telegram</div>
            </div>
          </div>
        </a>
      </div>
      {error && <p style={{ marginTop: 12, color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
    </div>
  )
}
