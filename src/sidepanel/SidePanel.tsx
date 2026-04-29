// TASK-035: Side Panel — full implementation with Overview + 7 tab shells.
// Global Shell (Header + TabBar + Footer) + Overview as default tab.
// Other tabs = wireframe shells (content in future tasks TASK-036..054).

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '../shared/components/LangSwitcher';
import { TabBar } from './components/TabBar';
import { Overview } from './components/Overview';
import { PlaceholderTab } from './components/PlaceholderTab';
import { Watchlists } from './components/Watchlists';
import { TrendsTab } from './components/tabs/trends/TrendsTab';
import type { AccessLevel } from '../shared/trends-types';
import { ChannelSwitchNotification } from './components/ChannelSwitchNotification';
import { InfoBanner } from './components/InfoBanner';
import { LockedTabPaywallModal } from './components/LockedTabPaywallModal';
import type { TrustCache } from '../shared/api';

const TABS = ['overview', 'trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid', 'settings'] as const;
export type SidePanelTab = typeof TABS[number];

// Tabs locked per tier (Design Spec §F3).
// LOCKED_TABS = visual lock indicator (lock icon + opacity) per wireframes 11/32.
// HARD_LOCKED_TABS = click triggers generic LockedTabPaywallModal.
// Trends is soft-locked (visual lock only) because TrendsTab renders its own
// rich Paywall content (frames 32 Free / 33 Guest) — generic modal would lose context.
const LOCKED_TABS: Record<string, SidePanelTab[]> = {
  guest: ['trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid'],
  free: ['trends', 'audience', 'compare', 'overlap', 'botraid'],
  premium: [],
  business: [],
  streamer: [],
};
const HARD_LOCKED_TABS: Record<string, SidePanelTab[]> = {
  guest: ['audience', 'watchlists', 'compare', 'overlap', 'botraid'],
  free: ['audience', 'compare', 'overlap', 'botraid'],
  premium: [],
  business: [],
  streamer: [],
};

