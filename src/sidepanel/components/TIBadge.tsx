// BUG-016 PR-1 Section 6: TIBadge canonical match (wireframe lines 1952-1963).
// Wireframe: side-panel-wireframe-TASK-039.html sp-ti-section.
// Canonical classes: sp-ti-section + sp-ti-header + sp-ti-left + sp-ti-label
// + sp-ti-score (colored) + sp-ti-classification + sp-ti-expand + sp-percentile.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  tiScore: number | null;
  classification: string | null;
  percentile: number | null;
  showExpand: boolean;
}

function tiColor(score: number | null): 'green' | 'yellow' | 'red' | 'grey' {
  if (score == null) return 'grey';
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

export function TIBadge({ tiScore, classification, percentile, showExpand }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const color = tiColor(tiScore);
  const classText = classification ? t(`classification.${classification}`) : null;

  // Percentile: ≥50 → "above (X)% channels", <50 → "below (100-X)% channels"
  const percentileText = percentile != null
    ? percentile >= 50
      ? t('sp.percentile_above', { N: percentile })
      : t('sp.percentile_below', { N: 100 - percentile })
    : null;

  return (
    <div className="sp-ti-section">
      <div className="sp-ti-header">
        <div className="sp-ti-left">
          <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
            {t('sp.trust_rating')}
          </span>
          <span className={`sp-ti-score ${color}`}>{tiScore != null ? tiScore : '—'}</span>
          {classText && <span className="sp-ti-classification">— {classText}</span>}
        </div>
        {showExpand && (
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
