// TASK-034: Action buttons row — Channel Analytics, My Analytics, Watchlist.
// Guest: "View full analytics" + "Sign in".

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  isGuest: boolean;
  isLive: boolean;
  channelId: string | null;
}

export function ActionButtons({ isGuest, isLive: _isLive, channelId }: Props) {
  const { t } = useTranslation();
  const [watchlisted, setWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Load actual watchlist status on mount
  useEffect(() => {
    if (!channelId || isGuest) return;
    chrome.runtime.sendMessage({ action: 'GET_TRUST_DATA' }, (cache) => {
      if (cache?.is_tracked) setWatchlisted(true);
    });
  }, [channelId, isGuest]);

  const openSidePanel = (tab: string) => {
    chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab });
  };

  const handleWatchlist = async () => {
    if (!channelId || watchlistLoading) return;
    setWatchlistLoading(true);

    if (watchlisted) {
      const result = await api.untrackChannel(channelId);
      if (result.success) setWatchlisted(false);
    } else {
      const result = await api.trackChannel(channelId);
      if (result.success) {
        setWatchlisted(true);
      } else if (result.error === 'subscription_required') {
        // TODO: show upgrade CTA
      }
    }
    setWatchlistLoading(false);
  };

  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = () => {
    setAuthError(null);
    chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' }, (res) => {
      if (res && !res.success && res.error !== 'cancelled') {
        setAuthError(t('auth.error.failed'));
      }
    });
  };

  if (isGuest) {
    return (
      <>
        <button className="btn btn-primary" onClick={() => openSidePanel('overview')}>
          {t('popup.cta_guest')}
        </button>
        <div style={{ fontSize: '12px', color: 'var(--ink-50)', textAlign: 'center' }}>
          {t('popup.guest_sign_in_hint')}
        </div>
        <button className="btn btn-secondary" onClick={handleAuth}>
          {t('auth.login')}
        </button>
        {authError && (
          <div style={{ fontSize: '11px', color: 'var(--color-erv-red)', textAlign: 'center' }}>
            {authError}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => openSidePanel('overview')}>
          {t('popup.cta_channel')}
        </button>
        <button className="btn btn-secondary" onClick={() => openSidePanel('user')}>
          {t('popup.cta_my')}
        </button>
      </div>
      <button
        className="btn btn-tertiary"
        onClick={handleWatchlist}
        disabled={watchlistLoading}
      >
        {watchlistLoading ? '...' : watchlisted ? t('popup.watchlist_added') : t('popup.watchlist')}
      </button>
    </>
  );
}
