// TASK-034/077: Offline screen — tracked channel, stream ended.
// StreamEndedCTA with 3 color variants (green/yellow/red).
// Empty state: CollectingStatus hint to check historical data.

import { type TrustCache } from '../../shared/api';
import { useTranslation } from 'react-i18next';
import { ErvBadge } from './ErvBadge';
import { RatingButton } from './RatingButton';
import { StreamEndedCTA } from './StreamEndedCTA';
import { CollectingStatus } from './CollectingStatus';
import { ActionButtons } from './ActionButtons';

interface Props {
  cache: TrustCache;
  isGuest: boolean;
  tier: string;
}

function getErvColor(cache: TrustCache): 'green' | 'yellow' | 'red' {
  if (cache.erv_label_color === 'green') return 'green';
  if (cache.erv_label_color === 'yellow') return 'yellow';
  if (cache.erv_label_color === 'red') return 'red';
  return 'green';
}

export function OfflineScreen({ cache, isGuest, tier: _tier }: Props) {
  const { t } = useTranslation();
  const ervColor = cache.erv_label_color || 'neutral';
  const classification = cache.streamer_rating?.classification;
  const classificationText = classification ? t(`classification.${classification}`) : null;
  const isEmpty = cache.erv_percent === null;
  const ctaColor = getErvColor(cache);

  const hintByColor: Record<string, string> = {
    green: t('stream_ended_cta.hint_green'),
    yellow: t('stream_ended_cta.hint_yellow'),
    red: t('stream_ended_cta.hint_red'),
  };

  return (
    <div className="screen-content">
      <div className="two-col">
        <div className="col-left">
          <div className="avatar gray">
            {cache.avatar_url
              ? <img src={cache.avatar_url} alt={`${cache.display_name} avatar`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : (cache.display_name?.[0] || '?').toUpperCase()
            }
          </div>
          <div className="streamer-name">{cache.display_name}</div>
          <RatingButton score={cache.streamer_rating?.score ?? null} color={ervColor} />
          {classificationText && (
            <span className="classification" style={{ color: `var(--color-erv-${ervColor})` }}>
              {classificationText}
            </span>
          )}
        </div>

        <div className="col-right">
          <span className="offline-text">{t('popup.stream_offline')}</span>

          {isEmpty ? (
            <>
              <div className="data-label" style={{ marginTop: '12px', color: 'var(--ink-30)' }}>
                {t('popup.last_stream_erv', { N: '—' })}
              </div>
              <CollectingStatus showSpinner={false} message={t('collecting.hint_history')} />
            </>
          ) : (
            <>
              <div className="data-label" style={{ marginTop: '8px', color: 'var(--ink-30)' }}>
                {t('popup.last_stream')}
              </div>
              <ErvBadge
                label={cache.erv_label}
                percent={cache.erv_percent}
                color={ervColor}
              />
            </>
          )}
        </div>
      </div>

      {/* FR-006/013: StreamEndedCTA replaces old countdown + separate button */}
      {!isEmpty && cache.expires_at && (
        <StreamEndedCTA
          expires_at={cache.expires_at}
          color={ctaColor}
          channel_id={cache.channel_id}
          hint={hintByColor[ctaColor]}
        />
      )}

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'overview' })}>
          {t('popup.cta_channel')}
        </button>
        <button className="btn btn-secondary" onClick={() => chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'user' })}>
          {t('popup.cta_my')}
        </button>
      </div>

      <ActionButtons isGuest={isGuest} isLive={false} channelId={cache.channel_id} isWatchedByUser={cache.is_watched_by_user} />
    </div>
  );
}
