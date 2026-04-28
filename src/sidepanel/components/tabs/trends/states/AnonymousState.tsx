// BUG-016 PR-1a: AnonymousState canonical match (frame 33 — Trends Paywall Guest).
// Wireframe: wireframe-frames/33_Trends_PaywallGuestAuth.html.
// Lock icon 48×48 + title + subtitle + 2 OAuth buttons (Twitch + Google).

import { useTranslation } from 'react-i18next';

interface Props {
  onSignIn?: () => void;
}

function LockIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ink-20)"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TwitchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M11.64 5.93h.01c.13-.07.29-.04.39.07l.76 1.06c.1.14.07.34-.07.44l-.02.01c-.99.7-1.56 1.79-1.56 2.99 0 2.01 1.64 3.65 3.65 3.65s3.65-1.64 3.65-3.65c0-1.2-.57-2.29-1.56-2.99l-.02-.01a.31.31 0 0 1-.07-.44l.76-1.06a.31.31 0 0 1 .39-.07h.01c1.67 1.18 2.65 3.05 2.65 5.07 0 3.42-2.78 6.2-6.2 6.2s-6.2-2.78-6.2-6.2c0-2.02.98-3.89 2.65-5.07z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function AnonymousState({ onSignIn }: Props) {
  const { t } = useTranslation();
  const handleTwitch = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
    }
  };
  const handleGoogle = () => {
    chrome.runtime.sendMessage({ action: 'AUTH_GOOGLE' });
  };

  return (
    <div className="sp-anonymous-state" role="region" aria-label={t('trends.anonymous.aria')}>
      <LockIcon />
      <div>
        <div className="sp-anonymous-title">{t('trends.anonymous.title')}</div>
        <div className="sp-anonymous-message">{t('trends.anonymous.message')}</div>
      </div>
      <div className="sp-oauth-stack">
        <button className="sp-oauth-btn twitch" onClick={handleTwitch}>
          <TwitchGlyph />
          {t('auth.twitch')}
        </button>
        <button className="sp-oauth-btn google" onClick={handleGoogle}>
          <GoogleGlyph />
          {t('auth.google')}
        </button>
      </div>
    </div>
  );
}
