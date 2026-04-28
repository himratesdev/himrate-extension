// BUG-016 PR-1 Section 6: ReputationCard canonical match (wireframe lines 2003-2029).
// Wireframe: side-panel-wireframe-TASK-039.html sp-reputation + sp-rep-row.
// Canonical classes: sp-reputation (purple-themed inline) + sp-reputation-title
// + sp-rep-row + sp-rep-name + sp-rep-bar-bg + sp-rep-bar-fill + sp-rep-val.

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

const PURPLE = '#8B5CF6';
const PURPLE_DARK = '#7C3AED';
const PURPLE_LIGHT = '#DDD6FE';

function ReputationIcon() {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      style={{ width: 13, height: 13, stroke: PURPLE_DARK, verticalAlign: '-0.1em' }}
      aria-hidden="true"
    >
      <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke={PURPLE_DARK} />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke={PURPLE_DARK} />
      <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke={PURPLE_DARK} />
    </svg>
  );
}

export function ReputationCard({ reputation, isLive }: Props) {
  const { t } = useTranslation();

  if (!reputation) return null;

  return (
    <div
      className="sp-reputation"
      style={{
        border: `2.5px solid ${PURPLE}`,
        background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
      }}
    >
      <div className="sp-reputation-title" style={{ color: PURPLE_DARK }}>
        <ReputationIcon /> {t('sp.rep_title')}{' '}
        <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-30)' }}>
          — {t('sp.rep_subtitle')}
        </span>
      </div>
      {COMPONENTS.map(({ key, i18nKey }) => {
        const value = reputation[key as keyof ReputationData] as number | null;
        const pct = value ?? 0;
        return (
          <div key={key} className="sp-rep-row">
            <span className="sp-rep-name">{t(i18nKey)}</span>
            <div className="sp-rep-bar-bg" style={{ border: `1px solid ${PURPLE_LIGHT}` }}>
              <div
                className="sp-rep-bar-fill"
                style={{ width: `${Math.min(100, pct)}%`, background: PURPLE }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="sp-rep-val" style={{ color: PURPLE_DARK }}>
              {value != null ? value.toFixed(0) : '—'}
            </span>
          </div>
        );
      })}
      {isLive && (
        <div className="sp-rep-disclaimer">ⓘ {t('sp.reputation_disclaimer')}</div>
      )}
    </div>
  );
}
