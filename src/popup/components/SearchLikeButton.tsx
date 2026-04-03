// TASK-077 FR-015: SearchLikeButton — SVG heart for favorites.
// Stroke = not favorited, Fill = favorited. Guest click → auth redirect.

interface Props {
  login: string;
  isLiked: boolean;
  onToggle: (login: string, liked: boolean) => void;
  isGuest?: boolean;
}

export function SearchLikeButton({ login, isLiked, onToggle, isGuest }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
      return;
    }
    onToggle(login, !isLiked);
  };

  return (
    <button
      className="search-like-btn"
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16"
        fill={isLiked ? 'var(--color-erv-red)' : 'none'}
        stroke={isLiked ? 'var(--color-erv-red)' : 'var(--ink-30)'}
        strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
