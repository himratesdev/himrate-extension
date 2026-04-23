// TASK-039 FR-002, M2 — Trust Index timeline с trend + forecast + tier_changes + anomaly markers.
// Consumes GET /api/v1/channels/:id/trends/trust_index.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { TrustIndexResponse, TrendsPeriod } from '../../../../../shared/trends-types';
import { trendsColor } from '../../../../../shared/trends-theme';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LineChart, type Series } from '../charts/LineChart';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';
import { buildForecastSeries, padValues, ForecastBlockView } from '../shared/forecast-helpers';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

export function TrustIndexTimeline({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: TrustIndexResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getTrustIndex(channelId, period, 'daily', ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const points = result.data.data.points;
        setState(points.length < 3 ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  const handleRetry = () => setRefreshKey((k) => k + 1);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={handleRetry} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_3_streams" />;

  return <TrustIndexTimelineView data={state.data} locale={locale} variant={variant} t={t} />;
}

export function TrustIndexTimelineView({
  data,
  locale,
  variant,
  t,
}: {
  data: TrustIndexResponse;
  locale: 'ru' | 'en';
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const d = data.data;
  const current = d.summary?.current;
  const anomalyDates = useMemo(() => d.anomaly_markers.map((a) => a.date), [d.anomaly_markers]);

  // Proper memoization: deps — d.points + d.forecast (reference-stable из server
  // response). Prevents пересчёт series при unrelated parent re-renders.
  const { chartDates, series } = useMemo<{ chartDates: string[]; series: Series[] }>(() => {
    const dates = d.points.map((p) => p.date);
    const tiValues = d.points.map((p) => p.ti);
    const forecastSeries = buildForecastSeries(dates, tiValues, d.forecast);
    const resolvedDates = forecastSeries ? forecastSeries.dates : dates;

    const built: Series[] = [
      { label: 'TI', values: padValues(tiValues, resolvedDates.length), color: trendsColor('ti'), width: 2 },
    ];
    if (forecastSeries) {
      built.push({
        label: t('trends.modules.trust_index.forecast_series_label'),
        values: forecastSeries.values,
        color: trendsColor('forecast'),
        dashed: true,
        width: 2,
      });
    }

    return { chartDates: resolvedDates, series: built };
  }, [d.points, d.forecast, t]);

  return (
    <div className={`trends-module trends-module-ti trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.trust_index.title')}</span>
        {d.tier_changes.count > 0 && (
          <span className="trends-tier-changes-badge">
            {t('trends.tier_changes.count', { count: d.tier_changes.count })}
          </span>
        )}
      </div>

      {current != null && (
        <div className="trends-ti-current">
          <span className="trends-ti-value">{current.toFixed(1)}</span>
          <span className="trends-ti-label">TI</span>
        </div>
      )}

      <LineChart
        dates={chartDates}
        series={series}
        height={variant === 'overview' ? 120 : 160}
        yMin={0}
        yMax={100}
        valueFormatter={(v) => v.toFixed(0)}
        anomalyDates={anomalyDates}
      />

      {d.forecast && <ForecastBlockView forecast={d.forecast} t={t} />}

      {d.trend_explanation.explanation_en && (
        <div className="trends-explanation">
          {locale === 'ru' ? d.trend_explanation.explanation_ru : d.trend_explanation.explanation_en}
        </div>
      )}

      {d.tier_changes.latest && (
        <div className="trends-latest-tier-change">
          <span className="trends-tier-from">{d.tier_changes.latest.from_tier ?? '—'}</span>
          <span className="trends-tier-arrow">→</span>
          <span className="trends-tier-to">{d.tier_changes.latest.to_tier}</span>
          <span className="trends-tier-date">{d.tier_changes.latest.occurred_at?.slice(0, 10)}</span>
        </div>
      )}
    </div>
  );
}
