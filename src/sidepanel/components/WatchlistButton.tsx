// TASK-035 FR-009: Watchlist toggle button — star bookmark.
// FREE for all registered users. Uses api.trackChannel / untrackChannel.

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  channelId: string | null;
  isWatched: boolean;
}

export function WatchlistButton({ channelId, isWatched: initialIsWatched }: Props) {
  const { t } = useTranslation();
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // N1 (FR-021): 300ms debounce on toggle to prevent rapid double-clicks
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
    <div className="sp-watchlist-wrap">
      <button
        className={`sp-watchlist-btn ${isWatched ? 'sp-watchlist-active' : ''}`}
        onClick={handleToggle}
        disabled={loading || !channelId}
        aria-label={isWatched ? t('aria.favorite_remove') : t('aria.favorite_add')}
        aria-pressed={isWatched}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          border: '2px solid #111',
          borderRadius: '6px',
          background: isWatched ? '#111' : '#fff',
          color: isWatched ? '#fff' : '#111',
          fontWeight: 600,
          fontSize: '13px',
          cursor: loading ? 'wait' : 'pointer',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '15px' }}>{isWatched ? '★' : '☆'}</span>
        {isWatched ? t('popup.watchlist_added') : t('popup.watchlist')}
      </button>
      {error && (
        <div style={{ fontSize: '11px', color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
