// TASK-039 FR-009, M14 — 7-bar weekday chart + best/worst day cards (derived).
// Server response: app/services/trends/api/weekday_patterns_endpoint_service.rb +
// app/services/trends/analysis/weekday_pattern.rb. best/worst day fields derived
// client-side from weekday_patterns (server emits insight_ru/en string narrative only).

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  WeekdayPatternsResponse,
  WeekdayKey,
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

const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const WEEKEND_DAYS = new Set<WeekdayKey>(['sat', 'sun']);

interface WeekdayExtreme {
  day: WeekdayKey;
  ti_avg: number;
  erv_avg_percent: number;
}

function deriveExtremes(
  patterns: WeekdayPatternsResponse['data']['weekday_patterns']
): { best: WeekdayExtreme | null; worst: WeekdayExtreme | null } {
  const candidates = WEEKDAY_ORDER.map((day) => {
    const cell = patterns[day];
    if (!cell || cell.ti_avg == null || cell.streams_count === 0) return null;
    return { day, ti_avg: cell.ti_avg, erv_avg_percent: cell.erv_avg_percent ?? 0 };
  }).filter((c): c is WeekdayExtreme => c != null);

  if (candidates.length === 0) return { best: null, worst: null };

  let best = candidates[0];
  let worst = candidates[0];
  for (const c of candidates) {
    if (c.ti_avg > best.ti_avg) best = c;
    if (c.ti_avg < worst.ti_avg) worst = c;
  }
  return { best, worst };
}

export function WeekdayModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();

  const { state, retry } = useTrendsModule<WeekdayPatternsResponse>(
    (signal) => trendsApi.getWeekdayPatterns(channelId, period, signal),
    [channelId, period],
    { classifyOk: (r) => (r.data.insufficient_data ? 'empty' : 'ok') }
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive')
    return <InsufficientData reasonKey="min_14_days" />;

  return <WeekdayModuleView data={state.data} variant={variant} t={t} locale={locale} />;
}

export function WeekdayModuleView({
  data,
  variant,
  t,
  locale,
}: {
  data: WeekdayPatternsResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;
  const { best, worst } = useMemo(() => deriveExtremes(d.weekday_patterns), [d.weekday_patterns]);
  const max = useMemo(
    () => Math.max(1, ...WEEKDAY_ORDER.map((day) => d.weekday_patterns[day]?.ti_avg ?? 0)),
    [d.weekday_patterns]
  );
  const insight = locale === 'ru' ? d.insight_ru : d.insight_en;

  return (
    <div className={`trends-module trends-module-weekday trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">
          {variant === 'overview'
            ? t('trends.modules.weekday.title_mini')
            : t('trends.modules.weekday.title')}
        </span>
      </div>

      <div className="trends-weekday-bars">
        {WEEKDAY_ORDER.map((day) => {
          const cell = d.weekday_patterns[day];
          const ti = cell?.ti_avg ?? 0;
          const heightPct = (ti / max) * 100;
          const classes = [
            'trends-weekday-bar-cell',
            WEEKEND_DAYS.has(day) ? 'is-weekend' : 'is-workday',
            day === best?.day ? 'is-best' : '',
            day === worst?.day ? 'is-worst' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={day} className={classes}>
              {ti > 0 && <span className="trends-weekday-bar-value">{ti.toFixed(0)}</span>}
              <div
                className="trends-weekday-bar"
                style={{ height: `${Math.max(4, heightPct)}%` }}
              />
              <span className="trends-weekday-bar-label">
                {t(`trends.modules.weekday.short.${day}`)}
              </span>
            </div>
          );
        })}
      </div>

      {variant === 'detail' && best && (
        <DayCard variant="best" extreme={best} t={t} />
      )}
      {variant === 'detail' && worst && (
        <DayCard variant="worst" extreme={worst} t={t} />
      )}

      {variant === 'detail' && insight && (
        <div className="trends-explanation">{insight}</div>
      )}
    </div>
  );
}

function DayCard({
  variant,
  extreme,
  t,
}: {
  variant: 'best' | 'worst';
  extreme: WeekdayExtreme;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={`trends-weekday-card is-${variant}`}>
      <span className="trends-weekday-card-title">
        {variant === 'best'
          ? t('trends.modules.weekday.best_day')
          : t('trends.modules.weekday.worst_day')}
      </span>
      <span className="trends-weekday-card-day">
        {t(`trends.modules.weekday.day.${extreme.day}`)}
      </span>
      <span className="trends-weekday-card-metrics">
        TI {extreme.ti_avg.toFixed(0)} · ERV {extreme.erv_avg_percent.toFixed(0)}%
      </span>
    </div>
  );
}
