// TASK-034 FR-023: Post-stream blur + dual CTA.
// Shown when Free user's 18h window has expired.

import { type TrustCache } from '../../shared/api';
import { useTranslation } from 'react-i18next';

interface Props {
  cache: TrustCache;
}

export function PostStreamPaywall({ cache }: Props) {
  const { t } = useTranslation();
  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred content */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
        <div className="data-label" style={{ marginTop: '8px' }}>
          {cache.erv_percent !== null ? `${cache.erv_percent}%` : '—'}
        </div>
        <div className="data-label" style={{ fontSize: '11px', color: 'var(--ink-30)' }}>
          {t('label.streamer_rating', { N: cache.streamer_rating?.score ?? '—' })}
        </div>
      </div>

      {/* Paywall overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)',
        borderRadius: '8px', padding: '12px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
          {t('paywall.expired_title')}
        </div>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '10px', width: '100%', marginBottom: '6px' }}>
          {t('paywall.track_cta')}
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '10px', width: '100%' }}>
          {t('paywall.report_cta')}
        </button>
      </div>
    </div>
  );
}
