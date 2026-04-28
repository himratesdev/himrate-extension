// BUG-016 PR-1a (Section 5 + frame 10): "Link Twitch" / "Sign in" info banner.
// Wireframe: side-panel-wireframe-TASK-039.html sp-info-banner (canonical §4.9).
// 2 variants:
//   link_twitch — registered user без OAuth: "Привяжите Twitch для точной аналитики"
//   guest_signin — frame 10 Live Guest: "Войдите через Twitch для полного доступа"
// Dismiss stores timestamp в chrome.storage.local — hidden for 1 day.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  show: boolean;
  variant?: 'link_twitch' | 'guest_signin';
}

const STORAGE_KEY_BASE = 'info_banner_dismissed_at';
const HIDE_DURATION_MS = 24 * 60 * 60 * 1000;

export function InfoBanner({ show, variant = 'link_twitch' }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const storageKey = `${STORAGE_KEY_BASE}_${variant}`;
  const messageKey = variant === 'guest_signin' ? 'banner.guest_signin' : 'banner.link_twitch';

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    chrome.storage.local.get(storageKey).then((data) => {
      const dismissedAt = data[storageKey] as number | undefined;
      if (dismissedAt && Date.now() - dismissedAt < HIDE_DURATION_MS) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    });
  }, [show, storageKey]);

  if (!visible) return null;

  const handleDismiss = () => {
    chrome.storage.local.set({ [storageKey]: Date.now() });
    setVisible(false);
  };

  return (
    <div className="sp-info-banner" role="alert">
      <span className="sp-info-banner-text">
        <svg
          className="ico ico-sm"
          viewBox="0 0 24 24"
          style={{ verticalAlign: '-0.2em' }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {t(messageKey)}
      </span>
      <button
        type="button"
        className="sp-info-banner-close"
        onClick={handleDismiss}
        aria-label={t('aria.dismiss')}
      >
        ×
      </button>
    </div>
  );
}
