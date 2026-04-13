// TASK-035 FR-016: "You're not on Twitch" screen for Overview tab.
// Search hint. No props.

import { useTranslation } from 'react-i18next';

export function NotTwitchOverview() {
  const { t } = useTranslation();

  return (
    <div
      className="sp-not-twitch"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: '14px',
        textAlign: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '3px solid #111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '22px',
        }}
      >
        H
      </div>

      <div style={{ fontWeight: 700, fontSize: '15px' }}>{t('not_twitch.title')}</div>

      <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '220px', lineHeight: '1.5' }}>
        {t('not_twitch.subtitle')}
      </div>

      <div
        style={{
          marginTop: '4px',
          padding: '8px 14px',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#6b7280',
          maxWidth: '220px',
        }}
      >
        {t('search.no_results_hint')}
      </div>
    </div>
  );
}
