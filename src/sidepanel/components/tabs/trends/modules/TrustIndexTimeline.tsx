// TASK-039 FR-002, M2 — Trust Index timeline с trend + forecast + tier_changes + anomaly markers.
// Consumes GET /api/v1/channels/:id/trends/trust_index.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { TrustIndexResponse, TrendsPeriod } from '../../../../../shared/trends-types';
import { LineChart } from '../charts/LineChart';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  compact?: boolean;
}

export function TrustIndexTimeline({ channelId, period, compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: TrustIndexResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi.getTrustIndex(channelId, period, 'daily', ctrl.signal).then((result) => {
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
  const values = d.points.map((p) => p.ti);
  const current = d.summary?.current;
  const anomalyDates = d.anomaly_markers.map((a) => a.date);

  return (
    <div className="trends-module trends-module-ti">
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.trust_index.title')}</span>
        {d.tier_changes.count > 0 && (
          <span className="trends-tier-changes-badge">
            {t('trends.tier_changes.count', { count: d.tier_changes.count })}
          </span>
        )}
      </div>

      {current != null && (
        <div className="trends-ti-current">
          <span className="trends-ti-value">{current.toFixed(1)}</span>
          <span className="trends-ti-label">TI</span>
        </div>
      )}

      <LineChart
        dates={dates}
        series={[{ label: 'TI', values, color: '#2563eb', width: 2 }]}
        width={compact ? 300 : 320}
        height={compact ? 120 : 160}
        yMin={0}
        yMax={100}
        valueFormatter={(v) => v.toFixed(0)}
        anomalyDates={anomalyDates}
      />

      {d.trend_explanation.explanation_en && (
        <div className="trends-explanation">
          {locale === 'ru' ? d.trend_explanation.explanation_ru : d.trend_explanation.explanation_en}
        </div>
      )}

      {d.tier_changes.latest && (
        <div className="trends-latest-tier-change">
          <span className="trends-tier-from">{d.tier_changes.latest.from_tier ?? '—'}</span>
          <span className="trends-tier-arrow">→</span>
          <span className="trends-tier-to">{d.tier_changes.latest.to_tier}</span>
          <span className="trends-tier-date">
            {d.tier_changes.latest.occurred_at?.slice(0, 10)}
          </span>
        </div>
      )}
    </div>
  );
}
