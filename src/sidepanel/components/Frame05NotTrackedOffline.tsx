// Frame 05 — Not Tracked · Offline
// Literal port от wireframes/frames/05_NotTracked_Offline.html (extracted from
// side-panel-wireframe-TASK-039.html lines 1478-1510).
// Offline channel → нет CCV, banner + subtitle + request_btn.
// Guest + offline → button routes к Twitch sign-in (handler branch internal).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  /** Twitch login identifier (route key для request) */
  login: string;
  /** Whether user is signed in — определяет request flow (auth twitch vs api) */
  loggedIn: boolean;
}

export function Frame05NotTrackedOffline({ login, loggedIn }: Props) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const buttonLabel = submitted
    ? t('not_tracked.submitted_btn')
    : loading
      ? '...'
      : t('not_tracked.request_btn');

  return (
    // <div class="sp-content" style="justify-content:center;">
    <div className="sp-content" role="tabpanel" style={{ justifyContent: 'center' }}>
      {/* <div class="sp-not-tracked-banner"> */}
      <div className="sp-not-tracked-banner">
        {/* <span class="sp-nt-icon">!</span> */}
        <span className="sp-nt-icon">!</span>
        {/* <span>Канал не отслеживается</span> */}
        <span>{t('not_tracked.banner')}</span>
      </div>

      {/* <div style="font-size:12px;color:var(--ink-50);text-align:center;font-family:'Inter',sans-serif;line-height:1.5;">HimRate пока не отслеживает этот канал.</div> */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--ink-50)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.5,
        }}
      >
        {t('not_tracked.offline_subtitle')}
      </div>

      {/* <button class="btn btn-primary">Запросить отслеживание</button> */}
      <button className="btn btn-primary" onClick={handleRequest} disabled={submitted || loading}>
        {buttonLabel}
      </button>
    </div>
  );
}
