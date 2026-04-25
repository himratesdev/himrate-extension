// TASK-039 FR-001, M1 Hero module — ERV% timeline с trend + forecast + explanation + best/worst.
// Consumes GET /api/v1/channels/:id/trends/erv.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { ErvResponse, TrendsMeta, TrendsPeriod } from '../../../../../shared/trends-types';
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
  /** Overview list variant (denser layout). Default variant = drill-down detail. */
  variant?: 'overview' | 'detail';
  /** Phase D2 S-1: surface response meta (data_freshness etc.) к parent для banner логики. */
  onMetaUpdate?: (meta: TrendsMeta) => void;
}

export function ErvTimeline({ channelId, period, variant = 'detail', onMetaUpdate }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: ErvResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getErv(channelId, period, 'daily', ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        onMetaUpdate?.(result.data.meta);
        const points = result.data.data.points;
        setState(points.length < 3 ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        // CR N-5: AbortError при unmount — expected, не regression.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey, onMetaUpdate]);

  const handleRetry = () => setRefreshKey((k) => k + 1);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={handleRetry} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_3_streams" />;

  return <ErvTimelineView data={state.data} locale={locale} variant={variant} t={t} />;
}

// Pure view component — easier testing + clearer separation from fetch logic.
export function ErvTimelineView({
  data,
  locale,
  variant,
  t,
}: {
  data: ErvResponse;
  locale: 'ru' | 'en';
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const d = data.data;
  const current = d.summary?.current;
  const trendArrow = d.trend.direction === 'rising' ? '↑' : d.trend.direction === 'declining' ? '↓' : '→';

  // Proper memoization: deps — d.points + d.forecast (reference-stable из server
  // response object). useMemo предотвращает пересчёт arrays + series config при
  // unrelated parent re-renders.
  const { chartDates, series } = useMemo<{ chartDates: string[]; series: Series[] }>(() => {
    const dates = d.points.map((p) => p.date);
    const ervValues = d.points.map((p) => p.erv_percent);
    const forecastSeries = buildForecastSeries(dates, ervValues, d.forecast);
    const resolvedDates = forecastSeries ? forecastSeries.dates : dates;

    const built: Series[] = [
      {
        label: 'ERV %',
        values: padValues(ervValues, resolvedDates.length),
        color: trendsColor('erv'),
        width: 2,
      },
    ];
    if (forecastSeries) {
      built.push({
        label: t('trends.modules.erv.forecast_series_label'),
        values: forecastSeries.values,
        color: trendsColor('forecast'),
        dashed: true,
        width: 2,
      });
    }

    return { chartDates: resolvedDates, series: built };
  }, [d.points, d.forecast, t]);

  return (
    <div className={`trends-module trends-module-erv trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.erv.title')}</span>
      </div>

      <div className="trends-erv-hero">
        <span className="trends-erv-value">{current != null ? `${current.toFixed(1)}%` : '—'}</span>
        <span className="trends-erv-hero-label">{t('trends.modules.erv.hero_label')}</span>
      </div>

      {d.trend.direction && d.trend.delta != null && (
        <div className="trends-trend-line">
          <span className={`trends-trend-arrow trends-trend-${d.trend.direction}`}>{trendArrow}</span>
          <span className="trends-trend-delta">
            {d.trend.delta > 0 ? '+' : ''}
            {d.trend.delta.toFixed(1)}
          </span>
          {d.trend.confidence && (
            <span className="trends-trend-confidence">{t(`trends.confidence.${d.trend.confidence}`)}</span>
          )}
        </div>
      )}

      <LineChart
        dates={chartDates}
        series={series}
        height={variant === 'overview' ? 120 : 160}
        yMin={0}
        yMax={100}
        valueFormatter={(v) => `${v.toFixed(0)}%`}
      />

      {d.forecast && <ForecastBlockView forecast={d.forecast} t={t} />}

      {d.trend_explanation.explanation_en && (
        <div className="trends-explanation">
          {locale === 'ru' ? d.trend_explanation.explanation_ru : d.trend_explanation.explanation_en}
        </div>
      )}

      {(d.best_stream || d.worst_stream) && (
        <div className="trends-best-worst">
          {d.best_stream?.ti != null && (
            <div className="trends-best-stream">
              <span className="trends-best-worst-label">{t('trends.best_stream.title')}</span>
              <span className="trends-best-worst-value">TI {d.best_stream.ti}</span>
              <span className="trends-best-worst-date">{d.best_stream.date?.slice(0, 10) ?? '—'}</span>
            </div>
          )}
          {d.worst_stream?.ti != null && (
            <div className="trends-worst-stream">
              <span className="trends-best-worst-label">{t('trends.worst_stream.title')}</span>
              <span className="trends-best-worst-value">TI {d.worst_stream.ti}</span>
              <span className="trends-best-worst-date">{d.worst_stream.date?.slice(0, 10) ?? '—'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
