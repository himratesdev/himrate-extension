// LITERAL PORT — wireframe slim/52_watchlists-skeleton.html.
// Skeleton/shimmer placeholders during load. Max 3s before Error.

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--ink-10) 25%, rgba(0,0,0,0.04) 50%, var(--ink-10) 75%)',
  backgroundSize: '200%',
  animation: 'shimmer 1.5s infinite',
};

export function Frame52WatchlistsSkeleton() {
  const cardSkeletons = [
    { titleW: 120, subW: 80, hasBadge: true, opacity: 1 },
    { titleW: 100, subW: 90, hasBadge: true, opacity: 1 },
    { titleW: 110, subW: 70, hasBadge: true, opacity: 1 },
    { titleW: 90, subW: 60, hasBadge: false, opacity: 0.7 },
    { titleW: 80, subW: 100, hasBadge: false, opacity: 0.5 },
  ];

  return (
    <div className="sp-content" role="tabpanel">
      {/* M1 chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
        {[80, 60, 70].map((w, i) => (
          <div key={i} style={{ width: w, height: 28, borderRadius: 20, ...shimmer }}></div>
        ))}
      </div>
      {/* Stats skeleton */}
      <div style={{ width: 200, height: 16, borderRadius: 4, marginBottom: 10, ...shimmer }}></div>
      {/* Search skeleton */}
      <div style={{ width: '100%', height: 32, borderRadius: 8, marginBottom: 12, boxSizing: 'border-box', ...shimmer }}></div>
      {/* Card skeletons */}
      {cardSkeletons.map((c, i) => (
        <div key={i} style={{ border: '2px solid var(--border-light)', borderRadius: 10, padding: '10px 12px', marginBottom: 6, opacity: c.opacity }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, ...shimmer }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ width: c.titleW, height: 12, borderRadius: 4, marginBottom: 4, ...shimmer }}></div>
              <div style={{ width: c.subW, height: 10, borderRadius: 4, ...shimmer }}></div>
            </div>
            {c.hasBadge && (<div style={{ width: 40, height: 16, borderRadius: 6, ...shimmer }}></div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
