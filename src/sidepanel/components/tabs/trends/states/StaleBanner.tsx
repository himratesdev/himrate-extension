// BUG-016 PR-1a: StaleBanner canonical port (frames 46 stale / 47 revoked).
// Wireframe: wireframe-screens/slim/46 + 47.
// Yellow border 2px box с warning icon + title + detail для stale freshness.
// Red border + Reconnect CTA для revoked OAuth state.

import { useTranslation } from 'react-i18next';

interface Props {
  variant: 'stale' | 'revoked';
  /** Relative time label for stale variant (e.g. "2 hours ago"). */
  relative?: string;
  /** CTA handler for revoked variant — parent reconnects Twitch OAuth. */
  onReconnect?: () => void;
}

function WarnIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ flexShrink: 0, marginTop: 1 }}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M8 5v3.5M8 10.5v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StaleBanner({ variant, relative, onReconnect }: Props) {
  const { t } = useTranslation();

  if (variant === 'stale') {
    return (
      <div className="sp-stale-banner" role="status" aria-live="polite">
        <WarnIcon color="#EAB308" />
        <div className="sp-stale-banner-body">
          <div className="sp-stale-banner-title">{t('trends.banner.stale.title')}</div>
          {relative && (
            <div className="sp-stale-banner-detail">
              {t('trends.banner.stale.detail', { relative })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sp-revoked-banner" role="alert">
      <WarnIcon color="#DC2626" />
      <div className="sp-stale-banner-body">
        <div className="sp-revoked-banner-title">{t('trends.banner.revoked.title')}</div>
        <div className="sp-revoked-banner-detail">{t('trends.banner.revoked.detail')}</div>
      </div>
      <button type="button" className="sp-revoked-banner-cta" onClick={onReconnect}>
        {t('trends.banner.revoked.cta')}
      </button>
    </div>
  );
}
