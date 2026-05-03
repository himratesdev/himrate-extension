// BUG-016 PR-1a: ReputationCard LITERAL PORT from wireframe slim/14_live-premium-green-91.html
// Wireframe sp-reputation section (lines 207-275): purple-themed card with 3 rows
// + per-row sp-rep-detail block (title + description + mini-chart svg + change delta + history link)
// + footer disclaimer.
//
// Premium (expandable=true): all 3 rows open by default per wireframe frame 14.
// Free (expandable=false): rows visible without expand icons or detail blocks.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReputationData } from '../../shared/api';

interface Props {
  reputation: ReputationData | null;
  isLive: boolean;
  expandable?: boolean;
  streamsCount?: number;
  onNavigate?: (tab: string) => void;
  history?: {
    growth_pattern_score?: number[];
    follower_quality_score?: number[];
    engagement_consistency_score?: number[];
  };
  deltas?: {
    growth_pattern_score?: number;
    follower_quality_score?: number;
    engagement_consistency_score?: number;
  };
}

const COMPONENTS = [
  { key: 'growth_pattern_score', i18nKey: 'sp.rep_growth', descKey: 'sp.rep_growth_desc' },
  { key: 'follower_quality_score', i18nKey: 'sp.rep_quality', descKey: 'sp.rep_quality_desc' },
  { key: 'engagement_consistency_score', i18nKey: 'sp.rep_loyalty', descKey: 'sp.rep_loyalty_desc' },
] as const;

const PURPLE = '#8B5CF6';
const PURPLE_DARK = '#7C3AED';

const CHART_W = 200;
const CHART_H = 32;
const CHART_POINTS = 8;

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

function RepDetailChart({ score, history }: { score: number; history?: number[] }) {
  const yFor = (v: number) => Math.max(2, Math.min(CHART_H - 2, CHART_H - (v / 100) * CHART_H));
  const xFor = (i: number, n: number) => (i / Math.max(1, n - 1)) * CHART_W;
  const points = history && history.length >= 2 ? history : Array.from({ length: CHART_POINTS }, () => score);
  const polyline = points.map((v, i) => `${xFor(i, points.length)},${yFor(v)}`).join(' ');
  const lastX = xFor(points.length - 1, points.length);
  const lastY = yFor(score);

  return (
    <svg className="sp-rep-mini-chart" viewBox={`0 0 ${CHART_W} ${CHART_H}`} aria-hidden="true">
      <polyline fill="none" stroke={PURPLE} strokeWidth="1.5" points={polyline} />
      <circle cx={lastX} cy={lastY} r="2.5" fill={PURPLE} />
      <text
        x={lastX - 30}
        y={Math.max(8, lastY - 2)}
        fontSize="8"
        fill={PURPLE}
        fontFamily="'JetBrains Mono', monospace"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

function RepChange({
  delta,
  t,
}: {
  delta?: number;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) {
  if (delta == null) {
    return <div className="sp-rep-change">→ {t('sp.rep_change_stable')}</div>;
  }
  const direction: 'up' | 'down' | 'stable' = delta >= 1 ? 'up' : delta <= -1 ? 'down' : 'stable';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  if (direction === 'stable') {
    return <div className="sp-rep-change">{arrow} {t('sp.rep_change_stable')}</div>;
  }
  const sign = delta > 0 ? '+' : '';
  return (
    <div className={`sp-rep-change ${direction}`}>
      {arrow} {t('sp.rep_change_delta', { sign, delta })}
    </div>
  );
}

export function ReputationCard({
  reputation,
  isLive: _isLive,
  expandable = false,
  streamsCount = 0,
  onNavigate,
  history,
  deltas,
}: Props) {
  const { t } = useTranslation();

  // Premium: all 3 rows open by default (wireframe frame 14 — every sp-rep-row
  // followed by visible sp-rep-detail block).
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    expandable ? new Set(COMPONENTS.map((c) => c.key)) : new Set()
  );

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
    <div className="sp-reputation purple">
      {/* Header row — bar-chart icon + title + (Premium) streams badge */}
      {expandable ? (
        <>
          <div className="sp-rep-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ReputationIcon size={14} />
              <span className="sp-reputation-title">{t('sp.rep_title')}</span>
            </div>
            {streamsBadge && <span className="sp-rep-streams-badge">{streamsBadge}</span>}
          </div>
          <div className="sp-section-subtitle">{t('sp.rep_subtitle_premium')}</div>
        </>
      ) : (
        <div className="sp-reputation-title">
          <ReputationIcon /> {t('sp.rep_title')}{' '}
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-30)' }}>
            — {t('sp.rep_subtitle')}
          </span>
        </div>
      )}

      {/* 3 reputation rows — always all 3 rendered (placeholder when no API data) */}
      {COMPONENTS.map(({ key, i18nKey, descKey }) => {
        const value = reputation
          ? (reputation[key as keyof ReputationData] as number | null)
          : null;
        const hasValue = value != null;
        const pct = hasValue ? value : 0;
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
              <span className="sp-rep-name">{t(i18nKey)}</span>
              <div className="sp-rep-bar-bg">
                <div
                  className="sp-rep-bar-fill"
                  style={{ width: `${Math.min(100, pct)}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="sp-rep-val">{hasValue ? value!.toFixed(0) : '—'}</span>
            </div>

            {expandable && isOpen && (
              <div className="sp-rep-detail">
                <div className="sp-rep-detail-title">
                  {t(i18nKey)}: {hasValue ? value!.toFixed(0) : '—'} / 100
                </div>
                <div className="sp-rep-detail-text">{t(descKey)}</div>
                <RepDetailChart
                  score={pct}
                  history={history?.[key as keyof NonNullable<typeof history>]}
                />
                <RepChange
                  delta={deltas?.[key as keyof NonNullable<typeof deltas>]}
                  t={t}
                />
                <a
                  href="#"
                  className="sp-rep-history-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('trends');
                  }}
                >
                  {t('sp.rep_history_link')}
                </a>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer disclaimer — Premium full view only (wireframe frame 14 line 274) */}
      {expandable && (
        <div className="sp-rep-disclaimer">
          ⓘ {t('sp.rep_disclaimer_premium')}
        </div>
      )}
    </div>
  );
}
