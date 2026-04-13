// TASK-035 FR-010: Post-stream countdown — 18h access window for Free users.
// Recalculates every 60s. Shows blur message when expired.

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

  if (isExpired) {
    return (
      <div
        className="sp-post-stream-expired"
        style={{
          padding: '12px',
          background: '#f3f4f6',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          textAlign: 'center',
          filter: 'blur(2px)',
          userSelect: 'none',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        {t('popup.analytics_expired')}
      </div>
    );
  }

  const hours = Math.floor(remainingMin / 60);
  const minutes = remainingMin % 60;

  return (
    <div
      className="sp-post-stream-countdown"
      style={{
        padding: '10px 14px',
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
      }}
    >
      <span style={{ fontSize: '14px' }}>⏱</span>
      <span style={{ fontWeight: 600 }}>
        {t('stream_ended_cta.timer', { h: hours, m: minutes })}
      </span>
    </div>
  );
}
