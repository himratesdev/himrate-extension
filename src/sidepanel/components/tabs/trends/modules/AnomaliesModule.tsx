// TASK-039 FR-004, M4 — Anomalies counter + frequency + DoW + types + paginated event list.
// Server response: app/services/trends/api/anomalies_endpoint_service.rb.
// Severity derived from confidence threshold (server returns raw confidence numeric).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  AnomaliesResponse,
  AnomalyEvent,
  TrendsPeriod,
  WeekdayKey,
} from '../../../../../shared/trends-types';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { useTrendsModule } from '../shared/use-trends-module';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PER_PAGE = 50;

// CR M-1: severity derived client-side от confidence (server raw signal).
// Thresholds matched Phase C2 mapping в anomalies_endpoint_service severity_to_confidence_threshold:
//   high: confidence ≥ 0.7
//   medium: confidence ≥ 0.4
//   low: остальное
function severityForConfidence(c: number | null): 'high' | 'medium' | 'low' {
  if (c == null) return 'low';
  if (c >= 0.7) return 'high';
  if (c >= 0.4) return 'medium';
  return 'low';
}

export function AnomaliesModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { state, retry } = useTrendsModule<AnomaliesResponse>(
    (signal) => trendsApi.getAnomalies(channelId, period, { page, perPage: PER_PAGE, signal }),
    [channelId, period, page]
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive') return null;

  return (
    <AnomaliesModuleView
      data={state.data}
      variant={variant}
      period={period}
      t={t}
      page={page}
      onPageChange={setPage}
    />
  );
}

export function AnomaliesModuleView({
  data,
  variant,
  period,
  t,
  page,
  onPageChange,
}: {
  data: AnomaliesResponse;
  variant: 'overview' | 'detail';
  period: TrendsPeriod;
  t: ReturnType<typeof useTranslation>['t'];
  page: number;
  onPageChange: (next: number) => void;
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
      : freq.verdict === 'reduced' && factor != null && factor > 0
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
                    <div
                      className="trends-anomalies-dow-bar"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                    <span className="trends-anomalies-dow-count">{count}</span>
                    <span className="trends-anomalies-dow-label">
                      {t(`trends.modules.anomalies.weekday.${day}`)}
                    </span>
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
              d.anomalies.map((event) => <EventCard key={event.anomaly_id} event={event} />)
            )}

            <Pagination pagination={d.pagination} onChange={onPageChange} t={t} currentPage={page} />
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event }: { event: AnomalyEvent }) {
  const severity = severityForConfidence(event.confidence);
  const attributionLabel = event.attribution?.source ?? event.cause ?? event.type;
  return (
    <div className={`trends-anomalies-event severity-${severity}`}>
      <span className="trends-anomalies-event-dot" aria-hidden="true" />
      <div className="trends-anomalies-event-body">
        <span className="trends-anomalies-event-date">{event.date.slice(0, 10)}</span>
        <span className="trends-anomalies-event-type">{attributionLabel.replace(/_/g, ' ')}</span>
        {event.cause && event.cause !== attributionLabel && (
          <span className="trends-anomalies-event-cause">{event.cause}</span>
        )}
      </div>
      {event.ccv_impact != null && (
        <span className="trends-anomalies-event-impact">
          {event.ccv_impact > 0 ? '+' : ''}
          {event.ccv_impact.toFixed(0)}
        </span>
      )}
    </div>
  );
}

function Pagination({
  pagination,
  onChange,
  t,
  currentPage,
}: {
  pagination: AnomaliesResponse['data']['pagination'];
  onChange: (next: number) => void;
  t: ReturnType<typeof useTranslation>['t'];
  currentPage: number;
}) {
  if (pagination.total_pages <= 1) return null;
  return (
    <div className="trends-anomalies-pagination">
      <button
        type="button"
        className="trends-anomalies-page-btn"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label={t('aria.back')}
      >
        ←
      </button>
      <span className="trends-anomalies-page-label">
        {currentPage} / {pagination.total_pages}
      </span>
      <button
        type="button"
        className="trends-anomalies-page-btn"
        disabled={!pagination.has_next}
        onClick={() => onChange(currentPage + 1)}
        aria-label={t('sp.more')}
      >
        →
      </button>
    </div>
  );
}
