// LITERAL PORT + DATA WIRING — wireframe slim/12_live-free-yellow-62.html.
// Yellow ERV color variant (50-79%). Anomaly detected. Standalone (NOT parametrized).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';
import { useSparkline } from '../hooks/useSparkline';

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
  tiScore: number | null;
  classification: string | null;
  percentile: number | null;
  channelId?: string | null;
  signals?: Signal[];
  reputation?: ReputationData | null;
  topCountries?: Country[] | null;
  onNavigate?: (tab: string) => void;
}

const CIRCUMFERENCE = 326.7;

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

export function Frame12LiveFreeYellow({
  ervPercent, ervCount, ccv, tiScore, classification, percentile,
  channelId = null, signals = [], reputation = null, topCountries = null, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const chart = useSparkline(channelId, true, false); // Free user — 30m only

  const pct = ervPercent ?? 62;
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

  // Reputation values — wireframe slim/12 defaults (lower than green)
  const repGrowth = reputation?.growth_pattern_score ?? 45;
  const repQuality = reputation?.follower_quality_score ?? 52;

  // Countries — wireframe slim/12 defaults US/UK/DE
  const countries = (topCountries && topCountries.length > 0) ? topCountries.slice(0, 3) : [
    { country_code: 'US', percentage: 38, viewer_count: 0 },
    { country_code: 'GB', percentage: 15, viewer_count: 0 },
    { country_code: 'DE', percentage: 8, viewer_count: 0 },
  ];
  const countryName = (code: string): string => {
    try { return new Intl.DisplayNames([i18n.language || 'en'], { type: 'region' }).of(code) || code; }
    catch { return code; }
  };

  // TI expand state — wireframe slim/12 percentile visible
  const [tiExpanded, setTiExpanded] = useState(true);

  // Yellow alert dismiss (wireframe slim/12 — single yellow alert, dismissable)
  const [alertDismissed, setAlertDismissed] = useState(false);

  // M3 paywall preview — 3 first signals (wireframe slim/12 narrower preview)
  const s1 = sig('auth_ratio', 55, '55%');
  const s2 = sig('chatter_to_ccv_ratio', 30, t('signal.value_low'));
  const s3 = sig('ccv_step_function', 60, t('signal.value_surge'));
  // Note: wireframe slim/12 shows 3 rows (Авторизация / Чат / Рост зрителей)

  return (
    <div className="sp-content" role="tabpanel">
      {/* Alert Counter — wireframe slim/12: single yellow alert "Скачок зрителей" */}
      {!alertDismissed && (
        <div className="sp-alert-stack">
          <div className="sp-alert yellow" role="alert" aria-live="polite">
            <span className="sp-alert-dot"></span>
            <span>{t('sp.alert_yellow_surge', { count: '2,400', minutes: 5 })}</span>
            <button className="sp-alert-dismiss" aria-label={t('aria.close')} onClick={() => setAlertDismissed(true)}>×</button>
          </div>
        </div>
      )}

      {/* M1: ERV Gauge — yellow */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#D97706"
              strokeWidth="8"
              strokeDasharray="326.7"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
            />
          </svg>
          <div className="sp-gauge-center">
            <span className="sp-gauge-percent yellow">{pct}%</span>
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* ERV Hero — yellow */}
      <div className="sp-erv-hero yellow">
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* ERV Label Badge — yellow */}
      <div style={{ textAlign: 'center' }}>
        <span className="sp-erv-label yellow">
          <span className="erv-dot"></span> {t('erv_label.yellow')} · {pct}%
        </span>
      </div>

      {/* Confidence — wireframe slim/12: medium "точность средняя" */}
      <div className="sp-confidence medium">{t('confidence.moderate')}</div>

      {/* Trend Indicator — wireframe slim/12: ↓ down −8% */}
      <div className="sp-trend down">↓ {t('sp.trend_real_down', { sign: '−', pct: 8 })}</div>

      {/* M2: TI Badge — yellow score 62 */}
      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
              {t('sp.trust_rating')}
            </span>
            <span className="sp-ti-score yellow">{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">
              — {classification ? t(`classification.${classification}`) : t('classification.needs_review')}
            </span>
          </div>
          <button
            className={`sp-ti-expand${tiExpanded ? ' open' : ''}`}
            aria-label={t('aria.expand')}
            aria-expanded={tiExpanded}
            onClick={() => setTiExpanded(v => !v)}
          >▾</button>
        </div>
        {tiExpanded && (
          <div style={{ marginTop: '6px' }}>
            <span className="sp-percentile">
              {t('sp.percentile_above', { N: percentile ?? 42 })}
            </span>
          </div>
        )}
      </div>

      {/* M3: Signal Breakdown (paywall blurred) — wireframe slim/12: 3 rows */}
      <div className="sp-paywall">
        <div className="sp-paywall-blurred">
          <div className="sp-signals" style={{ padding: '8px' }}>
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
          </div>
        </div>
        <div className="sp-paywall-overlay">
          <span className="sp-paywall-text">{t('paywall.signals_full_analysis')}</span>
          <button className="sp-paywall-cta" onClick={handleUpgrade}>
            {t('paywall.upgrade_premium_cta')}
          </button>
        </div>
      </div>

      {/* M4: Reputation (paywall blurred) — wireframe slim/12: 2 rows */}
      <div className="sp-paywall">
        <div className="sp-paywall-blurred">
          <div
            className="sp-reputation"
            style={{
              padding: '8px',
              border: '2.5px solid #8B5CF6',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
            }}
          >
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
          </div>
        </div>
        <div className="sp-paywall-overlay">
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

      {/* M5: Mini Sparkline — wireframe slim/12 YELLOW shape (ERV flat + total online drift) */}
      <div className="sp-sparkline">
        <div className="sp-sparkline-header">
          <span className="sp-sparkline-title">{t('sp.sparkline_title_live')}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('trends'); }}>
            {t('sp.more')}
          </a>
        </div>
        <div className="sp-chart-stats">
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_real_short')}</div>
            <div className="sp-chart-stat-value yellow">{chart?.stats.now != null ? formatNumber(chart.stats.now, i18n.language) : '7,400'}</div>
          </div>
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_online_short')}</div>
            <div className="sp-chart-stat-value">{chart?.stats.max != null ? formatNumber(chart.stats.max, i18n.language) : '12,000'}</div>
          </div>
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div>
            <div className="sp-chart-stat-value yellow">{chart?.stats.change != null ? `${chart.stats.change >= 0 ? '+' : ''}${chart.stats.change}%` : '−10%'}</div>
          </div>
        </div>
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          {/* Horizontal grid */}
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          {/* Y labels — wireframe slim/12 defaults 15K/10K/5K/0 */}
          {chart ? chart.yLabels.map((l) => (
            <text key={l.y} x="30" y={l.y} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">{l.label}</text>
          )) : (<>
            <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">15K</text>
            <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">10K</text>
            <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">5K</text>
            <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          </>)}
          {/* X labels */}
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−30м</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−20м</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−10м</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_now_label')}</text>
          {/* ERV area / polyline / markers — wireframe slim/12 YELLOW coords (flat declining) */}
          <path
            d={chart?.ervAreaPath ?? "M34,72 L64,70 L94,68 L124,66 L154,70 L184,75 L214,82 L244,88 L274,92 L304,90 L330,85 L330,125 L34,125 Z"}
            fill="#D97706"
            fillOpacity="0.08"
          />
          {/* Total online (grey dashed) — drifting away from ERV = anomaly */}
          <polyline
            points={chart?.ccvPolylinePoints ?? "34,58 64,52 94,46 124,40 154,34 184,28 214,22 244,18 274,16 304,20 330,24"}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
          {/* ERV yellow */}
          <polyline
            points={chart?.ervPolylinePoints ?? "34,72 64,70 94,68 124,66 154,70 184,75 214,82 244,88 274,92 304,90 330,85"}
            fill="none"
            stroke="#D97706"
            strokeWidth="2"
          />
          {chart ? chart.markers.map((m, i) => (
            <circle key={i} cx={m.cx} cy={m.cy} r={m.r} fill="#D97706" stroke={m.isLast ? 'white' : 'none'} strokeWidth={m.isLast ? 2 : 0} />
          )) : (<>
            <circle cx="34" cy="72" r="2.5" fill="#D97706" />
            <circle cx="154" cy="70" r="2.5" fill="#D97706" />
            <circle cx="244" cy="88" r="2.5" fill="#D97706" />
            <circle cx="330" cy="85" r="4" fill="#D97706" stroke="white" strokeWidth="2" />
          </>)}
        </svg>
        <div className="sp-sparkline-legend">
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line" style={{ background: '#D97706' }}></span> {t('sp.legend_real_viewers')}
          </span>
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online')}
          </span>
        </div>
      </div>

      {/* M6: Audience Preview — wireframe slim/12: US/UK/DE */}
      <div className="sp-audience">
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('audience'); }}>
            {t('sp.more')}
          </a>
        </div>
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

      {/* Watchlist button */}
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
