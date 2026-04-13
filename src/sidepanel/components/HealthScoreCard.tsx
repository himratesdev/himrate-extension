// TASK-035 FR-007: Health Score Card — 5 component bars, green theme.
// Provisional badges when streams_count < 10.
// Fetches from api.getTrust() and reads health_score from extended response.

import { useTranslation } from 'react-i18next';
import type { HealthScoreData } from '../../shared/api';

interface Props {
  healthScore: HealthScoreData | null;
}

const COMPONENTS_ORDER = ['ti', 'stability', 'engagement', 'growth', 'consistency'] as const;

const LABEL_FALLBACKS: Record<string, string> = {
  ti: 'Trust Index',
  stability: 'Stability',
  engagement: 'Engagement',
  growth: 'Growth',
  consistency: 'Consistency',
};

function scoreColor(score: number | null): string {
  if (score == null) return '#9ca3af';
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function HealthScoreCard({ healthScore: health }: Props) {
  const { t } = useTranslation();

  if (!health) return null;

  const isProvisional = health.streams_count < 10;

  return (
    <div className="sp-health-card" style={{ border: '2px solid #22c55e', borderRadius: '8px', padding: '12px' }}>
      <div className="sp-health-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px' }}>{t('sp.health_score')}</span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: scoreColor(health.score) }}>{health.score}</span>
        {isProvisional && (
          <span className="sp-provisional-badge" style={{ fontSize: '10px', marginLeft: 'auto' }}>
            {t('popup.cold_start')} — {health.streams_count}/10
          </span>
        )}
      </div>
      {COMPONENTS_ORDER.map((key) => {
        const comp = health.components?.[key];
        const score = comp?.score ?? null;
        const label = comp?.label || LABEL_FALLBACKS[key];
        return (
          <div key={key} className="sp-health-bar" style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
              <span>{label}</span>
              <span style={{ color: scoreColor(score) }}>{score != null ? score.toFixed(0) : '—'}</span>
            </div>
            <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
              <div
                style={{ height: '100%', width: `${Math.min(100, score ?? 0)}%`, background: scoreColor(score), borderRadius: '2px', transition: 'width 0.4s ease' }}
                role="progressbar"
                aria-valuenow={score ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
