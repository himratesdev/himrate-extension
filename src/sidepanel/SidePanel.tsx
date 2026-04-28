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

// Tabs locked per tier (Design Spec §F3)
const LOCKED_TABS: Record<string, SidePanelTab[]> = {
  guest: ['trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid'],
  free: ['trends', 'audience', 'compare', 'overlap', 'botraid'],
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

  // Boot: get auth state + trust data. loading flips false once trust response
  // arrives — null response means "no current channel" (user not on Twitch),
  // which Overview state machine routes to NotTwitchOverview.
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_AUTH_STATE' }, (auth) => {
      if (auth) setAuthState(auth);
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
    const locked = LOCKED_TABS[authState.tier] || LOCKED_TABS.guest;
    if (locked.includes(tabId)) {
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
        {currentTab !== 'overview' && (
          <button className="sp-header-back" onClick={() => setCurrentTab('overview')} aria-label={t('aria.back')}>
            &#8592;
          </button>
        )}
        <span className="sp-header-title">{t(`tab.${currentTab}`)}</span>
        {currentTab === 'overview' && trustCache?.login && (
          <span className="sp-header-streamer">{trustCache.login}</span>
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

      {/* Info Banner */}
      <InfoBanner
        show={authState.loggedIn && !authState.twitchLinked}
      />

      {/* Tab Bar */}
      <TabBar
        tabs={TABS}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lockedTabs={lockedTabs}
        anomalyTabs={getAnomalyTabs(trustCache)}
      />

      {/* Content — canonical sp-content */}
      <div className="sp-content" role="tabpanel">
        {currentTab === 'overview' ? (
          <Overview
            trustCache={trustCache}
            loading={loading}
            tier={tier}
            isOwnChannel={isOwnChannel}
            authState={authState}
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
      </div>

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

function getAnomalyTabs(cache: TrustCache | null): Record<string, 'yellow' | 'red'> {
  if (!cache?.is_live || cache.erv_percent == null || cache.erv_percent >= 80) return {};
  // Anomaly dots: yellow (ERV 50-79) или red (ERV < 50). Wireframe spec.
  const color: 'yellow' | 'red' = cache.erv_percent < 50 ? 'red' : 'yellow';
  return { overview: color };
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
