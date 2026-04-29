// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/15_live-streamer-own-channel.html.

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
}

const CIRCUMFERENCE_160 = 427.3;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame15LiveStreamerOwnChannel({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore, percentile, streamsCount,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 88;
  const offset = CIRCUMFERENCE_160 - (pct / 100) * CIRCUMFERENCE_160;

  return (
    <div className="sp-content" role="tabpanel">
      {/* <!-- Streamer Disclaimer --> */}
      {/* <div class="sp-streamer-disclaimer">Это ваш канал. Сигналы и репутация бесплатны</div> */}
      <div className="sp-streamer-disclaimer">{t('sp.streamer_disclaimer')}</div>

      {/* <!-- Gauge 160×160 (Streamer) --> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        <div className="sp-gauge-wrap">
          <svg className="sp-gauge-ring" width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="80" cy="80" r="68" fill="none" stroke={stroke} strokeWidth="10"
              strokeDasharray="427.3" strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 80 80)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`} style={{ fontSize: '36px' }}>{pct}%</span>
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
      {/* <div class="sp-trend stable">→ Количество реальных зрителей стабильно</div> */}
      <div className="sp-trend stable">→ {t('sp.trend_real_stable_static')}</div>

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

      {/* <!-- M3: Signals OPEN FREE — first row expanded, others collapsed --> */}
      <div className="sp-signals">
        <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 }).replace('— нажмите на\u00a0любой для\u00a0подробностей', '').trim()}</div>
        {/* 1. Авторизация (expanded) */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '90%' }}></div></div>
          <span className="sp-signal-val green">90%</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('signal.auth_ratio')}: 90%</div>
          {t('signal.auth_ratio_desc')}
          <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
        </div>
        {/* 2-11 collapsed */}
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '82%' }}></div></div>
          <span className="sp-signal-val green">1:7</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_step')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '96%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_tier')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '88%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.chat_behavior')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '78%' }}></div></div>
          <span className="sp-signal-val green">78%</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.channel_protection')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '84%' }}></div></div>
          <span className="sp-signal-val green">84%</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.cross_channel')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '72%' }}></div></div>
          <span className="sp-signal-val green">72%</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.known_bots')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '95%' }}></div></div>
          <span className="sp-signal-val green">95%</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.raid')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '80%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_norm')}</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.ccv_chat_corr')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '88%' }}></div></div>
          <span className="sp-signal-val green">88%</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-signal-row sp-signal-expandable">
          <span className="sp-signal-name">{t('signal.account_scoring')}</span>
          <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '94%' }}></div></div>
          <span className="sp-signal-val green">{t('signal.value_clean')}</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
      </div>

      {/* <!-- M4: Reputation — purple, 3 collapsible rows + disclaimer --> */}
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
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '6px' }}>
          {t('sp.rep_subtitle_simple') || 'История канала за\u00a030+ дней. Не текущий стрим.'}
        </div>
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_growth')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '80%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>80</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_quality')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '90%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>90</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-rep-row sp-rep-expandable">
          <span className="sp-rep-name" style={{ fontWeight: 600 }}>{t('sp.rep_loyalty')}</span>
          <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
            <div className="sp-rep-bar-fill" style={{ width: '86%', background: '#8B5CF6' }}></div>
          </div>
          <span className="sp-rep-val" style={{ color: '#7C3AED' }}>86</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-rep-disclaimer" style={{ color: '#7C3AED', opacity: 0.7 }}>
          ⓘ {t('sp.rep_disclaimer_simple') || 'Репутация = история\u00a0канала. Обновляется после каждого стрима.'}
        </div>
      </div>

      {/* <!-- Health Score Card — ALL 5 with first expanded --> */}
      <div className="sp-health-score">
        <div className="sp-health-title">
          <span>{t('sp.health_score')}</span>
          <span className="sp-health-badge-full">{t('sp.health_badge_full', { count: streamsCount })}</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--ink-30)', marginBottom: '6px' }}>
          {t('sp.health_subtitle')}
        </div>

        {/* 1. Trust Index — OPEN */}
        <div className="sp-health-row sp-signal-expandable">
          <span className="sp-health-name">{t('sp.hs_ti')}</span>
          <div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: '88%' }}></div></div>
          <span className="sp-health-val">88</span>
          <span className="sp-signal-expand-icon open">▾</span>
        </div>
        <div className="sp-signal-detail" style={{ margin: '-2px 0 4px' }}>
          <div className="sp-signal-detail-title">{t('sp.hs_ti')}: 88 / 100</div>
          {t('sp.hs_ti_desc')}
          <svg className="sp-rep-mini-chart" viewBox="0 0 200 32">
            <polyline fill="none" stroke="#059669" strokeWidth="1.5" points="0,20 25,19 50,21 75,18 100,16 125,14 150,13 175,11 200,10" />
            <circle cx="200" cy="10" r="2.5" fill="#059669" />
            <text x="170" y="8" fontSize="8" fill="#059669" fontFamily="'JetBrains Mono', monospace">88</text>
          </svg>
          <div className="sp-rep-change up">↑ {t('sp.hs_change_delta', { sign: '+', delta: 2 })} · {t('sp.hs_trend_up') || 'Тренд: стабильный рост'}</div>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <a style={{ fontSize: '10px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>{t('sp.rep_history_link')}</a>
          </div>
        </div>

        {/* 2-5 collapsed */}
        <div className="sp-health-row sp-signal-expandable">
          <span className="sp-health-name">{t('sp.hs_stability')}</span>
          <div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: '91%' }}></div></div>
          <span className="sp-health-val">91</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-health-row sp-signal-expandable">
          <span className="sp-health-name">{t('sp.hs_engagement')}</span>
          <div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: '90%' }}></div></div>
          <span className="sp-health-val">90</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-health-row sp-signal-expandable">
          <span className="sp-health-name">{t('sp.hs_growth')}</span>
          <div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: '82%' }}></div></div>
          <span className="sp-health-val">82</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
        <div className="sp-health-row sp-signal-expandable">
          <span className="sp-health-name">{t('sp.hs_consistency')}</span>
          <div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: '86%' }}></div></div>
          <span className="sp-health-val">86</span>
          <span className="sp-signal-expand-icon">▾</span>
        </div>
      </div>
    </div>
  );
}
