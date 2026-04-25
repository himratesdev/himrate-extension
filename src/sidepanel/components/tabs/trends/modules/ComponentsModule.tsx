// TASK-039 FR-005, M5 — Component breakdown + Discovery Phase + Coupling + Botted fraction.
// Server response: app/services/trends/api/components_endpoint_service.rb.
// degradation_signals only (improvement signals — separate /trends/insights endpoint).
// botted_fraction = single decimal 0..1; Coupling consumed via summary block.

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  ComponentsResponse,
  TrendsPeriod,
  DiscoveryPhase,
  FollowerCcvCouplingSummary,
} from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';
import { useTrendsModule } from '../shared/use-trends-module';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

// CR N-2 fix: array-based palette + modulo cycle (replaces Record<number, string>
// с brittle index lookup). Cleanly cycles когда components > palette length.
const COMPONENT_COLORS = [
  'var(--trends-component-1, #2563eb)',
  'var(--trends-component-2, #16a34a)',
  'var(--trends-component-3, #9333ea)',
  'var(--trends-component-4, #eab308)',
  'var(--trends-component-5, #ef4444)',
] as const;

function pickColor(idx: number): string {
  return COMPONENT_COLORS[idx % COMPONENT_COLORS.length];
}

export function ComponentsModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();

  const { state, retry } = useTrendsModule<ComponentsResponse>(
    (signal) => trendsApi.getComponents(channelId, period, signal),
    [channelId, period],
    { classifyOk: (r) => (r.data.degradation_signals.length === 0 && r.data.points.length === 0 ? 'empty' : 'ok') }
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive')
    return <InsufficientData reasonKey="min_14_days" />;

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

  // Derive contribution % per component via |delta| (degradation_signals).
  // Server doesn't return contribution_pct directly — use absolute delta share
  // as proxy для visual stack ranking.
  const segments = useMemo(() => {
    if (d.degradation_signals.length === 0) return [];
    const totalAbs = d.degradation_signals.reduce((sum, s) => sum + Math.abs(s.delta), 0);
    return d.degradation_signals.map((s, idx) => ({
      ...s,
      sharePct: totalAbs > 0 ? (Math.abs(s.delta) / totalAbs) * 100 : 0,
      color: pickColor(idx),
    }));
  }, [d.degradation_signals]);

  return (
    <div className={`trends-module trends-module-components trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">
          {variant === 'overview'
            ? t('trends.modules.components.title_mini')
            : t('trends.modules.components.title')}
        </span>
      </div>

      {segments.length > 0 && (
        <div className="trends-components-stack">
          <div className="trends-components-stack-title">
            {t('trends.modules.components.contribution_title')}
          </div>
          <div
            className="trends-components-stack-bar"
            role="img"
            aria-label={t('trends.modules.components.contribution_title')}
          >
            {segments.map((s) => (
              <div
                key={s.name}
                className="trends-components-stack-segment"
                style={{ width: `${s.sharePct}%`, background: s.color }}
                title={`${s.name}: ${s.sharePct.toFixed(0)}%`}
              />
            ))}
          </div>
          <div className="trends-components-stack-legend">
            {segments.map((s) => (
              <div key={s.name} className="trends-components-legend-row">
                <span
                  className="trends-components-legend-dot"
                  style={{ background: s.color }}
                />
                <span className="trends-components-legend-name">{s.name.replace(/_/g, ' ')}</span>
                <span className="trends-components-legend-pts">
                  {s.delta > 0 ? '+' : ''}
                  {s.delta.toFixed(2)}
                </span>
                <span className="trends-components-legend-pct">{s.sharePct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'detail' && d.degradation_signals.length > 0 && (
        <div className="trends-components-changes">
          <div className="trends-components-section-title">
            {t('trends.modules.components.changes_title')}
          </div>
          {d.degradation_signals.map((s) => (
            <div key={`deg-${s.name}`} className="trends-components-change-row is-down">
              <span className="trends-components-change-name">{s.name.replace(/_/g, ' ')}</span>
              <span className="trends-components-change-delta">{s.delta.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {variant === 'detail' && d.discovery_phase && (
        <DiscoveryPhaseCard phase={d.discovery_phase} t={t} locale={locale} />
      )}

      {variant === 'detail' && d.follower_ccv_coupling_summary && d.follower_ccv_coupling_summary.current_health && (
        <CouplingCard summary={d.follower_ccv_coupling_summary} t={t} />
      )}

      {variant === 'detail' && d.botted_fraction != null && (
        <BottedFractionCard
          fraction={d.botted_fraction}
          totalStreams={d.points.length}
          period={t(`trends.period.${period}`)}
          t={t}
        />
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
  const details = locale === 'ru' ? phase.details_ru : phase.details_en;
  return (
    <div className={`trends-discovery-card status-${phase.status}`}>
      <span className="trends-discovery-dot" aria-hidden="true" />
      <div className="trends-discovery-body">
        <span className="trends-discovery-title">
          {t('trends.modules.components.discovery_title', { label })}
        </span>
        {details && <span className="trends-discovery-detail">{details}</span>}
      </div>
    </div>
  );
}

function CouplingCard({
  summary,
  t,
}: {
  summary: FollowerCcvCouplingSummary;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  if (!summary.current_health) return null;
  const label = t(`trends.modules.components.coupling.${summary.current_health}`);
  const r = summary.current_r != null ? summary.current_r.toFixed(2) : '—';
  return (
    <div className={`trends-coupling-card health-${summary.current_health}`}>
      <span className="trends-coupling-dot" aria-hidden="true" />
      <div className="trends-coupling-body">
        <span className="trends-coupling-title">
          {t('trends.modules.components.coupling_title', { label })}
        </span>
        <span className="trends-coupling-detail">r = {r}</span>
      </div>
    </div>
  );
}

function BottedFractionCard({
  fraction,
  totalStreams,
  period,
  t,
}: {
  fraction: number;
  totalStreams: number;
  period: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const count = Math.round(fraction * Math.max(totalStreams, 1));
  return (
    <div className={`trends-botted-card${fraction === 0 ? ' is-clean' : ''}`}>
      <span className="trends-botted-title">{t('trends.modules.components.botted_title')}</span>
      <span className="trends-botted-value">{count}</span>
      <span className="trends-botted-detail">
        {fraction === 0
          ? t('trends.modules.components.botted_zero', { period })
          : t('trends.modules.components.botted_count', { count, total: totalStreams, period })}
      </span>
    </div>
  );
}
