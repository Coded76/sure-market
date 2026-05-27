'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const PRODUCTS = [
  { icon: '📱', label: 'US Phone Numbers', desc: '646, 917, 310, 212 area codes', price: 'from $2.50', color: '#00d4ff' },
  { icon: '📘', label: 'Facebook Accounts', desc: 'Aged, phone-verified profiles', price: 'from $9.00', color: '#1877f2' },
  { icon: '📸', label: 'Instagram Accounts', desc: 'Email + phone verified', price: 'from $12.00', color: '#e1306c' },
  { icon: '🐦', label: 'Twitter / X Accounts', desc: 'Phone verified, 1yr+ aged', price: 'from $7.00', color: '#1da1f2' },
  { icon: '💬', label: 'WhatsApp Numbers', desc: 'US-registered, ready to use', price: 'from $5.00', color: '#25d366' },
  { icon: '🎵', label: 'TikTok Accounts', desc: 'Email verified, blank profile', price: 'from $8.00', color: '#ee1d52' },
]

const STATS = [
  { value: '50,000+', label: 'Orders fulfilled' },
  { value: '99.2%', label: 'Delivery rate' },
  { value: '10,000+', label: 'Happy customers' },
  { value: '<2 min', label: 'Avg delivery time' },
]

const FAQS = [
  { q: 'How fast is delivery?', a: 'Orders are processed instantly through the SureVerifications API. Most orders are delivered in under 2 minutes after payment.' },
  { q: 'Are the accounts verified?', a: 'Yes. All phone numbers are real SIM-backed US numbers. All social accounts are email and/or phone verified before being listed.' },
  { q: 'What payment methods do you accept?', a: 'We accept cryptocurrency (BTC, ETH, USDT), credit/debit cards (Visa, Mastercard), and bank wire transfers.' },
  { q: 'What if my order fails?', a: 'Failed orders are automatically refunded to your wallet balance within minutes. Our 99.2% success rate means this is rare.' },
  { q: 'Can I buy in bulk?', a: 'Yes. You can purchase up to 100 units per order. For larger volumes, contact us for a custom API plan.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sora)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(10,12,16,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: 'var(--font-jetbrains)' }}>S</div>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px' }}>Sure<span style={{ color: 'var(--accent)' }}>Market</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" style={{ padding: '8px 18px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 9, color: 'var(--text)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .15s' }}>
            Sign in
          </Link>
          <Link href="/register" style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 5% 80px', position: 'relative', overflow: 'hidden' }}>
        {/* glow orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,255,0.08) 0%,transparent 70%)', bottom: 0, right: '10%', pointerEvents: 'none' }} />

        <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 28, fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          Powered by SureVerifications API · 99.2% uptime
        </div>

        <h1 className="animate-fade-up" style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, maxWidth: 820, animationDelay: '60ms' }}>
          Buy verified accounts &<br />
          <span style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>US phone numbers</span><br />
          in seconds.
        </h1>
        <p className="animate-fade-up" style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 520, marginBottom: 40, animationDelay: '120ms' }}>
          Instant delivery. Real verified accounts. Facebook, Instagram, Twitter, WhatsApp, TikTok — all in one marketplace.
        </p>

        <div className="animate-fade-up" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animationDelay: '180ms' }}>
          <Link href="/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.2px' }}>
            Start buying →
          </Link>
          <Link href="/login" style={{ padding: '14px 32px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, color: 'var(--text)', fontWeight: 500, fontSize: 15, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        {/* floating mini stats */}
        <div className="animate-fade-up stagger" style={{ display: 'flex', gap: 12, marginTop: 60, flexWrap: 'wrap', justifyContent: 'center', animationDelay: '240ms' }}>
          {STATS.map((s) => (
            <div key={s.label} className="animate-fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-jetbrains)', color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>Everything you need, in stock</h2>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Sourced via SureVerifications — refreshed daily</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {PRODUCTS.map((p) => (
            <div key={p.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
              <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 5 }}>{p.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>{p.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: 'var(--accent-green)', fontSize: 15 }}>{p.price}</span>
                <Link href="/register" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#a78bfa', textDecoration: 'none' }}>Buy now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 5%', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>How it works</h2>
          <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 56 }}>From sign-up to delivered account in under 3 minutes</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 30 }}>
            {[
              { step: '01', title: 'Create account', desc: 'Sign up in 30 seconds with just your email.' },
              { step: '02', title: 'Fund wallet', desc: 'Top up via crypto, card, or bank transfer.' },
              { step: '03', title: 'Choose product', desc: 'Browse our live inventory powered by the API.' },
              { step: '04', title: 'Get credentials', desc: 'Receive login details or numbers instantly.' },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--accent-purple)', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>STEP {s.step}</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 5%', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 40, textAlign: 'center' }}>FAQs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-sora)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                {f.q}
                <span style={{ color: 'var(--text3)', fontSize: 18, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 14 }}>{f.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER BANNER ── */}
      <section style={{ padding: '60px 5%', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,212,255,0.08))', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>Ready to start?</h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 28 }}>Join 10,000+ customers. No subscription, pay as you go.</p>
        <Link href="/register" style={{ display: 'inline-block', padding: '14px 36px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          Create free account →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '30px 5%', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>© 2026 SureMarket. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Terms', 'Privacy', 'Support'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
