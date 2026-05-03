// BUG-016 PR-1a: Watchlist Button + Dropdown canonical (frame 27).
// Wireframe: wireframe-frames/27_Interactive_WatchlistDropdown.html.
// Click "★ В списке / Add to list" → dropdown overlay с list options:
// - 3 watchlist items (active highlighted with green border-left + bg)
// - Footer: "Создать новый список" / "Открыть Watchlists"
// FR-021: 300ms debounce on toggle.

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import type { WatchlistItem } from '../../shared/api';

interface Props {
  channelId: string | null;
  isWatched: boolean;
  onOpenWatchlists?: () => void;
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      className="ico ico-sm"
      viewBox="0 0 24 24"
      style={{
        verticalAlign: '-0.2em',
        strokeWidth: 1.5,
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
      }}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function WatchlistButton({ channelId, isWatched: initialIsWatched, onOpenWatchlists }: Props) {
  const { t } = useTranslation();
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load watchlists when dropdown opens (lazy fetch)
  useEffect(() => {
    if (!open || watchlists.length > 0) return;
    api.getWatchlists().then((wls) => {
      if (wls) setWatchlists(wls);
    }).catch(() => {});
  }, [open, watchlists.length]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggleAdd = useCallback(() => {
    if (!channelId || loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!channelId || loading) return;
      setLoading(true);
      setError(null);

      if (isWatched) {
        const result = await api.untrackChannel(channelId);
        if (result.success) setIsWatched(false);
        else setError(t('popup.error'));
      } else {
        const result = await api.trackChannel(channelId);
        if (result.success) setIsWatched(true);
        else if (result.error === 'subscription_required') setError(t('sp.login_required'));
        else setError(t('popup.error'));
      }

      setLoading(false);
    }, 300);
  }, [channelId, loading, isWatched, t]);

  return (
    <div ref={wrapperRef} className="sp-watchlist-wrap">
      <button
        className={`sp-watchlist-btn${isWatched ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading || !channelId}
        aria-label={isWatched ? t('aria.favorite_remove') : t('aria.favorite_add')}
        aria-pressed={isWatched}
        aria-expanded={open}
      >
        <StarIcon filled={isWatched} /> {isWatched ? t('sp.watchlist_remove') : t('sp.watchlist_add')}{' '}
        <span style={{ fontSize: 9, marginLeft: 2 }}>▾</span>
      </button>
      {open && (
        <div className="sp-watchlist-dropdown" role="menu">
          <div className="sp-watchlist-dropdown-header">{t('sp.watchlist_my_lists')}</div>
          <div className="sp-watchlist-dropdown-list">
            {watchlists.length === 0 ? (
              <div className="sp-watchlist-dropdown-empty">{t('sp.watchlist_empty_lists')}</div>
            ) : (
              watchlists.map((wl) => {
                // Without per-channel membership data, mark first list active when isWatched
                const isInList = isWatched && watchlists[0]?.id === wl.id;
                return (
                  <div
                    key={wl.id}
                    className={`sp-watchlist-dropdown-item${isInList ? ' active' : ''}`}
                    onClick={handleToggleAdd}
                    role="menuitem"
                  >
                    <StarIcon filled={isInList} />
                    <div className="sp-watchlist-dropdown-item-text">
                      <div className="sp-watchlist-dropdown-item-name">{wl.name}</div>
                      {/* Subtitle from wl description if available */}
                    </div>
                    <span className="sp-watchlist-dropdown-item-count">
                      {t('sp.watchlist_channel_count', { count: wl.channels_count })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="sp-watchlist-dropdown-footer">
            <button
              className="sp-watchlist-dropdown-action"
              onClick={() => {
                setOpen(false);
                onOpenWatchlists?.();
              }}
            >
              {t('sp.watchlist_open_tab')}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div role="alert" className="sp-watchlist-error">{error}</div>
      )}
    </div>
  );
}
