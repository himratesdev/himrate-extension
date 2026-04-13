// TASK-035 FR-005: Streamer Reputation — 3 components, purple theme.
// Premium: open. Free/Guest: blur overlay.

import { useTranslation } from 'react-i18next';
import type { ReputationData } from '../../shared/api';

interface Props {
  reputation: ReputationData | null;
  isLive: boolean;
}

const COMPONENTS = [
  { key: 'growth_pattern_score', i18nKey: 'sp.rep_growth' },
  { key: 'follower_quality_score', i18nKey: 'sp.rep_quality' },
  { key: 'engagement_consistency_score', i18nKey: 'sp.rep_loyalty' },
] as const;

export function ReputationCard({ reputation, isLive }: Props) {
  const { t } = useTranslation();

  if (!reputation) return null;

  return (
    <div className="sp-reputation">
      <div className="sp-reputation-header">
        📊 {t('sp.rep_title')} <span className="sp-reputation-sub">— {t('sp.rep_subtitle')}</span>
      </div>
      {COMPONENTS.map(({ key, i18nKey }) => {
        const value = reputation[key as keyof ReputationData] as number | null;
        return (
          <div key={key} className="sp-reputation-bar">
            <div className="sp-reputation-name">{t(i18nKey)}</div>
            <div className="sp-reputation-track">
              <div
                className="sp-reputation-fill"
                style={{ width: `${Math.min(100, value ?? 0)}%` }}
                role="progressbar"
                aria-valuenow={value ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="sp-reputation-value">{value != null ? value.toFixed(0) : '—'}</div>
          </div>
        );
      })}
      {isLive && (
        <div className="sp-reputation-disclaimer">
          ⓘ {t('sp.reputation_disclaimer')}
        </div>
      )}
    </div>
  );
}
