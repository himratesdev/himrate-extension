// TASK-039 CR follow-ups:
//   - Dedup buildForecastSeries + padValues между ErvTimeline + TrustIndexTimeline
//   - ForecastBlockView renamed (избегает shadow с type ForecastBlock)
// Reusable в любых модулях где forecast applicable (trend-based endpoints).

import type { TFunction } from 'i18next';
import type { ForecastBlock } from '../../../../../shared/trends-types';

/**
 * Extends historical dates/values array с 2 forecast projection points (7d + 30d ahead).
 * Forecast values aligned как separate series в LineChart с dashed rendering.
 *
 * historical[...] + [null anchor at last real] + forecast_7d + forecast_30d
 *
 * Returns null если forecast отсутствует или historical empty.
 */
export function buildForecastSeries(
  historicalDates: string[],
  historicalValues: (number | null)[],
  forecast: ForecastBlock | null,
): { dates: string[]; values: (number | null)[] } | null {
  if (!forecast || historicalDates.length === 0) return null;

  const lastDate = historicalDates[historicalDates.length - 1];
  if (!lastDate) return null;

  const lastTs = new Date(lastDate).getTime();
  const date7d = new Date(lastTs + 7 * 86_400_000).toISOString().slice(0, 10);
  const date30d = new Date(lastTs + 30 * 86_400_000).toISOString().slice(0, 10);

  return {
    dates: [...historicalDates, date7d, date30d],
    values: [
      ...new Array(historicalDates.length - 1).fill(null),
      historicalValues[historicalValues.length - 1] ?? null, // anchor: last historical
      forecast.forecast_7d.value,
      forecast.forecast_30d.value,
    ],
  };
}

/**
 * Pads series values с trailing nulls to match target length. LineChart требует
 * all series aligned с x-axis dates array.
 */
export function padValues(values: (number | null)[], targetLength: number): (number | null)[] {
  if (values.length >= targetLength) return values;
  return [...values, ...new Array(targetLength - values.length).fill(null)];
}

/**
 * Forecast block — renders horizon_7d + horizon_30d values с confidence-bound
 * ranges + reliability label. Shared across Erv/TI modules.
 * Name "View" suffix распознаётся чтобы избежать shadow с type ForecastBlock.
 */
export function ForecastBlockView({ forecast, t }: { forecast: ForecastBlock; t: TFunction }) {
  return (
    <div className="trends-forecast-block">
      <div className="trends-forecast-row">
        <span className="trends-forecast-label">{t('trends.forecast.horizon_7d')}</span>
        <span className="trends-forecast-value">
          {t('trends.forecast.range', {
            value: forecast.forecast_7d.value.toFixed(1),
            lower: forecast.forecast_7d.lower.toFixed(1),
            upper: forecast.forecast_7d.upper.toFixed(1),
          })}
        </span>
      </div>
      <div className="trends-forecast-row">
        <span className="trends-forecast-label">{t('trends.forecast.horizon_30d')}</span>
        <span className="trends-forecast-value">
          {t('trends.forecast.range', {
            value: forecast.forecast_30d.value.toFixed(1),
            lower: forecast.forecast_30d.lower.toFixed(1),
            upper: forecast.forecast_30d.upper.toFixed(1),
          })}
        </span>
      </div>
      <div className={`trends-forecast-reliability trends-forecast-${forecast.reliability}`}>
        {t(`trends.reliability.${forecast.reliability}`)}
      </div>
      {forecast.reliability === 'low' && (
        <div className="trends-forecast-disclaimer">{t('trends.reliability.disclaimer_low')}</div>
      )}
    </div>
  );
}