export function SidePanel() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<SidePanelTab>('overview');
  const [trustCache, setTrustCache] = useState<TrustCache | null>(null);
  const [authState, setAuthState] = useState<{ loggedIn: boolean; tier: string; twitchLinked: boolean; twitchLogin: string | null }>({
    loggedIn: false, tier: 'guest', twitchLinked: false, twitchLogin: null,
  });
  const [pendingChannel, setPendingChannel] = useState<string | null>(null);
  const [lockedTabPaywall, setLockedTabPaywall] = useState<SidePanelTab | null>(null);
  const [loading, setLoading] = useState(true);
  // currentChannel: undefined = not yet known (Skeleton); null = no channel
  // detected (NotTwitchOverview); string = channel found (wait for trustCache).
  const [currentChannel, setCurrentChannel] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_AUTH_STATE' }, (auth) => {
      if (auth) setAuthState(auth);
    });
    chrome.runtime.sendMessage({ action: 'GET_CURRENT_CHANNEL' }, (ch) => {
      setCurrentChannel(typeof ch === 'string' && ch.length > 0 ? ch : null);
    });
    chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' }, (data) => {
      if (data) setTrustCache(data);
      setLoading(false);
    });
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    const listener = (msg: { action: string; data?: TrustCache; channel?: string }) => {
      if (msg.action === 'TRUST_DATA_UPDATED' && msg.data) {
        setTrustCache(msg.data);
        setLoading(false);
      }
      if (msg.action === 'CHANNEL_CHANGED' && msg.channel) {
        // Channel changed on page — show switch notification
        if (trustCache?.login && msg.channel !== trustCache.login) {
          setPendingChannel(msg.channel);
        }
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [trustCache?.login]);

  const handleTabChange = useCallback((tab: string) => {
    const tabId = tab as SidePanelTab;
    const hardLocked = HARD_LOCKED_TABS[authState.tier] || HARD_LOCKED_TABS.guest;
    if (hardLocked.includes(tabId)) {
      setLockedTabPaywall(tabId);
      return;
    }
    setCurrentTab(tabId);
  }, [authState.tier]);

  // TASK-039 Phase D2 M-2: thread upgrade/sign-in/reconnect handlers через TrendsTab.
  // Открываем checkout / settings web pages через chrome.tabs (extension context).
  // CR M-2 fix: prevents Paywall CTA non-functional regression.
  const handleRequestUpgrade = useCallback((target: 'premium' | 'business') => {
    const url = target === 'business'
      ? 'https://himrate.com/pricing?plan=business&utm_source=extension&utm_medium=trends_tab'
      : 'https://himrate.com/pricing?plan=premium&utm_source=extension&utm_medium=trends_tab';
    chrome.tabs.create({ url });
  }, []);

  const handleRequestSignIn = useCallback(() => {
    // Open settings tab — sign-in flow lives there per TASK-018 wiring.
    setCurrentTab('settings');
  }, []);

  const handleReconnectTwitch = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'TWITCH_RECONNECT' });
  }, []);

  const handleChannelSwitch = useCallback((accept: boolean) => {
    if (accept && pendingChannel) {
      setLoading(true);
      setTrustCache(null);
      chrome.runtime.sendMessage({ action: 'FORCE_CHANNEL_LOAD', channel: pendingChannel });
    }
    setPendingChannel(null);
  }, [pendingChannel]);

  const tier = authState.tier || 'guest';
  const lockedTabs = LOCKED_TABS[tier] || LOCKED_TABS.guest;
  const isOwnChannel = authState.twitchLogin != null &&
    trustCache?.login != null &&
    authState.twitchLogin === trustCache.login;

  return (
    <div className="panel">
      {/* Header — canonical sp-header §6.2 */}
      <div className="sp-header">
        <button
          className="sp-header-back"
          onClick={() => setCurrentTab('overview')}
          aria-label={t('aria.back')}
          disabled={currentTab === 'overview'}
          style={currentTab === 'overview' ? { opacity: 0.3, cursor: 'default' } : undefined}
        >
          &#8592;
        </button>
        <span className="sp-header-title">{t(`tab.${currentTab}`)}</span>
        {currentTab === 'overview' && trustCache?.login && (
          <span className="sp-header-streamer" title={trustCache.display_name || trustCache.login}>
            {trustCache.login}
          </span>
        )}
        <div className="sp-header-right">
          <LangSwitcher compact />
          {authState.loggedIn && (
            <>
              <button
                className="sp-header-icon"
                aria-label={t('aria.settings')}
                onClick={() => setCurrentTab('settings')}
              >
                <svg className="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <div className="sp-header-avatar" aria-label={t('aria.profile')}>
                {trustCache?.avatar_url
                  ? <img src={trustCache.avatar_url} alt="" width={20} height={20} style={{ borderRadius: '50%' }} />
                  : (authState.twitchLogin?.[0]?.toUpperCase() || 'U')
                }
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Banner — 2 variants:
          link_twitch (loggedIn + !twitchLinked + tracked): "Привяжите Twitch..."
          guest_signin (Guest + tracked + Live, frame 10): "Войдите через Twitch..."
          Hidden on NotTracked / NotTwitch / Error / Offline per frames 03/05/17. */}
      <InfoBanner
        show={
          authState.loggedIn &&
          !authState.twitchLinked &&
          Boolean(trustCache?.is_tracked)
        }
        variant="link_twitch"
      />
      <InfoBanner
        show={
          !authState.loggedIn &&
          Boolean(trustCache?.is_tracked) &&
          Boolean(trustCache?.is_live)
        }
        variant="guest_signin"
      />

      {/* Tab Bar */}
      <TabBar
        tabs={TABS}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lockedTabs={lockedTabs}
        anomalyTabs={getAnomalyTabs(trustCache, lockedTabs)}
      />

      {/* Content — каждый tab/state owns свой sp-content (literal port wireframe).
          sp-content inline styles варьируются per-frame (e.g. justify-content:center
          для NotTwitch/NotTracked); поэтому wrapper в каждом компоненте, не здесь. */}
      {currentTab === 'overview' ? (
        <Overview
          trustCache={trustCache}
          loading={loading}
          currentChannel={currentChannel}
          tier={tier}
          isOwnChannel={isOwnChannel}
          authState={authState}
          onNavigate={(tab) => setCurrentTab(tab as SidePanelTab)}
        />
      ) : currentTab === 'watchlists' ? (
        <Watchlists tier={tier} authState={authState} />
      ) : currentTab === 'trends' ? (
        <TrendsTab
          channelId={trustCache?.channel_id ?? null}
          accessLevel={resolveAccessLevel(tier, isOwnChannel)}
          onRequestSignIn={handleRequestSignIn}
          onRequestUpgrade={handleRequestUpgrade}
          onReconnectTwitch={handleReconnectTwitch}
          oauthRevoked={authState.loggedIn && !authState.twitchLinked}
        />
      ) : (
        <PlaceholderTab tabId={currentTab} />
      )}

      {/* Channel Switch Notification */}
      {pendingChannel && (
        <ChannelSwitchNotification
          channelName={pendingChannel}
          onAccept={() => handleChannelSwitch(true)}
          onDecline={() => handleChannelSwitch(false)}
        />
      )}

      {/* Locked Tab Paywall Modal */}
      {lockedTabPaywall && (
        <LockedTabPaywallModal
          tabName={t(`tab.${lockedTabPaywall}`)}
          onClose={() => setLockedTabPaywall(null)}
          onUpgrade={() => {
            setLockedTabPaywall(null);
            handleRequestUpgrade('premium');
          }}
        />
      )}

      {/* Footer — canonical sp-footer §6.2 */}
      <div className="sp-footer">
        <a href="#" className="sp-footer-link">{t('footer.support')}</a>
        <span className="sp-footer-sep">·</span>
        <a href="#" className="sp-footer-link">{t('footer.feedback')}</a>
        <span className="sp-footer-sep">·</span>
        <a href="https://youtube.com/@himrate" target="_blank" rel="noopener" className="sp-footer-link">{t('footer.youtube')}</a>
        <span className="sp-footer-sep">·</span>
        <a href="https://t.me/himrate" target="_blank" rel="noopener" className="sp-footer-link">{t('footer.telegram')}</a>
      </div>
    </div>
  );
}

