export default function WalletLoading() {
  return (
    <div>
      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ height: 10, width: '50%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
            <div style={{ height: 32, width: '60%', background: 'var(--bg4)', borderRadius: 6, marginBottom: 10, animation: 'pulse-skeleton 1.4s ease infinite 0.1s' }} />
            <div style={{ height: 10, width: '35%', background: 'var(--bg4)', borderRadius: 4, animation: 'pulse-skeleton 1.4s ease infinite 0.2s' }} />
          </div>
        ))}
      </div>

      {/* Fund methods */}
      <div style={{ height: 14, width: 110, background: 'var(--bg4)', borderRadius: 5, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, background: 'var(--bg4)', borderRadius: '50%', margin: '0 auto 10px', animation: 'pulse-skeleton 1.4s ease infinite' }} />
            <div style={{ height: 12, width: '60%', background: 'var(--bg4)', borderRadius: 4, margin: '0 auto 6px', animation: 'pulse-skeleton 1.4s ease infinite 0.1s' }} />
            <div style={{ height: 10, width: '75%', background: 'var(--bg4)', borderRadius: 4, margin: '0 auto', animation: 'pulse-skeleton 1.4s ease infinite 0.2s' }} />
          </div>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 44, background: 'var(--bg4)', borderRadius: 10, animation: 'pulse-skeleton 1.4s ease infinite' }} />
        <div style={{ width: 120, height: 44, background: 'var(--bg4)', borderRadius: 10, animation: 'pulse-skeleton 1.4s ease infinite 0.1s' }} />
      </div>

      {/* Transactions */}
      <div style={{ height: 14, width: 160, background: 'var(--bg4)', borderRadius: 5, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
      <div className="card" style={{ padding: '4px 16px 0' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 38, height: 38, background: 'var(--bg4)', borderRadius: 10, flexShrink: 0, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.08}s` }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '55%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 7, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.08 + 0.1}s` }} />
              <div style={{ height: 10, width: '35%', background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.08 + 0.15}s` }} />
            </div>
            <div style={{ height: 14, width: 60, background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.08 + 0.2}s` }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-skeleton {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
