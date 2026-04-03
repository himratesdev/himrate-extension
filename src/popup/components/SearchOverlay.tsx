// TASK-034/077: Popup Search overlay.
// FR-009: 2 variants (Guest/Registered), unified buttons without prices.
// FR-010: SearchLikeButton (SVG heart) on each result.
// FR-011: Favorites section at top of empty search.

import { useState, useEffect, useRef, useCallback } from 'react';
import { type SearchResult } from '../../shared/api';
import { api } from '../../shared/api';
import { useTranslation } from 'react-i18next';
import { SEARCH_DEBOUNCE_MS } from '../../shared/config';
import { SearchLikeButton } from './SearchLikeButton';

interface Props {
  onClose: () => void;
  isGuest: boolean;
  tier: string;
}

export function SearchOverlay({ onClose, isGuest, tier: _tier }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
    // Load favorites from storage
    chrome.storage.local.get('favorite_channels').then(data => {
      setFavorites((data.favorite_channels as string[]) || []);
    });
  }, []);

  const toggleFavorite = async (login: string, liked: boolean) => {
    const updated = liked
      ? [...new Set([...favorites, login])]
      : favorites.filter(f => f !== login);
    setFavorites(updated);
    await chrome.storage.local.set({ favorite_channels: updated });
  };

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(false);
    setSearched(true);

    try {
      const gqlResults = await new Promise<Array<{
        login: string; displayName: string; profileImageURL: string;
        stream: { viewersCount: number; game: { name: string } | null } | null;
      }>>((resolve) => {
        chrome.runtime.sendMessage({ action: 'SEARCH_STREAMERS', query: q }, (res) => {
          resolve(res?.results || []);
        });
      });

      if (abortRef.current?.signal.aborted) return;

      const enriched: SearchResult[] = await Promise.all(
        gqlResults.slice(0, 5).map(async (r) => {
          const trust = await api.getTrust(r.login).catch(() => null);
          return {
            login: r.login,
            display_name: r.displayName,
            avatar_url: r.profileImageURL || null,
            is_live: !!r.stream,
            viewers_count: r.stream?.viewersCount ?? null,
            game_name: r.stream?.game?.name ?? null,
            ti_score: trust?.ti_score ?? null,
            erv_percent: trust?.erv_percent ?? null,
            erv_label: trust?.erv_label ?? null,
            erv_label_color: trust?.erv_label_color ?? null,
            rating_score: trust?.streamer_rating?.score ?? null,
          };
        })
      );

      if (!abortRef.current?.signal.aborted) {
        setResults(enriched);
        setLoading(false);
      }
    } catch {
      if (!abortRef.current?.signal.aborted) {
        setError(true);
        setLoading(false);
      }
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), SEARCH_DEBOUNCE_MS);
  };

  const handleNavigate = (login: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { url: `https://twitch.tv/${login}` });
      }
    });
    window.close();
  };

  const handleGuestCTA = () => {
    chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
  };

  const ervColorClass = (color: string | null) => {
    if (color === 'green') return 'green';
    if (color === 'yellow') return 'yellow';
    if (color === 'red') return 'red';
    return '';
  };

  return (
    <div className="search-overlay">
      <div className="search-overlay-header">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={t('search.hint')}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', boxShadow: '1px 1px 0 var(--border-dark)' }}
        />
        <button className="search-close-btn" onClick={onClose} aria-label={t('aria.search_close')}>
          &times;
        </button>
      </div>

      <div className="search-body">
        {/* Empty state: favorites + hint */}
        {!searched && !loading && (
          <>
            {favorites.length > 0 && (
              <div className="search-favorites">
                <div className="search-favorites-title">{t('search.favorites')}</div>
                {favorites.map(login => (
                  <div key={login} className="search-result-item" onClick={() => handleNavigate(login)}>
                    <div className="search-avatar-wrap">
                      <div className="search-avatar" style={{ background: 'var(--color-avatar-fallback)' }}>
                        {login[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{login}</div>
                    </div>
                    <SearchLikeButton login={login} isLiked={true} onToggle={toggleFavorite} isGuest={isGuest} />
                  </div>
                ))}
              </div>
            )}
            <div className="search-hint">{t('search.hint')}</div>
          </>
        )}

        {/* Loading skeleton */}
        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-circle" />
                <div className="skeleton-lines">
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="search-error">
            <div className="search-error-icon">!</div>
            <div className="search-error-text">{t('search.error')}</div>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '12px', width: 'auto', marginTop: '8px' }}
              onClick={() => doSearch(query)}>
              {t('search.retry')}
            </button>
          </div>
        )}

        {/* No results */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="search-error">
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{t('search.no_results')}</div>
            <div className="search-error-text" style={{ marginTop: '4px' }}>{t('search.no_results_hint')}</div>
          </div>
        )}

        {/* Results — FR-009: unified CTA for Guest and Registered */}
        {results.map((r) => (
          <div key={r.login} className="search-result-item">
            <div className="search-avatar-wrap">
              <div className="search-avatar" style={{ background: r.avatar_url ? undefined : 'var(--color-avatar-fallback)' }}>
                {r.avatar_url
                  ? <img src={r.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (r.display_name?.[0] || '?').toUpperCase()
                }
              </div>
              {r.rating_score !== null && (
                <span className="search-rating">{r.rating_score}</span>
              )}
            </div>
            <div className="search-result-info">
              <div className="search-result-name">{r.display_name}</div>
              {r.game_name && <div className="search-result-game">{r.game_name}</div>}
              <div className="search-result-meta">
                {r.is_live && (
                  <span className="search-result-live">
                    <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                    <span>{r.viewers_count?.toLocaleString() ?? '—'}</span>
                  </span>
                )}
                {r.ti_score !== null && <span> · TI {r.ti_score}</span>}
                {r.erv_percent !== null && (
                  <span className={`search-result-erv ${ervColorClass(r.erv_label_color)}`} style={{ marginLeft: '4px' }}>
                    {Math.round(r.erv_percent)}%
                  </span>
                )}
              </div>
              <div className="search-result-cta">
                <button className="search-btn search-btn-primary"
                  onClick={isGuest ? handleGuestCTA : () => handleNavigate(r.login)}>
                  {t('search.cta.full_analytics')}
                </button>
                <button className="search-btn search-btn-secondary"
                  onClick={isGuest ? handleGuestCTA : undefined}>
                  {t('search.cta.report')}
                </button>
                <button className="search-btn search-btn-secondary"
                  onClick={isGuest ? handleGuestCTA : undefined}>
                  {t('search.cta.add_channel')}
                </button>
              </div>
            </div>
            <span className={`search-result-erv ${ervColorClass(r.erv_label_color)}`}>
              {r.erv_percent !== null ? `${Math.round(r.erv_percent)}%` : ''}
            </span>
            <SearchLikeButton
              login={r.login}
              isLiked={favorites.includes(r.login)}
              onToggle={toggleFavorite}
              isGuest={isGuest}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
