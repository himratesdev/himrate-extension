// LITERAL PORT + DATA WIRING — wireframe slim/16_offline-18ch-dannye-dostupny.html.
// Free user post-stream: full drill-down visible. Real signals/reputation/audience props.

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
  percentile: number | null;
  countdownText: string;
  /** Frame18: <1h remaining → red border + "Осталось N м". Default: blue border + "Доступно ещё". */
  countdownWarning?: boolean;
  streamDuration: string | null;
  peakViewers: number | null;
  avgCcv: number | null;
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

export function Frame16OfflineWithin18h({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, percentile,
  countdownText, countdownWarning = false, streamDuration, peakViewers, avgCcv,
  signals = [], reputation = null, topCountries = null, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 85;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

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

  // Expand state — Frame16 (slim/16) shows all signals collapsible, all closed by default
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggle = (k: string) => setExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const [repExpanded, setRepExpanded] = useState<Set<string>>(() => new Set());
  const toggleRep = (k: string) => setRepExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Reputation
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

  return (
    <div className="sp-content" role="tabpanel">
      {/* PostStream Countdown — warning variant (red border) при <1h, иначе default blue.
          slim/16: <div class="sp-countdown">
          slim/18: <div class="sp-countdown warning"> + "Осталось" instead of "Доступно ещё" */}
      <div className={`sp-countdown${countdownWarning ? ' warning' : ''}`}>
        <span aria-hidden="true">⏱</span>
        <span>{countdownWarning ? t('sp.countdown_remaining') : t('sp.countdown_available')}</span>
        <span className="sp-countdown-time">{countdownText}</span>
      </div>

      {/* <!-- Gauge (historical) --> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="8"
              strokeDasharray="326.7" strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
            {/* <span class="sp-gauge-sub">Реальные</span> */}
            <span className="sp-gauge-sub">{t('sp.gauge_sub_short') || 'Реальные'}</span>
          </div>
        </div>
      </div>
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) }) : '—'}
      </div>
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>
      {/* Combined ERV label: "Аномалий не замечено · Реальные зрители 85%" */}
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {t('erv.real_viewers_label')} {pct}%
        </span>
      </div>

      {/* <!-- TI --> */}
      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>{t('sp.trust_rating')}</span>
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">— {t('classification.trusted')}</span>
          </div>
          <button className="sp-ti-expand" aria-label={t('aria.expand')}>▾</button>
        </div>
        {percentile != null && (
          <div style={{ marginTop: '6px' }}>
            <span className="sp-percentile">{t('sp.percentile_above', { N: percentile })}</span>
          </div>
        )}
      </div>

      {/* <!-- Stream Summary (итоги стрима) --> */}
      <div className="sp-signals" style={{ gap: '4px' }}>
        {/* <div class="sp-signals-title">Итоги стрима</div> */}
        <div className="sp-signals-title">{t('sp.stream_summary_title')}</div>
        {/* <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 0;"> */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px 0' }}>
          {/* 4 cells */}
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {streamDuration ?? '—'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_duration')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {peakViewers != null ? formatNumber(peakViewers, i18n.language) : '—'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_peak')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {avgCcv != null ? formatNumber(avgCcv, i18n.language) : '—'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_avg')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-erv-green)' }}>
              {pct}%
            </div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('erv.real_viewers_label')}</div>
          </div>
        </div>
      </div>

      {/* M3 Signals — 11 collapsible rows, click to expand. Data-driven values. */}
      <div className="sp-signals">
        <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 }).split('— нажмите')[0].trim()}</div>
        {[
          { type: 'auth_ratio', name: 'signal.auth_ratio', desc: 'signal.auth_ratio_desc', def: 82, defDisplay: '82%' },
          { type: 'chatter_to_ccv_ratio', name: 'signal.chatter_ccv', desc: 'signal.chatter_ccv_desc', def: 75, defDisplay: '1:8' },
          { type: 'ccv_step_function', name: 'signal.ccv_step', desc: 'signal.ccv_step_desc', def: 95, defDisplay: t('signal.value_norm') },
          { type: 'ccv_tier_clustering', name: 'signal.ccv_tier', desc: 'signal.ccv_tier_desc', def: 88, defDisplay: t('signal.value_norm') },
          { type: 'per_user_chat_behavior', name: 'signal.chat_behavior', desc: 'signal.chat_behavior_desc', def: 70, defDisplay: '70%' },
          { type: 'channel_protection_score', name: 'signal.channel_protection', desc: 'signal.channel_protection_desc', def: 78, defDisplay: '78%' },
          { type: 'cross_channel_bot_presence', name: 'signal.cross_channel', desc: 'signal.cross_channel_desc', def: 72, defDisplay: '72%' },
          { type: 'known_bot_list_matching', name: 'signal.known_bots', desc: 'signal.known_bots_desc', def: 90, defDisplay: '90%' },
          { type: 'raid_attribution', name: 'signal.raid', desc: 'signal.raid_desc', def: 80, defDisplay: t('signal.value_norm') },
          { type: 'ccv_chat_rate_correlation', name: 'signal.ccv_chat_corr', desc: 'signal.ccv_chat_corr_desc', def: 85, defDisplay: '85%' },
          { type: 'account_profile_scoring', name: 'signal.account_scoring', desc: 'signal.account_scoring_desc', def: 92, defDisplay: t('signal.value_clean') },
        ].map((cfg) => {
          const s = sig(cfg.type, cfg.def, cfg.defDisplay);
          const open = expanded.has(cfg.type);
          return (
            <div key={cfg.type}>
              <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle(cfg.type)} role="button" aria-expanded={open}>
                <span className="sp-signal-name">{t(cfg.name)}</span>
                <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
                <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
                <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
              </div>
              {open && (
                <div className="sp-signal-detail">
                  <div className="sp-signal-detail-title">{t(cfg.name)}: {s.display}</div>
                  {t(cfg.desc)}
                  <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* <!-- Reputation OPEN (during 18h window) --> */}
      <div className="sp-reputation" style={{
        border: '2.5px solid #8B5CF6', borderRadius: '12px', padding: '10px 12px',
        background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
      }}>
        <div className="sp-reputation-title" style={{ color: '#7C3AED' }}>
          <svg className="ico" viewBox="0 0 24 24" style={{ width: '13px', height: '13px', stroke: '#7C3AED', verticalAlign: '-0.1em' }}>
            <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
            <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
            <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
          </svg>{' '}
          {t('sp.rep_title')}{' '}
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--ink-30)' }}>— {t('sp.rep_subtitle')}</span>
        </div>
        {[
          { key: 'growth', name: 'sp.rep_growth', desc: 'sp.rep_growth_desc', value: repGrowth },
          { key: 'quality', name: 'sp.rep_quality', desc: 'sp.rep_quality_desc', value: repQuality },
          { key: 'loyalty', name: 'sp.rep_loyalty', desc: 'sp.rep_loyalty_desc', value: repLoyalty },
        ].map((cfg) => {
          const open = repExpanded.has(cfg.key);
          return (
            <div key={cfg.key}>
              <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep(cfg.key)} role="button" aria-expanded={open}>
                <span className="sp-rep-name">{t(cfg.name)}</span>
                <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                  <div className="sp-rep-bar-fill" style={{ width: `${cfg.value}%`, background: '#8B5CF6' }}></div>
                </div>
                <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(cfg.value)}</span>
                <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
              </div>
              {open && (
                <div className="sp-rep-detail">
                  <div className="sp-rep-detail-title">{t(cfg.name)}: {Math.round(cfg.value)} / 100</div>
                  <div className="sp-rep-detail-text">{t(cfg.desc)}</div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="sp-rep-disclaimer">ⓘ {t('sp.rep_disclaimer_short')}</div>
      </div>

      {/* <!-- Sparkline (stream session) — different X labels Начало/1ч/3ч/Конец --> */}
      <div className="sp-sparkline">
        <div className="sp-sparkline-header">
          {/* <span class="sp-sparkline-title">Зрители за стрим</span> */}
          <span className="sp-sparkline-title">{t('sp.sparkline_title_session') || 'Зрители за\u00a0стрим'}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('trends'); }}>{t('sp.more')}</a>
        </div>
        <div className="sp-chart-stats">
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_peak_real') || 'Пик реальных'}</div><div className="sp-chart-stat-value green">4,200</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_avg') || 'Среднее'}</div><div className="sp-chart-stat-value">3,600</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_duration') || 'Длит.'}</div><div className="sp-chart-stat-value">3ч 42м</div></div>
        </div>
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">6K</text>
          <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">4K</text>
          <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">2K</text>
          <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_x_start') || 'Начало'}</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">1ч</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">3ч</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_x_end') || 'Конец'}</text>
          <path d="M34,105 L64,95 L94,85 L124,75 L154,60 L184,50 L214,45 L244,48 L274,52 L304,58 L330,62 L330,125 L34,125 Z" fill="#059669" fillOpacity="0.08" />
          <polyline points="34,95 64,82 94,70 124,58 154,45 184,35 214,30 244,32 274,38 304,45 330,50" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2" />
          <polyline points="34,105 64,95 94,85 124,75 154,60 184,50 214,45 244,48 274,52 304,58 330,62" fill="none" stroke="#059669" strokeWidth="2" />
          <circle cx="34" cy="105" r="2.5" fill="#059669" />
          <circle cx="184" cy="50" r="2.5" fill="#059669" />
          <circle cx="214" cy="45" r="4" fill="#059669" stroke="white" strokeWidth="2" />
          <circle cx="330" cy="62" r="3" fill="#059669" />
          <text x="214" y="38" textAnchor="middle" fontSize="8" fill="#059669" fontFamily="JetBrains Mono,monospace" fontWeight="600">{t('sp.chart_peak_label') || 'Пик'}</text>
        </svg>
        <div className="sp-sparkline-legend">
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line green"></span> {t('sp.legend_real_viewers')}</span>
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online')}</span>
        </div>
      </div>

      {/* <!-- Audience --> */}
      <div className="sp-audience">
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('audience'); }}>{t('sp.more')}</a>
        </div>
        <div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[0].country_code)}</span><span className="sp-audience-country">{countryName(countries[0].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[0].percentage)}%</span></div>
        {countries[1] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[1].country_code)}</span><span className="sp-audience-country">{countryName(countries[1].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[1].percentage)}%</span></div>)}
        {countries[2] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[2].country_code)}</span><span className="sp-audience-country">{countryName(countries[2].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[2].percentage)}%</span></div>)}
      </div>

      {/* Watchlist active */}
      <button className="sp-watchlist-btn active" onClick={() => onNavigate?.('watchlists')}>
        <svg className="ico ico-sm" viewBox="0 0 24 24" style={{ verticalAlign: '-0.2em', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>{' '}
        {t('sp.watchlist_in') || 'В\u00a0списке'}
      </button>
    </div>
  );
}
