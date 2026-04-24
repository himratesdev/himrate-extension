// TASK-039 FR-007, M11 — Среди коллег: top% + 3 metric bars + position dynamics.
// Consumes GET /api/v1/channels/:id/trends/comparison.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { ComparisonResponse, TrendsPeriod, ComparisonPercentileEntry } from '../../../../../shared/trends-types';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

export function ComparisonModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: ComparisonResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getComparison(channelId, period, ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const sample = result.data.data.sample_size;
        setState(sample === 0 ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_3_streams" />;

  return <ComparisonModuleView data={state.data} variant={variant} t={t} />;
}

export function ComparisonModuleView({
  data,
  variant,
  t,
}: {
  data: ComparisonResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const d = data.data;
  const tiPct = d.percentiles.trust_index;
  const topPct = Math.max(1, 100 - tiPct.percentile);

  return (
    <div className={`trends-module trends-module-comparison trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">
          {variant === 'overview'
            ? t('trends.modules.comparison.title_mini')
            : t('trends.modules.comparison.title')}
        </span>
      </div>

      <div className="trends-comparison-hero">
        <span className="trends-comparison-top">{t('trends.modules.comparison.top_pct', { n: topPct })}</span>
        {d.category && <span className="trends-comparison-category">{d.category}</span>}
        {!d.category && (
          <span className="trends-comparison-no-category">
            {t('trends.modules.comparison.no_category')}
          </span>
        )}
      </div>

      {d.category && d.sample_size > 0 && (
        <div className="trends-comparison-context">
          {t('trends.modules.comparison.context', { n: tiPct.percentile, total: d.sample_size })}
        </div>
      )}

      {variant === 'detail' && (
        <>
          <PercentileRow
            label={t('trends.modules.comparison.metric_ti')}
            entry={d.percentiles.trust_index}
            t={t}
          />
          <PercentileRow
            label={t('trends.modules.comparison.metric_erv')}
            entry={d.percentiles.erv_percent}
            t={t}
            valueFormatter={(v) => `${v.toFixed(0)}%`}
          />
          {d.percentiles.stability && (
            <PercentileRow
              label={t('trends.modules.comparison.metric_stability')}
              entry={d.percentiles.stability}
              t={t}
            />
          )}

          {d.percentile_history.length > 0 && (
            <div className="trends-comparison-history">
              <div className="trends-comparison-section-title">
                {t('trends.modules.comparison.history_title')}
              </div>
              <div className="trends-comparison-history-cards">
                {d.percentile_history.map((entry) => (
                  <div key={entry.weeks_ago} className="trends-comparison-history-card">
                    <span className="trends-comparison-history-weeks">
                      {entry.weeks_ago === 0
                        ? t('trends.modules.comparison.history_now')
                        : t('trends.modules.comparison.history_weeks_ago', { n: entry.weeks_ago })}
                    </span>
                    <span className="trends-comparison-history-pct">
                      {Math.max(1, 100 - entry.percentile)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PercentileRow({
  label,
  entry,
  t,
  valueFormatter,
}: {
  label: string;
  entry: ComparisonPercentileEntry;
  t: ReturnType<typeof useTranslation>['t'];
  valueFormatter?: (v: number) => string;
}) {
  const fmt = valueFormatter ?? ((v: number) => v.toFixed(0));
  const channelPos = Math.max(0, Math.min(100, entry.percentile));
  const medianPos = 50;
  return (
    <div className="trends-comparison-row">
      <span className="trends-comparison-row-label">{label}</span>
      <div className="trends-comparison-bar-track">
        <span className="trends-comparison-median-tick" style={{ left: `${medianPos}%` }} aria-label={t('trends.modules.comparison.median')} />
        <div className="trends-comparison-bar-fill" style={{ width: `${channelPos}%` }} />
      </div>
      <span className="trends-comparison-row-value">{fmt(entry.channel_value)}</span>
    </div>
  );
}
