// TASK-039: Trends data freshness banner (Screens 17/18).
// Shown over content when data_freshness === 'stale' OR access revoked.

import { useTranslation } from 'react-i18next';

interface Props {
  variant: 'stale' | 'revoked';
  /** Relative time label for stale variant (e.g. "2 hours ago"). */
  relative?: string;
  /** CTA handler for revoked variant — parent reconnects Twitch OAuth. */
  onReconnect?: () => void;
}

export function StaleBanner({ variant, relative, onReconnect }: Props) {
  const { t } = useTranslation();

  if (variant === 'stale') {
    return (
      <div className="trends-stale-banner" role="status" aria-live="polite">
        <span className="trends-stale-icon" aria-hidden="true">⚠</span>
        <div className="trends-stale-body">
          <span className="trends-stale-title">{t('trends.banner.stale.title')}</span>
          {relative && (
            <span className="trends-stale-detail">
              {t('trends.banner.stale.detail', { relative })}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="trends-revoked-banner" role="alert">
      <span className="trends-revoked-icon" aria-hidden="true">⚠</span>
      <div className="trends-revoked-body">
        <span className="trends-revoked-title">{t('trends.banner.revoked.title')}</span>
        <span className="trends-revoked-detail">{t('trends.banner.revoked.detail')}</span>
      </div>
      <button type="button" className="trends-revoked-cta" onClick={onReconnect}>
        {t('trends.banner.revoked.cta')}
      </button>
    </div>
  );
}
