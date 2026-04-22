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
      <div className="panel-header">
        <div className="panel-header-left">
          {currentTab !== 'overview' && (
            <button className="panel-header-back" onClick={() => setCurrentTab('overview')} aria-label={t('aria.back')}>
              &#8592;
            </button>
          )}
          <span className="panel-header-title">
            {currentTab === 'overview' && trustCache?.display_name
              ? trustCache.display_name
              : t(`tab.${currentTab}`)}
          </span>
        </div>
        <div className="panel-header-right">
          <LangSwitcher compact />
          {authState.loggedIn && (
            <>
              <button className="panel-settings" aria-label={t('aria.settings')} onClick={() => setCurrentTab('settings')}>
                &#9881;&#65039;
              </button>
              <div className="panel-avatar" aria-label={t('aria.profile')}>
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
      <div className="panel-content" role="tabpanel">
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
      <div className="panel-footer">
        <a href="#" className="footer-link">{t('footer.support')}</a>
        <div className="panel-footer-right">
          <a href="#" className="footer-link">{t('footer.feedback')}</a>
          <a href="https://youtube.com/@himrate" target="_blank" rel="noopener" className="footer-link">{t('footer.youtube')}</a>
          <a href="https://t.me/himrate" target="_blank" rel="noopener" className="footer-link">{t('footer.telegram')}</a>
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

// TASK-039 Phase D1: access_level resolution для Trends API (FR-011..014).
// Matches ChannelPolicy semantics: business > streamer > premium > free > anonymous.
function resolveAccessLevel(tier: string, isOwnChannel: boolean): AccessLevel {
  if (tier === 'business') return 'business';
  if (isOwnChannel && (tier === 'streamer' || tier === 'free')) return 'streamer';
  if (tier === 'premium') return 'premium';
  if (tier === 'free') return 'free';
  return 'anonymous';
}
