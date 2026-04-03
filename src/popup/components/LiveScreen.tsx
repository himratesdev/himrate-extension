// TASK-034: Live screen — tracked channel, stream is live.
// Guest: headline only + Sign In CTA.
// Registered: + confidence, watchlist, analytics buttons.

import { type TrustCache } from '../../shared/api';
import { formatCCV } from '../../shared/utils';
import { useTranslation } from 'react-i18next';
import { ErvBadge } from './ErvBadge';
import { RatingButton } from './RatingButton';
import { TrendIndicator } from './TrendIndicator';
import { FreshnessIndicator } from './FreshnessIndicator';
import { AnimatedNumber } from './AnimatedNumber';
import { ActionButtons } from './ActionButtons';

interface Props {
  cache: TrustCache;
  isGuest: boolean;
  tier: string;
}

export function LiveScreen({ cache, isGuest, tier: _tier }: Props) {
  const { t } = useTranslation();
  const ervColor = cache.erv_label_color || 'neutral';

  const confidenceText = cache.confidence !== null
    ? cache.confidence >= 0.7 ? t('popup.confidence_high')
    : cache.confidence >= 0.3 ? t('popup.confidence_medium')
    : t('popup.confidence_low')
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

          {/* Confidence (registered only) */}
          {!isGuest && confidenceText && (
            <div className="data-label" style={{ color: confidenceColor, fontSize: '11px' }}>
              {confidenceText}
            </div>
          )}

          <ErvBadge
            label={cache.erv_label}
            percent={cache.erv_percent}
            color={ervColor}
          />

          {/* Percentile */}
          {cache.percentile_in_category !== null && (
            <div className="data-label" style={{ fontSize: '10px', color: 'var(--ink-30)' }}>
              {t('popup.percentile', { N: Math.round(cache.percentile_in_category) })}
            </div>
          )}

          {/* Trend */}
          {!isGuest && <TrendIndicator current={cache.ti_score} previous={cache.previous_ti_score} />}
        </div>
      </div>

      <ActionButtons isGuest={isGuest} isLive={true} channelId={cache.channel_id} isWatchedByUser={cache.is_watched_by_user} />
    </div>
  );
}
