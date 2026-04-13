// TASK-035 FR-014: Error screen for Overview tab — API unavailable / timeout.
// No props — retry fires GET_TRUST_DATA message to background.

import { useTranslation } from 'react-i18next';

export function ErrorOverview() {
  const { t } = useTranslation();

  const handleRetry = () => {
    chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' });
  };

  return (
    <div
      className="sp-error-overview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: '12px',
        textAlign: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid #ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 700,
          color: '#ef4444',
        }}
      >
        !
      </div>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>{t('sp.error')}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '220px' }}>
        {t('popup.error_subtitle')}
      </div>
      <button
        className="btn btn-primary"
        style={{ padding: '10px 32px', width: 'auto', marginTop: '4px' }}
        onClick={handleRetry}
      >
        {t('popup.retry')}
      </button>
    </div>
  );
}
