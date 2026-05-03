// LITERAL PORT + DATA WIRING — wireframe slim/17_offline-18ch-free-expired.html.
// Top section visible (gauge/erv/ti/summary). Bottom drill-down BLURRED behind paywall.

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

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  streamDuration: string | null;
  peakViewers: number | null;
  avgCcv: number | null;
  signals?: Signal[];
  reputation?: ReputationData | null;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

export function Frame17OfflineExpired({
  ervPercent, ervCount, ccv, ervLabelColor, tiScore,
  streamDuration, peakViewers, avgCcv,
  signals = [], reputation = null,
}: Props) {
  const { t, i18n } = useTranslation();
  const color = ervLabelColor || 'green';

  // Signals lookup для blurred preview
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
  const s1 = sig('auth_ratio', 82, '82%');
  const s2 = sig('chatter_to_ccv_ratio', 75, '1:8');
  const s3 = sig('ccv_step_function', 95, t('signal.value_norm'));
  const s4 = sig('ccv_tier_clustering', 88, t('signal.value_norm'));
  const s5 = sig('per_user_chat_behavior', 70, '70%');
  const repGrowth = reputation?.growth_pattern_score ?? 72;
  const repQuality = reputation?.follower_quality_score ?? 88;
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 85;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className="sp-content" role="tabpanel">
      {/* <div class="sp-countdown warning"><span>⏱</span><span>Время доступа истекло</span></div> */}
      <div className="sp-countdown warning">
        <span aria-hidden="true">⏱</span>
        <span>{t('sp.offline_paywall_title')}</span>
      </div>

      {/* <!-- Gauge still visible --> */}
      <div className="sp-gauge-section">
        <div className="sp-gauge-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="8"
              strokeDasharray="326.7" strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
          <div className="sp-gauge-center">
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
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
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {t('erv.real_viewers_label')} {pct}%
        </span>
      </div>

      {/* <!-- TI still visible --> */}
      <div className="sp-ti-section">
        <div className="sp-ti-header">
          <div className="sp-ti-left">
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>{t('sp.trust_rating')}</span>
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            <span className="sp-ti-classification">— {t('classification.trusted')}</span>
          </div>
        </div>
      </div>

      {/* <!-- Stream Summary still visible --> */}
      <div className="sp-signals" style={{ gap: '4px' }}>
        <div className="sp-signals-title">{t('sp.stream_summary_title')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px 0' }}>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{streamDuration ?? '—'}</div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_duration')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{peakViewers != null ? formatNumber(peakViewers, i18n.language) : '—'}</div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_peak')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{avgCcv != null ? formatNumber(avgCcv, i18n.language) : '—'}</div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('sp.stream_summary_avg')}</div>
          </div>
          <div style={{ background: 'var(--bg-page)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-erv-green)' }}>{pct}%</div>
            <div style={{ fontSize: '9px', color: 'var(--ink-30)' }}>{t('erv.real_viewers_label')}</div>
          </div>
        </div>
      </div>

      {/* <!-- BLURRED drill-down: signals + reputation + sparkline --> */}
      <div className="sp-paywall" style={{ minHeight: '200px' }}>
        <div className="sp-paywall-blurred">
          <div className="sp-signals" style={{ padding: '4px' }}>
            <div className="sp-signals-title">{t('sp.signals_title_premium', { count: 11 }).split('— нажмите')[0].trim()}</div>
            <div className="sp-signal-row"><span className="sp-signal-name">{t('signal.auth_ratio')}</span><div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s1.color}`} style={{ width: `${s1.pct}%` }}></div></div><span className={`sp-signal-val ${s1.color}`}>{s1.display}</span></div>
            <div className="sp-signal-row"><span className="sp-signal-name">{t('signal.chatter_ccv')}</span><div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s2.color}`} style={{ width: `${s2.pct}%` }}></div></div><span className={`sp-signal-val ${s2.color}`}>{s2.display}</span></div>
            <div className="sp-signal-row"><span className="sp-signal-name">{t('signal.ccv_step')}</span><div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s3.color}`} style={{ width: `${s3.pct}%` }}></div></div><span className={`sp-signal-val ${s3.color}`}>{s3.display}</span></div>
            <div className="sp-signal-row"><span className="sp-signal-name">{t('signal.ccv_tier')}</span><div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s4.color}`} style={{ width: `${s4.pct}%` }}></div></div><span className={`sp-signal-val ${s4.color}`}>{s4.display}</span></div>
            <div className="sp-signal-row"><span className="sp-signal-name">{t('signal.chat_behavior')}</span><div className="sp-signal-bar-bg"><div className={`sp-signal-bar-fill ${s5.color}`} style={{ width: `${s5.pct}%` }}></div></div><span className={`sp-signal-val ${s5.color}`}>{s5.display}</span></div>
          </div>
          <div className="sp-reputation" style={{ padding: '4px', border: '2.5px solid #8B5CF6', borderRadius: '12px', background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)' }}>
            <div className="sp-reputation-title" style={{ color: '#7C3AED' }}>
              <svg className="ico" viewBox="0 0 24 24" style={{ width: '13px', height: '13px', stroke: '#7C3AED', verticalAlign: '-0.1em' }}>
                <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
                <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
                <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
              </svg>{' '}{t('sp.rep_title')}
            </div>
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
        {/* <div class="sp-paywall-overlay" style="background:rgba(255,255,255,0.85);padding:20px;"> */}
        <div className="sp-paywall-overlay" style={{ background: 'rgba(255,255,255,0.85)', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '4px' }}>
            {t('sp.offline_paywall_title')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-50)', marginBottom: '12px' }}>
            {t('sp.offline_paywall_subtitle')}
          </div>
          <button
            className="sp-paywall-cta"
            style={{ width: '100%', marginBottom: '6px' }}
            onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' })}
          >
            {t('sp.offline_paywall_cta_track')}
          </button>
          <button
            className="sp-paywall-cta"
            style={{ width: '100%', background: 'white', color: 'var(--ink)', border: '1.5px solid var(--border-dark)' }}
            onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=report' })}
          >
            {t('sp.offline_paywall_cta_report')}
          </button>
        </div>
      </div>
    </div>
  );
}
