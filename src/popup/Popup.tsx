import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '../shared/components/LangSwitcher';

type PopupState = 'not_logged_in' | 'live_guest' | 'live_registered' | 'offline' | 'not_twitch' | 'skeleton' | 'error';

// S4: Search input in header for live states
function SearchBar({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <input
      type="text"
      disabled={disabled}
      placeholder={t('search.placeholder')}
      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '12px', background: disabled ? '#F9FAFB' : '#fff', color: disabled ? '#a3a3a3' : '#0a0a0a', marginBottom: '8px' }}
    />
  );
}

// S2: Shared left column component (DRY)
function LeftColumn() {
  const { t } = useTranslation();
  return (
    <div style={{ flex: '0 0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>S</span>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#0a0a0a', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>StreamerName</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#a3a3a3' }}>
          {t('placeholder.null')}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 500, color: '#525252' }}>{t('label.streamer_rating_short')}</span>
      </div>
    </div>
  );
}

export function Popup() {
  const { t } = useTranslation();
  const [state, setState] = useState<PopupState>('not_logged_in');

  const showSearch = ['live_guest', 'live_registered', 'offline'].includes(state);

  return (
    <div style={{ width: '360px', minHeight: '440px', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Dev state switcher - remove in production */}
      <select
        value={state}
        onChange={(e) => setState(e.target.value as PopupState)}
        style={{ fontSize: '10px', padding: '2px', margin: '4px', opacity: 0.5 }}
      >
        <option value="not_logged_in">Not Logged In</option>
        <option value="live_guest">Live Guest</option>
        <option value="live_registered">Live Registered</option>
        <option value="offline">Offline</option>
        <option value="not_twitch">Not on Twitch</option>
        <option value="skeleton">Skeleton</option>
        <option value="error">Error</option>
      </select>

      {/* Header with search (S4) */}
      <div style={{ padding: '16px', borderBottom: '2px solid #0a0a0a' }}>
        {showSearch && <SearchBar disabled={state === 'live_guest'} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em' }}>{t('app.title')}</span>
          <LangSwitcher />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px', gap: '12px' }}>
        {state === 'not_logged_in' && <NotLoggedIn />}
        {state === 'live_guest' && <LiveGuest />}
        {state === 'live_registered' && <LiveRegistered />}
        {state === 'offline' && <Offline />}
        {state === 'not_twitch' && <NotTwitch />}
        {state === 'skeleton' && <Skeleton />}
        {state === 'error' && <ErrorState />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '8px 16px', textAlign: 'center' }}>
        <a href="#" style={{ fontSize: '9px', color: '#a3a3a3', textDecoration: 'none' }}>{t('footer.support')}</a>
      </div>
    </div>
  );
}

function NotLoggedIn() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EBE8FD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color: '#4F36EE' }}>H</span>
      </div>
      <p style={{ fontSize: '13px', color: '#525252', marginBottom: '24px' }}>{t('app.subtitle')}</p>
      <button style={{ width: '100%', padding: '10px', marginBottom: '8px', background: '#9146FF', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('auth.twitch')}
      </button>
      <button style={{ width: '100%', padding: '10px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('auth.google')}
      </button>
    </div>
  );
}

function RightColumnLive({ isRegistered = false }: { isRegistered?: boolean }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase' }}>{t('label.live')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '12px', color: '#525252' }}>{t('label.real_viewers')}</span>
        <span title={t('tooltip.data_disclaimer')} style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #a3a3a3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, cursor: 'help', fontFamily: 'JetBrains Mono, monospace' }}>i</span>
      </div>
      <span style={{ fontSize: '28px', fontWeight: 600, color: '#0a0a0a' }}>{t('placeholder.null')}</span>
      <span style={{ fontSize: '14px', color: '#525252' }}>{t('label.twitch_online')} {t('placeholder.null')}</span>
      <div
        style={{ padding: '6px 10px', borderRadius: '8px', background: '#ECFDF5', cursor: 'pointer', display: 'inline-block' }}
        onClick={() => console.log('open:sidepanel')}
        role="button"
        tabIndex={0}
        aria-label={t('erv_label.green')}
      >
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', display: 'block' }}>{t('erv_label.green')}</span>
        <span style={{ fontSize: '9px', fontWeight: 500, color: '#059669', opacity: 0.85, display: 'block' }}>{t('placeholder.null')} {t('label.erv_suffix')}</span>
      </div>
      {isRegistered && (
        <span style={{ fontSize: '11px', color: '#a3a3a3' }}>{t('popup.realtime')}</span>
      )}
    </div>
  );
}

