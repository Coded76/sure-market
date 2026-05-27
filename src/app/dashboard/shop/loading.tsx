export default function ShopLoading() {
  return (
    <div>
      {/* Filter tabs skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {[80, 100, 90, 100, 90, 100, 80].map((w, i) => (
          <div key={i} style={{ height: 32, width: w, background: 'var(--bg4)', borderRadius: 8, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.06}s` }} />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ width: 42, height: 42, background: 'var(--bg4)', borderRadius: 11, marginBottom: 14, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04}s` }} />
            <div style={{ height: 13, width: '65%', background: 'var(--bg4)', borderRadius: 5, marginBottom: 10, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04 + 0.1}s` }} />
            <div style={{ height: 10, width: '90%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 6, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04 + 0.15}s` }} />
            <div style={{ height: 10, width: '70%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 18, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04 + 0.2}s` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ height: 16, width: 55, background: 'var(--bg4)', borderRadius: 5, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04 + 0.25}s` }} />
              <div style={{ height: 30, width: 72, background: 'var(--bg4)', borderRadius: 8, animation: `pulse-skeleton 1.4s ease infinite ${i * 0.04 + 0.3}s` }} />
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
