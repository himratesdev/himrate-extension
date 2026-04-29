// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/16_offline-18ch-dannye-dostupny.html.

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  percentile: number | null;
  countdownText: string; // e.g. "14ч 32м"
  /** Stream summary stats. */
  streamDuration: string | null; // e.g. "6ч 12м"
  peakViewers: number | null;
  avgCcv: number | null;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame16OfflineWithin18h({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, percentile,
  countdownText, streamDuration, peakViewers, avgCcv,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 85;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className="sp-content" role="tabpanel">
      {/* <!-- PostStream Countdown --> */}
      {/* <div class="sp-countdown"><span>⏱</span><span>Доступно ещё</span><span class="sp-countdown-time">14ч 32м</span></div> */}
      <div className="sp-countdown">
        <span aria-hidden="true">⏱</span>
        <span>{t('sp.countdown_available')}</span>
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

      {/* <!-- Signals OPEN (during 18h window, Free can see!) — 11 collapsible rows --> */}
      <div className="sp-signals">
        <div className="sp-signals-title">Анализ аудитории (11 показателей)</div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.auth_ratio')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '82%' }}></div></div><span className="sp-signal-val green">82%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.chatter_ccv')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '75%' }}></div></div><span className="sp-signal-val green">1:8</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.ccv_step')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '95%' }}></div></div><span className="sp-signal-val green">{t('signal.value_norm')}</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.ccv_tier')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '88%' }}></div></div><span className="sp-signal-val green">{t('signal.value_norm')}</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.chat_behavior')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '70%' }}></div></div><span className="sp-signal-val green">70%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.channel_protection')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '78%' }}></div></div><span className="sp-signal-val green">78%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.cross_channel')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '72%' }}></div></div><span className="sp-signal-val green">72%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.known_bots')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '90%' }}></div></div><span className="sp-signal-val green">90%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.raid')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '80%' }}></div></div><span className="sp-signal-val green">{t('signal.value_norm')}</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.ccv_chat_corr')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '85%' }}></div></div><span className="sp-signal-val green">85%</span><span className="sp-signal-expand-icon">▾</span></div>
        <div className="sp-signal-row sp-signal-expandable"><span className="sp-signal-name">{t('signal.account_scoring')}</span><div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '92%' }}></div></div><span className="sp-signal-val green">{t('signal.value_clean')}</span><span className="sp-signal-expand-icon">▾</span></div>
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
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name">{t('sp.rep_growth')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '72%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>72</span>
        </div>
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name">{t('sp.rep_quality')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '88%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>88</span>
        </div>
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name">{t('sp.rep_loyalty')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '91%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>91</span>
        </div>
        <div className="sp-rep-disclaimer">ⓘ {t('sp.rep_disclaimer_short') || 'Репутация обновляется после каждого стрима.'}</div>
      </div>

      {/* <!-- Sparkline (stream session) — different X labels Начало/1ч/3ч/Конец --> */}
      <div className="sp-sparkline">
        <div className="sp-sparkline-header">
          {/* <span class="sp-sparkline-title">Зрители за стрим</span> */}
          <span className="sp-sparkline-title">{t('sp.sparkline_title_session') || 'Зрители за\u00a0стрим'}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => e.preventDefault()}>{t('sp.more')}</a>
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
          <a className="sp-audience-more" href="#" onClick={(e) => e.preventDefault()}>{t('sp.more')}</a>
        </div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇷🇺</span><span className="sp-audience-country">Россия</span><span className="sp-audience-pct">45%</span></div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇺🇦</span><span className="sp-audience-country">Украина</span><span className="sp-audience-pct">20%</span></div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇰🇿</span><span className="sp-audience-country">Казахстан</span><span className="sp-audience-pct">10%</span></div>
      </div>

      {/* <!-- Watchlist --> */}
      <button className="sp-watchlist-btn active">
        <svg className="ico ico-sm" viewBox="0 0 24 24" style={{ verticalAlign: '-0.2em', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>{' '}
        {t('sp.watchlist_in') || 'В\u00a0списке'}
      </button>
    </div>
  );
}
