// TASK-039 FR-005, M5 — Components contribution + Discovery Phase + Coupling + Botted streams.
// Consumes GET /api/v1/channels/:id/trends/components.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  ComponentsResponse,
  TrendsPeriod,
  DiscoveryPhase,
  FollowerCcvCoupling,
} from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

const COMPONENT_COLORS: Record<number, string> = {
  0: 'var(--trends-component-1, #2563eb)',
  1: 'var(--trends-component-2, #16a34a)',
  2: 'var(--trends-component-3, #9333ea)',
  3: 'var(--trends-component-4, #eab308)',
  4: 'var(--trends-component-5, #ef4444)',
};

export function ComponentsModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: ComponentsResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getComponents(channelId, period, ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const top = result.data.data.summary.top_components;
        setState(top.length === 0 ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_14_days" />;

  return <ComponentsModuleView data={state.data} variant={variant} period={period} t={t} locale={locale} />;
}

export function ComponentsModuleView({
  data,
  variant,
  period,
  t,
  locale,
}: {
  data: ComponentsResponse;
  variant: 'overview' | 'detail';
  period: TrendsPeriod;
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;

  const totalContribution = useMemo(
    () => d.summary.top_components.reduce((sum, c) => sum + (c.contribution_pct ?? 0), 0),
    [d.summary.top_components]
  );

  return (
    <div className={`trends-module trends-module-components trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">
          {variant === 'overview'
            ? t('trends.modules.components.title_mini')
            : t('trends.modules.components.title')}
        </span>
      </div>

      <div className="trends-components-stack">
        <div className="trends-components-stack-title">
          {t('trends.modules.components.contribution_title')}
        </div>
        <div className="trends-components-stack-bar" role="img" aria-label={t('trends.modules.components.contribution_title')}>
          {d.summary.top_components.map((c, idx) => {
            const widthPct = totalContribution > 0 ? ((c.contribution_pct ?? 0) / totalContribution) * 100 : 0;
            return (
              <div
                key={c.name}
                className="trends-components-stack-segment"
                style={{ width: `${widthPct}%`, background: COMPONENT_COLORS[idx] ?? COMPONENT_COLORS[4] }}
                title={`${c.name}: ${(c.contribution_pct ?? 0).toFixed(0)}%`}
              />
            );
          })}
        </div>
        <div className="trends-components-stack-legend">
          {d.summary.top_components.map((c, idx) => (
            <div key={c.name} className="trends-components-legend-row">
              <span className="trends-components-legend-dot" style={{ background: COMPONENT_COLORS[idx] ?? COMPONENT_COLORS[4] }} />
              <span className="trends-components-legend-name">{c.name.replace(/_/g, ' ')}</span>
              {c.current_pts != null && (
                <span className="trends-components-legend-pts">{c.current_pts.toFixed(0)} pts</span>
              )}
              {c.contribution_pct != null && (
                <span className="trends-components-legend-pct">{c.contribution_pct.toFixed(0)}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {variant === 'detail' && (d.degradation_signals.length > 0 || d.improvement_signals.length > 0) && (
        <div className="trends-components-changes">
          <div className="trends-components-section-title">{t('trends.modules.components.changes_title')}</div>
          {d.degradation_signals.map((s) => (
            <div key={`deg-${s.name}`} className="trends-components-change-row is-down">
              <span className="trends-components-change-name">{s.name.replace(/_/g, ' ')}</span>
              <span className="trends-components-change-delta">{s.delta.toFixed(1)}</span>
            </div>
          ))}
          {d.improvement_signals.map((s) => (
            <div key={`imp-${s.name}`} className="trends-components-change-row is-up">
              <span className="trends-components-change-name">{s.name.replace(/_/g, ' ')}</span>
              <span className="trends-components-change-delta">+{s.delta.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {variant === 'detail' && d.discovery_phase && (
        <DiscoveryPhaseCard phase={d.discovery_phase} t={t} locale={locale} />
      )}

      {variant === 'detail' && d.follower_ccv_coupling && (
        <CouplingCard coupling={d.follower_ccv_coupling} t={t} locale={locale} />
      )}

      {variant === 'detail' && d.botted_streams && (
        <BottedStreamsCard
          count={d.botted_streams.count}
          total={d.botted_streams.total_streams}
          period={d.botted_streams.period_label || t(`trends.period.${period}`)}
          t={t}
        />
      )}

      {variant === 'detail' && (d.explanation_ru || d.explanation_en) && (
        <div className="trends-explanation">{locale === 'ru' ? d.explanation_ru : d.explanation_en}</div>
      )}
    </div>
  );
}

function DiscoveryPhaseCard({
  phase,
  t,
  locale,
}: {
  phase: DiscoveryPhase;
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const label = t(`trends.modules.components.discovery.${phase.status}`);
  return (
    <div className={`trends-discovery-card status-${phase.status}`}>
      <span className="trends-discovery-dot" aria-hidden="true" />
      <div className="trends-discovery-body">
        <span className="trends-discovery-title">
          {t('trends.modules.components.discovery_title', { label })}
        </span>
        <span className="trends-discovery-detail">
          {locale === 'ru' ? phase.details_ru : phase.details_en}
        </span>
      </div>
    </div>
  );
}

function CouplingCard({
  coupling,
  t,
  locale,
}: {
  coupling: FollowerCcvCoupling;
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const label = t(`trends.modules.components.coupling.${coupling.health}`);
  return (
    <div className={`trends-coupling-card health-${coupling.health}`}>
      <span className="trends-coupling-dot" aria-hidden="true" />
      <div className="trends-coupling-body">
        <span className="trends-coupling-title">
          {t('trends.modules.components.coupling_title', { label })}
        </span>
        <span className="trends-coupling-detail">
          {locale === 'ru' ? coupling.description_ru : coupling.description_en}
        </span>
      </div>
    </div>
  );
}

function BottedStreamsCard({
  count,
  total,
  period,
  t,
}: {
  count: number;
  total: number;
  period: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={`trends-botted-card${count === 0 ? ' is-clean' : ''}`}>
      <span className="trends-botted-title">{t('trends.modules.components.botted_title')}</span>
      <span className="trends-botted-value">{count}</span>
      <span className="trends-botted-detail">
        {count === 0
          ? t('trends.modules.components.botted_zero', { period })
          : t('trends.modules.components.botted_count', { count, total, period })}
      </span>
    </div>
  );
}
