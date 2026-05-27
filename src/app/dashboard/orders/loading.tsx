export default function OrdersLoading() {
  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[90, 100, 80, 70].map((w, i) => (
          <div key={i} style={{ height: 32, width: w, background: 'var(--bg4)', borderRadius: 8, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.07}s` }} />
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          {[70, 150, 40, 60, 60, 90, 100, 50].map((w, i) => (
            <div key={i} style={{ height: 10, width: w, background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.05}s` }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: 16, padding: '15px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            {[70, 160, 30, 55, 55, 90, 100, 40].map((w, i) => (
              <div key={i} style={{ height: 12, width: w, background: 'var(--bg4)', borderRadius: 4, animation: `pulse-skeleton 1.4s ease infinite ${(row * 0.08 + i * 0.04)}s` }} />
            ))}
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
