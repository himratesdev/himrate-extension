// LITERAL PORT — wireframe slim/47_screen-18-dostup-otozvan.html.
// Red OAuth revoked banner + Reconnect Twitch CTA + heavily dimmed module preview.

import { useTranslation } from 'react-i18next';

interface Props {
  onReconnect?: () => void;
}

export function Frame47TrendsOauthRevoked({ onReconnect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ border: '2px solid #EF4444', borderRadius: 8, padding: 12, background: '#FEF2F2' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
            <polygon points="8,2 14,13 2,13" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 7v2.5M8 11.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{t('trends.oauth_revoked.title')}</div>
            <div style={{ fontSize: 10, color: '#991B1B', marginTop: 2 }}>Данные могут быть устаревшими. Переподключите Twitch для\u00a0обновления.</div>
          </div>
        </div>
        <button
          onClick={() => (onReconnect ? onReconnect() : chrome.runtime.sendMessage({ action: 'TWITCH_RECONNECT' }))}
          style={{ width: '100%', marginTop: 10, padding: 10, background: '#5865F2', color: 'white', border: '2.5px solid var(--border-dark)', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M11.64 5.93h.01c.13-.07.29-.04.39.07l.76 1.06c.1.14.07.34-.07.44l-.02.01c-.99.7-1.56 1.79-1.56 2.99 0 2.01 1.64 3.65 3.65 3.65s3.65-1.64 3.65-3.65c0-1.2-.57-2.29-1.56-2.99l-.02-.01a.31.31 0 0 1-.07-.44l.76-1.06a.31.31 0 0 1 .39-.07h.01c1.67 1.18 2.65 3.05 2.65 5.07 0 3.42-2.78 6.2-6.2 6.2s-6.2-2.78-6.2-6.2c0-2.02.98-3.89 2.65-5.07z" />
          </svg>
          Переподключить Twitch
        </button>
      </div>
      <div style={{ opacity: 0.2, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{t('erv.real_viewers_label')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>83%</div>
        </div>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{t('sp.trust_rating')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>77</div>
        </div>
      </div>
    </div>
  );
}
