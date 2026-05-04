// Frame 02 — Skeleton · Loading
// Literal port от wireframes/frames/02_Skeleton_Loading.html (extracted from
// side-panel-wireframe-TASK-039.html lines 1333-1396).
// Initial loading shimmer для всех 6 модулей (M1 gauge, M2 TI, M3 signals,
// M4 reputation, M5 sparkline, M6 audience).

import { useTranslation } from 'react-i18next';

export function Frame02SkeletonLoading() {
  const { t } = useTranslation();
  return (
    // <div class="sp-content" aria-busy="true" aria-label="Загрузка данных">
    <div className="sp-content" role="tabpanel" aria-busy="true" aria-label={t('skeleton.loading_label')}>
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
