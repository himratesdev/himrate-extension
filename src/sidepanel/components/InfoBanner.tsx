// BUG-016 PR-1 (Section 5 of wireframe + canonical §4.9): "Link Twitch" info banner.
// Wireframe: side-panel-wireframe-TASK-039.html lines 1822-1825 (Section 5 use-case)
// CSS spec: canonical §4.9 lines 206-219.
// Dismiss stores timestamp в chrome.storage.local — hidden for 1 day.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  show: boolean;
}

const STORAGE_KEY = 'info_banner_dismissed_at';
const HIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

export function InfoBanner({ show }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY).then((data) => {
      const dismissedAt = data[STORAGE_KEY] as number | undefined;
      if (dismissedAt && Date.now() - dismissedAt < HIDE_DURATION_MS) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    });
  }, [show]);

  if (!visible) return null;

  const handleDismiss = () => {
    chrome.storage.local.set({ [STORAGE_KEY]: Date.now() });
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
        {t('banner.link_twitch')}
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
