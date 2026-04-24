// TASK-039 FR-008, M13 — Per-category cards с baseline ticks (derived).
// Server response: app/services/trends/api/categories_endpoint_service.rb +
// app/services/trends/analysis/category_pattern.rb. Baseline value = row.value − vs_baseline_delta.
// is_best derived client-side (top_category match).

import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  CategoriesResponse,
  CategoryRow,
  TrendsPeriod,
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

export function CategoriesModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();

  const { state, retry } = useTrendsModule<CategoriesResponse>(
    (signal) => trendsApi.getCategories(channelId, period, signal),
    [channelId, period],
    { classifyOk: (r) => (r.data.categories.length === 0 ? 'empty' : 'ok') }
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive')
    return <InsufficientData reasonKey="min_3_streams" />;

  return <CategoriesModuleView data={state.data} variant={variant} t={t} locale={locale} />;
}

export function CategoriesModuleView({
  data,
  variant,
  t,
  locale,
}: {
  data: CategoriesResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;
  const cats = variant === 'overview' ? d.categories.slice(0, 2) : d.categories;
  const verdict = locale === 'ru' ? d.verdict.verdict_ru : d.verdict.verdict_en;

  return (
    <div className={`trends-module trends-module-categories trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">
          {variant === 'overview'
            ? t('trends.modules.categories.title_mini')
            : t('trends.modules.categories.title')}
        </span>
      </div>

      <div className="trends-categories-list">
        {cats.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} isBest={cat.name === d.top_category} t={t} />
        ))}
      </div>

      {variant === 'detail' && verdict && (
        <div className="trends-explanation">{verdict}</div>
      )}
    </div>
  );
}

function CategoryCard({
  cat,
  isBest,
  t,
}: {
  cat: CategoryRow;
  isBest: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={`trends-category-card${isBest ? ' is-best' : ''}`}>
      <div className="trends-category-header">
        <span className="trends-category-name">{cat.name}</span>
        {isBest && (
          <span className="trends-category-best-badge">{t('trends.modules.categories.best_badge')}</span>
        )}
        <span className="trends-category-streams">
          {t('trends.modules.categories.streams_count', { n: cat.streams_count })}
        </span>
      </div>
      <div className="trends-category-metrics">
        <MetricCell
          label={t('trends.modules.categories.metric_ti')}
          value={cat.ti_avg}
          delta={cat.vs_baseline_ti_delta}
          t={t}
        />
        <MetricCell
          label={t('trends.modules.categories.metric_erv')}
          value={cat.erv_avg_percent}
          delta={cat.vs_baseline_erv_delta}
          suffix="%"
          t={t}
        />
      </div>
    </div>
  );
}

function MetricCell({
  label,
  value,
  delta,
  suffix = '',
  t,
}: {
  label: string;
  value: number | null;
  delta: number | null;
  suffix?: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  if (value == null) {
    return (
      <div className="trends-metric-cell is-empty">
        <span className="trends-metric-label">{label}</span>
        <span className="trends-metric-value">—</span>
      </div>
    );
  }
  // Baseline reconstructed: row value − vs_baseline_delta = baseline value.
  const baseline = delta != null ? value - delta : null;
  return (
    <div className="trends-metric-cell">
      <span className="trends-metric-label">{label}</span>
      <span className="trends-metric-value">
        {value.toFixed(0)}
        {suffix}
      </span>
      {baseline != null && (
        <span className="trends-metric-baseline">
          {t('trends.modules.categories.baseline', { value: `${baseline.toFixed(0)}${suffix}` })}
        </span>
      )}
    </div>
  );
}
