import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '../shared/components/LangSwitcher';
import { TabBar } from './components/TabBar';

// Scaffold placeholder actions — Phase 2 will replace with real handlers
// eslint-disable-next-line no-console
const action = (name: string) => console.log(`action:${name}`);

const TABS = ['overview', 'trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid', 'settings'] as const;
type TabId = typeof TABS[number];

const BANNER_STORAGE_KEY = 'himrate_banner_dismissed_at';
const BANNER_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

// S3: persist banner dismiss in chrome.storage.local with 1 day TTL
async function isBannerDismissed(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(BANNER_STORAGE_KEY);
    const dismissedAt = result[BANNER_STORAGE_KEY] as number | undefined;
    if (dismissedAt && Date.now() - dismissedAt < BANNER_TTL_MS) return true;
  } catch {
    // chrome.storage not available
  }
  return false;
}

async function dismissBanner(): Promise<void> {
  try {
    await chrome.storage.local.set({ [BANNER_STORAGE_KEY]: Date.now() });
  } catch {
    // chrome.storage not available
  }
}

export function SidePanel() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabId>('overview');
  const [loggedIn] = useState(true); // Scaffold: always logged in for demo
  const [onTwitch] = useState(true); // Scaffold: always on Twitch
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    isBannerDismissed().then(setBannerDismissed);
  }, []);

  if (!loggedIn) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-title">HimRate</div>
          <LangSwitcher />
        </div>
        <div className="panel-content screen-content-centered">
          <p className="sp-login-title">{t('sp.login_required')}</p>
          <div className="auth-buttons">
            <button className="btn btn-twitch" onClick={() => action('auth-twitch')}>
              {t('auth.twitch')}
            </button>
            <button className="btn btn-google" onClick={() => action('auth-google')}>
              {t('auth.google')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!onTwitch) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-title">HimRate</div>
          <div className="panel-header-right">
            <LangSwitcher compact />
            <span className="panel-settings" aria-label={t('aria.settings')}>&#9881;&#65039;</span>
            <div className="panel-avatar" aria-label={t('aria.profile')}>U</div>
          </div>
        </div>
        <div className="panel-content screen-content-centered">
          <h3 className="not-twitch-title">{t('popup.go_twitch')}</h3>
          <input
            type="text"
            className="search-input not-twitch-search"
            placeholder={t('search.placeholder')}
            disabled
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="panel">
      <Header currentTab={currentTab} onBack={() => setCurrentTab('overview')} />

      {/* Info banner — outside panel-content for sticky behavior (Design Spec deviation: documented) */}
      {!bannerDismissed && (
        <div className="banner-wrap">
          <div className="info-banner">
            <span>{t('sp.link_twitch')}</span>
            <button
              className="info-banner-close"
              aria-label={t('aria.dismiss')}
              onClick={() => { setBannerDismissed(true); dismissBanner(); }}
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      {/* Tab Bar — outside panel-content for sticky behavior (Design Spec deviation: documented) */}
      <TabBar tabs={TABS} currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab as TabId)} />

      {/* Content */}
      <div className="panel-content" role="tabpanel">
        <div className="content-placeholder">
          <span>{t(`tab.${currentTab}`)} {t('tab.placeholder_suffix')}</span>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Header({ currentTab, onBack }: { currentTab: string; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="panel-header">
      <div className="panel-header-left">
        {currentTab !== 'overview' && (
          <button className="panel-header-back" onClick={onBack} aria-label={t('aria.back')}>
            &#8592;
          </button>
        )}
        <span className="panel-header-title">{t(`tab.${currentTab}`)}</span>
      </div>
      <div className="panel-header-right">
        <LangSwitcher compact />
        <span className="panel-settings" aria-label={t('aria.settings')}>&#9881;&#65039;</span>
        <div className="panel-avatar" aria-label={t('aria.profile')}>U</div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <div className="panel-footer">
      <a href="#" className="footer-link">{t('footer.support')}</a>
      <div className="panel-footer-right">
        <a href="#" className="footer-link">{t('footer.feedback')}</a>
        <a href="#" className="footer-link">{t('footer.youtube')}</a>
        <a href="#" className="footer-link">{t('footer.telegram')}</a>
      </div>
    </div>
  );
}
