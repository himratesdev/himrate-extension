// Frame 03 — Not Tracked · Live (registered)
// Literal port от wireframes/frames/03_NotTracked_LiveRegistered.html (extracted
// from side-panel-wireframe-TASK-039.html lines 1408-1441).
// Live channel + registered user → CCV из Twitch + кнопка request tracking.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import { formatNumber } from '../../shared/format';

interface Props {
  /** Current concurrent viewers from Twitch (live channel) */
  ccv: number;
  /** Twitch login identifier (route key для request) */
  login: string;
}

export function Frame03NotTrackedLiveRegistered({ ccv, login }: Props) {
  const { t, i18n } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (submitted || loading) return;
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

      {/* <div class="sp-ccv-display">Текущие зрители: 5,000 <span ...>(данные Twitch)</span></div> */}
      <div className="sp-ccv-display">
        {t('not_tracked.platform_viewers', { N: formatNumber(ccv, i18n.language) })}{' '}
        <span style={{ fontSize: '10px', color: 'var(--ink-30)' }}>
          {t('not_tracked.platform_viewers_source')}
        </span>
      </div>

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
        {t('not_tracked.live_subtitle_registered')}
      </div>

      {/* <button class="btn btn-primary">Запросить отслеживание</button> */}
      <button className="btn btn-primary" onClick={handleRequest} disabled={submitted || loading}>
        {buttonLabel}
      </button>
    </div>
  );
}
