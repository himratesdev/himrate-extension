// BUG-016 PR-1 (Section 3 of wireframe): "Канал не отслеживается" state.
// Canonical wireframe: side-panel-wireframe-TASK-039.html lines 1404-1511.
// 3 variants per role × stream state:
//   - Live registered: banner + ccv + subtitle_registered + btn-primary "Запросить отслеживание"
//   - Live guest:      banner + ccv + analysis_unavailable + btn-twitch "Войдите для запроса"
//   - Offline:         banner + offline_subtitle + btn-primary "Запросить отслеживание"

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  ccv: number | null;
  login: string;
  loggedIn: boolean;
}

export function NotTrackedOverview({ ccv, login, loggedIn }: Props) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLive = ccv != null;
  const isGuestLive = isLive && !loggedIn;

  const handleRequest = async () => {
    if (submitted || loading) return;
    if (!loggedIn) {
      chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
      return;
    }
    setLoading(true);
    const result = await api.requestTracking(login);
    setLoading(false);
    if (result) setSubmitted(true);
  };

  let subtitleKey: string;
  if (!isLive) subtitleKey = 'not_tracked.offline_subtitle';
  else if (loggedIn) subtitleKey = 'not_tracked.live_subtitle_registered';
  else subtitleKey = 'not_tracked.analysis_unavailable';

  const buttonClass = isGuestLive ? 'btn btn-twitch' : 'btn btn-primary';
  const buttonLabel = submitted
    ? t('not_tracked.submitted_btn')
    : loading
      ? '...'
      : isGuestLive
        ? t('not_tracked.guest_request_btn')
        : t('not_tracked.request_btn');

  return (
    <div className="sp-content sp-content-centered">
      <div className="sp-not-tracked-banner">
        <span className="sp-nt-icon">!</span>
        <span>{t('not_tracked.banner')}</span>
      </div>

      {isLive && (
        <div className="sp-ccv-display">
          {t('not_tracked.platform_viewers', { N: ccv.toLocaleString() })}{' '}
          <span className="sp-ccv-source">
            {t('not_tracked.platform_viewers_source')}
          </span>
        </div>
      )}

      <div className="sp-not-tracked-subtitle">{t(subtitleKey)}</div>

      <button className={buttonClass} onClick={handleRequest} disabled={submitted || loading}>
        {buttonLabel}
      </button>
    </div>
  );
}
