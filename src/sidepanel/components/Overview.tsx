// TASK-035 + BUG-016 PR-1: Overview tab — conditional layout (LIVE vs OFFLINE).
// Per-tier visibility: Guest = headline + locked tabs; Free Live = full drill-down;
// Free <18h post-stream = drill-down with countdown; Free >18h = expired paywall;
// Premium = expandable details; Streamer (own channel) = HealthScore + tools.

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
import { StreamSummaryCard } from './StreamSummaryCard';
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
  /** undefined = still detecting (Skeleton); null = no channel (NotTwitch); string = found */
  currentChannel: string | null | undefined;
  tier: string;
  isOwnChannel: boolean;
  authState: { loggedIn: boolean; tier: string; twitchLinked: boolean; twitchLogin: string | null };
  onNavigate?: (tab: string) => void;
}

function isPostStreamWindowOpen(cache: TrustCache): boolean {
  if (!cache.expires_at) return false;
  return new Date(cache.expires_at).getTime() > Date.now();
}

export function Overview({ trustCache, loading, currentChannel, tier, isOwnChannel, authState, onNavigate }: Props) {
  const { t } = useTranslation();

  // Screen determination (FR-019 state machine, ordered):
  // 1. currentChannel undefined OR loading + has channel → Skeleton (frame 02)
  // 2. currentChannel === null → user not on Twitch (frame 01 NotTwitchOverview)
  // 3. Trust data error → ErrorOverview (frame 19)
  // 4. Channel exists but not tracked → NotTrackedOverview (frames 03-05)
  if (currentChannel === undefined) return <SkeletonOverview />;
  if (currentChannel === null) return <NotTwitchOverview />;
  if (loading || !trustCache) return <SkeletonOverview />;
  if (trustCache.error) return <ErrorOverview />;
  if (!trustCache.login) return <NotTwitchOverview />;
  if (!trustCache.is_tracked) {
    return (
      <NotTrackedOverview
        ccv={trustCache.is_live ? trustCache.ccv : null}
        login={trustCache.login}
        loggedIn={authState.loggedIn}
      />
    );
  }

  const isLive = trustCache.is_live;
  const isPremium = tier === 'premium' || tier === 'business' || tier === 'streamer' || isOwnChannel;
  const windowOpen = isPostStreamWindowOpen(trustCache);
  const isFreeWithAccess = tier === 'free' && (isLive || windowOpen);
  const showDrillDown = isPremium || isFreeWithAccess;
  const isGuest = !authState.loggedIn;
  // Offline + Free with expired post-stream window → drill-down behind paywall (Section 9 >18h)
  const isOfflineExpired = !isLive && !isPremium && !windowOpen && tier === 'free';

  return (
    <div className="sp-overview">
      {/* Streamer disclaimer — own channel only (Section 8 wireframe) */}
      {isOwnChannel && (
        <div className="sp-streamer-disclaimer">{t('sp.streamer_disclaimer')}</div>
      )}

      {/* Post-stream countdown — frames 16/18 (within window or <1h warning).
          Skipped at frame 17 (>18h expired) — overlay shows expired message. */}
      {!isLive && trustCache.expires_at && (tier === 'free' || isGuest) && !isOfflineExpired && (
        <PostStreamCountdown expiresAt={trustCache.expires_at} />
      )}

      {/* Alert Counter — LIVE only */}
      {isLive && <AlertCounter trustCache={trustCache} />}

      {/* M1: ERV Gauge */}
      <ERVGauge
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
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

      {/* M2: TI + Classification + Percentile (cold-start gated per frames 06-09;
          percentile hidden for Guest per frame 10 — premium-derived data). */}
      <TIBadge
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        percentile={isGuest ? null : trustCache.percentile_in_category}
        showExpand={showDrillDown}
        coldStartStatus={trustCache.cold_start_status}
      />

      {/* Stream Summary — offline only (Section 9 wireframe "Итоги стрима").
          Real-data slot: durationText/peakCcv/avgCcv all null until stream session
          summary endpoint exposes them. trustCache.ccv is current/last live CCV,
          NOT stream-average — passing it as avgCcv would mislead. */}
      {!isLive && (
        <StreamSummaryCard
          durationText={null}
          peakCcv={null}
          avgCcv={null}
          ervPercent={trustCache.erv_percent}
          ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        />
      )}

      {/* M3: Signal Breakdown — drill-down access (Premium / Free Live / Free <18h) */}
      {showDrillDown && (
        <SignalBreakdown signals={trustCache.signal_breakdown || []} expandable={isPremium} />
      )}

      {/* M4: Reputation — drill-down access */}
      {showDrillDown && (
        <ReputationCard
          reputation={trustCache.streamer_reputation}
          isLive={isLive}
          expandable={isPremium}
          streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
        />
      )}

      {/* Combined M3+M4 guest paywall (Section 5 wireframe frame 10).
          Blurred layer renders real data when available, falls back to static
          preview rows so the blur effect стайт визуально even when server
          returns empty signal_breakdown for anonymous tier. */}
      {isGuest && isLive && (
        <div className="sp-paywall sp-paywall-guest">
          <div className="sp-paywall-blurred">
            {trustCache.signal_breakdown && trustCache.signal_breakdown.length > 0 ? (
              <SignalBreakdown signals={trustCache.signal_breakdown} />
            ) : (
              <div className="sp-signals" style={{ padding: 8 }}>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '82%' }} /></div>
                  <span className="sp-signal-val green">82%</span>
                </div>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '75%' }} /></div>
                  <span className="sp-signal-val green">75%</span>
                </div>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.ccv_step')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '90%' }} /></div>
                  <span className="sp-signal-val green">90%</span>
                </div>
              </div>
            )}
            {trustCache.streamer_reputation ? (
              <ReputationCard reputation={trustCache.streamer_reputation} isLive={isLive} />
            ) : (
              <div className="sp-reputation purple" style={{ padding: '4px 8px' }}>
                <div className="sp-rep-row">
                  <span className="sp-rep-name">{t('sp.rep_growth')}</span>
                  <div className="sp-rep-bar-bg"><div className="sp-rep-bar-fill" style={{ width: '72%' }} /></div>
                  <span className="sp-rep-val">72</span>
                </div>
                <div className="sp-rep-row">
                  <span className="sp-rep-name">{t('sp.rep_quality')}</span>
                  <div className="sp-rep-bar-bg"><div className="sp-rep-bar-fill" style={{ width: '88%' }} /></div>
                  <span className="sp-rep-val">88</span>
                </div>
              </div>
            )}
          </div>
          <div className="sp-paywall-overlay sp-paywall-overlay-guest">
            <div className="sp-paywall-headline">{t('paywall.guest_title')}</div>
            <div className="sp-paywall-subtext">{t('paywall.guest_description')}</div>
            <button
              className="sp-paywall-cta twitch"
              onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}
            >
              {t('auth.twitch')}
            </button>
          </div>
        </div>
      )}

      {/* Offline expired paywall (frame 17). Blurred layer has placeholder rows
          when API returns null (anonymous tier / not-cached) so blur effect shows. */}
      {isOfflineExpired && (
        <div className="sp-paywall sp-paywall-expired">
          <div className="sp-paywall-blurred">
            {trustCache.signal_breakdown && trustCache.signal_breakdown.length > 0 ? (
              <SignalBreakdown signals={trustCache.signal_breakdown} />
            ) : (
              <div className="sp-signals" style={{ padding: 8 }}>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '82%' }} /></div>
                  <span className="sp-signal-val green">82%</span>
                </div>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '75%' }} /></div>
                  <span className="sp-signal-val green">75%</span>
                </div>
                <div className="sp-signal-row">
                  <span className="sp-signal-name">{t('signal.ccv_step')}</span>
                  <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill green" style={{ width: '90%' }} /></div>
                  <span className="sp-signal-val green">90%</span>
                </div>
              </div>
            )}
            {trustCache.streamer_reputation ? (
              <ReputationCard reputation={trustCache.streamer_reputation} isLive={false} />
            ) : (
              <div className="sp-reputation purple" style={{ padding: '4px 8px' }}>
                <div className="sp-rep-row">
                  <span className="sp-rep-name">{t('sp.rep_growth')}</span>
                  <div className="sp-rep-bar-bg"><div className="sp-rep-bar-fill" style={{ width: '72%' }} /></div>
                  <span className="sp-rep-val">72</span>
                </div>
                <div className="sp-rep-row">
                  <span className="sp-rep-name">{t('sp.rep_quality')}</span>
                  <div className="sp-rep-bar-bg"><div className="sp-rep-bar-fill" style={{ width: '88%' }} /></div>
                  <span className="sp-rep-val">88</span>
                </div>
              </div>
            )}
          </div>
          <div className="sp-paywall-overlay sp-paywall-overlay-expired">
            <div className="sp-paywall-headline">{t('sp.offline_paywall_title')}</div>
            <div className="sp-paywall-subtext">{t('sp.offline_paywall_subtitle')}</div>
            <button
              className="sp-paywall-cta full-width"
              onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' })}
            >
              {t('sp.offline_paywall_cta_track')}
            </button>
            <button
              className="sp-paywall-cta secondary full-width"
              onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=report' })}
            >
              {t('sp.offline_paywall_cta_report')}
            </button>
          </div>
        </div>
      )}

      {/* Streamer Mode extensions — hidden during cold-start insufficient
          (frame 06: M3/M4 + Streamer Tools collapsed) */}
      {isOwnChannel && trustCache.cold_start_status !== 'insufficient' && (
        <>
          <HealthScoreCard healthScore={trustCache.health_score} />
          <StreamerModeButtons channelId={trustCache.channel_id} login={trustCache.login} />
        </>
      )}

      {/* M5: Mini Sparkline */}
      {!isOfflineExpired && (
        <MiniSparkline
          channelId={trustCache.channel_id}
          isLive={isLive}
          isPremium={isPremium}
          ervColor={(trustCache.erv_label_color as 'green' | 'yellow' | 'red' | undefined) || 'green'}
        />
      )}

      {/* M6: Audience Preview (LIVE + offline-with-access) */}
      {!isOfflineExpired && trustCache.top_countries && (
        <AudiencePreview countries={trustCache.top_countries} />
      )}

      {/* Watchlist Button + Dropdown (frame 27) */}
      {authState.loggedIn && (
        <WatchlistButton
          channelId={trustCache.channel_id}
          isWatched={trustCache.is_watched_by_user}
          onOpenWatchlists={() => onNavigate?.('watchlists')}
        />
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
