// TASK-039 FR-001, M1 Hero module — ERV% timeline с trend + forecast.
// Consumes GET /api/v1/channels/:id/trends/erv.
// Hero layout: current ERV% большой, trend arrow, chart, forecast dashed.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { ErvResponse, TrendsPeriod } from '../../../../../shared/trends-types';
import { LineChart } from '../charts/LineChart';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  compact?: boolean;
}

export function ErvTimeline({ channelId, period, compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: ErvResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });

  // refreshKey bumps → effect re-fires (манульный retry через ErrorState).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi.getErv(channelId, period, 'daily', ctrl.signal).then((result) => {
      if (!result.ok) {
        setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
        return;
      }
      const points = result.data.data.points;
      if (points.length < 3) {
        setState({ status: 'empty' });
        return;
      }
      setState({ status: 'ok', data: result.data });
    });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  const handleRetry = () => setRefreshKey((k) => k + 1);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={handleRetry} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_3_streams" />;

  const d = state.data.data;
  const locale = i18n.language.startsWith('ru') ? 'ru' : 'en';
  const dates = d.points.map((p) => p.date);
  const values = d.points.map((p) => p.erv_percent);
  const current = d.summary?.current;
  const trendArrow = d.trend.direction === 'rising' ? '↑' : d.trend.direction === 'declining' ? '↓' : '→';

  return (
    <div className="trends-module trends-module-erv">
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
            <span className="trends-trend-confidence">
              {t(`trends.confidence.${d.trend.confidence}`)}
            </span>
          )}
        </div>
      )}

      <LineChart
        dates={dates}
        series={buildSeries(values, d.forecast, locale)}
        width={compact ? 300 : 320}
        height={compact ? 120 : 160}
        yMin={0}
        yMax={100}
        valueFormatter={(v) => `${v.toFixed(0)}%`}
      />

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

function buildSeries(values: (number | null)[], _forecast: ErvResponse['data']['forecast'], locale: string) {
  const label = locale === 'ru' ? 'ERV %' : 'ERV %';
  return [
    { label, values, color: '#16a34a', width: 2 },
  ];
}
