// TASK-039 FR-006, M6 — Rehabilitation progress + bonus badge.
// Consumes GET /api/v1/channels/:id/trends/rehabilitation (TrustIndex::RehabilitationTracker из A3b).
// Conditional render: скрывается если rehabilitation_active !== true.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../../shared/trends-api';
import type { RehabilitationResponse } from '../../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../../shared/use-current-locale';
import { ErrorState } from '../states/ErrorState';
import { LoadingSkeleton } from '../states/LoadingSkeleton';

interface Props {
  channelId: string;
}

export function RehabilitationCurve({ channelId }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; data: RehabilitationResponse }
    | { status: 'error' }
    | { status: 'inactive' }
  >({ status: 'loading' });
  const [bonusOpen, setBonusOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    trendsApi
      .getRehabilitation(channelId, '30d', ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: 'error' });
          return;
        }
        const active = result.data.data.rehabilitation_active ?? result.data.data.active ?? false;
        setState(active ? { status: 'ok', data: result.data } : { status: 'inactive' });
      })
      .catch((e: unknown) => {
        // CR N-5: AbortError на unmount — expected.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [channelId, refreshKey]);

  const handleRetry = () => setRefreshKey((k) => k + 1);

  if (state.status === 'loading') return <LoadingSkeleton moduleCount={1} />;
  if (state.status === 'error') return <ErrorState onRetry={handleRetry} />;
  // Conditional module: not rendered when rehabilitation inactive.
  if (state.status === 'inactive') return null;

  const d = state.data.data;
  const progress = d.progress;
  const bonus = d.bonus;

  if (!progress) return null;

  const completed = progress.clean_streams_completed;
  const required = progress.clean_streams_required;
  // CR S-2: все три pct поля optional в types — fallback 0 предотвращает
  // TypeError на pct.toFixed() когда backend возвращает пустую prog payload.
  const pct = progress.effective_progress_pct ?? progress.completion_percent ?? progress.progress_pct ?? 0;

  return (
    <div className="trends-module trends-module-rehab">
      <div className="trends-module-header">
        <span className="trends-module-title">{t('trends.modules.rehabilitation.title')}</span>
      </div>

      <div className="trends-rehab-progress">
        <div className="trends-rehab-progress-bar">
          <div
            className="trends-rehab-progress-fill"
            style={{ width: `${Math.min(pct, 100)}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="trends-rehab-progress-label">
          {t('trends.modules.rehabilitation.progress', { completed, required, pct: pct.toFixed(0) })}
        </div>
      </div>

      {bonus && bonus.bonus_pts_earned > 0 && (
        <div className="trends-rehab-bonus">
          <button
            type="button"
            className="trends-rehab-bonus-badge"
            onClick={() => setBonusOpen((v) => !v)}
            aria-expanded={bonusOpen}
          >
            {t('trends.modules.rehabilitation.bonus_badge', { n: bonus.bonus_pts_earned })}
          </button>
          {bonusOpen && bonus.qualifying_signals && (
            <div className="trends-rehab-bonus-tooltip" role="tooltip">
              <div className="trends-rehab-bonus-tooltip-title">
                {t('trends.modules.rehabilitation.bonus_tooltip_title')}
              </div>
              <div className="trends-rehab-bonus-tooltip-row">
                {t('trends.modules.rehabilitation.bonus_chat', {
                  n: bonus.qualifying_signals.chatter_to_ccv_percentile ?? 0,
                })}
              </div>
              <div className="trends-rehab-bonus-tooltip-row">
                {t('trends.modules.rehabilitation.bonus_engagement', {
                  n: bonus.qualifying_signals.engagement_consistency_percentile ?? 0,
                })}
              </div>
              <div className="trends-rehab-bonus-tooltip-footer">
                {locale === 'ru' ? bonus.bonus_description_ru : bonus.bonus_description_en}
              </div>
            </div>
          )}
        </div>
      )}

      {d.projected_full_recovery && (
        <div className="trends-rehab-eta">
          {t('trends.modules.rehabilitation.eta', {
            streams: d.projected_full_recovery.streams_needed,
          })}
        </div>
      )}
    </div>
  );
}
