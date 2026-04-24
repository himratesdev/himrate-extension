// TASK-039 FR-007, M11 — Среди коллег. Server returns quartile percentiles
// (p25/p50/p75/p90) per metric — UI computes channel position bracket.
// Server response: app/services/trends/api/comparison_endpoint_service.rb +
// app/services/trends/analysis/peer_comparison_service.rb.

import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  ComparisonResponse,
  TrendsPeriod,
  PercentileQuartiles,
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

export function ComparisonModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();

  const { state, retry } = useTrendsModule<ComparisonResponse>(
    (signal) => trendsApi.getComparison(channelId, period, signal),
    [channelId, period],
    { classifyOk: (r) => (r.data.insufficient_data ? 'empty' : 'ok') }
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive')
    return <InsufficientData reasonKey="min_3_streams" />;

  return <ComparisonModuleView data={state.data} variant={variant} t={t} locale={locale} />;
}

// CR M-1: derive position bracket from quartile percentiles. Returns approximate
// percentile rank (0..100) of channel value within the peer distribution.
function deriveRank(value: number | null, quartiles: PercentileQuartiles): number | null {
  if (value == null) return null;
  const points: { p: number; v: number | null }[] = [
    { p: 25, v: quartiles.p25 },
    { p: 50, v: quartiles.p50 },
    { p: 75, v: quartiles.p75 },
    { p: 90, v: quartiles.p90 },
  ];
  // Below p25 → linear interp 0..25.
  const p25 = quartiles.p25;
  if (p25 != null && value <= p25) return Math.round((value / Math.max(p25, 1e-9)) * 25);
  // Above p90 → 95th rank approximation.
  const p90 = quartiles.p90;
  if (p90 != null && value >= p90) return 95;
  // Between brackets — linear interpolation.
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a.v == null || b.v == null) continue;
    if (value >= a.v && value <= b.v) {
      const span = Math.max(b.v - a.v, 1e-9);
      return Math.round(a.p + ((value - a.v) / span) * (b.p - a.p));
    }
  }
  return 50;
}

export function ComparisonModuleView({
  data,
  variant,
  t,
  locale,
}: {
  data: ComparisonResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;

  // Type narrowing — insufficient branch handled before we got here.
  if (d.insufficient_data) {
    return null;
  }

  const channelTi = d.channel_values.ti_avg;
  const tiRank = deriveRank(channelTi, d.percentiles.ti);
  const topPct = tiRank != null ? Math.max(1, 100 - tiRank) : null;
  const verdict = locale === 'ru' ? d.verdict.verdict_ru : d.verdict.verdict_en;

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
        {topPct != null && (
          <span className="trends-comparison-top">{t('trends.modules.comparison.top_pct', { n: topPct })}</span>
        )}
        <span className="trends-comparison-category">{d.category}</span>
      </div>

      {tiRank != null && (
        <div className="trends-comparison-context">
          {t('trends.modules.comparison.context', { n: tiRank, total: d.sample_size })}
        </div>
      )}

      {variant === 'detail' && (
        <>
          <PercentileRow
            label={t('trends.modules.comparison.metric_ti')}
            channelValue={d.channel_values.ti_avg}
            quartiles={d.percentiles.ti}
            t={t}
          />
          <PercentileRow
            label={t('trends.modules.comparison.metric_erv')}
            channelValue={d.channel_values.erv_avg_percent}
            quartiles={d.percentiles.erv}
            t={t}
            valueFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <PercentileRow
            label={t('trends.modules.comparison.metric_stability')}
            channelValue={d.channel_values.stability != null ? d.channel_values.stability * 100 : null}
            quartiles={{
              p25: d.percentiles.stability.p25 != null ? d.percentiles.stability.p25 * 100 : null,
              p50: d.percentiles.stability.p50 != null ? d.percentiles.stability.p50 * 100 : null,
              p75: d.percentiles.stability.p75 != null ? d.percentiles.stability.p75 * 100 : null,
              p90: d.percentiles.stability.p90 != null ? d.percentiles.stability.p90 * 100 : null,
            }}
            t={t}
          />

          {verdict && <div className="trends-explanation">{verdict}</div>}
        </>
      )}
    </div>
  );
}

function PercentileRow({
  label,
  channelValue,
  quartiles,
  t,
  valueFormatter,
}: {
  label: string;
  channelValue: number | null;
  quartiles: PercentileQuartiles;
  t: ReturnType<typeof useTranslation>['t'];
  valueFormatter?: (v: number) => string;
}) {
  if (channelValue == null) return null;
  const fmt = valueFormatter ?? ((v: number) => v.toFixed(0));
  const rank = deriveRank(channelValue, quartiles);
  const channelPos = rank != null ? Math.max(0, Math.min(100, rank)) : 50;
  return (
    <div className="trends-comparison-row">
      <span className="trends-comparison-row-label">{label}</span>
      <div className="trends-comparison-bar-track">
        <span
          className="trends-comparison-median-tick"
          style={{ left: '50%' }}
          aria-label={t('trends.modules.comparison.median')}
        />
        <div className="trends-comparison-bar-fill" style={{ width: `${channelPos}%` }} />
      </div>
      <span className="trends-comparison-row-value">{fmt(channelValue)}</span>
    </div>
  );
}
