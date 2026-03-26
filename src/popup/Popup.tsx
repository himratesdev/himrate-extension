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
      className="search-input compact"
    />
  );
}

// Shared left column: avatar + name + rating
function LeftColumn({ displayName = '', avatarLetter = '', isOffline = false }: { displayName?: string; avatarLetter?: string; isOffline?: boolean }) {
  const { t } = useTranslation();
  const name = displayName || t('placeholder.null');
  const letter = avatarLetter || (displayName ? displayName[0].toUpperCase() : t('placeholder.null'));
  return (
    <div className="col-left">
      <div className={`avatar${isOffline ? ' gray' : ''}`} aria-label="Streamer avatar">{letter}</div>
      <div className="streamer-name">{name}</div>
      <div className="rating-wrap">
        <div className="rating-btn" aria-label="Rating" onClick={() => void 0 /* Phase 2: open overview */}>
          {t('placeholder.null')}
        </div>
        <span className="rating-label">{t('label.streamer_rating_short')}</span>
      </div>
    </div>
  );
}

export function Popup() {
  const { t } = useTranslation();
  // Phase 2: state computed from auth status + content script URL + API stream status
  // Scaffold: defaults to not_logged_in (no auth implemented yet)
  const [state] = useState<PopupState>('not_logged_in');

  const showSearch = ['live_guest', 'live_registered'].includes(state);

  return (
    <div className="screen">
      {/* Header */}
      <div className="screen-header">
        <div className="logo-header">{t('app.title')}</div>
        {showSearch ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SearchBar disabled={state === 'live_guest'} />
            <LangSwitcher />
          </div>
        ) : (
          <LangSwitcher />
        )}
      </div>

      {/* Content */}
      <div className={`screen-content${['not_logged_in', 'not_twitch', 'error'].includes(state) ? ' screen-content-centered' : ''}`}>
        {state === 'not_logged_in' && <NotLoggedIn />}
        {state === 'live_guest' && <LiveGuest />}
        {state === 'live_registered' && <LiveRegistered />}
        {state === 'offline' && <Offline />}
        {state === 'not_twitch' && <NotTwitch />}
        {state === 'skeleton' && <SkeletonState />}
        {state === 'error' && <ErrorState />}
      </div>

      {/* Footer */}
      <div className="screen-footer">
        <a href="#" className="footer-link" onClick={() => void 0 /* Phase 2: open support */}>{t('footer.support')}</a>
      </div>
    </div>
  );
}

function NotLoggedIn() {
  const { t } = useTranslation();
  return (
    <>
      <h3 style={{ fontSize: '22px', marginBottom: '4px' }}>{t('app.title')}</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>{t('app.subtitle')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <button className="btn btn-twitch" onClick={() => void 0 /* Phase 2: auth twitch */}>
          {t('auth.twitch')}
        </button>
        <button className="btn btn-google" onClick={() => void 0 /* Phase 2: auth google */}>
          {t('auth.google')}
        </button>
      </div>
    </>
  );
}

function RightColumnLive({ isRegistered = false }: { isRegistered?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="col-right">
      <div className="stream-status">
        <div className="live-dot" />
        <span className="live-text">{t('label.live')}</span>
      </div>
      {/* Data label with info trigger */}
      <div className="data-label data-label-primary">
        <span className="info-wrap">
          <span>{t('label.real_viewers')}</span>
          <span className="info-trigger">i</span>
          <div className="info-tooltip">{t('tooltip.data_disclaimer')}</div>
        </span>
      </div>
      <div className="erv-hero placeholder">{t('placeholder.null')}</div>
      {/* Twitch online */}
      <div className="data-label data-label-secondary">
        <span>{t('label.twitch_online')}</span> {t('placeholder.null')}
      </div>
      {/* ERV badge (clickable) */}
      <div className="erv-badge-wrap">
        <span
          className="erv-badge neutral clickable"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            // Phase 2: chrome.sidePanel.open() + navigate to Overview tab
            chrome.runtime.sendMessage({ action: 'open_sidepanel', tab: 'overview' }).catch(() => {});
          }}
          role="button"
          tabIndex={0}
        >
          {t('placeholder.null')}
        </span>
      </div>
      {isRegistered && (
        <div style={{ marginTop: '6px' }}>
          <span className="tag">{t('popup.realtime')}</span>
        </div>
      )}
    </div>
  );
}

function LiveGuest() {
  const { t } = useTranslation();
  return (
    <>
      <div className="two-col">
        <LeftColumn />
        <RightColumnLive isRegistered={false} />
      </div>
      <button className="btn btn-primary" onClick={() => void 0 /* Phase 2: open sidepanel */}>
        {t('popup.cta_guest')}
      </button>
      <button className="btn btn-secondary" onClick={() => void 0 /* Phase 2: auth twitch */}>
        {t('auth.login')}
      </button>
    </>
  );
}

function LiveRegistered() {
  const { t } = useTranslation();
  return (
    <>
      <div className="two-col">
        <LeftColumn />
        <RightColumnLive isRegistered={true} />
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => void 0 /* Phase 2: open channel */}>
          {t('popup.cta_channel')}
        </button>
        <button className="btn btn-secondary" onClick={() => void 0 /* Phase 2: open my analytics */}>
          {t('popup.cta_my')}
        </button>
      </div>
      <button className="btn btn-tertiary" onClick={() => void 0 /* Phase 2: add to watchlist */}>
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
      <div className="two-col">
        <LeftColumn isOffline={true} />
        <div className="col-right">
          <div className="stream-status">
            <span className="offline-text">{t('popup.stream_ended')}</span>
          </div>
          {/* Data label with info trigger */}
          <div className="data-label data-label-primary">
            <span className="info-wrap">
              <span>{t('label.real_viewers')}</span>
              <span className="info-trigger">i</span>
              <div className="info-tooltip">{t('tooltip.data_disclaimer')}</div>
            </span>
          </div>
          <div className="erv-hero placeholder">{t('placeholder.null')}</div>
          {/* ERV badge */}
          <div className="erv-badge-wrap">
            <span
              className="erv-badge neutral clickable"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                chrome.runtime.sendMessage({ action: 'open_sidepanel', tab: 'overview' }).catch(() => {});
              }}
              role="button"
              tabIndex={0}
            >
              {t('placeholder.null')}
            </span>
          </div>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => void 0 /* Phase 2: open last stream */}>
        {t('btn.last_stream_analytics')}
      </button>
    </>
  );
}

function NotTwitch() {
  const { t } = useTranslation();
  return (
    <>
      <h3 style={{ fontSize: '20px' }}>{t('popup.go_twitch')}</h3>
      <input
        type="text"
        className="search-input"
        placeholder={t('search.placeholder')}
        disabled
        style={{ marginTop: '16px' }}
      />
    </>
  );
}

function SkeletonState() {
  return (
    <div className="two-col" aria-busy="true" aria-label="Loading">
      <div className="col-left">
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2.5px solid var(--border-dark)' }} />
        <div className="skeleton" style={{ width: '60px', height: '12px' }} />
      </div>
      <div className="col-right">
        <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '40px', height: '12px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '60px', height: '16px' }} />
      </div>
    </div>
  );
}

function ErrorState() {
  const { t } = useTranslation();
  return (
    <>
      <div style={{ fontSize: '24px', marginBottom: '12px' }}>&#9888;&#65039;</div>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{t('popup.error')}</p>
      <button className="btn btn-secondary" style={{ width: 'auto', padding: '10px 32px' }} onClick={() => void 0 /* Phase 2: retry */}>
        {t('popup.retry')}
      </button>
    </>
  );
}
