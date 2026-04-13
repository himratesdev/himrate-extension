// TASK-035 FR-005: Streamer Reputation — 3 components, purple theme.
// Premium: open. Free/Guest: blur overlay.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import type { ReputationData } from '../../shared/api';

interface Props {
  channelId: string | null;
  isLive: boolean;
}

const COMPONENTS = [
  { key: 'growth_pattern_score', label: 'sp.hs_growth', fallbackLabel: 'Естественность роста' },
  { key: 'follower_quality_score', label: 'sp.hs_consistency', fallbackLabel: 'Качество подписчиков' },
  { key: 'engagement_consistency_score', label: 'sp.hs_engagement', fallbackLabel: 'Лояльность аудитории' },
] as const;

export function ReputationCard({ channelId, isLive }: Props) {
  const { t } = useTranslation();
  const [reputation, setReputation] = useState<ReputationData | null>(null);

  useEffect(() => {
    if (!channelId) return;
    api.getTrust(channelId).then((data) => {
      if (data && 'streamer_reputation' in data) {
        setReputation((data as unknown as { streamer_reputation: ReputationData }).streamer_reputation);
      }
    });
  }, [channelId]);

  if (!reputation) return null;

  return (
    <div className="sp-reputation">
      <div className="sp-reputation-header">
        📊 Streamer Reputation <span className="sp-reputation-sub">— история канала</span>
      </div>
      {COMPONENTS.map(({ key, fallbackLabel }) => {
        const value = reputation[key as keyof ReputationData] as number | null;
        return (
          <div key={key} className="sp-reputation-bar">
            <div className="sp-reputation-name">{fallbackLabel}</div>
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
