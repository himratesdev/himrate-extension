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
import { LiveTrendIndicator } from './LiveTrendIndicator';
import { AudiencePreview } from './AudiencePreview';
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
      {/* Streamer disclaimer — own channel only (Section 8 wireframe) */}
      {isOwnChannel && (
        <div className="sp-streamer-disclaimer">{t('sp.streamer_disclaimer')}</div>
      )}

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
        streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
        isLive={isLive}
        isOwnChannel={isOwnChannel}
      />

      {/* Live Trend Indicator (Section 6 wireframe — sp-trend) */}
      {isLive && <LiveTrendIndicator channelId={trustCache.channel_id} />}

      {/* Cold Start collecting status (Section 4 wireframe) */}
      {trustCache.cold_start_status === 'insufficient' && (
        <div className="collecting-status">
          {t('cold_start.collecting_min3')}
        </div>
      )}
      {(trustCache.cold_start_status === 'provisional_low' ||
        trustCache.cold_start_status === 'provisional') && (
        <div className="collecting-status">
          {t('cold_start.collecting_provisional', {
            current: trustCache.streamer_rating?.streams_count ?? 0,
            required: 10,
          })}
        </div>
      )}

      {/* M2: TI + Classification + Percentile */}
      <TIBadge
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        percentile={trustCache.percentile_in_category}
        showExpand={showDrillDown}
      />

      {/* M3: Signal Breakdown (Premium / Free live) — data from trustCache, no extra API call */}
      {showDrillDown && (
        <SignalBreakdown signals={trustCache.signal_breakdown || []} expandable={isPremium} />
      )}
      {showPaywall && (
        <div className="sp-paywall-blur">
          <div className="sp-paywall-cta">
            <span>{t('sp.upgrade')}</span>
          </div>
        </div>
      )}

      {/* M4: Reputation — data from trustCache */}
      {showDrillDown && (
        <ReputationCard
          reputation={trustCache.streamer_reputation}
          isLive={isLive}
          expandable={isPremium}
          streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
        />
      )}

      {/* Combined M3+M4 guest paywall (Section 5 wireframe lines 1855-1877) — Live · Guest */}
      {isGuest && isLive && (
        <div className="sp-paywall" style={{ minHeight: 180 }}>
          <div className="sp-paywall-blurred">
            <SignalBreakdown signals={trustCache.signal_breakdown || []} />
            <ReputationCard reputation={trustCache.streamer_reputation} isLive={isLive} />
          </div>
          <div className="sp-paywall-overlay" style={{ padding: '16px 12px' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--ink)',
            }}>
              {t('paywall.guest_title')}
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--ink-50)',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: 260,
            }}>
              {t('paywall.guest_description')}
            </div>
            <button
              className="sp-paywall-cta"
              onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}
              style={{
                background: 'var(--color-twitch)',
                borderColor: 'var(--color-twitch)',
                fontSize: 13,
                padding: '8px 24px',
              }}
            >
              {t('auth.twitch')}
            </button>
          </div>
        </div>
      )}

      {/* Streamer Mode extensions */}
      {isOwnChannel && (
        <>
          <HealthScoreCard healthScore={trustCache.health_score} />
          <StreamerModeButtons channelId={trustCache.channel_id} login={trustCache.login} />
        </>
      )}

      {/* M5: Mini Sparkline */}
      <MiniSparkline
        channelId={trustCache.channel_id}
        isLive={isLive}
        isPremium={isPremium}
        ervColor={(trustCache.erv_label_color as 'green' | 'yellow' | 'red' | undefined) || 'green'}
      />

      {/* M6: Audience Preview (Section 6 wireframe — top 3 countries) */}
      {isLive && trustCache.top_countries && (
        <AudiencePreview countries={trustCache.top_countries} />
      )}

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

      {/* Guest CTA (offline only — Live guest gets combined paywall above) */}
      {isGuest && !isLive && (
        <div className="sp-guest-cta">
          <button className="btn btn-primary" onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}>
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
