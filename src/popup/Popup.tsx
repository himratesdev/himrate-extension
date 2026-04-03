// TASK-034/077: Main Popup component — state machine + screen routing.

import { useState, useEffect, useCallback } from 'react';
import { type TrustCache, type PopupScreen } from '../shared/api';
import { initI18n, changeLanguage } from '../shared/i18n';
import { useTranslation } from 'react-i18next';
import { DONATION_URL } from '../shared/config';

import { LiveScreen } from './components/LiveScreen';
import { OfflineScreen } from './components/OfflineScreen';
import { NotTrackedScreen } from './components/NotTrackedScreen';
import { NotTwitchScreen } from './components/NotTwitchScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { SkeletonScreen } from './components/SkeletonScreen';
import { SearchOverlay } from './components/SearchOverlay';

function determineScreen(
  currentChannel: string | null,
  cache: TrustCache | null,
): PopupScreen {
  if (!currentChannel) return 'not_twitch';
  if (!cache || cache.loading) return 'skeleton';
  if (cache.error) return 'error';
  if (!cache.is_tracked && cache.is_live) return 'not_tracked_live';
  if (!cache.is_tracked && !cache.is_live) return 'not_tracked_offline';
  if (cache.is_tracked && cache.is_live) return 'live';
  if (cache.is_tracked && !cache.is_live) return 'offline';
  return 'skeleton';
}

export default function Popup() {
  const { t } = useTranslation();
  const [cache, setCache] = useState<TrustCache | null>(null);
  const [authState, setAuthState] = useState<{ loggedIn: boolean; user: Record<string, unknown> | null }>({ loggedIn: false, user: null });
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('ru');
  const [i18nReady, setI18nReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Init i18n
  useEffect(() => {
    initI18n().then((i18nInstance) => {
      setLocale(i18nInstance.language);
      setI18nReady(true);
    });
  }, []);

  // Load initial state
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_AUTH_STATE' }, (res) => {
      if (res) setAuthState(res);
    });
    chrome.runtime.sendMessage({ action: 'GET_CURRENT_CHANNEL' }, (res) => {
      const ch = res?.currentChannel || null;
      setCurrentChannel(ch);

      if (ch) {
        chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' }, (trustCache) => {
          if (trustCache) setCache(trustCache);
        });
      }
    });
  }, []);

  // Listen for updates from background
  useEffect(() => {
    const listener = (message: Record<string, unknown>) => {
      if (message.action === 'TRUST_DATA_UPDATED') {
        setCache(message.data as TrustCache);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Skeleton timeout → error after 5s
  useEffect(() => {
    if (cache?.loading) {
      const timeout = setTimeout(() => {
        setCache(prev => prev?.loading ? { ...prev, loading: false, error: 'timeout' } : prev);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [cache?.loading]);

  const handleRetry = useCallback(() => {
    if (currentChannel) {
      setCache(prev => prev ? { ...prev, loading: true, error: null } : null);
      chrome.runtime.sendMessage({ action: 'CHANNEL_CHANGED', channel: currentChannel });
    }
  }, [currentChannel]);

  const handleLanguageChange = async () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    await changeLanguage(newLocale);
    setLocale(newLocale);
  };

  if (!i18nReady) return null;

  const screen = determineScreen(currentChannel, cache);
  const isGuest = !authState.loggedIn;
  const tier = (authState.user?.tier as string) || 'free';

  return (
    <div className="screen">
      {/* Search overlay */}
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} isGuest={isGuest} tier={tier} />
      )}

      {/* Header — FR-012: search bar on ALL screens */}
      <div className="screen-header">
        <div className="logo-header">{t('app.title')}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder={t('search.placeholder')}
            style={{ width: '150px', padding: '6px 10px', fontSize: '12px', boxShadow: '1px 1px 0 var(--border-dark)' }}
            onFocus={() => setSearchOpen(true)}
            readOnly
          />
          <div className="lang-switch" onClick={handleLanguageChange} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleLanguageChange()}
            aria-label={t('aria.lang')}>
            <span className="globe">🌐</span>
            <span className="lang-code">{locale.toUpperCase()}</span>
            <span className="chevron">▾</span>
          </div>
        </div>
      </div>

      {/* Screen content */}
      {screen === 'skeleton' && <SkeletonScreen />}
      {screen === 'error' && <ErrorScreen onRetry={handleRetry} />}
      {screen === 'not_twitch' && <NotTwitchScreen isGuest={isGuest} />}
      {screen === 'live' && cache && <LiveScreen cache={cache} isGuest={isGuest} tier={tier} />}
      {screen === 'offline' && cache && <OfflineScreen cache={cache} isGuest={isGuest} tier={tier} />}
      {screen === 'not_tracked_live' && cache && <NotTrackedScreen cache={cache} isGuest={isGuest} isLive={true} />}
      {screen === 'not_tracked_offline' && cache && <NotTrackedScreen cache={cache} isGuest={isGuest} isLive={false} />}

      {/* Footer M4 */}
      <div className="screen-footer">
        {DONATION_URL ? (
          <a href={DONATION_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
            {t('footer.support')}
          </a>
        ) : (
          <span className="footer-link" style={{ opacity: 0.5, cursor: 'default' }}>
            {t('footer.support')}
          </span>
        )}
      </div>
    </div>
  );
}
