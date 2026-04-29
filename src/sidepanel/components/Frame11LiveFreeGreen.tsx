// LITERAL PORT + DATA WIRING — wireframe slim/11/12/13. Color variants via ervLabelColor.
// M3/M4 в paywall blurred preview — read-only (no expand handlers, full UX в Premium).
// Audience real data; sparkline coords остаются hardcoded (defer to chart-wiring pass).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Signal {
  type: string;
  value: number;
  confidence: number | null;
  weight: number | null;
  contribution: number;
  metadata: Record<string, unknown> | null;
}

interface ReputationData {
  growth_pattern_score: number | null;
  follower_quality_score: number | null;
  engagement_consistency_score: number | null;
}

interface Country {
  country_code: string;
  percentage: number;
  viewer_count: number;
}

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  classification: string | null;
  percentile: number | null;
  signals?: Signal[];
  reputation?: ReputationData | null;
  topCountries?: Country[] | null;
  onNavigate?: (tab: string) => void;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

function flagEmoji(code: string): string {
  if (code.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(A + upper.charCodeAt(0) - 'A'.charCodeAt(0), A + upper.charCodeAt(1) - 'A'.charCodeAt(0));
}

export function Frame11LiveFreeGreen({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, classification, percentile,
  signals = [], reputation = null, topCountries = null, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();

  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 85;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const handleUpgrade = () => {
    chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' });
  };

  // Signal lookup
  const signalMap = new Map<string, Signal>();
  for (const s of signals) signalMap.set(s.type, s);
  function sig(type: string, defaultPct: number, defaultDisplay: string) {
    const s = signalMap.get(type);
    if (s != null) {
      const p = Math.round(s.value * 100);
      return { pct: p, display: `${p}%`, color: signalColor(s.value) };
    }
    return { pct: defaultPct, display: defaultDisplay, color: signalColor(defaultPct / 100) };
  }

  // Reputation values
  const repGrowth = reputation?.growth_pattern_score ?? 72;
  const repQuality = reputation?.follower_quality_score ?? 88;
  const repLoyalty = reputation?.engagement_consistency_score ?? 91;

  // Countries
  const countries = (topCountries && topCountries.length > 0) ? topCountries.slice(0, 3) : [
    { country_code: 'RU', percentage: 45, viewer_count: 0 },
    { country_code: 'UA', percentage: 20, viewer_count: 0 },
    { country_code: 'KZ', percentage: 10, viewer_count: 0 },
  ];
  const countryName = (code: string): string => {
    try { return new Intl.DisplayNames([i18n.language || 'en'], { type: 'region' }).of(code) || code; }
    catch { return code; }
  };

  // Alert dismiss state — local toggle (alerts hide on click ×)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const dismiss = (key: string) => setDismissed(p => { const n = new Set(p); n.add(key); return n; });

  // M3 paywall preview — 5 first signals
  const s1 = sig('auth_ratio', 82, '82%');
  const s2 = sig('chatter_to_ccv_ratio', 75, t('signal.value_norm'));
  const s3 = sig('ccv_step_function', 95, t('signal.value_norm'));
  const s4 = sig('ccv_tier_clustering', 88, '88%');
  const s5 = sig('per_user_chat_behavior', 70, '70%');

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <!-- Alert Counter — frame 12 wireframe (yellow ERV) + frame 13 (red ERV).
            Frame 11 (green) не показывает alerts. --> */}
      {color === 'yellow' && !dismissed.has('yellow_surge') && (
        <div className="sp-alert-stack">
          <div className="sp-alert yellow" role="alert" aria-live="polite">
            <span className="sp-alert-dot"></span>
            <span>{t('sp.alert_yellow_surge', { count: '2,400', minutes: 5 })}</span>
            <button className="sp-alert-dismiss" aria-label={t('aria.close')} onClick={() => dismiss('yellow_surge')}>×</button>
          </div>
        </div>
      )}
      {color === 'red' && (!dismissed.has('red_surge') || !dismissed.has('red_unauth')) && (
        <div className="sp-alert-stack">
          {!dismissed.has('red_surge') && (
            <div className="sp-alert red" role="alert">
              <span className="sp-alert-dot"></span>
              <span>{t('sp.alert_red_surge', { count: '5,000', minutes: 2 })}</span>
              <button className="sp-alert-dismiss" aria-label={t('aria.close')} onClick={() => dismiss('red_surge')}>×</button>
            </div>
          )}
          {!dismissed.has('red_unauth') && (
            <div className="sp-alert red" role="alert">
              <span className="sp-alert-dot"></span>
              <span>{t('sp.alert_red_unauthorized', { pct: 80 })}</span>
              <button className="sp-alert-dismiss" aria-label={t('aria.close')} onClick={() => dismiss('red_unauth')}>×</button>
            </div>
          )}
        </div>
      )}

      {/* <!-- M1: ERV Gauge --> */}
      {/* <div class="sp-gauge-section" role="img" aria-label="ERV 85%"> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg class="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120"> */}
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/> */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            {/* <circle ... stroke="#059669" stroke-dashoffset="49" ... style="transition: stroke-dashoffset 600ms ease-out;"/> */}
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
              style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
            />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent green">85%</span> */}
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <!-- ERV Hero --> */}
      {/* <div class="sp-erv-hero green">~4,200 реальных зрителей</div> */}
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>
      {/* <div class="sp-erv-ccv">Twitch онлайн: 5,000</div> */}
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* <!-- ERV Label Badge --> */}
      {/* <div style="text-align:center;"><span class="sp-erv-label green">...</span></div> */}
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%
        </span>
      </div>

      {/* <!-- Confidence — per ervLabelColor: green/red → high "Данных достаточно для анализа",
          yellow → medium "Данных достаточно, точность средняя." (per slim/11/12/13). --> */}
      {color === 'yellow' ? (
        <div className="sp-confidence medium">{t('confidence.moderate')}</div>
      ) : (
        <div className="sp-confidence high">{t('confidence.sufficient')}</div>
      )}

      {/* <!-- Trend Indicator --> */}
      {/* <div class="sp-trend up">↑ Реальных зрителей стало больше: +5% за 30мин</div> */}
      <div className="sp-trend up">↑ {t('sp.trend_real_up', { sign: '+', pct: 5 })}</div>

      {/* <!-- M2: TI Badge (with percentile inside) --> */}
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
            {/* <span class="sp-ti-score green">85</span> */}
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            {/* <span class="sp-ti-classification">— Порядочный</span> */}
            <span className="sp-ti-classification">
              — {classification ? t(`classification.${classification}`) : t('classification.trusted')}
            </span>
          </div>
          {/* <button class="sp-ti-expand" aria-label="...">▾</button> */}
          <button className="sp-ti-expand" aria-label={t('aria.expand')}>▾</button>
        </div>
        {/* <div style="margin-top:6px;"><span class="sp-percentile">Выше чем у 85% каналов в категории</span></div> */}
        {percentile != null && (
          <div style={{ marginTop: '6px' }}>
            <span className="sp-percentile">
              {t('sp.percentile_above', { N: percentile })}
            </span>
          </div>
        )}
      </div>

      {/* <!-- M3: Signal Breakdown (paywall for Free) --> */}
      {/* <div class="sp-paywall"> */}
      <div className="sp-paywall">
        {/* <div class="sp-paywall-blurred"> */}
        <div className="sp-paywall-blurred">
          {/* <div class="sp-signals"> */}
          <div className="sp-signals">
            {/* <div class="sp-signals-title">Сигналы (11)</div> */}
            <div className="sp-signals-title">{t('sp.signals_title', { count: 11 })}</div>
            {/* M3 paywall preview rows — values from real signals[] with wireframe defaults fallback */}
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
              <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s1.color}`} style={{ width: `${s1.pct}%` }}></div></div>
              <span className={`sp-signal-val ${s1.color}`}>{s1.display}</span>
            </div>
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
              <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s2.color}`} style={{ width: `${s2.pct}%` }}></div></div>
              <span className={`sp-signal-val ${s2.color}`}>{s2.display}</span>
            </div>
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.ccv_step')}</span>
              <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s3.color}`} style={{ width: `${s3.pct}%` }}></div></div>
              <span className={`sp-signal-val ${s3.color}`}>{s3.display}</span>
            </div>
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.ccv_tier')}</span>
              <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s4.color}`} style={{ width: `${s4.pct}%` }}></div></div>
              <span className={`sp-signal-val ${s4.color}`}>{s4.display}</span>
            </div>
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.chat_behavior')}</span>
              <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s5.color}`} style={{ width: `${s5.pct}%` }}></div></div>
              <span className={`sp-signal-val ${s5.color}`}>{s5.display}</span>
            </div>
          </div>
        </div>
        {/* <div class="sp-paywall-overlay"> */}
        <div className="sp-paywall-overlay">
          {/* <span class="sp-paywall-text">Полный анализ сигналов</span> */}
          <span className="sp-paywall-text">{t('paywall.signals_full_analysis')}</span>
          {/* <button class="sp-paywall-cta">Обновить до Premium</button> */}
          <button className="sp-paywall-cta" onClick={handleUpgrade}>
            {t('paywall.upgrade_premium_cta')}
          </button>
        </div>
      </div>

      {/* <!-- M4: Reputation (paywall for Free) --> */}
      <div className="sp-paywall">
        <div className="sp-paywall-blurred">
          {/* <div class="sp-reputation" style="border:2.5px solid #8B5CF6;border-radius:12px;padding:10px 12px;background:linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%);"> */}
          <div
            className="sp-reputation"
            style={{
              border: '2.5px solid #8B5CF6',
              borderRadius: '12px',
              padding: '10px 12px',
              background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
            }}
          >
            {/* <div class="sp-reputation-title" style="color:#7C3AED;"><svg ...></svg> Репутация стримера <span style="font-size:10px;font-weight:400;color:var(--ink-30);">— история канала</span></div> */}
            <div className="sp-reputation-title" style={{ color: '#7C3AED' }}>
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
              <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--ink-30)' }}>
                — {t('sp.rep_subtitle')}
              </span>
            </div>
            {/* M4 paywall preview rows — values from real reputation prop with defaults fallback */}
            <div className="sp-rep-row">
              <span className="sp-rep-name">{t('sp.rep_growth')}</span>
              <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                <div className="sp-rep-bar-fill" style={{ width: `${repGrowth}%`, background: '#8B5CF6' }}></div>
              </div>
              <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repGrowth)}</span>
            </div>
            <div className="sp-rep-row">
              <span className="sp-rep-name">{t('sp.rep_quality')}</span>
              <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                <div className="sp-rep-bar-fill" style={{ width: `${repQuality}%`, background: '#8B5CF6' }}></div>
              </div>
              <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repQuality)}</span>
            </div>
            <div className="sp-rep-row">
              <span className="sp-rep-name">{t('sp.rep_loyalty')}</span>
              <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                <div className="sp-rep-bar-fill" style={{ width: `${repLoyalty}%`, background: '#8B5CF6' }}></div>
              </div>
              <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repLoyalty)}</span>
            </div>
          </div>
        </div>
        <div className="sp-paywall-overlay">
          {/* <span class="sp-paywall-text"><svg ...></svg> Репутация стримера</span> */}
          <span className="sp-paywall-text">
            <svg
              className="ico"
              viewBox="0 0 24 24"
              style={{ width: '13px', height: '13px', stroke: '#7C3AED', verticalAlign: '-0.1em' }}
            >
              <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
              <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
              <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
            </svg>{' '}
            {t('sp.rep_title')}
          </span>
          <button className="sp-paywall-cta" onClick={handleUpgrade}>
            {t('paywall.upgrade_premium_cta')}
          </button>
        </div>
      </div>

      {/* <!-- M5: Mini Sparkline --> */}
      {/* <div class="sp-sparkline"> */}
      <div className="sp-sparkline">
        {/* <div class="sp-sparkline-header"> */}
        <div className="sp-sparkline-header">
          {/* <span class="sp-sparkline-title">Зрители за 30 минут</span> */}
          <span className="sp-sparkline-title">{t('sp.sparkline_title_live')}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('trends'); }}>
            {t('sp.more')}
          </a>
        </div>
        {/* <div class="sp-chart-stats"> */}
        <div className="sp-chart-stats">
          {/* <div class="sp-chart-stat"><div class="sp-chart-stat-label">Сейчас</div><div class="sp-chart-stat-value green">4,200</div></div> */}
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_now')}</div>
            <div className="sp-chart-stat-value green">4,200</div>
          </div>
          {/* <div class="sp-chart-stat"><div class="sp-chart-stat-label">Макс</div><div class="sp-chart-stat-value">4,500</div></div> */}
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_max')}</div>
            <div className="sp-chart-stat-value">4,500</div>
          </div>
          {/* <div class="sp-chart-stat"><div class="sp-chart-stat-label">Изм. 30м</div><div class="sp-chart-stat-value green">+8%</div></div> */}
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div>
            <div className="sp-chart-stat-value green">+8%</div>
          </div>
        </div>
        {/* <svg class="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none"> */}
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          {/* <!-- Horizontal grid dashed --> */}
          {/* <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="2,3"/> */}
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          {/* <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="2,3"/> */}
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          {/* <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="2,3"/> */}
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          {/* <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" stroke-width="1"/> */}
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          {/* <!-- Y labels --> */}
          {/* <text x="30" y="24" text-anchor="end" font-size="9" fill="#9ca3af" font-family="JetBrains Mono,monospace">5K</text> */}
          <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">5K</text>
          <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">4K</text>
          <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">3K</text>
          <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          {/* <!-- X labels --> */}
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−30м</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−20м</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−10м</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_now_label')}</text>
          {/* <!-- ERV area --> */}
          {/* <path d="M34,90 L64,85 L94,80 L124,82 L154,75 L184,72 L214,68 L244,62 L274,55 L304,52 L330,48 L330,125 L34,125 Z" fill="#059669" fill-opacity="0.08"/> */}
          <path
            d="M34,90 L64,85 L94,80 L124,82 L154,75 L184,72 L214,68 L244,62 L274,55 L304,52 L330,48 L330,125 L34,125 Z"
            fill="#059669"
            fillOpacity="0.08"
          />
          {/* <!-- Total online dashed grey --> */}
          {/* <polyline points="34,75 64,70 94,65 124,63 154,58 184,55 214,50 244,44 274,38 304,32 330,28" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="3,2"/> */}
          <polyline
            points="34,75 64,70 94,65 124,63 154,58 184,55 214,50 244,44 274,38 304,32 330,28"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
          {/* <!-- ERV solid green --> */}
          <polyline
            points="34,90 64,85 94,80 124,82 154,75 184,72 214,68 244,62 274,55 304,52 330,48"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
          />
          {/* <!-- Markers --> */}
          <circle cx="34" cy="90" r="2.5" fill="#059669" />
          <circle cx="154" cy="75" r="2.5" fill="#059669" />
          <circle cx="244" cy="62" r="2.5" fill="#059669" />
          <circle cx="330" cy="48" r="4" fill="#059669" stroke="white" strokeWidth="2" />
        </svg>
        {/* <div class="sp-sparkline-legend"> */}
        <div className="sp-sparkline-legend">
          {/* <span class="sp-sparkline-legend-item"><span class="sp-sparkline-legend-line green"></span> Реальные (ERV)</span> */}
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line green"></span> {t('sp.legend_real_viewers')}
          </span>
          {/* <span class="sp-sparkline-legend-item"><span class="sp-sparkline-legend-line grey"></span> Всего онлайн</span> */}
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online')}
          </span>
        </div>
      </div>

      {/* <!-- M6: Audience Preview --> */}
      {/* <div class="sp-audience"> */}
      <div className="sp-audience">
        {/* <div class="sp-audience-header"> */}
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('audience'); }}>
            {t('sp.more')}
          </a>
        </div>
        {/* Audience rows real from countries[] */}
        <div className="sp-audience-row">
          <span className="sp-audience-flag">{flagEmoji(countries[0].country_code)}</span>
          <span className="sp-audience-country">{countryName(countries[0].country_code)}</span>
          <span className="sp-audience-pct">{Math.round(countries[0].percentage)}%</span>
        </div>
        {countries[1] && (
          <div className="sp-audience-row">
            <span className="sp-audience-flag">{flagEmoji(countries[1].country_code)}</span>
            <span className="sp-audience-country">{countryName(countries[1].country_code)}</span>
            <span className="sp-audience-pct">{Math.round(countries[1].percentage)}%</span>
          </div>
        )}
        {countries[2] && (
          <div className="sp-audience-row">
            <span className="sp-audience-flag">{flagEmoji(countries[2].country_code)}</span>
            <span className="sp-audience-country">{countryName(countries[2].country_code)}</span>
            <span className="sp-audience-pct">{Math.round(countries[2].percentage)}%</span>
          </div>
        )}
      </div>

      {/* Watchlist button — click navigates to Watchlists tab */}
      <button className="sp-watchlist-btn" onClick={() => onNavigate?.('watchlists')}>
        <svg
          className="ico ico-sm"
          viewBox="0 0 24 24"
          style={{ verticalAlign: '-0.2em', strokeWidth: 1.5 }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>{' '}
        {t('sp.watchlist_add')}
      </button>
    </div>
  );
}
