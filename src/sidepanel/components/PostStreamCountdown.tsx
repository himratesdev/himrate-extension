// BUG-016 PR-1 Section 9: PostStreamCountdown canonical match.
// Wireframe: side-panel-wireframe-TASK-039.html sp-countdown (lines 3085-3089 normal,
// 3244-3247 warning expired, 3350-3354 <1h warning).
// Canonical: sp-countdown (.warning variant for <1h or expired).

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  expiresAt: string;
}

function getRemainingMinutes(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
}

export function PostStreamCountdown({ expiresAt }: Props) {
  const { t } = useTranslation();
  const [remainingMin, setRemainingMin] = useState(() => getRemainingMinutes(expiresAt));

  useEffect(() => {
    setRemainingMin(getRemainingMinutes(expiresAt));
    const timer = setInterval(() => {
      setRemainingMin(getRemainingMinutes(expiresAt));
    }, 60_000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const isExpired = remainingMin <= 0;
  const isWarning = remainingMin > 0 && remainingMin < 60;
  const variant = isExpired || isWarning ? ' warning' : '';

  if (isExpired) {
    return (
      <div className={`sp-countdown${variant}`}>
        <span aria-hidden="true">⏱</span>
        <span>{t('sp.countdown_expired')}</span>
      </div>
    );
  }

  const hours = Math.floor(remainingMin / 60);
  const minutes = remainingMin % 60;
  const timeText = hours > 0
    ? t('sp.countdown_time_hm', { h: hours, m: minutes })
    : t('sp.countdown_time_m', { m: minutes });

  return (
    <div className={`sp-countdown${variant}`}>
      <span aria-hidden="true">⏱</span>
      <span>{isWarning ? t('sp.countdown_remaining') : t('sp.countdown_available')}</span>
      <span className="sp-countdown-time">{timeText}</span>
    </div>
  );
}
