// TASK-034: Offline screen — tracked channel, stream ended.
// Shows historical ERV%, rating, classification, countdown.
// Blur + dual CTA when post-stream window expired (Free).

import { type TrustCache } from '../../shared/api';
import { useTranslation } from 'react-i18next';
import { ErvBadge } from './ErvBadge';
import { RatingButton } from './RatingButton';
import { ActionButtons } from './ActionButtons';
import { PostStreamPaywall } from './PostStreamPaywall';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  cache: TrustCache;
  isGuest: boolean;
  tier: string;
}

export function OfflineScreen({ cache, isGuest, tier }: Props) {
  const { t } = useTranslation();
  const ervColor = cache.erv_label_color || 'neutral';
  const classification = cache.streamer_rating?.classification;
  const classificationText = classification ? t(`classification.${classification}`) : null;

  const { remaining, expired } = useCountdown(cache.expires_at);
  const showPaywall = !isGuest && tier === 'free' && expired;

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
            <span className="rating-label" style={{ color: `var(--color-erv-${ervColor})` }}>
              {classificationText}
            </span>
          )}
        </div>

        <div className="col-right" style={{ position: 'relative' }}>
          <span className="offline-text">{t('popup.stream_offline')}</span>

          {showPaywall ? (
            <PostStreamPaywall cache={cache} />
          ) : (
            <>
              <div className="data-label" style={{ marginTop: '8px', color: 'var(--ink-30)' }}>
                {t('popup.last_stream')}
              </div>
              <ErvBadge
                label={cache.erv_percent !== null
                  ? (cache.erv_percent >= 80 ? t('offline.no_anomalies') : t('offline.anomalies_detected'))
                  : null}
                percent={cache.erv_percent}
                color={ervColor}
              />
              {remaining && (
                <div className="data-label" style={{ color: 'var(--color-primary)', fontSize: '11px' }}>
                  {t('popup.analytics_remaining', { hours: remaining.hours, minutes: remaining.minutes })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!showPaywall && (
        <>
          <button className="btn btn-primary" onClick={() => chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'overview' })}>
            {t('btn.last_stream_analytics')}
          </button>
          <ActionButtons isGuest={isGuest} isLive={false} channelId={cache.channel_id} />
        </>
      )}
    </div>
  );
}
