// TASK-035 + BUG-016 PR-1: Overview tab — conditional layout (LIVE vs OFFLINE).
// Per-tier visibility: Guest = headline + locked tabs; Free Live = full drill-down;
// Free <18h post-stream = drill-down with countdown; Free >18h = expired paywall;
// Premium = expandable details; Streamer (own channel) = HealthScore + tools.

import { useState } from 'react';
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
import { Frame06ColdStartInsufficient } from './Frame06ColdStartInsufficient';
import { Frame07ColdStartProvisionalLow } from './Frame07ColdStartProvisionalLow';
import { Frame08ColdStartProvisional } from './Frame08ColdStartProvisional';
import { Frame09ColdStartDeepStreamer } from './Frame09ColdStartDeepStreamer';
import { Frame10LiveGuestGreen } from './Frame10LiveGuestGreen';
import { Frame11LiveFreeGreen } from './Frame11LiveFreeGreen';
import { Frame12LiveFreeYellow } from './Frame12LiveFreeYellow';
import { Frame13LiveFreeRed } from './Frame13LiveFreeRed';
import { Frame14LivePremiumGreen } from './Frame14LivePremiumGreen';
import { Frame15LiveStreamerOwnChannel } from './Frame15LiveStreamerOwnChannel';
import { Frame16OfflineWithin18h } from './Frame16OfflineWithin18h';
import { Frame17OfflineExpired } from './Frame17OfflineExpired';
import { Frame20BadgeModal } from './Frame20BadgeModal';
import { Frame21ChannelCardModal } from './Frame21ChannelCardModal';
import { Frame22VerificationModal } from './Frame22VerificationModal';
import { Frame23VerificationLimitModal } from './Frame23VerificationLimitModal';
import { LiveTrendIndicator } from './LiveTrendIndicator';
import { AudiencePreview } from './AudiencePreview';
import { AlertsBlock, type AnomalyAlert } from './AlertsBlock';
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

  // Streamer Tools modal state — frames 20/21/22/23
  type ModalKey = 'badge' | 'card' | 'verification' | 'verificationLimit' | null;
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const verificationRequestsUsed = 2; // TBD: from backend (TASK-085)
  const handleOpenVerification = () => {
    setActiveModal(verificationRequestsUsed >= 5 ? 'verificationLimit' : 'verification');
  };
  const handleVerificationSubmit = async (_message: string) => {
    // TBD: api.submitVerificationRequest(_message) — backend endpoint pending TASK-085
    // Currently just close modal — UI feedback only
  };

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

  // Frame 06 — Cold Start <3 streams (insufficient): full literal port from
  // wireframe slim/06. Replaces abstract ERVGauge/TIBadge composition.
  if (trustCache.cold_start_status === 'insufficient') {
    return <Frame06ColdStartInsufficient streamsCount={trustCache.streamer_rating?.streams_count ?? 0} />;
  }

  // Frame 10 — Live Guest Green: literal port from slim/10. Combined sign-in paywall
  // with blurred M3+M4 preview + Twitch CTA.
  if (trustCache.is_live && !authState.loggedIn) {
    return (
      <Frame10LiveGuestGreen
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
      />
    );
  }

  // Frames 11/12/13 — Live Free with M3/M4 paywall (3 standalone literal ports per ERV color).
  // Routing per erv_label_color: green→Frame11 / yellow→Frame12 / red→Frame13. Each frame is JSX 1:1
  // от соответствующего wireframe slim/11/12/13.html (sparkline coords/colors/alerts/audience defaults).
  if (trustCache.is_live && tier === 'free' && !isOwnChannel) {
    const liveFreeProps = {
      ervPercent: trustCache.erv_percent,
      ervCount: trustCache.erv_count,
      ccv: trustCache.ccv,
      tiScore: trustCache.ti_score,
      classification: trustCache.classification,
      percentile: trustCache.percentile_in_category,
      channelId: trustCache.channel_id,
      signals: trustCache.signal_breakdown ?? [],
      reputation: trustCache.streamer_reputation,
      topCountries: trustCache.top_countries,
      onNavigate,
    };
    const ervColor = trustCache.erv_label_color;
    if (ervColor === 'yellow') return <Frame12LiveFreeYellow {...liveFreeProps} />;
    if (ervColor === 'red') return <Frame13LiveFreeRed {...liveFreeProps} />;
    return <Frame11LiveFreeGreen {...liveFreeProps} />;
  }

  // Frame 14 — Live Premium Green: literal port from slim/14. All 11 signals + 3 reputation
  // rows expanded with descriptions/charts/history. Premium user, not own channel.
  if (trustCache.is_live && (tier === 'premium' || tier === 'business') && !isOwnChannel) {
    return (
      <Frame14LivePremiumGreen
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        percentile={trustCache.percentile_in_category}
        isWatched={trustCache.is_watched_by_user}
        channelId={trustCache.channel_id}
        signals={trustCache.signal_breakdown ?? []}
        reputation={trustCache.streamer_reputation}
        topCountries={trustCache.top_countries}
        onNavigate={onNavigate}
      />
    );
  }

  // Frame 15 — Live Streamer Own Channel: literal port from slim/15. Own channel +
  // streamer disclaimer + ERV gauge 160px + signals + reputation + Health Score.
  if (trustCache.is_live && isOwnChannel) {
    const tiScoreSafe = trustCache.ti_score ?? 0;
    const channelLogin = trustCache.login || '';
    const avatarLetter = (authState.twitchLogin?.[0] || channelLogin[0] || 'M').toUpperCase();
    return (
      <>
        <Frame15LiveStreamerOwnChannel
          ervPercent={trustCache.erv_percent}
          ervCount={trustCache.erv_count}
          ccv={trustCache.ccv}
          ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
          tiScore={trustCache.ti_score}
          percentile={trustCache.percentile_in_category}
          streamsCount={trustCache.streamer_rating?.streams_count ?? 342}
          channelId={trustCache.channel_id}
          signals={trustCache.signal_breakdown ?? []}
          reputation={trustCache.streamer_reputation}
          healthScore={trustCache.health_score}
          topCountries={trustCache.top_countries}
          verificationRequestsUsed={verificationRequestsUsed}
          onNavigate={onNavigate}
          onOpenBadgeModal={() => setActiveModal('badge')}
          onOpenChannelCardModal={() => setActiveModal('card')}
          onOpenVerificationModal={handleOpenVerification}
        />
        {activeModal === 'badge' && (
          <Frame20BadgeModal
            channelLogin={channelLogin}
            tiScore={tiScoreSafe}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'card' && (
          <Frame21ChannelCardModal
            channelLogin={channelLogin}
            avatarLetter={avatarLetter}
            streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
            tiScore={tiScoreSafe}
            ervPercent={trustCache.erv_percent ?? 0}
            classification={trustCache.classification ? t(`classification.${trustCache.classification}`) : ''}
            healthScore={trustCache.health_score}
            reputation={trustCache.streamer_reputation}
            onClose={() => setActiveModal(null)}
            onNavigate={onNavigate}
          />
        )}
        {activeModal === 'verification' && (
          <Frame22VerificationModal
            requestsUsed={verificationRequestsUsed}
            onClose={() => setActiveModal(null)}
            onSubmit={handleVerificationSubmit}
          />
        )}
        {activeModal === 'verificationLimit' && (
          <Frame23VerificationLimitModal onClose={() => setActiveModal(null)} />
        )}
      </>
    );
  }


  // Frame 07 — Cold Start 3-6 streams (provisional_low): literal port from slim/07.
  if (trustCache.cold_start_status === 'provisional_low') {
    return (
      <Frame07ColdStartProvisionalLow
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        tiScore={trustCache.ti_score}
        streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
      />
    );
  }

  // Frame 08 — Cold Start 7-9 streams (provisional): literal port from slim/08.
  if (trustCache.cold_start_status === 'provisional') {
    return (
      <Frame08ColdStartProvisional
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
      />
    );
  }

  // Frame 09 — Cold Start 30+ streams Streamer (deep + own channel): literal port from slim/09.
  if (trustCache.cold_start_status === 'deep' && isOwnChannel) {
    const hs = trustCache.health_score?.components;
    return (
      <Frame09ColdStartDeepStreamer
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
        percentile={trustCache.percentile_in_category}
        streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
        hsTi={hs?.ti?.score ?? null}
        hsStability={hs?.stability?.score ?? null}
        hsEngagement={hs?.engagement?.score ?? null}
        hsGrowth={hs?.growth?.score ?? null}
        hsConsistency={hs?.consistency?.score ?? null}
        onNavigate={onNavigate}
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
  // Cold-start tier gating per wireframe frames 06-09:
  //   insufficient (<3) — frame 06: hide M3/M4/M5/M6/Trend (only ERV+TI+banner)
  //   provisional_low (3-6) — frame 07: hide M3/M4/M5/M6/Trend (only ERV+TI+badge+banner)
  //   provisional (7-9) — frame 08: hide M3/M5/M6/Trend, show M4 placeholder
  //   full (10-29) / deep (30+) — frames 11+: full module rendering
  const isInsufficient = trustCache.cold_start_status === 'insufficient';
  const isProvisionalLow = trustCache.cold_start_status === 'provisional_low';
  const isProvisional = trustCache.cold_start_status === 'provisional';
  const hideAllModules = isInsufficient || isProvisionalLow;
  const hideMostModules = hideAllModules || isProvisional;

  // Frame 17 — Offline >18h expired: literal port from slim/17. Top section visible
  // (gauge/ERV/TI/stream summary), bottom blurred paywall + 2 CTAs ($9.99 / $4.99).
  if (isOfflineExpired) {
    return (
      <Frame17OfflineExpired
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
        streamDuration={null}
        peakViewers={null}
        avgCcv={null}
        signals={trustCache.signal_breakdown ?? []}
        reputation={trustCache.streamer_reputation}
      />
    );
  }

  // Frame 16/18 — Offline within 18h window: literal port from slim/16 (default) or
  // slim/18 (warning red border when <1h remaining). Free user post-stream sees full drill-down.
  if (!isLive && windowOpen && !isOfflineExpired) {
    const remainingMin = trustCache.expires_at
      ? Math.max(0, Math.floor((new Date(trustCache.expires_at).getTime() - Date.now()) / 60_000))
      : 0;
    const hours = Math.floor(remainingMin / 60);
    const minutes = remainingMin % 60;
    const countdownText = hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
    const isWarning = remainingMin > 0 && remainingMin < 60; // Frame18 trigger
    return (
      <Frame16OfflineWithin18h
        ervPercent={trustCache.erv_percent}
        ervCount={trustCache.erv_count}
        ccv={trustCache.ccv}
        ervLabelColor={trustCache.erv_label_color as 'green' | 'yellow' | 'red' | null}
        tiScore={trustCache.ti_score}
        percentile={trustCache.percentile_in_category}
        countdownText={countdownText}
        countdownWarning={isWarning}
        streamDuration={null}
        peakViewers={null}
        avgCcv={null}
        channelId={trustCache.channel_id}
        isWatched={trustCache.is_watched_by_user}
        signals={trustCache.signal_breakdown ?? []}
        reputation={trustCache.streamer_reputation}
        topCountries={trustCache.top_countries}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    // <div class="sp-content"> — wireframe slim/11/14/15 wraps live overview in default sp-content
    <div className="sp-content" role="tabpanel">
      {/* Streamer disclaimer — own channel only (Section 8 wireframe) */}
      {isOwnChannel && (
        <div className="sp-streamer-disclaimer">{t('sp.streamer_disclaimer')}</div>
      )}

      {/* Post-stream countdown — frames 16/18 (within window or <1h warning).
          Skipped at frame 17 (>18h expired) — replaced by red expired banner. */}
      {!isLive && trustCache.expires_at && (tier === 'free' || isGuest) && !isOfflineExpired && (
        <PostStreamCountdown expiresAt={trustCache.expires_at} />
      )}

      {/* Offline expired top banner — frame 17 wireframe (red border + clock icon).
          Wireframe slim 17: "🕐 Время доступа истекло" — red rounded box at top of content. */}
      {isOfflineExpired && (
        <div className="sp-offline-expired-banner" role="alert">
          🕐 {t('sp.offline_paywall_title')}
        </div>
      )}

      {/* Alert Counter — LIVE only */}
      {isLive && <AlertCounter trustCache={trustCache} />}

      {/* Deep Analytics badge — frame 09 wireframe (cold_start_status === 'deep'),
          gradient green→blue pill above ERV gauge with stream count. */}
      {trustCache.cold_start_status === 'deep' && (trustCache.streamer_rating?.streams_count ?? 0) > 0 && (
        <div className="sp-deep-analytics-badge-wrap">
          <span className="sp-deep-analytics-badge">
            {t('cold_start.deep_badge', { N: trustCache.streamer_rating?.streams_count ?? 0 })}
          </span>
        </div>
      )}

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

      {/* Live Trend Indicator (Section 6 wireframe — sp-trend).
          Hidden during all cold-start tiers + for guests (wireframe frame 10 shows
          only ERV+TI+paywall for guest live, no trend / charts). */}
      {isLive && !hideMostModules && !isGuest && <LiveTrendIndicator channelId={trustCache.channel_id} />}

      {/* M2: TI + Classification + Percentile (cold-start gated per frames 06-09;
          percentile hidden for Guest per frame 10 — premium-derived data).
          Wireframe order: TI badge BEFORE collecting-status banner (frame 06 lines 32-42). */}
      <TIBadge
        tiScore={trustCache.ti_score}
        classification={trustCache.classification}
        percentile={isGuest ? null : trustCache.percentile_in_category}
        showExpand={showDrillDown}
        coldStartStatus={trustCache.cold_start_status}
      />

      {/* Cold Start collecting status (Section 4 wireframe — frames 06-08) */}
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

      {/* M-Anomaly: Persistent anomaly attribution (frame 26 — Premium Live ERV<80%).
          Real-data slot: trustCache.anomaly_alerts array (backend integration pending).
          Without it, render placeholder alerts so canonical structure visible per wireframe. */}
      {isLive && isPremium && trustCache.erv_percent != null && trustCache.erv_percent < 80 && (
        <AlertsBlock
          alerts={
            (trustCache as TrustCache & { anomaly_alerts?: AnomalyAlert[] }).anomaly_alerts ??
            (trustCache.erv_percent < 50
              ? [
                  { id: 'pl-raid', severity: 'red', title: t('sp.alert_anomaly_raid_title'), detail: t('sp.alert_anomaly_raid_detail') },
                  { id: 'pl-overlap', severity: 'yellow', title: t('sp.alert_anomaly_overlap_title'), detail: t('sp.alert_anomaly_overlap_detail') },
                ]
              : [
                  { id: 'pl-anomaly', severity: 'yellow', title: t('sp.alert_anomaly_audience_title'), detail: t('sp.alert_anomaly_audience_detail') },
                ])
          }
        />
      )}

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

      {/* M3: Signal Breakdown.
          - Premium / own channel: full visible + expandable
          - Free registered live (frame 11): paywall blur + "Upgrade to Premium" overlay
          - Cold-start tiers (06/07/08): hidden via hideMostModules
          - Guest live: handled by combined M3+M4 guest paywall block below */}
      {!hideMostModules && !isGuest && isPremium && (
        <SignalBreakdown signals={trustCache.signal_breakdown || []} expandable={true} />
      )}
      {!hideMostModules && !isGuest && !isPremium && isFreeWithAccess && (
        <div className="sp-paywall">
          <div className="sp-paywall-blurred">
            <SignalBreakdown signals={trustCache.signal_breakdown || []} expandable={false} />
          </div>
          <div className="sp-paywall-overlay">
            <span className="sp-paywall-text">{t('paywall.signals_full_analysis')}</span>
            <button
              className="sp-paywall-cta"
              onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' })}
            >
              {t('paywall.upgrade_premium_cta')}
            </button>
          </div>
        </div>
      )}

      {/* M4: Reputation.
          - Premium / own channel: full visible + expandable
          - Free registered live (frame 11): paywall blur + "Upgrade to Premium" overlay
          - insufficient/provisional_low (06/07): hidden
          - provisional (08): placeholder via ReputationCard's empty-state */}
      {!hideAllModules && !isGuest && isPremium && (
        <ReputationCard
          reputation={trustCache.streamer_reputation}
          isLive={isLive}
          expandable={true}
          streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
        />
      )}
      {!hideAllModules && !isGuest && !isPremium && isFreeWithAccess && (
        <div className="sp-paywall">
          <div className="sp-paywall-blurred">
            <ReputationCard
              reputation={trustCache.streamer_reputation}
              isLive={isLive}
              expandable={false}
              streamsCount={trustCache.streamer_rating?.streams_count ?? 0}
            />
          </div>
          <div className="sp-paywall-overlay">
            <span className="sp-paywall-text">{t('paywall.reputation_title')}</span>
            <button
              className="sp-paywall-cta"
              onClick={() => chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' })}
            >
              {t('paywall.upgrade_premium_cta')}
            </button>
          </div>
        </div>
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

      {/* M5: Mini Sparkline. Hidden during cold-start tiers + for guests
          (wireframe frame 10: guest paywall ends content, no M5/M6 trail). */}
      {!isOfflineExpired && !hideMostModules && !isGuest && (
        <MiniSparkline
          channelId={trustCache.channel_id}
          isLive={isLive}
          isPremium={isPremium}
          ervColor={(trustCache.erv_label_color as 'green' | 'yellow' | 'red' | undefined) || 'green'}
        />
      )}

      {/* M6: Audience Preview. Hidden during cold-start tiers + for guests. */}
      {!isOfflineExpired && !hideMostModules && !isGuest && (showDrillDown || isFreeWithAccess) && (
        <AudiencePreview
          countries={trustCache.top_countries}
          onNavigate={onNavigate}
        />
      )}

      {/* Watchlist Button + Dropdown (frame 27). Hidden during cold-start tiers. */}
      {authState.loggedIn && !hideMostModules && (
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
