// BUG-016 PR-1a: NotTrackedOverview LITERAL PORT — JSX 1:1 от wireframe slim/03/04/05.
// Frame 03 (live registered): banner + ccv + subtitle + btn-primary "Запросить отслеживание"
// Frame 04 (live guest): banner + ccv + subtitle + btn-twitch "Войдите для запроса"
// Frame 05 (offline): banner + subtitle (no ccv) + btn-primary

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import { formatNumber } from '../../shared/format';

interface Props {
  ccv: number | null;
  login: string;
  loggedIn: boolean;
}

export function NotTrackedOverview({ ccv, login, loggedIn }: Props) {
  const { t, i18n } = useTranslation();
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
    // <div class="sp-content" style="justify-content:center;">
    <div className="sp-content" role="tabpanel" style={{ justifyContent: 'center' }}>
      {/* <div class="sp-not-tracked-banner"> */}
      <div className="sp-not-tracked-banner">
        {/* <span class="sp-nt-icon">!</span> */}
        <span className="sp-nt-icon">!</span>
        {/* <span>Канал не отслеживается</span> */}
        <span>{t('not_tracked.banner')}</span>
      </div>

      {/* Frame 03/04 only: <div class="sp-ccv-display">Текущие зрители: 5,000 <span ...>(данные Twitch)</span></div> */}
      {isLive && (
        <div className="sp-ccv-display">
          {t('not_tracked.platform_viewers', { N: formatNumber(ccv, i18n.language) })}{' '}
          <span style={{ fontSize: '10px', color: 'var(--ink-30)' }}>
            {t('not_tracked.platform_viewers_source')}
          </span>
        </div>
      )}

      {/* <div style="font-size:12px;color:var(--ink-50);text-align:center;font-family:'Inter',sans-serif;line-height:1.5;">...</div> */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--ink-50)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.5,
        }}
      >
        {t(subtitleKey)}
      </div>

      {/* <button class="btn btn-primary">Запросить отслеживание</button> */}
      <button className={buttonClass} onClick={handleRequest} disabled={submitted || loading}>
        {buttonLabel}
      </button>
    </div>
  );
}
