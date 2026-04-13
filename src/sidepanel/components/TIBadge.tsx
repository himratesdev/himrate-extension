// TASK-035 FR-003: Trust Index + Classification + expandable Components.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StreamerRating } from '../../shared/api';

interface Props {
  tiScore: number | null;
  classification: string | null;
  streamerRating: StreamerRating | null;
  showExpand: boolean;
}

export function TIBadge({ tiScore, classification, streamerRating, showExpand }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const classText = classification ? t(`classification.${classification}`) : null;

  return (
    <div className="sp-ti-section">
      <div className="sp-ti-header">
        <div className="sp-ti-left">
          <span className="sp-ti-label" title={t('sp.ti_tooltip')}>Trust Index</span>
          <span className="sp-ti-score">{tiScore != null ? tiScore : '—'}</span>
          {classText && <span className="sp-ti-class"> — {classText}</span>}
        </div>
        {showExpand && (
          <button
            className={`sp-ti-expand ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {t('sp.components_toggle')} {expanded ? '▴' : '▾'}
          </button>
        )}
      </div>
      {streamerRating && (
        <div className="sp-ti-rating">
          {t('label.streamer_rating_live', { N: streamerRating.score })}
        </div>
      )}
    </div>
  );
}
