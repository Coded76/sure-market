import Link from 'next/link'

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', padding: '24px 16px' }}>
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, textDecoration: 'none', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', fontFamily: 'var(--font-jetbrains)' }}>S</div>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>Sure<span style={{ color: 'var(--accent)' }}>Market</span></span>
        </Link>
        {children}
      </div>
    </div>
  )
}
