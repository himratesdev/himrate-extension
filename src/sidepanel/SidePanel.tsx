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
import type { TrustCache } from '../shared/api';

const TABS = ['overview', 'trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid', 'settings'] as const;
export type SidePanelTab = typeof TABS[number];

// BUG-016: 'trends' removed from guest/free locks — TrendsTab.tsx handles
// Paywall variants (anonymous → AnonymousState, free → Paywall variant="free").
// Locking at TabBar level prevented users from EVER reaching paywall conversion path.
const LOCKED_TABS: Record<string, SidePanelTab[]> = {
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
  const [loading, setLoading] = useState(true);

  // Boot: get auth state + current channel + trust data
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_AUTH_STATE' }, (auth) => {
      if (auth) setAuthState(auth);
    });
    chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' }, (data) => {
      if (data) {
        setTrustCache(data);
        setLoading(false);
      }
    });
    chrome.runtime.sendMessage({ action: 'GET_CURRENT_CHANNEL' }, (ch) => {
      if (!ch) setLoading(false);
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
      // TODO: show paywall modal
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
      {/* Header */}
      <div className="sp-header">
        <div className="sp-header-left">
          {currentTab !== 'overview' && (
            <button className="sp-header-back" onClick={() => setCurrentTab('overview')} aria-label={t('aria.back')}>
              &#8592;
            </button>
          )}
          <span className="sp-header-title">
            {currentTab === 'overview' && trustCache?.display_name
              ? trustCache.display_name
              : t(`tab.${currentTab}`)}
          </span>
        </div>
        <div className="sp-header-right">
          <LangSwitcher compact />
          {authState.loggedIn && (
            <>
              <button className="sp-header-icon" aria-label={t('aria.settings')} onClick={() => setCurrentTab('settings')}>
                &#9881;&#65039;
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

      {/* Content */}
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

      {/* Footer */}
      <div className="sp-footer">
        <a href="#" className="sp-footer-link">{t('footer.support')}</a>
        <div className="sp-footer-right">
          <a href="#" className="sp-footer-link">{t('footer.feedback')}</a>
          <a href="https://youtube.com/@himrate" target="_blank" rel="noopener" className="sp-footer-link">{t('footer.youtube')}</a>
          <a href="https://t.me/himrate" target="_blank" rel="noopener" className="sp-footer-link">{t('footer.telegram')}</a>
        </div>
      </div>
    </div>
  );
}

function getAnomalyTabs(cache: TrustCache | null): string[] {
  if (!cache?.is_live || cache.erv_percent == null || cache.erv_percent >= 80) return [];
  // Anomaly dots on Overview + relevant tabs when ERV < 80%
  return ['overview'];
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
