// TASK-034 FR-022: Viewer Time UI foundation.
// Hidden until Viewer Analytics is implemented.
// Timer infrastructure: stores entry timestamp, calculates elapsed.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  channelLogin: string;
  isLive: boolean;
}

const VIEWER_TIME_PREFIX = 'viewer_time_';

export function ViewerTime({ visible, channelLogin, isLive }: Props) {
  const { t } = useTranslation();
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!visible || !isLive || !channelLogin) return;

    const key = `${VIEWER_TIME_PREFIX}${channelLogin}`;

    chrome.storage.local.get(key).then(data => {
      const startedAt = data[key] as number | undefined;
      if (startedAt) {
        setMinutes(Math.floor((Date.now() - startedAt) / 60_000));
      } else {
        chrome.storage.local.set({ [key]: Date.now() });
        setMinutes(0);
      }
    });

    const interval = setInterval(() => {
      chrome.storage.local.get(key).then(data => {
        const startedAt = data[key] as number | undefined;
        if (startedAt) setMinutes(Math.floor((Date.now() - startedAt) / 60_000));
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [visible, channelLogin, isLive]);

  if (!visible || !isLive) return null;

  return (
    <div style={{ fontSize: '12px', color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>
      {t('popup.viewer_time', { N: minutes })}
    </div>
  );
}
