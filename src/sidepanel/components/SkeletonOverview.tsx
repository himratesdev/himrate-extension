// BUG-016 PR-1a: SkeletonOverview LITERAL PORT — JSX 1:1 от wireframe slim/02_skeleton-loading.html.
// Каждый skeleton-rect/skeleton-circle с inline style скопирован вербатим из wireframe.

export function SkeletonOverview() {
  return (
    // <div class="sp-content" aria-busy="true" aria-label="Загрузка данных">
    <div className="sp-content" role="tabpanel" aria-busy="true" aria-label="Загрузка данных">
      {/* <!-- M1 Skeleton --> */}
      {/* <div style="display:flex;justify-content:center;"> */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* <div class="skeleton-circle" style="width:120px;height:120px;"></div> */}
        <div className="skeleton-circle" style={{ width: '120px', height: '120px' }} />
      </div>
      {/* <div class="skeleton-rect" style="width:180px;height:24px;margin:0 auto;"></div> */}
      <div className="skeleton-rect" style={{ width: '180px', height: '24px', margin: '0 auto' }} />
      {/* <div class="skeleton-rect" style="width:120px;height:18px;margin:0 auto;"></div> */}
      <div className="skeleton-rect" style={{ width: '120px', height: '18px', margin: '0 auto' }} />
      {/* <div class="skeleton-rect" style="width:200px;height:18px;margin:0 auto;"></div> */}
      <div className="skeleton-rect" style={{ width: '200px', height: '18px', margin: '0 auto' }} />

      {/* <!-- M2 Skeleton --> */}
      {/* <div class="skeleton-rect" style="width:100%;height:48px;"></div> */}
      <div className="skeleton-rect" style={{ width: '100%', height: '48px' }} />

      {/* <!-- M3 Skeleton --> */}
      {/* <div style="display:flex;flex-direction:column;gap:6px;"> */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '28px' }} />
      </div>

      {/* <!-- M4 Skeleton --> */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '40px' }} />
      </div>

      {/* <!-- M5 Skeleton --> */}
      <div className="skeleton-rect" style={{ width: '100%', height: '80px' }} />

      {/* <!-- M6 Skeleton --> */}
      {/* <div style="display:flex;flex-direction:column;gap:4px;"> */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
        <div className="skeleton-rect" style={{ width: '100%', height: '20px' }} />
      </div>
    </div>
  );
}
