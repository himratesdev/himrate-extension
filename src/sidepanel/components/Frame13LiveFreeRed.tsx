// LITERAL PORT + DATA WIRING — wireframe slim/13_live-free-red-28.html.
// Red ERV color variant (<50%). Significant anomaly detected. Standalone.

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

export function Frame13LiveFreeRed({
  ervPercent, ervCount, ccv, tiScore, classification, percentile,
  channelId = null, signals = [], reputation = null, topCountries = null, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const chart = useSparkline(channelId, true, false); // Free user — 30m only

  const pct = ervPercent ?? 28;
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

  // Reputation values — wireframe slim/13 defaults (very low)
  const repGrowth = reputation?.growth_pattern_score ?? 15;

  // Countries — wireframe slim/13 defaults TR/ID/BR
  const countries = (topCountries && topCountries.length > 0) ? topCountries.slice(0, 3) : [
    { country_code: 'TR', percentage: 55, viewer_count: 0 },
    { country_code: 'ID', percentage: 22, viewer_count: 0 },
    { country_code: 'BR', percentage: 8, viewer_count: 0 },
  ];
  const countryName = (code: string): string => {
    try { return new Intl.DisplayNames([i18n.language || 'en'], { type: 'region' }).of(code) || code; }
    catch { return code; }
  };

  // TI expand state — wireframe slim/13 percentile visible
  const [tiExpanded, setTiExpanded] = useState(true);

  // Red alerts dismissable separately (wireframe slim/13: 2 alerts)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const dismiss = (key: string) => setDismissed(p => { const n = new Set(p); n.add(key); return n; });

  // M3 paywall preview — 2 first signals (wireframe slim/13 narrowest preview)
  const s1 = sig('auth_ratio', 20, '20%');
  const s2 = sig('chatter_to_ccv_ratio', 12, t('signal.value_low'));

  return (
    <div className="sp-content" role="tabpanel">
      {/* Alerts — wireframe slim/13: 2 red alerts */}
      {(!dismissed.has('red_surge') || !dismissed.has('red_unauth')) && (
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

      {/* M1: ERV Gauge — red */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#DC2626"
              strokeWidth="8"
              strokeDasharray="326.7"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
            />
          </svg>
          <div className="sp-gauge-center">
            <span className="sp-gauge-percent red">{pct}%</span>
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* ERV Hero — red */}
      <div className="sp-erv-hero red">
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* ERV Label Badge — red */}
      <div style={{ textAlign: 'center' }}>
        <span className="sp-erv-label red">
          <span className="erv-dot"></span> {t('erv_label.red')} · {pct}%
        </span>
      </div>

      {/* Confidence — wireframe slim/13: high "Данных достаточно для анализа" */}
      <div className="sp-confidence high">{t('confidence.sufficient')}</div>

      {/* Trend Indicator — wireframe slim/13: ↓ down −15% */}
      <div className="sp-trend down">↓ {t('sp.trend_real_down', { sign: '−', pct: 15 })}</div>

      {/* M2: TI Badge — red score 28 + suspicious classification */}
      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
              {t('sp.trust_rating')}
            </span>
            <span className="sp-ti-score red">{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">
              — {classification ? t(`classification.${classification}`) : t('classification.suspicious')}
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
              {t('sp.percentile_below', { N: percentile ?? 90 })}
            </span>
          </div>
        )}
      </div>

      {/* M3: Signal Breakdown (paywall blurred) — wireframe slim/13: 2 rows */}
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
          </div>
        </div>
        <div className="sp-paywall-overlay">
          <span className="sp-paywall-text">{t('paywall.signals_full_analysis')}</span>
          <button className="sp-paywall-cta" onClick={handleUpgrade}>
            {t('paywall.upgrade_premium_cta')}
          </button>
        </div>
      </div>

      {/* M4: Reputation (paywall blurred) — wireframe slim/13: 1 row */}
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

      {/* M5: Mini Sparkline — wireframe slim/13 RED shape (ERV flat low + CCV spike + anomaly rect) */}
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
            <div className="sp-chart-stat-value red">{chart?.stats.now != null ? formatNumber(chart.stats.now, i18n.language) : '3,100'}</div>
          </div>
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_online_short')}</div>
            <div className="sp-chart-stat-value">{chart?.stats.max != null ? formatNumber(chart.stats.max, i18n.language) : '15,000'}</div>
          </div>
          <div className="sp-chart-stat">
            <div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div>
            <div className="sp-chart-stat-value red">{chart?.stats.change != null ? `${chart.stats.change >= 0 ? '+' : ''}${chart.stats.change}%` : '−26%'}</div>
          </div>
        </div>
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          {/* Horizontal grid */}
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          {/* Y labels — wireframe slim/13 defaults 20K/10K/5K/0 */}
          {chart ? chart.yLabels.map((l) => (
            <text key={l.y} x="30" y={l.y} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">{l.label}</text>
          )) : (<>
            <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">20K</text>
            <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">10K</text>
            <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">5K</text>
            <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          </>)}
          {/* X labels */}
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−30м</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−20м</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−10м</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_now_label')}</text>
          {/* ERV area / polyline / markers — wireframe slim/13 RED coords (flat low) */}
          <path
            d={chart?.ervAreaPath ?? "M34,104 L64,102 L94,100 L124,100 L154,98 L184,102 L214,104 L244,108 L274,110 L304,112 L330,112 L330,125 L34,125 Z"}
            fill="#DC2626"
            fillOpacity="0.06"
          />
          {/* Total online (grey dashed) — huge spike (anomalous wave) */}
          <polyline
            points={chart?.ccvPolylinePoints ?? "34,100 64,92 94,85 124,70 154,50 184,25 214,18 244,20 274,24 304,28 330,32"}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
          {/* ERV red solid — flat/declining */}
          <polyline
            points={chart?.ervPolylinePoints ?? "34,104 64,102 94,100 124,100 154,98 184,102 214,104 244,108 274,110 304,112 330,112"}
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
          />
          {chart ? chart.markers.map((m, i) => (
            <circle key={i} cx={m.cx} cy={m.cy} r={m.r} fill="#DC2626" stroke={m.isLast ? 'white' : 'none'} strokeWidth={m.isLast ? 2 : 0} />
          )) : (<>
            <circle cx="34" cy="104" r="2.5" fill="#DC2626" />
            <circle cx="154" cy="98" r="2.5" fill="#DC2626" />
            <circle cx="244" cy="108" r="2.5" fill="#DC2626" />
            <circle cx="330" cy="112" r="4" fill="#DC2626" stroke="white" strokeWidth="2" />
          </>)}
          {/* Anomaly zone marker — wireframe slim/13 line 130-131 */}
          <rect x="184" y="18" width="90" height="94" fill="#DC2626" fillOpacity="0.04" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="3,2" />
          <text x="229" y="14" textAnchor="middle" fontSize="8" fill="#DC2626" fontFamily="JetBrains Mono,monospace" fontWeight="600">{t('sp.anomaly_label')}</text>
        </svg>
        <div className="sp-sparkline-legend">
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line" style={{ background: '#DC2626' }}></span> {t('sp.legend_real_viewers_short')}
          </span>
          <span className="sp-sparkline-legend-item">
            <span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online_short')}
          </span>
        </div>
      </div>

      {/* M6: Audience Preview — wireframe slim/13: TR/ID/BR */}
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
