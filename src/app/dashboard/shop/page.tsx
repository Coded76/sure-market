'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import type { Product, ProductCategory } from '@/types'

const CATEGORY_TABS = [
  { key: '', label: 'All' },
  { key: 'us_numbers', label: '📱 US Numbers' },
  { key: 'facebook', label: '📘 Facebook' },
  { key: 'instagram', label: '📸 Instagram' },
  { key: 'twitter', label: '🐦 Twitter/X' },
  { key: 'whatsapp', label: '💬 WhatsApp' },
  { key: 'tiktok', label: '🎵 TikTok' },
]

const CAT_COLOR: Record<string, string> = {
  us_numbers: '#00d4ff', facebook: '#1877f2', instagram: '#e1306c',
  twitter: '#1da1f2', whatsapp: '#25d366', tiktok: '#ee1d52',
}
const CAT_ICON: Record<string, string> = {
  us_numbers: '📱', facebook: '📘', instagram: '📸',
  twitter: '🐦', whatsapp: '💬', tiktok: '🎵',
}

// Mock products — replaced live when API is connected
const MOCK_PRODUCTS: Product[] = [
  { id: 'p1',  category: 'us_numbers', name: 'US Number — 646', description: 'New York area code. Instant delivery. High SMS deliverability.', price: 2.50, stock: 120, areaCode: '646', features: ['Instant delivery', 'SMS verified', 'Real SIM-backed'] },
  { id: 'p2',  category: 'us_numbers', name: 'US Number — 917', description: 'New York mobile code. High deliverability rate.', price: 2.50, stock: 95, areaCode: '917' },
  { id: 'p3',  category: 'us_numbers', name: 'US Number — 310', description: 'California LA area code. Premium verified number.', price: 3.00, stock: 55, areaCode: '310' },
  { id: 'p4',  category: 'us_numbers', name: 'US Number — 212', description: 'Classic NYC number. High trust score.', price: 3.00, stock: 40, areaCode: '212' },
  { id: 'p5',  category: 'facebook',   name: 'Facebook — Standard', description: '2023 created, phone verified. Profile + cover photo. Clean history.', price: 9.00, stock: 48, features: ['Phone verified', 'Profile photo', 'Clean history'] },
  { id: 'p6',  category: 'facebook',   name: 'Facebook — Aged 2018+', description: '5+ year old accounts. High trust score. Best for ads.', price: 18.00, stock: 22, features: ['5yr+ aged', 'High trust', 'Ad-ready'] },
  { id: 'p7',  category: 'instagram',  name: 'Instagram — Verified', description: 'Email + phone verified. 100–500 followers. Niche-specific.', price: 12.00, stock: 87, features: ['Email verified', '100–500 followers', 'Niche options'] },
  { id: 'p8',  category: 'twitter',    name: 'Twitter / X Account', description: 'Phone verified. Complete profile. No suspension history. 1yr+.', price: 7.00, stock: 134, features: ['Phone verified', '1yr+ aged', 'No bans'] },
  { id: 'p9',  category: 'whatsapp',   name: 'WhatsApp Account', description: 'US number registered on WhatsApp. Ready to use, delivered instantly.', price: 5.00, stock: 200, features: ['US number', 'Instant delivery'] },
  { id: 'p10', category: 'tiktok',     name: 'TikTok Account', description: 'Email verified. Blank profile. US registered.', price: 8.00, stock: 63, features: ['Email verified', 'US registered', 'Blank profile'] },
]

interface BuyModalProps {
  product: Product
  onClose: () => void
  onConfirm: (qty: number) => void
  loading: boolean
}

function BuyModal({ product, onClose, onConfirm, loading }: BuyModalProps) {
  const [qty, setQty] = useState(1)
  const total = (product.price * qty).toFixed(2)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 18, padding: 30, width: '100%', maxWidth: 440, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg3)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Confirm purchase</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 18 }}>Review and place your order</p>

        <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: `${CAT_COLOR[product.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{CAT_ICON[product.category]}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>${product.price.toFixed(2)} per unit · {product.stock} in stock</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8, fontWeight: 600 }}>Quantity</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px 0 0 8px', color: 'var(--text)', cursor: 'pointer', fontSize: 18, transition: 'background .15s' }}>−</button>
            <input type="number" value={qty} min={1} max={100} onChange={e => setQty(Math.max(1, Math.min(100, Number(e.target.value))))} style={{ width: 60, height: 36, background: 'var(--bg4)', border: '1px solid var(--border2)', borderLeft: 'none', borderRight: 'none', color: 'var(--text)', fontFamily: 'var(--font-jetbrains)', fontSize: 15, fontWeight: 600, textAlign: 'center', outline: 'none' }} />
            <button onClick={() => setQty(q => Math.min(100, q + 1))} style={{ width: 36, height: 36, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '0 8px 8px 0', color: 'var(--text)', cursor: 'pointer', fontSize: 18, transition: 'background .15s' }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total cost</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>${total}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, marginBottom: 18, fontSize: 12 }}>
          <span style={{ color: 'var(--accent-green)' }}>⚡ Instant delivery</span>
          <span style={{ color: 'var(--text2)' }}>Powered by SureVerifications</span>
        </div>

        <button className="btn-green" onClick={() => onConfirm(qty)} disabled={loading}>
          {loading ? 'Placing order…' : `Confirm & Pay $${total} →`}
        </button>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const qs = category ? `?category=${category}` : ''
    fetch(`/api/products${qs}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.products?.length) setProducts(d.products) })
      .finally(() => setLoading(false))
  }, [category])

  const filtered = category ? products.filter(p => p.category === category) : products

  async function handleOrder(qty: number) {
    if (!selected) return
    setOrdering(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id, quantity: qty }),
      })
      const data = await res.json()
      if (!res.ok) { showToast('❌ ' + (data.message || 'Order failed')); return }
      setSelected(null)
      showToast('✅ Order placed! Check My Orders for credentials.')
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

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {CATEGORY_TABS.map(t => (
          <button key={t.key} onClick={() => setCategory(t.key)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', background: category === t.key ? '#7c3aed' : 'var(--bg2)', color: category === t.key ? '#fff' : 'var(--text2)', border: `1px solid ${category === t.key ? 'transparent' : 'var(--border)'}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }} className="stagger">
        {filtered.map(p => (
          <div key={p.id} className="card animate-fade-up" style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            {/* top color bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${CAT_COLOR[p.category]}, transparent)` }} />

            <div style={{ width: 42, height: 42, borderRadius: 11, background: `${CAT_COLOR[p.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{CAT_ICON[p.category]}</div>
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
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>${p.price.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}><span style={{ color: 'var(--accent-green)' }}>{p.stock}</span> in stock</div>
              </div>
              <button onClick={() => setSelected(p)} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#fff', fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Buy now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && <BuyModal product={selected} onClose={() => setSelected(null)} onConfirm={handleOrder} loading={ordering} />}
    </div>
  )
}
