// TASK-035 FR-013: Shimmer skeleton for Overview tab — all modules.
// No props. Matches Overview module layout: gauge, TI, signals, reputation, sparkline, buttons.

export function SkeletonOverview() {
  return (
    <div className="sp-overview sp-skeleton" aria-busy="true" aria-label="Loading" style={{ gap: '14px', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      {/* ERV Gauge placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div className="skeleton-circle" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
        <div className="skeleton-line" style={{ width: '100px', height: '14px' }} />
        <div className="skeleton-line" style={{ width: '140px', height: '12px' }} />
      </div>

      {/* TI Badge placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="skeleton-line" style={{ width: '90px', height: '16px' }} />
        <div className="skeleton-line" style={{ width: '50px', height: '22px' }} />
        <div className="skeleton-line" style={{ width: '70px', height: '14px' }} />
      </div>

      {/* Signal bars placeholder */}
      {[100, 80, 120, 90, 110].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="skeleton-line" style={{ width: '90px', height: '12px' }} />
          <div className="skeleton-line" style={{ flex: 1, height: '6px', borderRadius: '3px' }} />
          <div className="skeleton-line" style={{ width: `${w > 80 ? 32 : 24}px`, height: '12px' }} />
        </div>
      ))}

      {/* Reputation card placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', borderRadius: '8px' }}>
        <div className="skeleton-line" style={{ width: '140px', height: '14px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton-line" style={{ width: '100px', height: '10px' }} />
            <div className="skeleton-line" style={{ flex: 1, height: '4px' }} />
            <div className="skeleton-line" style={{ width: '24px', height: '10px' }} />
          </div>
        ))}
      </div>

      {/* Sparkline placeholder */}
      <div className="skeleton-line" style={{ width: '100%', height: '80px', borderRadius: '6px' }} />

      {/* Button placeholder */}
      <div className="skeleton-line" style={{ width: '100%', height: '40px', borderRadius: '6px' }} />
    </div>
  );
}
