// TASK-034: Rating button — circular 34px, clickable → Side Panel.

interface Props {
  score: number | null;
  color: string;
}

export function RatingButton({ score, color: _color }: Props) {
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
        aria-label={`Streamer rating: ${score ?? '—'}`}
      >
        {score !== null ? score : '—'}
      </button>
      <span className="rating-label">рейтинг стримера</span>
    </div>
  );
}
