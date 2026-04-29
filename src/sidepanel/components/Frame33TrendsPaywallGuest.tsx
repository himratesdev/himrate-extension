// LITERAL PORT — wireframe slim/33_screen-6-paywall-guest-avtorizaciya.html.
// Trends Guest Paywall — Twitch + Google sign-in CTAs.

import { useTranslation } from 'react-i18next';

interface Props {
  onTwitchSignIn?: () => void;
  onGoogleSignIn?: () => void;
}

export function Frame33TrendsPaywallGuest({ onTwitchSignIn, onGoogleSignIn }: Props) {
  const { t: _t } = useTranslation();

  return (
    <div
      className="sp-content"
      role="tabpanel"
      style={{ justifyContent: 'center', alignItems: 'center', gap: 20, textAlign: 'center' }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-20)" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>
          Войдите, чтобы увидеть тренды
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-50)', lineHeight: 1.5, maxWidth: 260, margin: '0 auto' }}>
          Как менялись реальные зрители и\u00a0рейтинг доверия стримера со\u00a0временем
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 260 }}>
        <button
          style={{
            width: '100%',
            padding: 10,
            background: '#5865F2',
            color: 'white',
            border: '2.5px solid var(--border-dark)',
            borderRadius: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={() => (onTwitchSignIn ? onTwitchSignIn() : chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' }))}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M11.64 5.93h.01c.13-.07.29-.04.39.07l.76 1.06c.1.14.07.34-.07.44l-.02.01c-.99.7-1.56 1.79-1.56 2.99 0 2.01 1.64 3.65 3.65 3.65s3.65-1.64 3.65-3.65c0-1.2-.57-2.29-1.56-2.99l-.02-.01a.31.31 0 0 1-.07-.44l.76-1.06a.31.31 0 0 1 .39-.07h.01c1.67 1.18 2.65 3.05 2.65 5.07 0 3.42-2.78 6.2-6.2 6.2s-6.2-2.78-6.2-6.2c0-2.02.98-3.89 2.65-5.07z" />
          </svg>
          Войти через Twitch
        </button>
        <button
          style={{
            width: '100%',
            padding: 10,
            background: 'white',
            color: 'var(--ink)',
            border: '2.5px solid var(--border-dark)',
            borderRadius: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={() => (onGoogleSignIn ? onGoogleSignIn() : chrome.runtime.sendMessage({ action: 'AUTH_GOOGLE' }))}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Войти через Google
        </button>
      </div>
    </div>
  );
}
