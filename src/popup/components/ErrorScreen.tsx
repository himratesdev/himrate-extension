// TASK-034: Error screen — API unavailable / timeout.

import { useTranslation } from 'react-i18next';

interface Props {
  onRetry: () => void;
}

export function ErrorScreen({ onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <div className="state-center">
      <div className="state-icon error-icon">!</div>
      <div className="state-title">{t('popup.error')}</div>
      <div className="state-subtitle">{t('popup.error_subtitle')}</div>
      <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 32px', marginTop: '6px' }}
        onClick={onRetry}>
        {t('popup.retry')}
      </button>
    </div>
  );
}
