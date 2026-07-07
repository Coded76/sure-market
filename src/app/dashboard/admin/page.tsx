'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminStats {
  totalAccounts: number
  availableAccounts: number
  soldAccounts: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.stats) {
          setStats({
            totalAccounts: d.stats.accounts?.total || 0,
            availableAccounts: d.stats.accounts?.available || 0,
            soldAccounts: d.stats.accounts?.sold || 0,
            totalUsers: d.stats.users?.total || 0,
            totalRevenue: d.stats.revenue?.total || 0,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'var(--accent)' },
    { label: 'Total Accounts', value: stats?.totalAccounts ?? 0, color: '#a78bfa' },
    { label: 'Available', value: stats?.availableAccounts ?? 0, color: 'var(--accent-green)' },
    { label: 'Sold', value: stats?.soldAccounts ?? 0, color: 'var(--accent-purple)' },
    { label: 'Total Revenue', value: `₦${(stats?.totalRevenue ?? 0).toLocaleString('en-NG')}`, color: 'var(--accent-green)' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            {cards.map(c => (
              <div key={c.label} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Link href="/dashboard/admin/accounts" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textDecoration: 'none', color: 'var(--text)', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📱</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Manage Accounts</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Upload, edit, and delete social media accounts</div>
            </Link>

            <Link href="/dashboard/admin/orders" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textDecoration: 'none', color: 'var(--text)', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📦</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>View Orders</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>See all customer purchases and deliveries</div>
            </Link>

            <Link href="/dashboard/admin/users" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textDecoration: 'none', color: 'var(--text)', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Manage Users</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>View, suspend, or activate customer accounts</div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
