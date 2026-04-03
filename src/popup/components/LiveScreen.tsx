// TASK-034/077: Live screen — tracked channel, stream is live.
// Guest: headline only + Sign In CTA.
// Registered: + confidence human-readable, watchlist, analytics buttons.

import { type TrustCache } from '../../shared/api';
import { formatCCV } from '../../shared/utils';
import { useTranslation } from 'react-i18next';
import { ErvBadge } from './ErvBadge';
import { RatingButton } from './RatingButton';
import { FreshnessIndicator } from './FreshnessIndicator';
import { AnimatedNumber } from './AnimatedNumber';
import { CollectingStatus } from './CollectingStatus';
import { ActionButtons } from './ActionButtons';

interface Props {
  cache: TrustCache;
  isGuest: boolean;
  tier: string;
}

export function LiveScreen({ cache, isGuest, tier: _tier }: Props) {
  const { t } = useTranslation();
  const ervColor = cache.erv_label_color || 'neutral';
  const isColdStart = cache.cold_start_status === 'insufficient' || cache.erv_count === null;

  // FR-005: Human-readable confidence (replaces numeric high/medium/low)
  const confidenceText = cache.confidence !== null
    ? cache.confidence >= 0.7 ? t('confidence.sufficient')
    : cache.confidence >= 0.3 ? t('confidence.moderate')
    : t('confidence.insufficient')
    : null;

  const confidenceColor = cache.confidence !== null
    ? cache.confidence >= 0.7 ? 'var(--color-erv-green)'
    : cache.confidence >= 0.3 ? 'var(--color-erv-yellow)'
    : 'var(--color-erv-red)'
    : undefined;

  return (
    <div className="screen-content">
      <div className="two-col">
        {/* Left column */}
        <div className="col-left">
          <div className="avatar" style={{ background: cache.avatar_url ? undefined : 'var(--color-avatar-fallback)' }}>
            {cache.avatar_url
              ? <img src={cache.avatar_url} alt={`${cache.display_name} avatar`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : (cache.display_name?.[0] || '?').toUpperCase()
            }
          </div>
          <div className="streamer-name">{cache.display_name}</div>
          <RatingButton score={cache.streamer_rating?.score ?? null} color={ervColor} />
        </div>

        {/* Right column */}
        <div className="col-right">
          <div className="stream-status">
            <div className="live-dot" />
            <span className="live-text">{t('label.live')}</span>
            <FreshnessIndicator fetchedAt={cache.fetched_at} />
          </div>

          <div className="data-label data-label-primary">
            {t('label.real_viewers')}
          </div>
          <div className={`erv-hero${cache.erv_count === null ? ' placeholder' : ''}`}
            style={{ color: cache.erv_count !== null ? `var(--color-erv-${ervColor})` : undefined }}>
            {cache.erv_count !== null
              ? <>~<AnimatedNumber value={cache.erv_count} formatter={formatCCV} /></>
              : t('placeholder.null')
            }
          </div>

          <div className="data-label data-label-secondary">
            {t('label.twitch_online')}{' '}
            <AnimatedNumber value={cache.ccv} formatter={formatCCV} nullText={t('placeholder.null')} />
          </div>

          {/* FR-007: Cold Start — CollectingStatus spinner */}
          {isColdStart && (
            <CollectingStatus message={t('collecting.status')} />
          )}

          {/* FR-005: Confidence human-readable (registered only, not cold start) */}
          {!isGuest && !isColdStart && confidenceText && (
            <div className="meta-row">
              <span className={`confidence ${cache.confidence !== null && cache.confidence >= 0.7 ? 'high' : cache.confidence !== null && cache.confidence >= 0.3 ? 'medium' : 'low'}`}
                style={{ color: confidenceColor }}>
                {confidenceText}
              </span>
              <FreshnessIndicator fetchedAt={cache.fetched_at} />
            </div>
          )}

          {/* ERV badge (not shown on cold start) */}
          {!isColdStart && (
            <ErvBadge
              label={cache.erv_label}
              percent={cache.erv_percent}
              color={ervColor}
            />
          )}
        </div>
      </div>

      {/* ViewerTime: shown only when real viewing session data is available.
         Requires Viewer Analytics pipeline (not yet implemented) — hidden until then. */}

      <ActionButtons isGuest={isGuest} isLive={true} channelId={cache.channel_id} isWatchedByUser={cache.is_watched_by_user} />
    </div>
  );
}
