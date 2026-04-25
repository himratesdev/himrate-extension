// TASK-039 FR-003, M3 — Stability score + label + (optional) peer comparison.
// Server response shape: app/services/trends/api/stability_endpoint_service.rb.
// score = 0..1 decimal (1 - CV), UI multiplies × 100 для отображения.
// peer_comparison запрашивается только при include_peer_comparison=true (M-4 fix).

import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type {
  StabilityResponse,
  StabilityPeerComparisonOk,
  TrendsPeriod,
  AccessLevel,
} from '../../../../../shared/trends-types';
import { LoadingSkeleton } from '../states/LoadingSkeleton';
import { ErrorState } from '../states/ErrorState';
import { InsufficientData } from '../states/InsufficientData';
import { useTrendsModule } from '../shared/use-trends-module';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  variant?: 'overview' | 'detail';
  /** Server requires include_peer_comparison=true для peer block (FR-014).
   * Передавать true когда accessLevel ∈ {premium, business, streamer}. */
  accessLevel?: AccessLevel;
}

export function StabilityModule({ channelId, period, variant = 'detail', accessLevel }: Props) {
  const { t } = useTranslation();
  const includePeer = accessLevel === 'premium' || accessLevel === 'business' || accessLevel === 'streamer';

  const { state, retry } = useTrendsModule<StabilityResponse>(
    (signal) => trendsApi.getStability(channelId, period, { includePeerComparison: includePeer, signal }),
    [channelId, period, includePeer],
    { classifyOk: (r) => (r.data.label === 'insufficient_data' ? 'empty' : 'ok') }
  );

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;
  if (state.status === 'empty' || state.status === 'inactive')
    return <InsufficientData reasonKey="min_7_streams" />;

  return <StabilityModuleView data={state.data} variant={variant} t={t} />;
}

export function StabilityModuleView({
  data,
  variant,
  t,
}: {
  data: StabilityResponse;
  variant: 'overview' | 'detail';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const d = data.data;
  // Server returns 0..1 decimal; UI shows 0..100 score.
  const score100 = d.score == null ? null : Math.round(d.score * 100);
  const labelKey = `trends.modules.stability.label.${d.label}`;
  const peer = d.peer_comparison && !d.peer_comparison.insufficient_data
    ? (d.peer_comparison as StabilityPeerComparisonOk)
    : null;

  return (
    <div className={`trends-module trends-module-stability trends-module-${variant}`}>
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.stability.title')}</span>
      </div>

      <div className="trends-stability-hero">
        <span className="trends-stability-score">
          {score100 != null ? t('trends.modules.stability.score', { score: score100 }) : '—'}
        </span>
        <span className="trends-stability-label">{t(labelKey)}</span>
      </div>

      {variant === 'detail' && peer && (
        <div className="trends-stability-peer">
          <div className="trends-stability-peer-title">
            {t('trends.modules.stability.peer_comparison_title', { category: peer.category })}
          </div>
          <PeerRow
            label={t('trends.modules.stability.peer_you')}
            value={peer.channel_values.stability != null ? Math.round(peer.channel_values.stability * 100) : null}
            highlight
          />
          <PeerRow
            label={t('trends.modules.stability.peer_p50')}
            value={peer.percentiles.stability.p50 != null ? Math.round(peer.percentiles.stability.p50 * 100) : null}
          />
          <PeerRow
            label={t('trends.modules.stability.peer_p90')}
            value={peer.percentiles.stability.p90 != null ? Math.round(peer.percentiles.stability.p90 * 100) : null}
          />
        </div>
      )}
    </div>
  );
}

function PeerRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  if (value == null) return null;
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
