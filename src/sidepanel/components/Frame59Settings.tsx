// LITERAL PORT — wireframe slim/59_settings.html.
// Settings: Account + Upgrade tiers (Premium/Business) + Notifications + Language + Data + Links.
// NOTE: «Бот-атаки» toggle replaced with «Аномалии трафика» per CLAUDE.md ERV labels v3.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  userName?: string;
  userTier?: string;
  authProvider?: string;
  language?: 'ru' | 'en';
  notificationAnomalies?: boolean;
  notificationRaids?: boolean;
  notificationWatchlistLive?: boolean;
  autoRefresh?: boolean;
  version?: string;
  onUpgradePremium?: () => void;
  onUpgradeBusiness?: () => void;
  onComparePlans?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onSetLanguage?: (lang: 'ru' | 'en') => void;
  onToggleNotification?: (key: 'anomalies' | 'raids' | 'watchlist_live', value: boolean) => void;
  onToggleAutoRefresh?: (value: boolean) => void;
}

export function Frame59Settings({
  userName = 'user_name',
  userTier = 'Free',
  authProvider = 'Twitch привязан',
  language: initialLanguage = 'ru',
  notificationAnomalies: initialAnomalies = true,
  notificationRaids: initialRaids = true,
  notificationWatchlistLive: initialWatchlist = false,
  autoRefresh: initialAutoRefresh = true,
  version = 'v1.0.0',
  onUpgradePremium,
  onUpgradeBusiness,
  onComparePlans,
  onOpenPrivacy,
  onOpenTerms,
  onSetLanguage,
  onToggleNotification,
  onToggleAutoRefresh,
}: Props) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<'ru' | 'en'>(initialLanguage);
  const [anomalies, setAnomalies] = useState(initialAnomalies);
  const [raids, setRaids] = useState(initialRaids);
  const [watchlistLive, setWatchlistLive] = useState(initialWatchlist);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);

  const setLang = (l: 'ru' | 'en') => { setLanguage(l); onSetLanguage?.(l); };

  const renderToggle = (label: string, value: boolean, onClick: () => void, isLast = false) => (
    <div onClick={onClick} role="button" aria-checked={value}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: isLast ? undefined : '1px solid var(--border-light)', cursor: 'pointer' }}>
      <span style={{ fontSize: 11 }}>{label}</span>
      <span style={{ fontSize: 10, color: value ? 'var(--color-erv-green)' : 'var(--ink-30)', fontWeight: 600 }}>{value ? 'Вкл' : 'Выкл'}</span>
    </div>
  );

  return (
    <div className="sp-content" role="tabpanel">
      {/* Account */}
      <div className="sp-signals" style={{ gap: 8 }}>
        <div className="sp-signals-title">{t('settings.account')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-avatar-fallback)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>{userName.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{userName}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>{userTier} план · {authProvider}</div>
          </div>
        </div>

        {/* Upgrade Premium */}
        <div style={{ border: '2px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '10px 12px', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#4f46e5' }}>Premium · per channel</div>
            <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>$9.99/мес за&nbsp;каждый канал</div>
          </div>
          <button onClick={() => onUpgradePremium?.()} style={{ padding: '7px 12px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid #4f46e5', borderRadius: 8, background: '#4f46e5', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>$9.99/мес</button>
        </div>

        {/* Upgrade Business */}
        <div style={{ border: '2.5px solid #1a1a1a', borderRadius: 10, padding: '10px 12px', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1e5e 100%)', color: 'white', position: 'relative', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ background: '#22c55e', color: 'white', fontSize: 8, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", padding: '3px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: 6 }}>{t('settings.recommended')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#a5b4fc' }}>Business · до&nbsp;50 каналов</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Для агентств и&nbsp;брендов</div>
            </div>
            <button onClick={() => onUpgradeBusiness?.()} style={{ padding: '7px 12px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid white', borderRadius: 8, background: 'white', color: '#1a1a1a', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>$99/мес</button>
          </div>
        </div>

        <div style={{ fontSize: 10, textAlign: 'center', paddingTop: 2 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onComparePlans?.(); }} style={{ color: '#6366f1', textDecoration: 'underline' }}>Сравнить планы →</a>
        </div>
      </div>

      {/* Notifications */}
      <div className="sp-signals" style={{ gap: 6 }}>
        <div className="sp-signals-title">{t('settings.notifications')}</div>
        {renderToggle('Аномалии зрителей', anomalies, () => { setAnomalies(!anomalies); onToggleNotification?.('anomalies', !anomalies); })}
        {renderToggle('Аномалии трафика', raids, () => { setRaids(!raids); onToggleNotification?.('raids', !raids); })}
        {renderToggle('Стрим в\u00a0watchlist начался', watchlistLive, () => { setWatchlistLive(!watchlistLive); onToggleNotification?.('watchlist_live', !watchlistLive); }, true)}
      </div>

      {/* Language */}
      <div className="sp-signals" style={{ gap: 6 }}>
        <div className="sp-signals-title">{t('settings.language_interface')}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['ru', 'en'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`sp-tab ${language === l ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: 10, borderRadius: 20, border: language === l ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-light)' }}
            >{l === 'ru' ? 'Русский' : 'English'}</button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="sp-signals" style={{ gap: 6 }}>
        <div className="sp-signals-title">{t('settings.data')}</div>
        {renderToggle('Автообновление (30с)', autoRefresh, () => { setAutoRefresh(!autoRefresh); onToggleAutoRefresh?.(!autoRefresh); }, true)}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onOpenPrivacy?.(); }} style={{ fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none' }}>{t('settings.privacy_policy')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onOpenTerms?.(); }} style={{ fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none' }}>{t('settings.terms')}</a>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', marginTop: 4 }}>HimRate Extension {version} · © 2026</div>
      </div>
    </div>
  );
}
