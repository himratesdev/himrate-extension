// TASK-035 FR-012: "Link Twitch" info banner.
// Dismiss stores timestamp in chrome.storage.local — hidden for 1 day.

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
    <div
      className="sp-info-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#eff6ff',
        borderBottom: '2px solid #3b82f6',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      <span style={{ flex: 1 }}>{t('banner.link_twitch')}</span>
      <button
        onClick={handleDismiss}
        aria-label={t('aria.dismiss')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: 1,
          padding: '0 2px',
        }}
      >
        ×
      </button>
    </div>
  );
}
