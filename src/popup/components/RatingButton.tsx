// TASK-034: Rating button — circular 34px, clickable → Side Panel.

import { useTranslation } from 'react-i18next';

interface Props {
  score: number | null;
  color: string;
}

export function RatingButton({ score, color: _color }: Props) {
  const { t } = useTranslation();

  const handleClick = () => {
    chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'overview' });
  };

  const colorClass = score !== null
    ? score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'
    : '';

  return (
    <div className="rating-wrap">
      <button
        className={`rating-btn ${colorClass}`}
        onClick={handleClick}
        aria-label={t('label.streamer_rating', { N: score ?? '—' })}
      >
        {score !== null ? score : '—'}
      </button>
      <span className="rating-label">{t('label.streamer_rating_short')}</span>
    </div>
  );
}
