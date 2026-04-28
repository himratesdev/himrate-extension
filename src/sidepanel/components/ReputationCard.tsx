// BUG-016 PR-1 Section 6+7: ReputationCard canonical with Premium expand UX.
// Wireframe: side-panel-wireframe-TASK-039.html sp-reputation (Section 6 lines 2003-2029
// for collapsed, Section 7 lines 2650-2719 for Premium expandable).
// Free Live: 3 rows visible (no expand). Premium: expandable rows + sp-rep-detail
// + streams_count badge + premium subtitle paragraph.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReputationData } from '../../shared/api';

interface Props {
  reputation: ReputationData | null;
  isLive: boolean;
  /** Premium drill-down: expandable rows + streams badge + descriptive subtitle. */
  expandable?: boolean;
  /** From streamer_rating.streams_count — drives "10+ стримов" badge. */
  streamsCount?: number;
  onNavigate?: (tab: string) => void;
}

const COMPONENTS = [
  { key: 'growth_pattern_score', i18nKey: 'sp.rep_growth', descKey: 'sp.rep_growth_desc' },
  { key: 'follower_quality_score', i18nKey: 'sp.rep_quality', descKey: 'sp.rep_quality_desc' },
  { key: 'engagement_consistency_score', i18nKey: 'sp.rep_loyalty', descKey: 'sp.rep_loyalty_desc' },
] as const;

const PURPLE = '#8B5CF6';
const PURPLE_DARK = '#7C3AED';
const PURPLE_LIGHT = '#DDD6FE';

function ReputationIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      style={{ width: size, height: size, stroke: PURPLE_DARK, verticalAlign: '-0.1em' }}
      aria-hidden="true"
    >
      <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke={PURPLE_DARK} />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke={PURPLE_DARK} />
      <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke={PURPLE_DARK} />
    </svg>
  );
}

export function ReputationCard({
  reputation,
  isLive,
  expandable = false,
  streamsCount = 0,
  onNavigate,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!reputation) return null;

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const streamsBadge =
    streamsCount >= 10
      ? t('sp.rep_streams_count_plus')
      : streamsCount > 0
        ? t('sp.rep_streams_count', { count: streamsCount })
        : null;

  return (
    <div
      className="sp-reputation"
      style={{
        border: `2.5px solid ${PURPLE}`,
        background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
      }}
    >
      {expandable ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ReputationIcon size={14} />
              <span
                className="sp-reputation-title"
                style={{ margin: 0, color: PURPLE_DARK, fontSize: 13 }}
              >
                {t('sp.rep_title')}
              </span>
            </div>
            {streamsBadge && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 8px',
                  background: PURPLE,
                  color: 'white',
                  borderRadius: 8,
                }}
              >
                {streamsBadge}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-30)',
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            {t('sp.rep_subtitle_premium')}
          </div>
        </>
      ) : (
        <div className="sp-reputation-title" style={{ color: PURPLE_DARK }}>
          <ReputationIcon /> {t('sp.rep_title')}{' '}
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-30)' }}>
            — {t('sp.rep_subtitle')}
          </span>
        </div>
      )}

      {COMPONENTS.map(({ key, i18nKey, descKey }) => {
        const value = reputation[key as keyof ReputationData] as number | null;
        const pct = value ?? 0;
        const isOpen = expanded.has(key);
        const rowClass = expandable ? 'sp-rep-row sp-rep-expandable' : 'sp-rep-row';

        return (
          <div key={key}>
            <div
              className={rowClass}
              onClick={expandable ? () => toggleExpand(key) : undefined}
              role={expandable ? 'button' : undefined}
              aria-expanded={expandable ? isOpen : undefined}
            >
              <span className="sp-rep-name" style={expandable ? { fontWeight: 600 } : undefined}>
                {t(i18nKey)}
              </span>
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
            {expandable && isOpen && (
              <div className="sp-rep-detail">
                <div className="sp-rep-detail-title">
                  {t(i18nKey)}: {value != null ? value.toFixed(0) : '—'} / 100
                </div>
                <div className="sp-rep-detail-text">{t(descKey)}</div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <a
                    href="#"
                    style={{
                      fontSize: 10,
                      color: PURPLE_DARK,
                      cursor: 'pointer',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate?.('trends');
                    }}
                  >
                    {t('sp.rep_history_link')}
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {isLive && (
        <div
          className="sp-rep-disclaimer"
          style={expandable ? { color: PURPLE_DARK, opacity: 0.7 } : undefined}
        >
          ⓘ {expandable ? t('sp.rep_disclaimer_premium') : t('sp.reputation_disclaimer')}
        </div>
      )}
    </div>
  );
}
