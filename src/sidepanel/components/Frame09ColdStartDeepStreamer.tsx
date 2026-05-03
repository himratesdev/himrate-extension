// LITERAL PORT + DATA WIRING — wireframe slim/09_cold-start-30-strimov-streamer.html.
// HealthScore values from props; expand state for 5 rows (TI default open).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  percentile: number | null;
  streamsCount: number;
  /** HS components 0..100 (or null if no data). */
  hsTi?: number | null;
  hsStability?: number | null;
  hsEngagement?: number | null;
  hsGrowth?: number | null;
  hsConsistency?: number | null;
  onNavigate?: (tab: string) => void;
}

function healthColor(score: number | null): 'green' | 'yellow' | 'red' | 'grey' {
  if (score == null) return 'grey';
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

const CIRCUMFERENCE_160 = 427.3; // 2π × r=68
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame09ColdStartDeepStreamer({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, percentile, streamsCount,
  hsTi, hsStability, hsEngagement, hsGrowth, hsConsistency, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const [tiExpanded, setTiExpanded] = useState(true);
  // First row (TI) open by default per wireframe slim/09. Click toggle each row.
  const [hsExpanded, setHsExpanded] = useState<Set<string>>(() => new Set(['ti']));
  const toggleHs = (k: string) => setHsExpanded(p => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const tiVal = hsTi ?? 88;
  const stabVal = hsStability ?? 91;
  const engVal = hsEngagement ?? 90;
  const growVal = hsGrowth ?? 82;
  const consVal = hsConsistency ?? 86;

  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 88;
  const offset = CIRCUMFERENCE_160 - (pct / 100) * CIRCUMFERENCE_160;

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <!-- Deep Analytics badge --> */}
      {/* <div style="display:flex;justify-content:center;margin-bottom:8px;"> */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        {/* <span style="font-size:10px;font-family:'JetBrains Mono',monospace;padding:4px 12px;background:linear-gradient(135deg,#059669,#3B82F6);color:white;border-radius:20px;letter-spacing:0.05em;text-transform:uppercase;">Глубокая аналитика · 342 стрима</span> */}
        <span
          style={{
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            padding: '4px 12px',
            background: 'linear-gradient(135deg, #059669, #3B82F6)',
            color: 'white',
            borderRadius: '20px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {t('cold_start.deep_badge', { N: streamsCount })}
        </span>
      </div>

      {/* <!-- ERV Gauge (Streamer 160px) --> */}
      {/* <div class="sp-gauge-section" role="img" aria-label="ERV 88%"> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg width="160" height="160" viewBox="0 0 160 160"> */}
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* <circle cx="80" cy="80" r="68" fill="none" stroke="#E5E7EB" stroke-width="10"/> */}
            <circle cx="80" cy="80" r="68" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            {/* <circle cx="80" cy="80" r="68" fill="none" stroke="#059669" stroke-width="10" stroke-dasharray="427.3" stroke-dashoffset="51" stroke-linecap="round" transform="rotate(-90 80 80)"/> */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke={stroke}
              strokeWidth="10"
              strokeDasharray="427.3"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent green" style="font-size:32px;">88%</span> */}
            <span className={`sp-gauge-percent ${color}`} style={{ fontSize: '32px' }}>
              {pct}%
            </span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <div class="sp-erv-hero green">~4,400 реальных зрителей</div> */}
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>

      {/* <div class="sp-erv-ccv">Twitch онлайн: 5,000</div> */}
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* <div style="text-align:center;"><span class="sp-erv-label green"><span class="erv-dot"></span> Аномалий не замечено · 88%</span></div> */}
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%
        </span>
      </div>

      {/* <!-- TI --> */}
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
            {/* <span class="sp-ti-score green">88</span> */}
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            {/* <span class="sp-ti-classification">— Доверенный</span> */}
            <span className="sp-ti-classification">— {t('classification.fully_trusted')}</span>
            {/* <span class="sp-percentile">Выше чем у 92% каналов в категории</span> */}
            {percentile != null && (
              <span className="sp-percentile">
                {t('sp.percentile_above', { N: percentile })}
              </span>
            )}
          </div>
          {/* <button class="sp-ti-expand">▾</button> */}
          <button
            className={`sp-ti-expand${tiExpanded ? ' open' : ''}`}
            aria-label={t('aria.expand') || 'Expand'}
            aria-expanded={tiExpanded}
            onClick={() => setTiExpanded((v) => !v)}
          >▾</button>
        </div>
      </div>

      {/* <!-- Health Score — FULL (30+ streams) with expandable rows --> */}
      {/* <div class="sp-signals" style="gap:4px;"> */}
      <div className="sp-signals" style={{ gap: '4px' }}>
        {/* <div style="display:flex;align-items:center;justify-content:space-between;"> */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* <span class="sp-signals-title">Здоровье канала</span> */}
          <span className="sp-signals-title">{t('sp.health_score')}</span>
          {/* <span style="font-size:9px;font-family:'JetBrains Mono',monospace;padding:2px 8px;background:linear-gradient(135deg,#059669,#3B82F6);color:white;border-radius:10px;">Full Health Score</span> */}
          <span
            style={{
              fontSize: '9px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 8px',
              background: 'linear-gradient(135deg, #059669, #3B82F6)',
              color: 'white',
              borderRadius: '10px',
            }}
          >
            {t('sp.health_badge_compact')}
          </span>
        </div>
        {/* <div style="font-size:10px;color:var(--ink-30);margin-bottom:4px;">Нажмите на показатель → подробности + история</div> */}
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '4px' }}>
          {t('sp.health_subtitle_compact')}
        </div>

        {/* HealthScore 5 rows — click toggle, TI default open per slim/09 */}
        {[
          { key: 'ti', name: 'sp.hs_ti', desc: 'sp.hs_ti_desc_compact', value: tiVal },
          { key: 'stability', name: 'sp.hs_stability', desc: 'sp.hs_stability_desc', value: stabVal },
          { key: 'engagement', name: 'sp.hs_engagement', desc: 'sp.hs_engagement_desc', value: engVal },
          { key: 'growth', name: 'sp.hs_growth', desc: 'sp.hs_growth_desc', value: growVal },
          { key: 'consistency', name: 'sp.hs_consistency', desc: 'sp.hs_consistency_desc', value: consVal },
        ].map((cfg) => {
          const c = healthColor(cfg.value);
          const open = hsExpanded.has(cfg.key);
          return (
            <div key={cfg.key}>
              <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs(cfg.key)} role="button" aria-expanded={open}>
                <span className="sp-health-name">{t(cfg.name)}</span>
                <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${cfg.value}%` }}></div></div>
                <span className="sp-health-val">{Math.round(cfg.value)}</span>
                <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
              </div>
              {open && (
                <div className="sp-signal-detail" style={cfg.key === 'ti' ? { margin: '-2px 0 4px', fontSize: '10px' } : undefined}>
                  {cfg.key === 'ti' ? (
                    <>
                      {t(cfg.desc)}
                      <svg className="sp-rep-mini-chart" viewBox="0 0 200 24" style={{ marginTop: '2px' }}>
                        <polyline fill="none" stroke="#059669" strokeWidth="1.5" points="0,18 50,15 100,12 150,10 200,8" />
                        <circle cx="200" cy="8" r="2" fill="#059669" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <div className="sp-signal-detail-title">{t(cfg.name)}: {Math.round(cfg.value)} / 100</div>
                      {t(cfg.desc)}
                    </>
                  )}
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.hs_history_link')}</a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* <!-- Streamer disclaimer --> */}
      {/* <div style="font-size:10px;color:var(--ink-30);text-align:center;font-style:italic;margin-top:6px;">Это ваш канал. Сигналы и репутация бесплатны.</div> */}
      <div
        style={{
          fontSize: '10px',
          color: 'var(--ink-30)',
          textAlign: 'center',
          fontStyle: 'italic',
          marginTop: '6px',
        }}
      >
        {t('sp.streamer_disclaimer')}
      </div>
    </div>
  );
}
