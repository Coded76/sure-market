'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import type { Product } from '@/types'

interface Credential {
  label: string
  value: string
}

interface BuyModalProps {
  product: Product
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

function BuyModal({ product, onClose, onConfirm, loading }: BuyModalProps) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 18, padding: 30, width: '100%', maxWidth: 440, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg3)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Confirm purchase</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 18 }}>Review and place your order</p>

        <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(24,119,242,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📘</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>₦{product.price.toLocaleString('en-NG')} · Instant delivery</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total cost</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>₦{product.price.toLocaleString('en-NG')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, marginBottom: 18, fontSize: 12 }}>
          <span style={{ color: 'var(--accent-green)' }}>⚡ Instant delivery</span>
          <span style={{ color: 'var(--text2)' }}>Full credentials after payment</span>
        </div>

        <button className="btn-green" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing…' : `Confirm & Pay →`}
        </button>
      </div>
    </div>
  )
}

function CredentialsModal({ credentials, onClose }: { credentials: Credential[]; onClose: () => void }) {
  function copy(val: string) {
    navigator.clipboard.writeText(val)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 18, padding: 30, width: '100%', maxWidth: 460, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg3)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Purchase successful!</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 22 }}>Your account credentials are below. Copy and save them securely.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {credentials.map(c => (
            <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{c.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <code style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: 'var(--text)', wordBreak: 'break-all' }}>{c.value}</code>
                <button onClick={() => copy(c.value)} style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: 20 }}>
          Done
        </button>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [credentials, setCredentials] = useState<Credential[] | null>(null)
  const [toast, setToast] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const PLATFORMS = [
    { value: 'all', label: 'All', icon: '🌐' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'twitter', label: 'Twitter / X', icon: '🐦' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  ]

  useEffect(() => {
    setLoading(true)
    const query = filterPlatform !== 'all' ? `?platform=${filterPlatform}` : ''
    fetch(`/api/products${query}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.products) setProducts(d.products) })
      .finally(() => setLoading(false))
  }, [filterPlatform])

  async function handleOrder() {
    if (!selected) return
    setOrdering(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selected.id }),
      })
      const data = await res.json()
      if (!res.ok) { showToast('❌ ' + (data.message || 'Order failed')); return }
      setSelected(null)
      if (data.credentials) {
        setCredentials(data.credentials)
      }
    } catch {
      showToast('❌ Network error. Please try again.')
    } finally {
      setOrdering(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Social Media Accounts</h3>
        <p style={{ fontSize: 12, color: 'var(--text2)' }}>Verified accounts ready for instant delivery. Stock updates in real-time.</p>
      </div>

      {/* Platform filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {PLATFORMS.map(p => (
          <button key={p.value} onClick={() => setFilterPlatform(p.value)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: filterPlatform === p.value ? 'var(--accent)' : 'var(--bg3)', color: filterPlatform === p.value ? '#fff' : 'var(--text2)', border: '1px solid ' + (filterPlatform === p.value ? 'var(--accent)' : 'var(--border)'), transition: 'all .15s' }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)', fontSize: 13 }}>Loading…</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          No accounts available right now. Check back soon.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }} className="stagger">
          {products.map(p => (
            <div key={p.id} className="card animate-fade-up" style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color .2s, transform .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
              {/* top color bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />

              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
                {(p as any).icon || '🌐'}
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>{p.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 12 }}>{p.description}</p>

              {p.features && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {p.features.map(f => (
                    <span key={f} style={{ fontSize: 10, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', color: 'var(--text2)' }}>{f}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>₦{p.price.toLocaleString('en-NG')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}><span style={{ color: 'var(--accent-green)' }}>{p.stock}</span> in stock</div>
                </div>
                <button onClick={() => setSelected(p)} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#fff', fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Buy now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <BuyModal product={selected} onClose={() => setSelected(null)} onConfirm={handleOrder} loading={ordering} />}
      {credentials && <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />}
    </div>
  )
}
