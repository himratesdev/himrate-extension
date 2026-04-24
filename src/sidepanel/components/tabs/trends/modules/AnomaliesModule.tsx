// TASK-039 FR-004, M4 — Anomalies counter + frequency + DoW + types + events list.
// Consumes GET /api/v1/channels/:id/trends/anomalies.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { AnomaliesResponse, TrendsPeriod, WeekdayKey } from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function AnomaliesModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: AnomaliesResponse }
    | { status: 'error' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getAnomalies(channelId, period, ctrl.signal)
      .then((result) => {
        setState(result.ok ? { status: 'ok', data: result.data } : { status: 'error' });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />;

  return <AnomaliesModuleView data={state.data} variant={variant} period={period} t={t} locale={locale} />;
}

export function AnomaliesModuleView({
  data,
  variant,
  period,
  t,
  locale,
}: {
  data: AnomaliesResponse;
  variant: 'overview' | 'detail';
  period: TrendsPeriod;
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;
  const freq = d.frequency_score;

  const factor =
    freq.baseline_per_month && freq.baseline_per_month > 0
      ? freq.current_per_month / freq.baseline_per_month
      : null;

  const verdictLabel =
    freq.verdict === 'elevated' && factor != null
      ? t('trends.modules.anomalies.elevated', { factor: factor.toFixed(1) })
      : freq.verdict === 'reduced' && factor != null
      ? t('trends.modules.anomalies.reduced', { factor: (1 / factor).toFixed(1) })
      : t('trends.modules.anomalies.normal');

  return (
    <div className={`trends-module trends-module-anomalies trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.anomalies.title')}</span>
      </div>

      <div className="trends-anomalies-hero">
        <span className="trends-anomalies-count">{d.total}</span>
        <span className="trends-anomalies-subtitle">
          {t('trends.modules.anomalies.subtitle', { period: t(`trends.period.${period}`) })}
        </span>
      </div>

      <div className="trends-anomalies-pills">
        {d.unattributed_count > 0 && (
          <span className="trends-anomalies-pill is-unattributed">
            {t('trends.modules.anomalies.unattributed_other', { count: d.unattributed_count })}
          </span>
        )}
        <span className={`trends-anomalies-pill is-${freq.verdict}`}>{verdictLabel}</span>
      </div>

      {variant === 'detail' && (
        <>
          <div className="trends-anomalies-distribution">
            <div className="trends-anomalies-section-title">
              {t('trends.modules.anomalies.distribution_title')}
            </div>
            <div className="trends-anomalies-dow-bars">
              {WEEKDAY_ORDER.map((day) => {
                const count = d.distribution.by_day_of_week[day] ?? 0;
                const max = Math.max(1, ...Object.values(d.distribution.by_day_of_week));
                const heightPct = (count / max) * 100;
                return (
                  <div key={day} className="trends-anomalies-dow-cell">
                    <div className="trends-anomalies-dow-bar" style={{ height: `${Math.max(4, heightPct)}%` }} />
                    <span className="trends-anomalies-dow-count">{count}</span>
                    <span className="trends-anomalies-dow-label">{t(`trends.modules.anomalies.weekday.${day}`)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="trends-anomalies-types">
            <div className="trends-anomalies-section-title">{t('trends.modules.anomalies.types_title')}</div>
            <div className="trends-anomalies-type-cards">
              {Object.entries(d.distribution.by_type).map(([type, count]) => (
                <div key={type} className={`trends-anomalies-type-card type-${type}`}>
                  <span className="trends-anomalies-type-count">{count}</span>
                  <span className="trends-anomalies-type-label">{type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trends-anomalies-events">
            <div className="trends-anomalies-section-title">{t('trends.modules.anomalies.events_title')}</div>
            {d.anomalies.length === 0 ? (
              <div className="trends-anomalies-events-empty">
                {t('trends.modules.anomalies.event_empty')}
              </div>
            ) : (
              d.anomalies.map((event) => (
                <div key={event.id} className={`trends-anomalies-event severity-${event.severity}`}>
                  <span className="trends-anomalies-event-dot" aria-hidden="true" />
                  <div className="trends-anomalies-event-body">
                    <span className="trends-anomalies-event-date">{event.date.slice(0, 10)}</span>
                    <span className="trends-anomalies-event-type">{event.attribution ?? event.type}</span>
                    <span className="trends-anomalies-event-desc">
                      {locale === 'ru' ? event.description_ru : event.description_en}
                    </span>
                  </div>
                  {event.ti_delta != null && (
                    <span className="trends-anomalies-event-delta">
                      {event.ti_delta > 0 ? '+' : ''}
                      {event.ti_delta.toFixed(0)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