function getAnomalyTabs(
  cache: TrustCache | null,
  lockedTabs: SidePanelTab[],
): Record<string, 'yellow' | 'red'> {
  if (!cache?.is_live || cache.erv_percent == null || cache.erv_percent >= 80) return {};
  // ERV<50 = red, ERV 50-79 = yellow per wireframe.
  const color: 'yellow' | 'red' = cache.erv_percent < 50 ? 'red' : 'yellow';
  // Tabs with anomaly-relevant drill-down: overview always; overlap when
  // user has access (frames 12/26 — locked tabs in Free skip dot).
  const candidateTabs: SidePanelTab[] = ['overview', 'overlap'];
  const result: Record<string, 'yellow' | 'red'> = {};
  for (const tab of candidateTabs) {
    if (!lockedTabs.includes(tab)) result[tab] = color;
  }
  return result;
}

// TASK-039: access_level resolution для Trends API (FR-011..014).
// CR S-3: Matches server ChannelPolicy priority order EXACTLY:
//   effective_business_access? → "business"
//   owns_channel_access?       → "streamer"  (через auth_providers.is_broadcaster)
//   premium_access?            → "premium"
//   registered                 → "free"
//   else                       → "anonymous"
// Streamer check BEFORE premium — streamer-on-own-channel с premium tier всё равно
// получает "streamer" access_level в meta.access_level response (не "premium").
function resolveAccessLevel(tier: string, isOwnChannel: boolean): AccessLevel {
  if (tier === 'business') return 'business';
  if (isOwnChannel) return 'streamer';
  if (tier === 'premium') return 'premium';
  if (tier === 'free' || tier === 'streamer') return 'free';
  return 'anonymous';
}
