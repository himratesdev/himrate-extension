// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/07_cold-start-36-strimov.html (lines 17-49).
// Каждый <div>, <svg>, <circle>, <span> + class + inline style скопирован вербатим из wireframe.
// Real data overrides wireframe defaults via JSX expressions (gauge offset, stream counts, etc.).
//
// SOURCE (slim/07 sp-content):
// <div class="sp-content">
//     <div class="sp-gauge-section">
//         <div class="sp-gauge-wrap">
//             <svg width="120" height="120" viewBox="0 0 120 120">
//                 <circle cx="60" cy="60" r="52" fill="none" stroke="#D97706" stroke-width="4" stroke-dasharray="8 4"/>
//                 <circle cx="60" cy="60" r="52" fill="none" stroke="#D97706" stroke-width="4"
//                     stroke-dasharray="326.7" stroke-dashoffset="98"
//                     stroke-linecap="round" transform="rotate(-90 60 60)" opacity="0.6"/>
//             </svg>
//             <div class="sp-gauge-center">
//                 <span class="sp-gauge-percent yellow" style="font-size:24px;">70%</span>
//                 <span class="sp-gauge-sub" title="...">Реальные зрители</span>
//             </div>
//         </div>
//     </div>
//     <div style="text-align:center;">
//         <span class="sp-health-provisional yellow">Provisional · 4/10 стримов</span>
//     </div>
//     <div class="sp-erv-hero yellow">~700 реальных зрителей</div>
//     <div class="sp-erv-ccv">Twitch онлайн: 1,000</div>
//     <div style="text-align:center;"><span class="sp-erv-label yellow"><span class="erv-dot"></span> Аномалия онлайна · 70%</span></div>
//     <div class="sp-ti-section">
//         <div class="sp-ti-header">
//             <div class="sp-ti-left">
//                 <span class="sp-ti-label" title="...">Рейтинг доверия</span>
//                 <span class="sp-ti-score yellow">70</span>
//                 <span class="sp-ti-classification">— Предварительный</span>
//             </div>
//         </div>
//     </div>
//     <div class="collecting-status">
//         ⏳ Данные предварительные. 4 из 10 стримов проанализировано.
//     </div>
// </div>

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  tiScore: number | null;
  streamsCount: number;
}

const CIRCUMFERENCE = 326.7; // 2π × r=52

export function Frame07ColdStartProvisionalLow({ ervPercent, ervCount, ccv, tiScore, streamsCount }: Props) {
  const { t, i18n } = useTranslation();

  const pct = ervPercent ?? 70;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <div class="sp-gauge-section"> */}
      <div className="sp-gauge-section">
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg width="120" height="120" viewBox="0 0 120 120"> */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#D97706" stroke-width="4" stroke-dasharray="8 4"/> */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#D97706" strokeWidth="4" strokeDasharray="8 4" />
            {/* <circle ... stroke-dashoffset="98" ... opacity="0.6"/> */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#D97706"
              strokeWidth="4"
              strokeDasharray="326.7"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              opacity="0.6"
            />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent yellow" style="font-size:24px;">70%</span> */}
            <span className="sp-gauge-percent yellow" style={{ fontSize: '24px' }}>
              {pct}%
            </span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <div style="text-align:center;"> */}
      <div style={{ textAlign: 'center' }}>
        {/* <span class="sp-health-provisional yellow">Provisional · 4/10 стримов</span> */}
        <span className="sp-health-provisional yellow">
          {t('cold_start.provisional_streams', { N: streamsCount })}
        </span>
      </div>

      {/* <div class="sp-erv-hero yellow">~700 реальных зрителей</div> */}
      <div className="sp-erv-hero yellow">
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>

      {/* <div class="sp-erv-ccv">Twitch онлайн: 1,000</div> */}
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* <div style="text-align:center;"><span class="sp-erv-label yellow"><span class="erv-dot"></span> Аномалия онлайна · 70%</span></div> */}
      <div style={{ textAlign: 'center' }}>
        <span className="sp-erv-label yellow">
          <span className="erv-dot"></span> {t('erv_label.yellow')} · {pct}%
        </span>
      </div>

      {/* <div class="sp-ti-section"> */}
      <div className="sp-ti-section">
        {/* <div class="sp-ti-header"> */}
        <div className="sp-ti-header">
          {/* <div class="sp-ti-left"> */}
          <div className="sp-ti-left">
            {/* <span class="sp-ti-label" title="...">Рейтинг доверия</span> */}
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
              {t('sp.trust_rating')}
            </span>
            {/* <span class="sp-ti-score yellow">70</span> */}
            <span className="sp-ti-score yellow">{tiScore ?? '—'}</span>
            {/* <span class="sp-ti-classification">— Предварительный</span> */}
            <span className="sp-ti-classification">— {t('classification.provisional')}</span>
          </div>
        </div>
      </div>

      {/* <div class="collecting-status">⏳ Данные предварительные. 4 из 10 стримов проанализировано.</div> */}
      <div className="collecting-status">
        {t('cold_start.collecting_provisional', { current: streamsCount, required: 10 })}
      </div>
    </div>
  );
}
