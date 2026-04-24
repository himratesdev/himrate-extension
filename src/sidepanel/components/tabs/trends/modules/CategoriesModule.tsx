// TASK-039 FR-008, M13 — Per-category cards with metric cells + baseline ticks.
// Consumes GET /api/v1/channels/:id/trends/categories.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { CategoriesResponse, CategoryRow, TrendsPeriod } from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

export function CategoriesModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: CategoriesResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getCategories(channelId, period, ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const cats = result.data.data.categories;
        setState(cats.length === 0 ? { status: 'empty' } : { status: 'ok', data: result.data });
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
  const baseline = d.baseline;

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
          <CategoryCard key={cat.name} cat={cat} baseline={baseline} t={t} />
        ))}
      </div>

      {variant === 'detail' && (d.verdict_ru || d.verdict_en) && (
        <div className="trends-explanation">{locale === 'ru' ? d.verdict_ru : d.verdict_en}</div>
      )}
    </div>
  );
}

function CategoryCard({
  cat,
  baseline,
  t,
}: {
  cat: CategoryRow;
  baseline: CategoriesResponse['data']['baseline'];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={`trends-category-card${cat.is_best ? ' is-best' : ''}`}>
      <div className="trends-category-header">
        <span className="trends-category-name">{cat.name}</span>
        {cat.is_best && (
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
          baseline={baseline.ti_avg}
          t={t}
        />
        <MetricCell
          label={t('trends.modules.categories.metric_erv')}
          value={cat.erv_avg_percent}
          baseline={baseline.erv_avg_percent}
          suffix="%"
          t={t}
        />
        <MetricCell
          label={t('trends.modules.categories.metric_stability')}
          value={cat.stability_avg}
          baseline={baseline.stability_avg}
          t={t}
        />
      </div>
    </div>
  );
}

function MetricCell({
  label,
  value,
  baseline,
  suffix = '',
  t,
}: {
  label: string;
  value: number | null;
  baseline: number | null;
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
