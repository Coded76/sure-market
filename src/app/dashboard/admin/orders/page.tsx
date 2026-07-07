'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface PurchaseItem {
  id: string
  emailOrPhone: string
  price: number
  boughtBy?: string
  boughtAt?: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPurchases()
  }, [])

  async function loadPurchases() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/accounts?status=sold')
      const data = await res.json()
      if (res.ok && data.accounts) {
        setPurchases(data.accounts)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Customer Orders</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading…</div>
      ) : purchases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          No purchases yet.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Account', 'Price', 'Buyer ID', 'Purchased At', 'Date'].map(h => (
                  <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchases.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < purchases.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{p.emailOrPhone}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>₦{p.price.toLocaleString('en-NG')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-jetbrains)', color: 'var(--text2)' }}>{p.boughtBy || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{p.boughtAt ? new Date(p.boughtAt).toLocaleDateString('en-NG') : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{new Date(p.createdAt).toLocaleDateString('en-NG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
