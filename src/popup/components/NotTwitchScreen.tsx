// TASK-034: Not Twitch screen — user not on twitch.tv.
// Two variants: Guest (+ Sign In) and Logged In.
// Search bar stays active.

import { useTranslation } from 'react-i18next';

interface Props {
  isGuest: boolean;
}

export function NotTwitchScreen({ isGuest }: Props) {
  const { t } = useTranslation();
  return (
    <div className="screen-content" style={{ alignItems: 'center', textAlign: 'center', gap: '14px' }}>
      <div className="state-icon twitch-icon" style={{ width: '48px', height: '48px', fontSize: '22px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>H</span>
      </div>
      <div className="state-title" style={{ fontSize: '15px' }}>{t('not_twitch.title')}</div>
      <div className="state-subtitle" style={{ maxWidth: '240px' }}>{t('not_twitch.subtitle')}</div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary" style={{ width: '100%' }}
        onClick={() => chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' })}>
        {t('not_twitch.open_panel')}
      </button>
      {isGuest && (
        <button className="btn btn-secondary" style={{ width: '100%' }}
          onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}>
          {t('auth.login')}
        </button>
      )}
    </div>
  );
}
