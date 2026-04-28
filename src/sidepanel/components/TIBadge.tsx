// BUG-016 PR-1a: TIBadge canonical match (frames 06-09 + 11-15).
// Wireframe: side-panel-wireframe-TASK-039.html sp-ti-section.
// Cold start gating per frames:
//   06 insufficient: label + "—" grey, no classification/expand/percentile
//   07 provisional_low: yellow score + "Предварительный", no expand, no percentile
//   08 provisional 7-9: full classification + expand, no percentile
//   09/14/15 full+deep: classification + expand + percentile all visible

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  tiScore: number | null;
  classification: string | null;
  percentile: number | null;
  showExpand: boolean;
  coldStartStatus?: string | null;
}

function tiColor(score: number | null): 'green' | 'yellow' | 'red' | 'grey' {
  if (score == null) return 'grey';
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

export function TIBadge({
  tiScore,
  classification,
  percentile,
  showExpand,
  coldStartStatus,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const isInsufficient = coldStartStatus === 'insufficient';
  const isProvisionalLow = coldStartStatus === 'provisional_low';
  const isFullOrDeep = coldStartStatus === 'full' || coldStartStatus === 'deep' || coldStartStatus == null;

  const color = isInsufficient ? 'grey' : tiColor(tiScore);
  // Provisional Low (3-6 streams) — server may return real classification but
  // wireframe frame 07 hard-codes "— Предварительный" badge for this tier.
  const classText = isInsufficient
    ? null
    : isProvisionalLow
      ? t('classification.provisional')
      : classification
        ? t(`classification.${classification}`)
        : null;

  // Percentile shown only at full/deep (10+ streams).
  const percentileText =
    isFullOrDeep && percentile != null
      ? percentile >= 50
        ? t('sp.percentile_above', { N: percentile })
        : t('sp.percentile_below', { N: 100 - percentile })
      : null;

  const hideExpand = isInsufficient || isProvisionalLow;

  return (
    <div className="sp-ti-section">
      <div className="sp-ti-header">
        <div className="sp-ti-left">
          <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
            {t('sp.trust_rating')}
          </span>
          <span className={`sp-ti-score ${color}`}>{isInsufficient ? '—' : tiScore != null ? tiScore : '—'}</span>
          {classText && <span className="sp-ti-classification">— {classText}</span>}
        </div>
        {showExpand && !hideExpand && (
          <button
            className={`sp-ti-expand ${expanded ? 'open' : ''}`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={t('sp.components_toggle')}
          >
            ▾
          </button>
        )}
      </div>
      {percentileText && (
        <div style={{ marginTop: 6 }}>
          <span className="sp-percentile">{percentileText}</span>
        </div>
      )}
    </div>
  );
}
