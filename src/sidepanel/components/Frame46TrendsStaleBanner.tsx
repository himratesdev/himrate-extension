// LITERAL PORT — wireframe slim/46_screen-17-dannye-obnovlyayutsya.html.
// Yellow stale banner + dimmed module cards (preview).

import { useTranslation } from 'react-i18next';

interface Props {
  lastUpdatedRelative?: string;
}

export function Frame46TrendsStaleBanner({ lastUpdatedRelative = '2 часа назад' }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      {/* Warning banner */}
      <div style={{ border: '2px solid #EAB308', borderRadius: 8, padding: '10px 12px', background: '#FFFBEB', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="7" fill="none" stroke="#EAB308" strokeWidth="1.5" />
          <path d="M8 5v3.5M8 10.5v.5" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207' }}>{t('trends.stale.title')}</div>
          <div style={{ fontSize: 10, color: '#92400E', marginTop: 2 }}>Последнее обновление: {lastUpdatedRelative}</div>
        </div>
      </div>
      {/* Dimmed preview content */}
      <div style={{ opacity: 0.5, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600 }}>{t('erv.real_viewers_label')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#22C55E' }}>83%</div>
          <svg viewBox="0 0 80 20" style={{ width: '100%', height: 16 }} preserveAspectRatio="none">
            <path d="M0,14 L20,10 L40,8 L60,12 L80,6" stroke="#22C55E" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600 }}>{t('sp.trust_rating')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6' }}>77</div>
          <svg viewBox="0 0 80 20" style={{ width: '100%', height: 16 }} preserveAspectRatio="none">
            <path d="M0,6 L20,8 L40,10 L60,9 L80,14" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
