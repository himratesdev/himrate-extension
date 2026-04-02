// TASK-034 FR-018: Mini-trend ↑↓→ next to TI.

import { useTranslation } from 'react-i18next';

interface Props {
  current: number | null;
  previous: number | null;
}

export function TrendIndicator({ current, previous }: Props) {
  const { t } = useTranslation();
  if (current === null || previous === null) return null;

  const diff = current - previous;
  const threshold = 2;

  if (diff > threshold) {
    return <span className="trend-arrow trend-up" title={t('popup.trend_up')}>↑</span>;
  }
  if (diff < -threshold) {
    return <span className="trend-arrow trend-down" title={t('popup.trend_down')}>↓</span>;
  }
  return <span className="trend-arrow trend-stable" title={t('popup.trend_stable')}>→</span>;
}
