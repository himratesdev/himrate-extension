// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/14_live-premium-green-91.html.
// 307 строк wireframe → 11 expanded signal rows + 3 expanded reputation rows + chart + audience + watchlist active.

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  classification: string | null;
  percentile: number | null;
  isWatched: boolean;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame14LivePremiumGreen({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, classification: _classification, percentile, isWatched,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 91;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className="sp-content" role="tabpanel">
      {/* <!-- Gauge --> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="8"
              strokeDasharray="326.7" strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>{t('erv.real_viewers_label')}</span>
          </div>
        </div>
      </div>
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) }) : '—'}
      </div>
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%
        </span>
      </div>
      <div className="sp-confidence high">{t('confidence.sufficient')}</div>
      <div className="sp-trend up">↑ {t('sp.trend_real_up', { sign: '+', pct: 3 })}</div>
      {/* <!-- TI --> */}
      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>{t('sp.trust_rating')}</span>
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">— {t('classification.fully_trusted')}</span>
          </div>
          <button className="sp-ti-expand open" aria-label={t('aria.expand')}>▾</button>
        </div>
        {percentile != null && (
          <div style={{ marginTop: '6px' }}>
            <span className="sp-percentile">{t('sp.percentile_above', { N: percentile })}</span>
          </div>
        )}
      </div>

      {/* <!-- M3: Signals OPEN (Premium) — ALL 11 expanded with descriptions --> */}
      <div className="sp-signals">
        <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 })}</div>

        {/* 1. Авторизация */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '92%' }}></div></div>
          <span className="sp-signal-val green">92%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.auth_ratio')}: 92%</div>
          {t('signal.auth_ratio_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 2. Чат / зрители */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '85%' }}></div></div>
          <span className="sp-signal-val green">1:6</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.chatter_ccv')}: 1:6</div>
          {t('signal.chatter_ccv_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 3. Рост зрителей */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_step')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '98%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.ccv_step')}: {t('signal.value_norm')}</div>
          {t('signal.ccv_step_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 4. Подписки */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_tier')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '95%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.ccv_tier')}: {t('signal.value_norm')}</div>
          {t('signal.ccv_tier_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 5. Скорость чата */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.chat_behavior')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '88%' }}></div></div>
          <span className="sp-signal-val green">88%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.chat_behavior')}: 88%</div>
          {t('signal.chat_behavior_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 6. Эмоции в чате */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.channel_protection')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '80%' }}></div></div>
          <span className="sp-signal-val green">80%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.channel_protection')}: 80%</div>
          {t('signal.channel_protection_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 7. Подписчики */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.cross_channel')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '76%' }}></div></div>
          <span className="sp-signal-val green">76%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.cross_channel')}: 76%</div>
          {t('signal.cross_channel_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 8. Возраст аккаунтов */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.known_bots')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '94%' }}></div></div>
          <span className="sp-signal-val green">94%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.known_bots')}: 94%</div>
          {t('signal.known_bots_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 9. Молчуны */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.raid')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '82%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.raid')}: {t('signal.value_norm')}</div>
          {t('signal.raid_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 10. Время подключения */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_chat_corr')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '90%' }}></div></div>
          <span className="sp-signal-val green">90%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.ccv_chat_corr')}: 90%</div>
          {t('signal.ccv_chat_corr_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>

        {/* 11. Признаки ботов */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.account_scoring')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '96%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_clean')}</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.account_scoring')}: {t('signal.value_clean')}</div>
          {t('signal.account_scoring_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>
      </div>

      {/* <!-- M4: Reputation — purple, 3 expanded rows with mini-chart + change + history --> */}
      <div className="sp-reputation" style={{
        border: '2.5px solid #8B5CF6', borderRadius: '12px', padding: '10px 12px',
        background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg className="ico" viewBox="0 0 24 24" style={{ width: '14px', height: '14px', stroke: '#7C3AED' }}>
              <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
              <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
              <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
            </svg>
            <span className="sp-reputation-title" style={{ margin: 0, color: '#7C3AED', fontSize: '13px' }}>{t('sp.rep_title')}</span>
          </div>
          <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', background: '#8B5CF6', color: 'white', borderRadius: '8px' }}>
            {t('sp.rep_streams_count_plus')}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '8px', lineHeight: 1.4 }}>
          {t('sp.rep_subtitle_premium')}
        </div>

        {/* 1. Естественность роста */}
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_growth')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '85%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>85</span>
        </div>
        <div className="sp-rep-detail">
          <div className="sp-rep-detail-title">{t('sp.rep_growth')}: 85 / 100</div>
          <div className="sp-rep-detail-text">{t('sp.rep_growth_desc')}</div>
          <svg className="sp-rep-mini-chart" viewBox="0 0 200 32">
            <polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,28 30,25 60,22 90,20 120,18 150,15 180,12 200,10" />
            <circle cx="200" cy="10" r="2.5" fill="#8B5CF6" />
            <text x="170" y="8" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">85</text>
          </svg>
          <div className="sp-rep-change up">↑ {t('sp.rep_change_delta', { sign: '+', delta: 3 })}</div>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }}>{t('sp.rep_history_link')}</a>
          </div>
        </div>

        {/* 2. Качество подписчиков */}
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_quality')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '92%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>92</span>
        </div>
        <div className="sp-rep-detail">
          <div className="sp-rep-detail-title">{t('sp.rep_quality')}: 92 / 100</div>
          <div className="sp-rep-detail-text">{t('sp.rep_quality_desc')}</div>
          <svg className="sp-rep-mini-chart" viewBox="0 0 200 32">
            <polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,20 30,18 60,16 90,14 120,12 150,12 180,10 200,8" />
            <circle cx="200" cy="8" r="2.5" fill="#8B5CF6" />
            <text x="170" y="6" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">92</text>
          </svg>
          <div className="sp-rep-change up">↑ {t('sp.rep_change_delta', { sign: '+', delta: 1 })}</div>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }}>{t('sp.rep_history_link')}</a>
          </div>
        </div>

        {/* 3. Лояльность аудитории */}
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_loyalty')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '88%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>88</span>
        </div>
        <div className="sp-rep-detail">
          <div className="sp-rep-detail-title">{t('sp.rep_loyalty')}: 88 / 100</div>
          <div className="sp-rep-detail-text">{t('sp.rep_loyalty_desc')}</div>
          <svg className="sp-rep-mini-chart" viewBox="0 0 200 32">
            <polyline fill="none" stroke="#8B5CF6" strokeWidth="1.5" points="0,22 30,20 60,18 90,16 120,15 150,14 180,12 200,11" />
            <circle cx="200" cy="11" r="2.5" fill="#8B5CF6" />
            <text x="170" y="9" fontSize="8" fill="#8B5CF6" fontFamily="'JetBrains Mono', monospace">88</text>
          </svg>
          <div className="sp-rep-change stable">→ {t('sp.rep_change_stable')}</div>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <a style={{ fontSize: '10px', color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }}>{t('sp.rep_history_link')}</a>
          </div>
        </div>

        <div className="sp-rep-disclaimer" style={{ color: '#7C3AED', opacity: 0.7 }}>
          ⓘ {t('sp.rep_disclaimer_premium')}
        </div>
      </div>

      {/* <!-- M5 Sparkline (Premium Green) — chart values different from frame 11 --> */}
      <div className="sp-sparkline">
        <div className="sp-sparkline-header">
          <span className="sp-sparkline-title">{t('sp.sparkline_title_live')}</span>
          <a className="sp-sparkline-more" href="#" onClick={(e) => e.preventDefault()}>{t('sp.more')}</a>
        </div>
        <div className="sp-chart-stats">
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_real_short') || 'Реальных'}</div><div className="sp-chart-stat-value green">7,500</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_online_short') || 'Онлайн'}</div><div className="sp-chart-stat-value">7,800</div></div>
          <div className="sp-chart-stat"><div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div><div className="sp-chart-stat-value green">+29%</div></div>
        </div>
        <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
          <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
          <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">10K</text>
          <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">7K</text>
          <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">4K</text>
          <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
          <text x="34" y="145" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−30м</text>
          <text x="132" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−20м</text>
          <text x="230" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">−10м</text>
          <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">{t('sp.chart_now_label')}</text>
          <path d="M34,85 L64,80 L94,72 L124,65 L154,58 L184,50 L214,45 L244,38 L274,32 L304,28 L330,22 L330,125 L34,125 Z" fill="#059669" fillOpacity="0.08" />
          <polyline points="34,80 64,74 94,68 124,60 154,53 184,45 214,38 244,32 274,26 304,22 330,18" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2" />
          <polyline points="34,85 64,80 94,72 124,65 154,58 184,50 214,45 244,38 274,32 304,28 330,22" fill="none" stroke="#059669" strokeWidth="2" />
          <circle cx="34" cy="85" r="2.5" fill="#059669" />
          <circle cx="154" cy="58" r="2.5" fill="#059669" />
          <circle cx="244" cy="38" r="2.5" fill="#059669" />
          <circle cx="330" cy="22" r="4" fill="#059669" stroke="white" strokeWidth="2" />
        </svg>
        <div className="sp-sparkline-legend">
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line green"></span> {t('sp.legend_real_viewers_short') || 'Реальные зрители'}</span>
          <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line grey"></span> {t('sp.legend_total_online_short') || 'Twitch онлайн'}</span>
        </div>
      </div>

      {/* <!-- M6 Audience --> */}
      <div className="sp-audience">
        <div className="sp-audience-header">
          <span className="sp-audience-title">{t('sp.audience_preview')}</span>
          <a className="sp-audience-more" href="#" onClick={(e) => e.preventDefault()}>{t('sp.more')}</a>
        </div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇷🇺</span><span className="sp-audience-country">Россия</span><span className="sp-audience-pct">45%</span></div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇺🇦</span><span className="sp-audience-country">Украина</span><span className="sp-audience-pct">20%</span></div>
        <div className="sp-audience-row"><span className="sp-audience-flag">🇰🇿</span><span className="sp-audience-country">Казахстан</span><span className="sp-audience-pct">10%</span></div>
      </div>

      {/* <!-- Watchlist (active) --> */}
      <button className={`sp-watchlist-btn${isWatched ? ' active' : ''}`}>
        <svg className="ico ico-sm" viewBox="0 0 24 24" style={{ verticalAlign: '-0.2em', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>{' '}
        {isWatched ? (t('sp.watchlist_in') || 'В\u00a0списке') : t('sp.watchlist_add')}
      </button>
    </div>
  );
}
