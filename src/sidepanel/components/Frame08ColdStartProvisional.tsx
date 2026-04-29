// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/08_cold-start-79-strimov.html (sp-content).
// Каждый <div>, <svg>, <circle>, <span> + class + inline style скопирован вербатим из wireframe.
// Real data overrides defaults via JSX expressions.
//
// SOURCE (slim/08 sp-content):
// <div class="sp-content">
//     <div class="sp-gauge-section" role="img" aria-label="ERV 82%">
//         <div class="sp-gauge-wrap">
//             <svg width="120" height="120" viewBox="0 0 120 120">
//                 <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/>
//                 <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" stroke-width="8"
//                     stroke-dasharray="326.7" stroke-dashoffset="59"
//                     stroke-linecap="round" transform="rotate(-90 60 60)"/>
//             </svg>
//             <div class="sp-gauge-center">
//                 <span class="sp-gauge-percent green">82%</span>
//                 <span class="sp-gauge-sub" title="...">Реальные зрители</span>
//             </div>
//         </div>
//     </div>
//     <div class="sp-erv-hero green">~820 реальных зрителей</div>
//     <div class="sp-erv-ccv">Twitch онлайн: 1,000</div>
//     <div style="text-align:center;"><span class="sp-erv-label green"><span class="erv-dot"></span> Аномалий не замечено · 82%</span></div>
//     <div class="sp-ti-section">
//         <div class="sp-ti-header">
//             <div class="sp-ti-left">
//                 <span class="sp-ti-label" title="...">Рейтинг доверия</span>
//                 <span class="sp-ti-score green">82</span>
//                 <span class="sp-ti-classification">— Порядочный</span>
//             </div>
//             <button class="sp-ti-expand">▾</button>
//         </div>
//     </div>
//     <!-- M4: Not enough data -->
//     <div class="sp-reputation" style="opacity:0.5;border:2.5px solid #8B5CF6;border-radius:12px;padding:10px 12px;background:linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%);">
//         <div class="sp-reputation-title" style="color:#7C3AED;"><svg ...></svg> Репутация стримера <span style="font-size:10px;font-weight:400;color:var(--ink-30);">— история канала</span></div>
//         <div style="text-align:center;padding:12px;font-size:11px;color:var(--ink-30);font-family:'JetBrains Mono',monospace;">
//             Для расчёта репутации нужно минимум 10 стримов. Проанализировано 8 из 10.
//         </div>
//     </div>
// </div>

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  classification: string | null;
  streamsCount: number;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame08ColdStartProvisional({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, classification, streamsCount,
}: Props) {
  const { t, i18n } = useTranslation();

  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 82;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <div class="sp-gauge-section" role="img" aria-label="ERV 82%"> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg width="120" height="120" viewBox="0 0 120 120"> */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/> */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            {/* <circle ... stroke="#059669" stroke-dashoffset="59" .../> */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={stroke}
              strokeWidth="8"
              strokeDasharray="326.7"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent green">82%</span> */}
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <div class="sp-erv-hero green">~820 реальных зрителей</div> */}
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>

      {/* <div class="sp-erv-ccv">Twitch онлайн: 1,000</div> */}
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* <div style="text-align:center;"><span class="sp-erv-label green">...</span></div> */}
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%
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
            {/* <span class="sp-ti-score green">82</span> */}
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            {/* <span class="sp-ti-classification">— Порядочный</span> */}
            <span className="sp-ti-classification">
              — {classification ? t(`classification.${classification}`) : t('classification.trusted')}
            </span>
          </div>
          {/* <button class="sp-ti-expand">▾</button> */}
          <button className="sp-ti-expand" aria-label={t('aria.expand') || 'Expand'}>▾</button>
        </div>
      </div>

      {/* <!-- M4: Not enough data --> */}
      {/* <div class="sp-reputation" style="opacity:0.5;border:2.5px solid #8B5CF6;..."> */}
      <div
        className="sp-reputation"
        style={{
          opacity: 0.5,
          border: '2.5px solid #8B5CF6',
          borderRadius: '12px',
          padding: '10px 12px',
          background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
        }}
      >
        {/* <div class="sp-reputation-title" style="color:#7C3AED;"> */}
        <div className="sp-reputation-title" style={{ color: '#7C3AED' }}>
          {/* <svg class="ico" viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#7C3AED;vertical-align:-0.1em;"> */}
          <svg
            className="ico"
            viewBox="0 0 24 24"
            style={{ width: '13px', height: '13px', stroke: '#7C3AED', verticalAlign: '-0.1em' }}
          >
            <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
            <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
            <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
          </svg>{' '}
          {t('sp.rep_title')}{' '}
          {/* <span style="font-size:10px;font-weight:400;color:var(--ink-30);">— история канала</span> */}
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--ink-30)' }}>
            — {t('sp.rep_subtitle')}
          </span>
        </div>
        {/* <div style="text-align:center;padding:12px;font-size:11px;color:var(--ink-30);font-family:'JetBrains Mono',monospace;"> */}
        <div
          style={{
            textAlign: 'center',
            padding: '12px',
            fontSize: '11px',
            color: 'var(--ink-30)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {t('sp.rep_insufficient_for_calculation', { current: streamsCount })}
        </div>
      </div>
    </div>
  );
}
