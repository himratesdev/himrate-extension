// TASK-039 FR-003, M3 — Stability score + weekly history + peer comparison.
// Consumes GET /api/v1/channels/:id/trends/stability.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { StabilityResponse, TrendsPeriod } from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
}

export function StabilityModule({ channelId, period, variant = 'detail' }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: StabilityResponse }
    | { status: 'error' }
    | { status: 'empty' }
  >({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getStability(channelId, period, ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const label = result.data.data.stability.label;
        setState(label === 'insufficient_data' ? { status: 'empty' } : { status: 'ok', data: result.data });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, period, refreshKey]);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />;
  if (state.status === 'empty') return <InsufficientData reasonKey="min_7_streams" />;

  return <StabilityModuleView data={state.data} variant={variant} t={t} locale={locale} />;
}

export function StabilityModuleView({
  data,
  variant,
  t,
  locale,
}: {
  data: StabilityResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
  locale: 'ru' | 'en';
}) {
  const d = data.data;
  const labelKey = `trends.modules.stability.label.${d.stability.label}`;

  return (
    <div className={`trends-module trends-module-stability trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.stability.title')}</span>
      </div>

      <div className="trends-stability-hero">
        <span className="trends-stability-score">{t('trends.modules.stability.score', { score: d.stability.score })}</span>
        <span className="trends-stability-label">{t(labelKey)}</span>
      </div>

      {d.stability.category_avg != null && (
        <div className="trends-stability-baseline">
          {t('trends.modules.stability.category_avg', { avg: d.stability.category_avg })}
        </div>
      )}

      {variant === 'detail' && d.weekly_history.length > 0 && (
        <div className="trends-stability-weekly">
          <div className="trends-stability-weekly-title">{t('trends.modules.stability.weekly_history')}</div>
          <div className="trends-stability-weekly-bars">
            {d.weekly_history.map((week) => {
              const heightPct = Math.max(8, Math.min(100, (week.ti_avg / 100) * 100));
              return (
                <div key={week.week_start} className="trends-stability-weekly-bar-cell">
                  <div className="trends-stability-weekly-bar" style={{ height: `${heightPct}%` }} />
                  <span className="trends-stability-weekly-value">{week.ti_avg.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {variant === 'detail' && d.peer_comparison && (
        <div className="trends-stability-peer">
          <div className="trends-stability-peer-title">
            {t('trends.modules.stability.peer_comparison_title', { category: d.peer_comparison.category })}
          </div>
          <PeerRow
            label={t('trends.modules.stability.peer_you')}
            value={d.peer_comparison.channel_score}
            highlight
          />
          <PeerRow label={t('trends.modules.stability.peer_p50')} value={d.peer_comparison.p50} />
          <PeerRow label={t('trends.modules.stability.peer_p90')} value={d.peer_comparison.p90} />
        </div>
      )}

      {variant === 'detail' && (
        <div className="trends-explanation">
          {locale === 'ru' ? d.explanation_ru : d.explanation_en}
        </div>
      )}
    </div>
  );
}

function PeerRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  const widthPct = Math.max(4, Math.min(100, value));
  return (
    <div className={`trends-peer-row${highlight ? ' is-you' : ''}`}>
      <span className="trends-peer-label">{label}</span>
      <div className="trends-peer-bar-track">
        <div className="trends-peer-bar-fill" style={{ width: `${widthPct}%` }} />
      </div>
      <span className="trends-peer-value">{value.toFixed(0)}</span>
    </div>
  );
}
