// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/06_cold-start-3-strimov.html.
// Каждый <div>, <svg>, <circle>, <span> + class + inline style скопирован вербатим из wireframe.
// Real data ОТСУТСТВУЕТ (frame 06 = insufficient, gauge показывает "—").
//
// SOURCE (wireframe slim/06 lines 16-43):
// <div class="sp-content">
//     <!-- Grey Gauge -->
//     <div class="sp-gauge-section" style="cursor:default;">
//         <div class="sp-gauge-wrap">
//             <svg width="120" height="120" viewBox="0 0 120 120">
//                 <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/>
//             </svg>
//             <div class="sp-gauge-center">
//                 <span class="sp-gauge-percent grey">—</span>
//                 <span class="sp-gauge-sub" title="...">Реальные зрители</span>
//             </div>
//         </div>
//     </div>
//     <div class="sp-erv-hero grey">Недостаточно данных</div>
//     <div class="sp-erv-ccv">1 из 3 стримов для анализа</div>
//     <!-- TI placeholder -->
//     <div class="sp-ti-section">
//         <div class="sp-ti-header">
//             <div class="sp-ti-left">
//                 <span class="sp-ti-label" title="...">Рейтинг доверия</span>
//                 <span class="sp-ti-score" style="color:var(--ink-30);">—</span>
//             </div>
//         </div>
//     </div>
//     <div class="collecting-status">
//         ⏳ Данные собираются. Необходимо минимум 3 стрима для начала анализа.
//     </div>
// </div>

import { useTranslation } from 'react-i18next';

interface Props {
  /** Streams analyzed so far (1, 2 — insufficient state shows N of 3). */
  streamsCount: number;
}

export function Frame06ColdStartInsufficient({ streamsCount }: Props) {
  const { t } = useTranslation();

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <!-- Grey Gauge --> */}
      {/* <div class="sp-gauge-section" style="cursor:default;"> */}
      <div className="sp-gauge-section" style={{ cursor: 'default' }}>
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg width="120" height="120" viewBox="0 0 120 120"> */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/> */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent grey">—</span> */}
            <span className="sp-gauge-percent grey">—</span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <div class="sp-erv-hero grey">Недостаточно данных</div> */}
      <div className="sp-erv-hero grey">{t('cold_start.insufficient_data')}</div>

      {/* <div class="sp-erv-ccv">1 из 3 стримов для анализа</div> */}
      <div className="sp-erv-ccv">
        {t('cold_start.streams_for_analysis', { current: streamsCount, required: 3 })}
      </div>

      {/* <!-- TI placeholder --> */}
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
            {/* <span class="sp-ti-score" style="color:var(--ink-30);">—</span> */}
            <span className="sp-ti-score" style={{ color: 'var(--ink-30)' }}>—</span>
          </div>
        </div>
      </div>

      {/* <div class="collecting-status">⏳ Данные собираются...</div> */}
      <div className="collecting-status">
        {t('cold_start.collecting_min3')}
      </div>
    </div>
  );
}
