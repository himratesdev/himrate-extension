import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '../shared/components/LangSwitcher';
import { TabBar } from './components/TabBar';

const TABS = ['overview', 'trends', 'audience', 'watchlists', 'compare', 'overlap', 'botraid', 'settings'] as const;
type TabId = typeof TABS[number];

export function SidePanel() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabId>('overview');
  const [loggedIn] = useState(true); // Scaffold: always logged in for demo
  const [onTwitch] = useState(true); // Scaffold: always on Twitch
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (!loggedIn) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header currentTab="overview" onBack={() => {}} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>{t('sp.login_required')}</p>
          <button style={{ width: '100%', maxWidth: '280px', padding: '10px', marginBottom: '8px', background: '#9146FF', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {t('auth.twitch')}
          </button>
          <button style={{ width: '100%', maxWidth: '280px', padding: '10px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {t('auth.google')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!onTwitch) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header currentTab="overview" onBack={() => {}} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📺</div>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('popup.go_twitch')}</p>
          <input type="text" placeholder={t('search.placeholder')} style={{ width: '100%', maxWidth: '280px', padding: '10px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', marginTop: '16px' }} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentTab={currentTab} onBack={() => setCurrentTab('overview')} />

      {/* Info banner */}
      {!bannerDismissed && (
        <div style={{ background: '#EFF6FF', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DBEAFE' }}>
          <span style={{ fontSize: '12px', color: '#1D4ED8' }}>{t('sp.link_twitch')}</span>
          <button onClick={() => setBannerDismissed(true)} aria-label={t('aria.dismiss')} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* Tab Bar */}
      <TabBar tabs={TABS} currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab as TabId)} />

      {/* Content */}
      <div role="tabpanel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ fontSize: '14px', color: '#a3a3a3' }}>
          {t(`tab.${currentTab}`)} {t('tab.placeholder_suffix')}
        </p>
      </div>

      <Footer />
    </div>
  );
}

function Header({ currentTab, onBack }: { currentTab: string; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '8px 12px', borderBottom: '2px solid #0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {currentTab !== 'overview' && (
          <button onClick={onBack} aria-label={t('aria.back')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#525252', padding: '4px' }}>
            ←
          </button>
        )}
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{t(`tab.${currentTab}`)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <LangSwitcher />
        <button aria-label={t('aria.settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#525252' }}>⚙</button>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label={t('aria.profile')}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '10px' }}>U</span>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <div style={{ borderTop: '1px solid #e5e5e5', padding: '8px 12px', display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '9px', color: '#a3a3a3' }}>
      <a href="#" style={{ color: '#a3a3a3', textDecoration: 'none' }}>{t('footer.support')}</a>
      <span>·</span>
      <a href="#" style={{ color: '#a3a3a3', textDecoration: 'none' }}>{t('footer.feedback')}</a>
      <span>·</span>
      <span>{t('footer.youtube')}</span>
      <span>·</span>
      <span>{t('footer.telegram')}</span>
    </div>
  );
}
