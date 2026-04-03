// TASK-034: Skeleton loading state.

export function SkeletonScreen() {
  return (
    <div className="screen-content" aria-busy="true" aria-label="Loading">
      <div className="two-col">
        <div className="col-left">
          <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
          <div className="skeleton-line" style={{ width: '60px', height: '12px' }} />
          <div className="skeleton-line short" style={{ width: '40px', height: '10px' }} />
        </div>
        <div className="col-right" style={{ gap: '8px' }}>
          <div className="skeleton-line short" style={{ width: '80px' }} />
          <div className="skeleton-line" style={{ width: '180px', height: '24px' }} />
          <div className="skeleton-line" style={{ width: '120px' }} />
          <div className="skeleton-line" style={{ width: '200px', height: '16px' }} />
          <div className="skeleton-line short" style={{ width: '100px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="skeleton-line" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
        <div className="skeleton-line" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
