// TASK-039 Phase D1: Trends error state с retry button.

import { useTranslation } from 'react-i18next';

interface Props {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <div className="trends-error-state">
      <div className="trends-error-icon">⚠️</div>
      <div className="trends-error-message">{t('trends.errors.generic')}</div>
      <button type="button" className="trends-error-retry" onClick={onRetry}>
        {t('trends.errors.retry')}
      </button>
    </div>
  );
}
