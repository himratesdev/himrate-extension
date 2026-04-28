// BUG-016 PR-1 Section 8: HealthScoreCard canonical match (wireframe lines 2887-2964).
// Wireframe: side-panel-wireframe-TASK-039.html sp-health-score.
// Canonical: sp-health-score + sp-health-title + sp-health-badge-full + sp-health-row
// + sp-health-bar-bg + sp-health-bar-fill.{green/yellow/red} + sp-health-val.
// Each row expandable → reuses sp-signal-detail + sp-rep-mini-chart + sp-rep-change.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HealthScoreData } from '../../shared/api';

interface Props {
  healthScore: HealthScoreData | null;
  onNavigate?: (tab: string) => void;
  /** Optional 30-day history per component (8 points 0..100). Real data slot. */
  history?: Partial<Record<ComponentKey, number[]>>;
  /** Optional 30-day deltas per component. */
  deltas?: Partial<Record<ComponentKey, number>>;
}

const COMPONENTS_ORDER = ['ti', 'stability', 'engagement', 'growth', 'consistency'] as const;
type ComponentKey = (typeof COMPONENTS_ORDER)[number];

const I18N: Record<ComponentKey, { name: string; desc: string }> = {
  ti: { name: 'sp.hs_ti', desc: 'sp.hs_ti_desc' },
  stability: { name: 'sp.hs_stability', desc: 'sp.hs_stability_desc' },
  engagement: { name: 'sp.hs_engagement', desc: 'sp.hs_engagement_desc' },
  growth: { name: 'sp.hs_growth', desc: 'sp.hs_growth_desc' },
  consistency: { name: 'sp.hs_consistency', desc: 'sp.hs_consistency_desc' },
};

const HEALTH_GREEN = '#059669';

function healthColor(score: number | null): 'green' | 'yellow' | 'red' | 'grey' {
  if (score == null) return 'grey';
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

function MiniChart({ score, history }: { score: number; history?: number[] }) {
  const W = 200;
  const H = 32;
  const yFor = (v: number) => Math.max(2, Math.min(H - 2, H - (v / 100) * H));
  const xFor = (i: number, n: number) => (i / Math.max(1, n - 1)) * W;
  const points = history && history.length >= 2 ? history : Array.from({ length: 9 }, () => score);
  const polyline = points.map((v, i) => `${xFor(i, points.length)},${yFor(v)}`).join(' ');
  const lastX = xFor(points.length - 1, points.length);
  const lastY = yFor(score);

  return (
    <svg className="sp-rep-mini-chart" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline fill="none" stroke={HEALTH_GREEN} strokeWidth="1.5" points={polyline} />
      <circle cx={lastX} cy={lastY} r="2.5" fill={HEALTH_GREEN} />
      <text
        x={lastX - 30}
        y={Math.max(8, lastY - 2)}
        fontSize="8"
        fill={HEALTH_GREEN}
        fontFamily="'JetBrains Mono', monospace"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

function Change({
  delta,
  t,
}: {
  delta?: number;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) {
  if (delta == null) {
    return <div className="sp-rep-change">→ {t('sp.hs_change_stable')}</div>;
  }
  const direction: 'up' | 'down' | 'stable' = delta >= 1 ? 'up' : delta <= -1 ? 'down' : 'stable';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  if (direction === 'stable') {
    return <div className="sp-rep-change">{arrow} {t('sp.hs_change_stable')}</div>;
  }
  const sign = delta > 0 ? '+' : '';
  return (
    <div className={`sp-rep-change ${direction}`}>
      {arrow} {t('sp.hs_change_delta', { sign, delta })}
    </div>
  );
}

export function HealthScoreCard({ healthScore, onNavigate, history, deltas }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<ComponentKey>>(new Set());

  if (!healthScore) return null;

  const isProvisional = healthScore.streams_count < 10;
  const toggle = (key: ComponentKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="sp-health-score">
      <div className="sp-health-title">
        <span>{t('sp.health_score')}</span>
        {isProvisional ? (
          <span className="sp-health-provisional yellow">
            {t('sp.health_provisional', { N: healthScore.streams_count })}
          </span>
        ) : (
          <span className="sp-health-badge-full">
            {t('sp.health_badge_full', { count: healthScore.streams_count })}
          </span>
        )}
      </div>
      <div className="sp-section-subtitle">{t('sp.health_subtitle')}</div>

      {COMPONENTS_ORDER.map((key) => {
        const comp = healthScore.components?.[key];
        const score = comp?.score ?? null;
        const color = healthColor(score);
        const i18n = I18N[key];
        const isOpen = expanded.has(key);
        const pct = score ?? 0;

        return (
          <div key={key}>
            <div
              className="sp-health-row sp-signal-expandable"
              onClick={() => toggle(key)}
              role="button"
              aria-expanded={isOpen}
            >
              <span className="sp-health-name">{t(i18n.name)}</span>
              <div className="sp-health-bar-bg">
                <div
                  className={`sp-health-bar-fill ${color}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="sp-health-val">{score != null ? score.toFixed(0) : '—'}</span>
              <span className={`sp-signal-expand-icon${isOpen ? ' open' : ''}`}>▾</span>
            </div>
            {isOpen && (
              <div className="sp-signal-detail">
                <div className="sp-signal-detail-title">
                  {t(i18n.name)}: {score != null ? score.toFixed(0) : '—'} / 100
                </div>
                {t(i18n.desc)}
                <MiniChart score={pct} history={history?.[key]} />
                <Change delta={deltas?.[key]} t={t} />
                <a
                  href="#"
                  className="sp-hs-history-link"
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
    </div>
  );
}
