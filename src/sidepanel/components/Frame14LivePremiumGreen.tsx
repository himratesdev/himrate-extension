// LITERAL PORT + DATA WIRING — wireframe slim/14_live-premium-green-91.html.
// 11 explicit signal rows + 3 explicit reputation rows + 3 explicit country rows.
// Real data via signals[] / reputation / topCountries props; wireframe defaults
// fall through когда prop отсутствует (демо/preview).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';
import { useSparkline } from '../hooks/useSparkline';
import { WatchlistButton } from './WatchlistButton';

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
  isWatched: boolean;
  channelId?: string | null;
  signals?: Signal[];
  reputation?: ReputationData | null;
  topCountries?: Country[] | null;
  onWatchlistToggle?: () => void;
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

export function Frame14LivePremiumGreen({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, classification: _classification, percentile, isWatched,
  channelId = null, signals = [], reputation = null, topCountries = null, onWatchlistToggle: _onWatchlistToggle, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const chart = useSparkline(channelId, true, true); // Premium = full access
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 91;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  // Signal lookup with wireframe defaults fallback
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

  // TI expand state — wireframe slim/14 chevron `open` by default → percentile visible
  const [tiExpanded, setTiExpanded] = useState(true);

  // Expand state — Premium: all 11 open by default per wireframe
  const allTypes = ['auth_ratio', 'chatter_to_ccv_ratio', 'ccv_step_function', 'ccv_tier_clustering',
    'per_user_chat_behavior', 'channel_protection_score', 'cross_channel_bot_presence',
    'known_bot_list_matching', 'raid_attribution', 'ccv_chat_rate_correlation', 'account_profile_scoring'];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allTypes));
  const toggle = (k: string) => setExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const [repExpanded, setRepExpanded] = useState<Set<string>>(() => new Set(['growth', 'quality', 'loyalty']));
  const toggleRep = (k: string) => setRepExpanded(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Reputation
  const repGrowth = reputation?.growth_pattern_score ?? 85;
  const repQuality = reputation?.follower_quality_score ?? 92;
  const repLoyalty = reputation?.engagement_consistency_score ?? 88;

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
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="8" strokeDasharray="326.7" strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
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
      <div className="sp-trend up">↑ {t('sp.trend_real_up', { sign: '+', pct: 3 })}</div>

      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>{t('sp.trust_rating')}</span>
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">— {t('classification.fully_trusted')}</span>
          </div>
          <button
            className={`sp-ti-expand${tiExpanded ? ' open' : ''}`}
            aria-label={t('aria.expand')}
            aria-expanded={tiExpanded}
            onClick={() => setTiExpanded(v => !v)}
          >▾</button>
        </div>
        {tiExpanded && percentile != null && (
          <div style={{ marginTop: '6px' }}><span className="sp-percentile">{t('sp.percentile_above', { N: percentile })}</span></div>
        )}
      </div>

      {/* M3: 11 explicit signal rows. value/color data-driven, expand state-driven. */}
      <div className="sp-signals">
        <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 })}</div>

        {/* 1. Авторизация */}
        {(() => { const s = sig('auth_ratio', 92, '92%'); const open = expanded.has('auth_ratio'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('auth_ratio')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.auth_ratio')}: {s.display}</div>{t('signal.auth_ratio_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 2. Чат / зрители */}
        {(() => { const s = sig('chatter_to_ccv_ratio', 85, '1:6'); const open = expanded.has('chatter_to_ccv_ratio'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('chatter_to_ccv_ratio')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.chatter_ccv')}: {s.display}</div>{t('signal.chatter_ccv_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 3. Рост зрителей */}
        {(() => { const s = sig('ccv_step_function', 98, t('signal.value_norm')); const open = expanded.has('ccv_step_function'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_step_function')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_step')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_step')}: {s.display}</div>{t('signal.ccv_step_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 4. Подписки */}
        {(() => { const s = sig('ccv_tier_clustering', 95, t('signal.value_norm')); const open = expanded.has('ccv_tier_clustering'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_tier_clustering')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_tier')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_tier')}: {s.display}</div>{t('signal.ccv_tier_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 5. Скорость чата */}
        {(() => { const s = sig('per_user_chat_behavior', 88, '88%'); const open = expanded.has('per_user_chat_behavior'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('per_user_chat_behavior')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.chat_behavior')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.chat_behavior')}: {s.display}</div>{t('signal.chat_behavior_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 6. Эмоции в чате */}
        {(() => { const s = sig('channel_protection_score', 80, '80%'); const open = expanded.has('channel_protection_score'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('channel_protection_score')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.channel_protection')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.channel_protection')}: {s.display}</div>{t('signal.channel_protection_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 7. Подписчики */}
        {(() => { const s = sig('cross_channel_bot_presence', 76, '76%'); const open = expanded.has('cross_channel_bot_presence'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('cross_channel_bot_presence')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.cross_channel')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.cross_channel')}: {s.display}</div>{t('signal.cross_channel_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 8. Возраст аккаунтов */}
        {(() => { const s = sig('known_bot_list_matching', 94, '94%'); const open = expanded.has('known_bot_list_matching'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('known_bot_list_matching')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.known_bots')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.known_bots')}: {s.display}</div>{t('signal.known_bots_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 9. Молчуны */}
        {(() => { const s = sig('raid_attribution', 82, t('signal.value_norm')); const open = expanded.has('raid_attribution'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('raid_attribution')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.raid')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.raid')}: {s.display}</div>{t('signal.raid_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 10. Время подключения */}
        {(() => { const s = sig('ccv_chat_rate_correlation', 90, '90%'); const open = expanded.has('ccv_chat_rate_correlation'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('ccv_chat_rate_correlation')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.ccv_chat_corr')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.ccv_chat_corr')}: {s.display}</div>{t('signal.ccv_chat_corr_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}

        {/* 11. Признаки ботов */}
        {(() => { const s = sig('account_profile_scoring', 96, t('signal.value_clean')); const open = expanded.has('account_profile_scoring'); return (<>
          <div className="sp-signal-row sp-signal-expandable" onClick={() => toggle('account_profile_scoring')} role="button" aria-expanded={open}>
            <span className="sp-signal-name">{t('signal.account_scoring')}</span>
            <div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div></div>
            <span className={`sp-signal-val ${s.color}`}>{s.display}</span>
            <span className={`sp-signal-expand-icon${open ? ' open' : ''}`}>▾</span>
          </div>
          {open && <div className="sp-signal-detail"><div className="sp-signal-detail-title">{t('signal.account_scoring')}: {s.display}</div>{t('signal.account_scoring_desc')}<div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div></div>}
        </>); })()}
      </div>

      {/* M4: Reputation purple — 3 explicit rows, real values */}
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
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '8px', lineHeight: 1.4 }}>{t('sp.rep_subtitle_premium')}</div>

        {/* 1. Естественность роста */}
        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('growth')} role="button" aria-expanded={repExpanded.has('growth')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_growth')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repGrowth}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repGrowth)}</span>
        </div>
        {repExpanded.has('growth') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_growth')}: {Math.round(repGrowth)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_growth_desc')}</div>
            <svg className="sp-rep-mini-chart" viewBox="0 0 200 32"><polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,28 30,25 60,22 90,20 120,18 150,15 180,12 200,10" /><circle cx="200" cy="10" r="2.5" fill="#8B5CF6" /><text x="170" y="8" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">{Math.round(repGrowth)}</text></svg>
            <div className="sp-rep-change up">↑ {t('sp.rep_change_delta', { sign: '+', delta: 3 })}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        {/* 2. Качество подписчиков */}
        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('quality')} role="button" aria-expanded={repExpanded.has('quality')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_quality')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repQuality}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repQuality)}</span>
        </div>
        {repExpanded.has('quality') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_quality')}: {Math.round(repQuality)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_quality_desc')}</div>
            <svg className="sp-rep-mini-chart" viewBox="0 0 200 32"><polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,20 30,18 60,16 90,14 120,12 150,12 180,10 200,8" /><circle cx="200" cy="8" r="2.5" fill="#8B5CF6" /><text x="170" y="6" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">{Math.round(repQuality)}</text></svg>
            <div className="sp-rep-change up">↑ {t('sp.rep_change_delta', { sign: '+', delta: 1 })}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        {/* 3. Лояльность аудитории */}
        <div className="sp-rep-row sp-rep-expandable" onClick={() => toggleRep('loyalty')} role="button" aria-expanded={repExpanded.has('loyalty')}>
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_loyalty')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: `${repLoyalty}%`, background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>{Math.round(repLoyalty)}</span>
        </div>
        {repExpanded.has('loyalty') && (
          <div className="sp-rep-detail">
            <div className="sp-rep-detail-title">{t('sp.rep_loyalty')}: {Math.round(repLoyalty)} / 100</div>
            <div className="sp-rep-detail-text">{t('sp.rep_loyalty_desc')}</div>
            <svg className="sp-rep-mini-chart" viewBox="0 0 200 32"><polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,22 30,20 60,18 90,16 120,15 150,14 180,12 200,11" /><circle cx="200" cy="11" r="2.5" fill="#8B5CF6" /><text x="170" y="9" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">{Math.round(repLoyalty)}</text></svg>
            <div className="sp-rep-change stable">→ {t('sp.rep_change_stable')}</div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}><a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate?.('trends')}>{t('sp.rep_history_link')}</a></div>
          </div>
        )}

        <div className="sp-rep-disclaimer" style={{ color: '#7C3AED', opacity: 0.7 }}>ⓘ {t('sp.rep_disclaimer_premium')}</div>
      </div>

      {/* M5 Sparkline (Premium) — wireframe defaults remain hardcoded; full data wiring deferred to Phase G1 chart helper */}
      <div className="sp-sparkline">
        <div className="sp-sparkline-header">
          <span className="sp-sparkline-title">{t('sp.sparkline_title_live')}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('trends'); }}>{t('sp.more')}</a>
        </div>
        {/* Stats — real from chart hook OR wireframe defaults (7,500/7,800/+29%) */}
        <div className="sp-chart-stats">
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_real_short')}</div><div className="sp-chart-stat-value green">{chart?.stats.now != null ? formatNumber(chart.stats.now, i18n.language) : '7,500'}</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_online_short')}</div><div className="sp-chart-stat-value">{chart?.stats.max != null ? formatNumber(chart.stats.max, i18n.language) : '7,800'}</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div><div className="sp-chart-stat-value green">{chart?.stats.change != null ? `${chart.stats.change >= 0 ? '+' : ''}${chart.stats.change}%` : '+29%'}</div></div>
        </div>
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          {/* Y labels — real OR wireframe defaults 10K/7K/4K/0 */}
          {chart ? chart.yLabels.map((l) => (
            <text key={l.y} x="30" y={l.y} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">{l.label}</text>
          )) : (<>
            <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">10K</text>
            <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">7K</text>
            <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">4K</text>
            <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          </>)}
          {/* X labels (time-based, не зависят от data) */}
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−30м</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−20м</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−10м</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_now_label')}</text>
          {/* Path/polylines/markers — real chart OR wireframe defaults */}
          <path d={chart?.ervAreaPath ?? "M34,85 L64,80 L94,72 L124,65 L154,58 L184,50 L214,45 L244,38 L274,32 L304,28 L330,22 L330,125 L34,125 Z"} fill="#059669" fillOpacity="0.08" />
          <polyline points={chart?.ccvPolylinePoints ?? "34,80 64,74 94,68 124,60 154,53 184,45 214,38 244,32 274,26 304,22 330,18"} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2" />
          <polyline points={chart?.ervPolylinePoints ?? "34,85 64,80 94,72 124,65 154,58 184,50 214,45 244,38 274,32 304,28 330,22"} fill="none" stroke="#059669" strokeWidth="2" />
          {chart ? chart.markers.map((m, i) => (
            <circle key={i} cx={m.cx} cy={m.cy} r={m.r} fill="#059669" stroke={m.isLast ? 'white' : 'none'} strokeWidth={m.isLast ? 2 : 0} />
          )) : (<>
            <circle cx="34" cy="85" r="2.5" fill="#059669" />
            <circle cx="154" cy="58" r="2.5" fill="#059669" />
            <circle cx="244" cy="38" r="2.5" fill="#059669" />
            <circle cx="330" cy="22" r="4" fill="#059669" stroke="white" strokeWidth="2" />
          </>)}
        </svg>
        <div className="sp-sparkline-legend">
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line green"></span> {t('sp.legend_real_viewers_short')}</span>
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online_short')}</span>
        </div>
      </div>

      {/* M6 Audience — 3 explicit rows, real countries[] */}
      <div className="sp-audience">
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('audience'); }}>{t('sp.more')}</a>
        </div>
        <div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[0].country_code)}</span><span className="sp-audience-country">{countryName(countries[0].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[0].percentage)}%</span></div>
        {countries[1] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[1].country_code)}</span><span className="sp-audience-country">{countryName(countries[1].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[1].percentage)}%</span></div>)}
        {countries[2] && (<div className="sp-audience-row"><span className="sp-audience-flag">{flagEmoji(countries[2].country_code)}</span><span className="sp-audience-country">{countryName(countries[2].country_code)}</span><span className="sp-audience-pct">{Math.round(countries[2].percentage)}%</span></div>)}
      </div>

      {/* Watchlist button — full dropdown UX (frame 27 interactive state).
          WatchlistButton handles open/close + lazy fetch + toggle add/remove + navigate. */}
      <WatchlistButton
        channelId={channelId ?? null}
        isWatched={isWatched}
        onOpenWatchlists={() => onNavigate?.('watchlists')}
      />
    </div>
  );
}
