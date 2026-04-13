// TASK-035 FR-011: Channel Switch Notification — overlay with Yes/No.
// Auto-dismiss after 10s with animated progress bar.

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  channelName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const AUTO_DISMISS_S = 10;

export function ChannelSwitchNotification({ channelName, onAccept, onDecline }: Props) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_S);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onDecline();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [onDecline]);

  const progressPct = (secondsLeft / AUTO_DISMISS_S) * 100;

  return (
    <div
      className="sp-channel-switch-overlay"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        border: '2px solid #111',
        borderRadius: '8px 8px 0 0',
        padding: '14px 16px',
        zIndex: 200,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.12)',
      }}
    >
      {/* Progress bar */}
      <div style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '12px' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: '#111',
            borderRadius: '2px',
            transition: 'width 1s linear',
          }}
        />
      </div>

      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>
        {t('sp.switch_prompt')} <span style={{ fontWeight: 400, color: '#6b7280' }}>— {channelName}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, fontSize: '13px', padding: '8px' }}
          onClick={onAccept}
        >
          {t('sp.yes')}
        </button>
        <button
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: '13px', padding: '8px' }}
          onClick={onDecline}
        >
          {t('sp.no')}
        </button>
      </div>
    </div>
  );
}