function LiveGuest() {
  const { t } = useTranslation();
  return (
    <>
      <div style={{ display: 'flex', gap: '14px' }}>
        <LeftColumn />
        <RightColumnLive isRegistered={false} />
      </div>
      <button style={{ width: '100%', padding: '10px', background: '#4F36EE', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('popup.cta_guest')}
      </button>
      <button style={{ width: '100%', padding: '10px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('auth.login')}
      </button>
    </>
  );
}

function LiveRegistered() {
  const { t } = useTranslation();
  return (
    <>
      <div style={{ display: 'flex', gap: '14px' }}>
        <LeftColumn />
        <RightColumnLive isRegistered={true} />
      </div>
      <button style={{ width: '100%', padding: '10px', background: '#4F36EE', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('popup.cta_channel')}
      </button>
      <button style={{ width: '100%', padding: '10px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('popup.cta_my')}
      </button>
      <button style={{ width: '100%', padding: '10px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('popup.watchlist')}
      </button>
    </>
  );
}

// S2: Offline reuses LeftColumn (DRY), S5: no hardcoded date
function Offline() {
  const { t } = useTranslation();
  return (
    <>
      <div style={{ display: 'flex', gap: '14px' }}>
        <LeftColumn />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#525252' }}>{t('popup.stream_ended')}</span>
          <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{t('popup.last_stream')} {t('placeholder.null')}</span>
          <div style={{ padding: '6px 10px', borderRadius: '8px', background: '#ECFDF5' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', display: 'block' }}>{t('offline.no_anomalies')}</span>
          </div>
        </div>
      </div>
      <button style={{ width: '100%', padding: '10px', background: '#4F36EE', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('btn.last_stream_analytics')}
      </button>
    </>
  );
}

function NotTwitch() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📺</div>
      <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('popup.go_twitch')}</p>
      <p style={{ fontSize: '13px', color: '#525252', marginBottom: '24px' }}>{t('popup.go_twitch_sub')}</p>
      <input
        type="text"
        placeholder={t('search.placeholder')}
        style={{ width: '100%', padding: '10px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px' }}
      />
    </div>
  );
}

// N1: Shimmer animation via CSS keyframes injected as style tag
const SHIMMER_STYLE = `@keyframes himrate-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}`;

function Skeleton() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
    backgroundSize: '400px 100%',
    animation: 'himrate-shimmer 1.5s infinite',
  };
  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div aria-busy="true" aria-label="Loading" style={{ display: 'flex', gap: '14px' }}>
        <div style={{ flex: '0 0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', ...shimmer }} />
          <div style={{ width: '60px', height: '12px', borderRadius: '4px', ...shimmer }} />
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', ...shimmer }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '120px', height: '12px', borderRadius: '4px', ...shimmer }} />
          <div style={{ width: '80px', height: '28px', borderRadius: '4px', ...shimmer }} />
          <div style={{ width: '140px', height: '12px', borderRadius: '4px', ...shimmer }} />
          <div style={{ width: '160px', height: '32px', borderRadius: '8px', ...shimmer }} />
        </div>
      </div>
    </>
  );
}

function ErrorState() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '13px', color: '#525252', marginBottom: '16px' }}>{t('popup.error')}</p>
      <button style={{ padding: '10px 24px', background: '#fff', color: '#0a0a0a', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {t('popup.retry')}
      </button>
    </div>
  );
}
