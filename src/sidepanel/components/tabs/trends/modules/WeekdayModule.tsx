// TASK-039 FR-009, M14 — 7-bar weekday distribution + best/worst day cards.
// Consumes GET /api/v1/channels/:id/trends/patterns/weekday.

import { useEffect, useState } from 'react';
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

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const WEEKEND_DAYS = new Set<WeekdayKey>(['sat', 'sun']);

export function WeekdayModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: WeekdayPatternsResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getWeekdayPatterns(channelId, period, ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const totalStreams = WEEKDAY_ORDER.reduce(
          (sum, d) => sum + (result.data.data.weekday_patterns[d]?.streams_count ?? 0),
          0
        );
        setState(totalStreams === 0 ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_14_days" />;

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
  const max = Math.max(
    1,
    ...WEEKDAY_ORDER.map((day) => d.weekday_patterns[day]?.ti_avg ?? 0)
  );
  const bestDay = d.best_weekday?.day;
  const worstDay = d.worst_weekday?.day;

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
            day === bestDay ? 'is-best' : '',
            day === worstDay ? 'is-worst' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={day} className={classes}>
              {ti > 0 && <span className="trends-weekday-bar-value">{ti.toFixed(0)}</span>}
              <div className="trends-weekday-bar" style={{ height: `${Math.max(4, heightPct)}%` }} />
              <span className="trends-weekday-bar-label">{t(`trends.modules.weekday.short.${day}`)}</span>
            </div>
          );
        })}
      </div>

      {variant === 'detail' && d.best_weekday && (
        <DayCard
          variant="best"
          dayKey={d.best_weekday.day}
          ti={d.best_weekday.ti_avg}
          erv={d.best_weekday.erv_avg_percent}
          t={t}
        />
      )}
      {variant === 'detail' && d.worst_weekday && (
        <DayCard
          variant="worst"
          dayKey={d.worst_weekday.day}
          ti={d.worst_weekday.ti_avg}
          erv={d.worst_weekday.erv_avg_percent}
          t={t}
        />
      )}

      {variant === 'detail' && (d.insight_ru || d.insight_en) && (
        <div className="trends-explanation">{locale === 'ru' ? d.insight_ru : d.insight_en}</div>
      )}
    </div>
  );
}

function DayCard({
  variant,
  dayKey,
  ti,
  erv,
  t,
}: {
  variant: 'best' | 'worst';
  dayKey: WeekdayKey;
  ti: number;
  erv: number;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={`trends-weekday-card is-${variant}`}>
      <span className="trends-weekday-card-title">
        {variant === 'best'
          ? t('trends.modules.weekday.best_day')
          : t('trends.modules.weekday.worst_day')}
      </span>
      <span className="trends-weekday-card-day">{t(`trends.modules.weekday.day.${dayKey}`)}</span>
      <span className="trends-weekday-card-metrics">
        TI {ti.toFixed(0)} · ERV {erv.toFixed(0)}%
      </span>
    </div>
  );
}
