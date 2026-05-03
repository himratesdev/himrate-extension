// LITERAL PORT — wireframe slim/21_channel-card-modal.html.
// Channel Card: avatar + name + TI/ERV/classification + Health Score (5 rows) +
// Reputation (3 rows) + Stats (3 cells) + Last 5 streams. Real data from props
// with wireframe defaults fallback.

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';
import { Modal } from './Modal';

interface HealthComponentScore { score: number | null }

interface HealthScoreData {
  components?: {
    ti?: HealthComponentScore;
    stability?: HealthComponentScore;
    engagement?: HealthComponentScore;
    growth?: HealthComponentScore;
    consistency?: HealthComponentScore;
  };
}

interface ReputationData {
  growth_pattern_score: number | null;
  follower_quality_score: number | null;
  engagement_consistency_score: number | null;
}

interface StreamHistoryItem {
  date: string;       // "04.04"
  duration: string;   // "6ч 12м"
  peak: string;       // "5.2K"
  ti: number;
  ervPercent: number;
}

interface Props {
  channelLogin: string;
  avatarLetter: string;
  streamsCount: number;
  tiScore: number;
  ervPercent: number;
  classification: string;
  healthScore?: HealthScoreData | null;
  reputation?: ReputationData | null;
  avgCcv?: number | null;
  peakViewers?: number | null;
  avgDuration?: string | null;
  recentStreams?: StreamHistoryItem[];
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

const DEFAULT_STREAMS: StreamHistoryItem[] = [
  { date: '04.04', duration: '6ч 12м', peak: '5.2K', ti: 88, ervPercent: 88 },
  { date: '03.04', duration: '4ч 45м', peak: '4.8K', ti: 86, ervPercent: 85 },
  { date: '02.04', duration: '5ч 30м', peak: '5.5K', ti: 90, ervPercent: 91 },
  { date: '01.04', duration: '3ч 20м', peak: '3.9K', ti: 84, ervPercent: 82 },
  { date: '31.03', duration: '7ч 05м', peak: '6.1K', ti: 89, ervPercent: 87 },
];

export function Frame21ChannelCardModal({
  channelLogin, avatarLetter, streamsCount, tiScore, ervPercent, classification,
  healthScore = null, reputation = null,
  avgCcv = null, peakViewers = null, avgDuration = null,
  recentStreams = DEFAULT_STREAMS,
  onClose, onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();

  const hs = healthScore?.components;
  const hsTi = hs?.ti?.score ?? tiScore;
  const hsStab = hs?.stability?.score ?? 82;
  const hsEng = hs?.engagement?.score ?? 90;
  const hsGrow = hs?.growth?.score ?? 76;
  const hsCons = hs?.consistency?.score ?? 84;

  const repGrowth = reputation?.growth_pattern_score ?? 80;
  const repQuality = reputation?.follower_quality_score ?? 90;
  const repLoyalty = reputation?.engagement_consistency_score ?? 86;

  return (
    <Modal title={t('sp.modal_card_title')} onClose={onClose}>
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Avatar + Name */}
        <div className="sp-card-avatar-row">
          <div className="sp-card-avatar">{avatarLetter}</div>
          <div>
            <div className="sp-card-name">{channelLogin}</div>
            <div className="sp-card-partner">{t('sp.card_partner_streams', { N: streamsCount })}</div>
          </div>
        </div>

        {/* TI + ERV + Classification badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className="sp-erv-label green" style={{ fontSize: 10 }}>
            <span className="erv-dot"></span> TI: {tiScore}
          </span>
          <span className="sp-erv-label green" style={{ fontSize: 10 }}>
            <span className="erv-dot"></span> ERV: {ervPercent}%
          </span>
          <span style={{ fontSize: 10, color: 'var(--ink-50)', padding: '4px 8px' }}>{classification}</span>
        </div>

        {/* Health Score header */}
        <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <svg className="ico" viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: '#059669', verticalAlign: '-0.1em' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(5,150,105,0.1)" />
          </svg>{' '}
          {t('sp.health_score')} <span style={{ color: 'var(--color-erv-green)', textTransform: 'none', letterSpacing: 0 }}>— текущий стрим</span>
        </div>

        {/* Health Score 5 rows */}
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.hs_ti')}</span><div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: `${hsTi}%` }}></div></div><span className="sp-health-val">{Math.round(hsTi)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.hs_stability')}</span><div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: `${hsStab}%` }}></div></div><span className="sp-health-val">{Math.round(hsStab)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.hs_engagement')}</span><div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: `${hsEng}%` }}></div></div><span className="sp-health-val">{Math.round(hsEng)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.hs_growth')}</span><div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: `${hsGrow}%` }}></div></div><span className="sp-health-val">{Math.round(hsGrow)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.hs_consistency')}</span><div className="sp-health-bar-bg"><div className="sp-health-bar-fill green" style={{ width: `${hsCons}%` }}></div></div><span className="sp-health-val">{Math.round(hsCons)}</span></div>

        {/* Reputation header */}
        <div style={{ fontSize: 10, color: '#7C3AED', fontFamily: "'JetBrains Mono', monospace", margin: '8px 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <svg className="ico" viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: '#7C3AED', verticalAlign: '-0.1em' }}>
            <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke="#7C3AED" />
            <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke="#7C3AED" />
            <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke="#7C3AED" />
          </svg>{' '}
          {t('sp.rep_title')} <span style={{ textTransform: 'none', letterSpacing: 0 }}>— {t('sp.rep_subtitle')}</span>
        </div>

        {/* Reputation 3 rows */}
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.rep_growth')}</span><div className="sp-health-bar-bg" style={{ border: '1px solid #DDD6FE' }}><div className="sp-health-bar-fill" style={{ width: `${repGrowth}%`, background: '#8B5CF6' }}></div></div><span className="sp-health-val" style={{ color: '#7C3AED' }}>{Math.round(repGrowth)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.rep_quality')}</span><div className="sp-health-bar-bg" style={{ border: '1px solid #DDD6FE' }}><div className="sp-health-bar-fill" style={{ width: `${repQuality}%`, background: '#8B5CF6' }}></div></div><span className="sp-health-val" style={{ color: '#7C3AED' }}>{Math.round(repQuality)}</span></div>
        <div className="sp-health-row"><span className="sp-health-name" style={{ width: 85, fontSize: 10 }}>{t('sp.rep_loyalty')}</span><div className="sp-health-bar-bg" style={{ border: '1px solid #DDD6FE' }}><div className="sp-health-bar-fill" style={{ width: `${repLoyalty}%`, background: '#8B5CF6' }}></div></div><span className="sp-health-val" style={{ color: '#7C3AED' }}>{Math.round(repLoyalty)}</span></div>

        {/* Stats 3 cells */}
        <div className="sp-card-stats" style={{ marginTop: 8 }}>
          <div className="sp-card-stat"><div className="sp-card-stat-label">{t('sp.card_avg_online')}</div><div className="sp-card-stat-val">{avgCcv != null ? formatNumber(avgCcv, i18n.language) : '4,800'}</div></div>
          <div className="sp-card-stat"><div className="sp-card-stat-label">{t('sp.card_peak')}</div><div className="sp-card-stat-val">{peakViewers != null ? formatNumber(peakViewers, i18n.language) : '12,400'}</div></div>
          <div className="sp-card-stat"><div className="sp-card-stat-label">{t('sp.card_avg_duration')}</div><div className="sp-card-stat-val">{avgDuration ?? '5ч 20м'}</div></div>
        </div>

        {/* Last 5 streams clickable block */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border-light)',
            borderRadius: 10,
            overflow: 'hidden',
            cursor: 'pointer',
            marginTop: 8,
          }}
          onClick={() => onNavigate?.('trends')}
          role="button"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-page)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{t('sp.card_last_streams')}</span>
            <span style={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 600 }}>{t('sp.card_history_link')}</span>
          </div>
          {recentStreams.slice(0, 5).map((s, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 55px 1fr',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderBottom: i < recentStreams.length - 1 ? '1px solid var(--border-light)' : undefined,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{s.date}\u00a0·\u00a0{s.duration}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>{s.peak}</span>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 8, padding: '1px 5px', background: 'var(--color-erv-green-bg)', color: 'var(--color-erv-green)', borderRadius: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }} title="Trust Index">Дов. {s.ti}</span>
                <span style={{ fontSize: 8, padding: '1px 5px', background: 'var(--color-erv-green-bg)', color: 'var(--color-erv-green)', borderRadius: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }} title="Estimated Real Viewers">Зрит. {s.ervPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
