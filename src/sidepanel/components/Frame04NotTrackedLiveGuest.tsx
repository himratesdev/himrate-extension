// Frame 04 — Not Tracked · Live (guest)
// Literal port от wireframes/frames/04_NotTracked_LiveGuest.html (extracted
// from side-panel-wireframe-TASK-039.html lines 1444-1475).
// Live channel + guest → CCV из Twitch + Twitch sign-in CTA вместо request.

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  /** Current concurrent viewers from Twitch (live channel) */
  ccv: number;
}

export function Frame04NotTrackedLiveGuest({ ccv }: Props) {
  const { t, i18n } = useTranslation();

  const handleTwitchSignIn = () => {
    chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
  };

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

      {/* <div class="sp-ccv-display">Текущие зрители: 5,000 <span ...>(данные Twitch)</span></div> */}
      <div className="sp-ccv-display">
        {t('not_tracked.platform_viewers', { N: formatNumber(ccv, i18n.language) })}{' '}
        <span style={{ fontSize: '10px', color: 'var(--ink-30)' }}>
          {t('not_tracked.platform_viewers_source')}
        </span>
      </div>

      {/* <div style="font-size:12px;color:var(--ink-50);text-align:center;font-family:'Inter',sans-serif;line-height:1.5;">Анализ недоступен</div> */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--ink-50)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.5,
        }}
      >
        {t('not_tracked.analysis_unavailable')}
      </div>

      {/* <button class="btn btn-twitch">Войдите для запроса</button> */}
      <button className="btn btn-twitch" onClick={handleTwitchSignIn}>
        {t('not_tracked.guest_request_btn')}
      </button>
    </div>
  );
}
