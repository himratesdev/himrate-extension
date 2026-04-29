// LITERAL PORT + DATA WIRING — wireframe slim/15_live-streamer-own-channel.html.
// Streamer own channel: signals + reputation + Health Score (5 rows).
// Default expand: signals[0]=open, all reputation closed, healthscore[0]=open per slim/15.

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

interface HealthComponentScore {
  score: number | null;
}

interface HealthScoreData {
  components?: {
    ti?: HealthComponentScore;
    stability?: HealthComponentScore;
    engagement?: HealthComponentScore;
    growth?: HealthComponentScore;
    consistency?: HealthComponentScore;
  };
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
  streamsCount: number;
  signals?: Signal[];
  reputation?: ReputationData | null;
  healthScore?: HealthScoreData | null;
  topCountries?: Country[] | null;
  onNavigate?: (tab: string) => void;
}

const CIRCUMFERENCE_160 = 427.3;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

function healthColor(score: number | null): 'green' | 'yellow' | 'red' | 'grey' {
  if (score == null) return 'grey';
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

function flagEmoji(code: string): string {
  if (code.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(A + upper.charCodeAt(0) - 'A'.charCodeAt(0), A + upper.charCodeAt(1) - 'A'.charCodeAt(0));
}

export function Frame15LiveStreamerOwnChannel({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, percentile, streamsCount,
  signals = [], reputation = null, healthScore = null, topCountries = null, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 88;
  const offset = CIRCUMFERENCE_160 - (pct / 100) * CIRCUMFERENCE_160;

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

  // Per slim/15: первый signal row open, остальные closed
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['auth_ratio']));
  const toggle = (k: string) => setExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Reputation rows — все closed по умолчанию per slim/15 (нет sp-rep-detail в slim)
  const [repExpanded, setRepExpanded] = useState<Set<string>>(() => new Set());
  const toggleRep = (k: string) => setRepExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // HealthScore — first row (TI) open per slim/15
  const [hsExpanded, setHsExpanded] = useState<Set<string>>(() => new Set(['ti']));
  const toggleHs = (k: string) => setHsExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Reputation values
  const repGrowth = reputation?.growth_pattern_score ?? 80;
  const repQuality = reputation?.follower_quality_score ?? 90;
  const repLoyalty = reputation?.engagement_consistency_score ?? 86;

  // HealthScore values
  const hs = healthScore?.components;
  const hsTi = hs?.ti?.score ?? 88;
  const hsStability = hs?.stability?.score ?? 91;
  const hsEngagement = hs?.engagement?.score ?? 90;
  const hsGrowth = hs?.growth?.score ?? 82;
  const hsConsistency = hs?.consistency?.score ?? 86;

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
      {/* Streamer Disclaimer */}
      <div className="sp-streamer-disclaimer">{t('sp.streamer_disclaimer')}</div>

      {/* Gauge 160×160 */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="80" cy="80" r="68" fill="none" stroke={stroke} strokeWidth="10" strokeDasharray="427.3" strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 80 80)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`} style={{ fontSize: '36px' }}>{pct}%</span>
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>{t('erv.real_viewers_label')}</span>
          </div>
        </div>
      </div>
      <div className={`sp-erv-hero ${color}`}>{ervCount != null ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) }) : '—'}</div>
      <div className="sp-erv-ccv">{ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}</div>
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}><span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%</span>
      </div>
      <div className="sp-confidence high">{t('confidence.sufficient')}</div>
      <div className="sp-trend stable">→ {t('sp.trend_real_stable_static')}</div>

      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>{t('sp.trust_rating')}</span>
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">— {t('classification.fully_trusted')}</span>
          </div>
          <button className="sp-ti-expand open" aria-label={t('aria.expand')}>▾</button>
        </div>
        {percentile != null && (<div style={{ marginTop: '6px' }}><span className="sp-percentile">{t('sp.percentile_above', { N: percentile })}</span></div>)}
      </div>

      {/* M3 Signals — first row open per slim/15, others click to expand */}
      <div className="sp-signals">
        <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 }).split('— нажмите')[0].trim()}</div>

        {(() => { const s = sig('auth_ratio', 90, '90%'); const open = expanded.has('auth_ratio'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('auth_ratio')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.auth_ratio')}: {s.display}</div>{t('signal.auth_ratio_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('chatter_to_ccv_ratio', 82, '1:7'); const open = expanded.has('chatter_to_ccv_ratio'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('chatter_to_ccv_ratio')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.chatter_ccv')}: {s.display}</div>{t('signal.chatter_ccv_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('ccv_step_function', 96, t('signal.value_norm')); const open = expanded.has('ccv_step_function'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_step_function')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_step')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_step')}: {s.display}</div>{t('signal.ccv_step_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('ccv_tier_clustering', 88, t('signal.value_norm')); const open = expanded.has('ccv_tier_clustering'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_tier_clustering')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_tier')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_tier')}: {s.display}</div>{t('signal.ccv_tier_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('per_user_chat_behavior', 78, '78%'); const open = expanded.has('per_user_chat_behavior'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('per_user_chat_behavior')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.chat_behavior')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.chat_behavior')}: {s.display}</div>{t('signal.chat_behavior_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('channel_protection_score', 84, '84%'); const open = expanded.has('channel_protection_score'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('channel_protection_score')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.channel_protection')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.channel_protection')}: {s.display}</div>{t('signal.channel_protection_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('cross_channel_bot_presence', 72, '72%'); const open = expanded.has('cross_channel_bot_presence'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('cross_channel_bot_presence')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.cross_channel')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.cross_channel')}: {s.display}</div>{t('signal.cross_channel_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('known_bot_list_matching', 95, '95%'); const open = expanded.has('known_bot_list_matching'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('known_bot_list_matching')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.known_bots')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.known_bots')}: {s.display}</div>{t('signal.known_bots_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('raid_attribution', 80, t('signal.value_norm')); const open = expanded.has('raid_attribution'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('raid_attribution')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.raid')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.raid')}: {s.display}</div>{t('signal.raid_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('ccv_chat_rate_correlation', 88, '88%'); const open = expanded.has('ccv_chat_rate_correlation'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_chat_rate_correlation')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_chat_corr')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_chat_corr')}: {s.display}</div>{t('signal.ccv_chat_corr_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {(() => { const s = sig('account_profile_scoring', 94, t('signal.value_clean')); const open = expanded.has('account_profile_scoring'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('account_profile_scoring')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.account_scoring')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.account_scoring')}: {s.display}</div>{t('signal.account_scoring_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}
      </div>

      {/* M4 Reputation purple — 3 rows, all collapsed by default per slim/15 */}
      <div className="sp-reputation" style={{ border: '2.5px solid #8B5CF6', borderRadius: '12px', padding: '10px 12px', background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg className="ico" viewBox="0 0 24 24" style={{ width: '14px', height: '14px', stroke: '#7C3AED' }}>
              <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
              <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
              <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
            </svg>
            <span className="sp-reputation-title" style={{ margin: 0, color: '#7C3AED', fontSize: '13px' }}>{t('sp.rep_title')}</span>
          </div>
          <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', background: '#8B5CF6', color: 'white', borderRadius: '8px' }}>{t('sp.rep_streams_count_plus')}</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '6px' }}>{t('sp.rep_subtitle_simple')}</div>

        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('growth')} role="button" aria-expanded={repExpanded.has('growth')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_growth')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repGrowth}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repGrowth)}</span>
          <span className={`sp-signal-expand-icon${repExpanded.has('growth') ? ' open' : ''}`}>▾</span>
        </div>
        {repExpanded.has('growth') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_growth')}: {Math.round(repGrowth)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_growth_desc')}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('quality')} role="button" aria-expanded={repExpanded.has('quality')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_quality')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repQuality}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repQuality)}</span>
          <span className={`sp-signal-expand-icon${repExpanded.has('quality') ? ' open' : ''}`}>▾</span>
        </div>
        {repExpanded.has('quality') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_quality')}: {Math.round(repQuality)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_quality_desc')}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('loyalty')} role="button" aria-expanded={repExpanded.has('loyalty')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_loyalty')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repLoyalty}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repLoyalty)}</span>
          <span className={`sp-signal-expand-icon${repExpanded.has('loyalty') ? ' open' : ''}`}>▾</span>
        </div>
        {repExpanded.has('loyalty') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_loyalty')}: {Math.round(repLoyalty)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_loyalty_desc')}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        <div className="sp-rep-disclaimer" style={{ color: '#7C3AED', opacity: 0.7 }}>ⓘ {t('sp.rep_disclaimer_short')}</div>
      </div>

      {/* HealthScore — 5 rows, first (TI) open */}
      <div className="sp-health-score">
        <div className="sp-health-title">
          <span>{t('sp.health_score')}</span>
          <span className="sp-health-badge-full">{t('sp.health_badge_full', { count: streamsCount })}</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '6px' }}>{t('sp.health_subtitle')}</div>

        {/* TI (open) */}
        {(() => { const c = healthColor(hsTi); const open = hsExpanded.has('ti'); return (<>
          <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs('ti')} role="button" aria-expanded={open}>
            <span className="sp-health-name">{t('sp.hs_ti')}</span>
            <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${hsTi}%` }}></div></div>
            <span className="sp-health-val">{Math.round(hsTi)}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && (
            <div className="sp-signal-detail" style={{ margin: '-2px 0 4px' }}>
              <div className="sp-signal-detail-title">{t('sp.hs_ti')}: {Math.round(hsTi)} / 100</div>
              {t('sp.hs_ti_desc')}
              <svg className="sp-rep-mini-chart" viewBox="0 0 200 32"><polyline fill="none" stroke="#059669" strokeWidth="1.5" points="0,20 25,19 50,21 75,18 100,16 125,14 150,13 175,11 200,10" /><circle cx="200" cy="10" r="2.5" fill="#059669" /><text x="170" y="8" fontSize="8" fill="#059669" fontFamily="'JetBrains Mono', monospace">{Math.round(hsTi)}</text></svg>
              <div className="sp-rep-change up">↑ {t('sp.hs_change_delta', { sign: '+', delta: 2 })} · {t('sp.hs_trend_up')}</div>
              <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
            </div>
          )}
        </>); })()}

        {/* Stability */}
        {(() => { const c = healthColor(hsStability); const open = hsExpanded.has('stability'); return (<>
          <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs('stability')} role="button" aria-expanded={open}>
            <span className="sp-health-name">{t('sp.hs_stability')}</span>
            <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${hsStability}%` }}></div></div>
            <span className="sp-health-val">{Math.round(hsStability)}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && (<div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('sp.hs_stability')}: {Math.round(hsStability)} / 100</div>{t('sp.hs_stability_desc')}<div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div></div>)}
        </>); })()}

        {/* Engagement */}
        {(() => { const c = healthColor(hsEngagement); const open = hsExpanded.has('engagement'); return (<>
          <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs('engagement')} role="button" aria-expanded={open}>
            <span className="sp-health-name">{t('sp.hs_engagement')}</span>
            <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${hsEngagement}%` }}></div></div>
            <span className="sp-health-val">{Math.round(hsEngagement)}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && (<div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('sp.hs_engagement')}: {Math.round(hsEngagement)} / 100</div>{t('sp.hs_engagement_desc')}<div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div></div>)}
        </>); })()}

        {/* Growth */}
        {(() => { const c = healthColor(hsGrowth); const open = hsExpanded.has('growth'); return (<>
          <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs('growth')} role="button" aria-expanded={open}>
            <span className="sp-health-name">{t('sp.hs_growth')}</span>
            <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${hsGrowth}%` }}></div></div>
            <span className="sp-health-val">{Math.round(hsGrowth)}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && (<div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('sp.hs_growth')}: {Math.round(hsGrowth)} / 100</div>{t('sp.hs_growth_desc')}<div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div></div>)}
        </>); })()}

        {/* Consistency */}
        {(() => { const c = healthColor(hsConsistency); const open = hsExpanded.has('consistency'); return (<>
          <div className="sp-health-row sp-signal-expandable" onClick={() => toggleHs('consistency')} role="button" aria-expanded={open}>
            <span className="sp-health-name">{t('sp.hs_consistency')}</span>
            <div className="sp-health-bar-bg"><div className={`sp-health-bar-fill ${c}`} style={{ width: `${hsConsistency}%` }}></div></div>
            <span className="sp-health-val">{Math.round(hsConsistency)}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && (<div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('sp.hs_consistency')}: {Math.round(hsConsistency)} / 100</div>{t('sp.hs_consistency_desc')}<div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div></div>)}
        </>); })()}
      </div>

      {/* Audience countries (real data fallback to wireframe defaults) */}
      <div className="sp-audience">
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('audience'); }}>{t('sp.more')}</a>
        </div>
        <div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[0].country_code)}</span><span className="sp-audience-country">{countryName(countries[0].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[0].percentage)}%</span></div>
        {countries[1] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[1].country_code)}</span><span className="sp-audience-country">{countryName(countries[1].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[1].percentage)}%</span></div>)}
        {countries[2] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[2].country_code)}</span><span className="sp-audience-country">{countryName(countries[2].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[2].percentage)}%</span></div>)}
      </div>
    </div>
  );
}
