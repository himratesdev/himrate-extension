// BUG-016 PR-1 Section 6: WatchlistButton canonical match (wireframe lines 2099-2102).
// Wireframe: side-panel-wireframe-TASK-039.html sp-watchlist-btn.
// Canonical: sp-watchlist-btn + .active modifier + star polygon SVG (NOT emoji ★).
// FREE for all registered users. Uses api.trackChannel / untrackChannel.
// FR-021: 300ms debounce on toggle.

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  channelId: string | null;
  isWatched: boolean;
}

function StarIcon() {
  return (
    <svg
      className="ico ico-sm"
      viewBox="0 0 24 24"
      style={{ verticalAlign: '-0.2em', strokeWidth: 1.5 }}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function WatchlistButton({ channelId, isWatched: initialIsWatched }: Props) {
  const { t } = useTranslation();
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = useCallback(() => {
    if (!channelId || loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!channelId || loading) return;
      setLoading(true);
      setError(null);

      if (isWatched) {
        const result = await api.untrackChannel(channelId);
        if (result.success) {
          setIsWatched(false);
        } else {
          setError(t('popup.error'));
        }
      } else {
        const result = await api.trackChannel(channelId);
        if (result.success) {
          setIsWatched(true);
        } else if (result.error === 'subscription_required') {
          setError(t('sp.login_required'));
        } else {
          setError(t('popup.error'));
        }
      }

      setLoading(false);
    }, 300);
  }, [channelId, loading, isWatched, t]);

  return (
    <>
      <button
        className={`sp-watchlist-btn${isWatched ? ' active' : ''}`}
        onClick={handleToggle}
        disabled={loading || !channelId}
        aria-label={isWatched ? t('aria.favorite_remove') : t('aria.favorite_add')}
        aria-pressed={isWatched}
      >
        <StarIcon /> {isWatched ? t('sp.watchlist_remove') : t('sp.watchlist_add')}
      </button>
      {error && (
        <div role="alert" style={{ fontSize: 11, color: 'var(--color-erv-red)', textAlign: 'center', marginTop: 4 }}>
          {error}
        </div>
      )}
    </>
  );
}
