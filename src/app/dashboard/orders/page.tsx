'use client'

import { useEffect, useState } from 'react'
import type { Order } from '@/types'

const CAT_ICON: Record<string, string> = {
  us_numbers: '📱', facebook: '📘', instagram: '📸',
  twitter: '🐦', whatsapp: '💬', tiktok: '🎵',
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: string }> = {
    delivered:  { cls: 'pill-success', icon: '✓' },
    pending:    { cls: 'pill-pending', icon: '◷' },
    processing: { cls: 'pill-pending', icon: '◷' },
    failed:     { cls: 'pill-failed',  icon: '✕' },
  }
  const { cls, icon } = map[status] || { cls: 'pill-info', icon: '•' }
  return <span className={`pill ${cls}`}>{icon} {status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

function CredentialModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(val: string, key: string) {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'var(--bg3)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ fontSize: 24, marginBottom: 12 }}>{CAT_ICON[order.category]}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Order Credentials</h3>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>Order {order.id} · {order.productName}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {order.credentials?.map(c => (
            <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: 'var(--text)' }}>{c.value}</div>
              </div>
              <button onClick={() => copy(c.value, c.label)} style={{ background: copied === c.label ? 'rgba(16,185,129,0.15)' : 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: copied === c.label ? 'var(--accent-green)' : 'var(--text2)', cursor: 'pointer', flexShrink: 0, transition: 'all .15s' }}>
                {copied === c.label ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => {
          const text = order.credentials?.map(c => `${c.label}: ${c.value}`).join('\n') || ''
          navigator.clipboard.writeText(text)
        }} style={{ width: '100%', marginTop: 16, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px', color: 'var(--text2)', fontFamily: 'var(--font-sora)', fontSize: 13, cursor: 'pointer' }}>
          Copy all credentials
        </button>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    const qs = filter ? `?status=${filter}` : ''
    fetch(`/api/orders${qs}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setOrders(d?.orders || []))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All orders' },
          { key: 'delivered', label: '✓ Delivered' },
          { key: 'pending', label: '◷ Pending' },
          { key: 'failed', label: '✕ Failed' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', background: filter === t.key ? '#7c3aed' : 'var(--bg2)', color: filter === t.key ? '#fff' : 'var(--text2)', border: `1px solid ${filter === t.key ? 'transparent' : 'var(--border)'}` }}>
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text2)', alignSelf: 'center' }}>{filtered.length} orders</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Order ID', 'Product', 'Qty', 'Unit', 'Total', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 16px', fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{o.id}</td>
                <td style={{ padding: '13px 16px', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>{CAT_ICON[o.category]}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{o.productName}</span>
                  </span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{o.quantity}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--text2)' }}>${o.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'var(--font-jetbrains)', fontSize: 13, fontWeight: 600 }}>${o.totalPrice.toFixed(2)}</td>
                <td style={{ padding: '13px 16px' }}><StatusPill status={o.status} /></td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                  {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  {o.status === 'delivered' && o.credentials?.length ? (
                    <button onClick={() => setSelected(o)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
                      View
                    </button>
                  ) : o.status === 'failed' ? (
                    <button style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer' }}>
                      Retry
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            No orders found.
          </div>
        )}
      </div>

      {selected && <CredentialModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
