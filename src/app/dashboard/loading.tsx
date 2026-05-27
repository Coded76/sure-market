export default function DashboardLoading() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ height: 11, width: '55%', background: 'var(--bg4)', borderRadius: 6, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
            <div style={{ height: 28, width: '70%', background: 'var(--bg4)', borderRadius: 6, marginBottom: 10, animation: 'pulse-skeleton 1.4s ease infinite 0.1s' }} />
            <div style={{ height: 10, width: '45%', background: 'var(--bg4)', borderRadius: 6, animation: 'pulse-skeleton 1.4s ease infinite 0.2s' }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ height: 15, width: 140, background: 'var(--bg4)', borderRadius: 6, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        {/* header row */}
        <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          {[60, 120, 40, 70, 80, 60].map((w, i) => (
            <div key={i} style={{ height: 10, width: w, background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.05}s` }} />
          ))}
        </div>
        {[1, 2, 3, 4].map(row => (
          <div key={row} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            {[60, 140, 30, 60, 80, 70, 30].map((w, i) => (
              <div key={i} style={{ height: 12, width: w, background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${(row * 0.1 + i * 0.05)}s` }} />
            ))}
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div style={{ height: 15, width: 120, background: 'var(--bg4)', borderRadius: 6, marginBottom: 14, animation: 'pulse-skeleton 1.4s ease infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: 'var(--bg4)', borderRadius: 10, flexShrink: 0, animation: 'pulse-skeleton 1.4s ease infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '70%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 7, animation: 'pulse-skeleton 1.4s ease infinite' }} />
              <div style={{ height: 10, width: '90%', background: 'var(--bg4)', borderRadius: 4, animation: 'pulse-skeleton 1.4s ease infinite 0.1s' }} />
            </div>
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
