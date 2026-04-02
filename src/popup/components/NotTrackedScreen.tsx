// TASK-034: Not Tracked screen (live + offline variants).
// NotTrackedBanner + RequestTrackingButton + CCV (live only).

import { useState } from 'react';
import { type TrustCache } from '../../shared/api';
import { api } from '../../shared/api';
import { formatCCV } from '../../shared/utils';
import { useTranslation } from 'react-i18next';
import { Toast } from './Toast';

interface Props {
  cache: TrustCache;
  isGuest: boolean;
  isLive: boolean;
}

export function NotTrackedScreen({ cache, isGuest, isLive }: Props) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestTracking = async () => {
    if (submitted || loading) return;

    if (isGuest) {
      // Auth flow first, then auto-submit
      chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
      return;
    }

    setLoading(true);
    const result = await api.requestTracking(cache.login);
    setLoading(false);

    if (result) {
      setSubmitted(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  return (
    <div className="screen-content not-tracked-layout">
      {showToast && <Toast message={t('not_tracked.toast')} />}

      <div className="two-col">
        <div className="col-left">
          <div className="avatar not-tracked">?</div>
          <div className="streamer-name">{cache.display_name || cache.login}</div>
        </div>

        <div className="col-right">
          {isLive && (
            <div className="stream-status">
              <div className="live-dot" />
              <span className="live-text">{t('label.live')}</span>
            </div>
          )}
          {!isLive && <span className="offline-text">{t('label.offline_indicator')}</span>}

          <div className="not-tracked-banner">
            <span className="nt-icon">!</span>
            <span className="nt-text">{t('not_tracked.badge')}</span>
            <span className="nt-info-wrap">
              <span className="not-tracked-info">i</span>
              <div className="nt-info-tooltip">{t('not_tracked.tooltip')}</div>
            </span>
          </div>

          {isLive && cache.ccv !== null && (
            <div className="data-label data-label-secondary" style={{ marginTop: '6px' }}>
              {t('label.twitch_online')} {formatCCV(cache.ccv)}
            </div>
          )}

          {isLive && (
            <div className="not-tracked-message" style={{ marginTop: '4px' }}>
              {t('not_tracked.analysis_unavailable')}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button
        className={`btn ${submitted ? 'btn-submitted' : 'btn-request'}`}
        onClick={handleRequestTracking}
        disabled={submitted || loading}
      >
        {loading ? '...' : submitted ? t('not_tracked.submitted_btn') : t('not_tracked.request_btn')}
      </button>
      <div className="btn-request-hint">{t('not_tracked.request_hint')}</div>

      {isGuest && (
        <button className="btn btn-secondary" onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}>
          {t('auth.login')}
        </button>
      )}
    </div>
  );
}
