// TASK-035: Overview tab — conditional layout (LIVE vs OFFLINE).
// Modular: each section = ModuleSlot. Adding new module = one import + one line.

import { useTranslation } from 'react-i18next';
import { ERVGauge } from './ERVGauge';
import { TIBadge } from './TIBadge';
import { SignalBreakdown } from './SignalBreakdown';
import { ReputationCard } from './ReputationCard';
import { MiniSparkline } from './MiniSparkline';
import { AlertCounter } from './AlertCounter';
import { HealthScoreCard } from './HealthScoreCard';
import { StreamerModeButtons } from './StreamerModeButtons';
import { WatchlistButton } from './WatchlistButton';
import { PostStreamCountdown } from './PostStreamCountdown';
import { SkeletonOverview } from './SkeletonOverview';
import { ErrorOverview } from './ErrorOverview';
import { NotTrackedOverview } from './NotTrackedOverview';
import { NotTwitchOverview } from './NotTwitchOverview';
import type { TrustCache } from '../../shared/api';

interface Props {
  trustCache: TrustCache | null;
  loading: boolean;
  tier: string;
  isOwnChannel: boolean;
  authState: { loggedIn: boolean; tier: string; twitchLinked: boolean; twitchLogin: string | null };
}

export function Overview({ trustCache, loading, tier, isOwnChannel, authState }: Props) {
  const { t } = useTranslation();

  // Screen determination (FR-019 state machine)
  if (loading || !trustCache) return <SkeletonOverview />;
  if (trustCache.error) return <ErrorOverview />;
  if (!trustCache.is_tracked && trustCache.is_live) return <NotTrackedOverview ccv={trustCache.ccv} login={trustCache.login} loggedIn={authState.loggedIn} />;
  if (!trustCache.is_tracked && !trustCache.is_live) return <NotTrackedOverview ccv={null} login={trustCache.login} loggedIn={authState.loggedIn} />;
  if (!trustCache.login) return <NotTwitchOverview />;

  const isLive = trustCache.is_live;
  const isPremium = tier === 'premium' || tier === 'business' || tier === 'streamer' || isOwnChannel;
  const isFreeWithAccess = tier === 'free' && (isLive || isPostStreamWindowOpen(trustCache));
  const showDrillDown = isPremium || isFreeWithAccess;
  const showPaywall = !showDrillDown && tier !== 'guest';
  const isGuest = !authState.loggedIn;

  return (
    <div className="sp-overview">
      {/* Alert Counter — LIVE only */}
      {isLive && <AlertCounter trustCache={trustCache} />}

      {/* M1: ERV Gauge */}
      <ERVGauge
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabel={trustCache.erv_label}
        ervLabelColor={trustCache.erv_label_color}
        confidence={trustCache.confidence}
        coldStartStatus={trustCache.cold_start_status}
        isLive={isLive}
        isOwnChannel={isOwnChannel}
      />

      {/* M2: TI + Classification */}
      <TIBadge
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        streamerRating={trustCache.streamer_rating}
        showExpand={showDrillDown}
      />

      {/* M3: Signal Breakdown (Premium / Free live) */}
      {showDrillDown && (
        <SignalBreakdown channelId={trustCache.channel_id} isPremium={isPremium} />
      )}
      {showPaywall && (
        <div className="sp-paywall-blur">
          <div className="sp-paywall-cta">
            <span>{t('sp.upgrade')}</span>
          </div>
        </div>
      )}

      {/* M4: Reputation */}
      {showDrillDown && (
        <ReputationCard channelId={trustCache.channel_id} isLive={isLive} />
      )}

      {/* Streamer Mode extensions */}
      {isOwnChannel && (
        <>
          <HealthScoreCard channelId={trustCache.channel_id} />
          <StreamerModeButtons channelId={trustCache.channel_id} login={trustCache.login} />
        </>
      )}

      {/* M5: Mini Sparkline */}
      <MiniSparkline channelId={trustCache.channel_id} isLive={isLive} isPremium={isPremium} />

      {/* Watchlist Button */}
      {authState.loggedIn && (
        <WatchlistButton
          channelId={trustCache.channel_id}
          isWatched={trustCache.is_watched_by_user}
        />
      )}

      {/* Post-stream countdown (OFFLINE Free) */}
      {!isLive && trustCache.expires_at && tier === 'free' && (
        <PostStreamCountdown expiresAt={trustCache.expires_at} />
      )}

      {/* Guest CTA */}
      {isGuest && (
        <div className="sp-guest-cta">
          <button className="btn btn-primary" onClick={() => chrome.runtime.sendMessage({ action: 'OPEN_AUTH' })}>
            {t('popup.cta_guest')}
          </button>
          <p className="sp-guest-hint">{t('popup.guest_sign_in_hint')}</p>
        </div>
      )}
    </div>
  );
}

function isPostStreamWindowOpen(cache: TrustCache): boolean {
  if (!cache.expires_at) return false;
  return new Date(cache.expires_at).getTime() > Date.now();
}
