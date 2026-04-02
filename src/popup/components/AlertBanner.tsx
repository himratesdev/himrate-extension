// TASK-034 FR-020: Alert Banner UI foundation.
// Hidden until anomaly detection pipeline provides data.
// Component fully built — just pass visible=true + data when ready.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  severity?: 'warning' | 'critical';
  message?: string;
  onClick?: () => void;
}

const DISMISS_KEY = 'alert_banner_dismissed_at';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function AlertBanner({ visible, severity = 'warning', message, onClick }: Props) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!visible) return;
    chrome.storage.local.get(DISMISS_KEY).then(data => {
      const dismissedAt = data[DISMISS_KEY] as number | undefined;
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    });
  }, [visible]);

  if (!visible || dismissed || !message) return null;

  const handleDismiss = () => {
    chrome.storage.local.set({ [DISMISS_KEY]: Date.now() });
    setDismissed(true);
  };

  const bgColor = severity === 'critical' ? 'var(--color-erv-red-bg)' : 'var(--color-erv-yellow-bg)';
  const borderColor = severity === 'critical' ? 'var(--color-erv-red)' : 'var(--color-erv-yellow)';

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '20%', minHeight: '80px',
      background: bgColor, borderTop: `2px solid ${borderColor}`,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
      cursor: onClick ? 'pointer' : 'default',
      animation: 'slideUp 0.3s ease-out',
    }} onClick={onClick}>
      <div style={{ flex: 1, fontSize: '12px', fontWeight: 500 }}>{message}</div>
      <button onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        aria-label={t('aria.dismiss')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--ink-50)' }}>
        ×
      </button>
    </div>
  );
}
