// BUG-016 PR-1 Section 10: ErrorOverview canonical match (wireframe lines 3498-3531).
// Wireframe: side-panel-wireframe-TASK-039.html state-center + state-icon.error-icon
// + state-title + state-subtitle + btn-primary retry.

import { useTranslation } from 'react-i18next';

export function ErrorOverview() {
  const { t } = useTranslation();

  const handleRetry = () => {
    chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' });
  };

  return (
    <div className="state-center">
      <div className="state-icon error-icon" aria-hidden="true">
        !
      </div>
      <div className="state-title">{t('sp.error_title')}</div>
      <div className="state-subtitle">{t('popup.error_subtitle')}</div>
      <button
        className="btn btn-primary"
        style={{ padding: '10px 32px', width: 'auto' }}
        onClick={handleRetry}
      >
        {t('popup.retry')}
      </button>
    </div>
  );
}
