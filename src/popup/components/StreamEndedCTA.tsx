// TASK-077 FR-013: StreamEndedCTA — timer + btn-last-stream (green) + hint.
// 3 color variants: green (clean), yellow (anomaly), red (significant anomaly).

import { useTranslation } from 'react-i18next';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  expires_at: string | null;
  color: 'green' | 'yellow' | 'red';
  channel_id: string | null;
  hint: string;
}

const BG_COLORS: Record<string, string> = {
  green: 'var(--color-erv-green-bg)',
  yellow: 'var(--color-erv-yellow-bg)',
  red: 'var(--color-erv-red-bg, #FEF2F2)',
};

const BORDER_COLORS: Record<string, string> = {
  green: 'var(--color-erv-green)',
  yellow: 'var(--color-erv-yellow)',
  red: 'var(--color-erv-red)',
};

export function StreamEndedCTA({ expires_at, color, channel_id, hint }: Props) {
  const { t } = useTranslation();
  const { remaining, expired } = useCountdown(expires_at);

  if (expired) {
    return (
      <div className="stream-ended-cta" style={{ background: 'var(--bg-warm)', borderColor: 'var(--border-light)' }}>
        <div className="stream-ended-cta-timer" style={{ color: 'var(--ink-30)' }}>
          {t('stream_ended_cta.expired')}
        </div>
      </div>
    );
  }

  const openLastStream = () => {
    if (channel_id) {
      chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'overview' });
    }
  };

  return (
    <div className="stream-ended-cta" style={{ background: BG_COLORS[color], borderColor: BORDER_COLORS[color] }}>
      {remaining && (
        <div className="stream-ended-cta-timer" style={{ color: BORDER_COLORS[color] }}>
          {t('stream_ended_cta.timer', { h: remaining.hours, m: remaining.minutes })}
        </div>
      )}
      <button className="btn btn-last-stream" onClick={openLastStream}>
        {t('stream_ended_cta.button')}
      </button>
      <div className="stream-ended-cta-hint">{hint}</div>
    </div>
  );
}
