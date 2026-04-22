// TASK-039 Phase D1: Insufficient data empty state. Shown when channel <3 streams
// (SRS Edge Case #1) или aggregates не пропускают min threshold.

import { useTranslation } from 'react-i18next';

interface Props {
  /** i18n key suffix for specific message, e.g. 'min_3_streams', 'min_7_streams'. Default 'min_3_streams'. */
  reasonKey?: string;
}

export function InsufficientData({ reasonKey = 'min_3_streams' }: Props) {
  const { t } = useTranslation();
  return (
    <div className="trends-empty-state">
      <div className="trends-empty-icon">📊</div>
      <div className="trends-empty-title">{t('trends.empty.title')}</div>
      <div className="trends-empty-reason">{t(`trends.empty.${reasonKey}`)}</div>
    </div>
  );
}
