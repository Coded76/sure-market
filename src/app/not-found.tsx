import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-sora)', flexDirection: 'column',
      textAlign: 'center', padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* background glows */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', top: '10%', left: '30%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,255,0.08) 0%,transparent 70%)', bottom: '10%', right: '20%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Link href="/landing" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', fontFamily: 'var(--font-jetbrains)' }}>S</div>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>Sure<span style={{ color: 'var(--accent)' }}>Market</span></span>
        </Link>

        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 96, fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 16 }}>
          404
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, maxWidth: 380, marginBottom: 36 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to the dashboard or landing page.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ padding: '11px 26px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Go to dashboard
          </Link>
          <Link href="/landing" style={{ padding: '11px 26px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
            Landing page
          </Link>
        </div>
      </div>
    </div>
  )
}
