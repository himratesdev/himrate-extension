// BUG-016 PR-1 (Section 2 of wireframe): Shimmer skeleton state.
// Canonical wireframe: side-panel-wireframe-TASK-039.html lines 1330-1397.
// Pixel-match: canonical skeleton-rect + skeleton-circle (NOT skeleton-line).
//
// Mirror Overview module layout: M1 gauge + M2 TI + M3 signals + M4 reputation +
// M5 sparkline + M6 audience preview. ARIA busy для AT.

export function SkeletonOverview() {
  return (
    <div aria-busy="true" aria-label="Загрузка данных">
      {/* M1 Skeleton — gauge + 3 text rects */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton-circle" style={{ width: '120px', height: '120px' }} />
      </div>
      <div className="skeleton-rect" style={{ width: '180px', height: '24px', margin: '0 auto' }} />
      <div className="skeleton-rect" style={{ width: '120px', height: '18px', margin: '0 auto' }} />
      <div className="skeleton-rect" style={{ width: '200px', height: '18px', margin: '0 auto' }} />

      {/* M2 Skeleton — TI badge */}
      <div className="skeleton-rect" style={{ width: '100%', height: '48px' }} />

      {/* M3 Skeleton — 5 signal rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
      </div>

      {/* M4 Skeleton — 3 reputation rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
      </div>

      {/* M5 Skeleton — sparkline */}
      <div className="skeleton-rect" style={{ width: '100%', height: '80px' }} />

      {/* M6 Skeleton — 3 audience rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
      </div>
    </div>
  );
}
