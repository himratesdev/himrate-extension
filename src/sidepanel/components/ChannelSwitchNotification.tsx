// BUG-016 PR-1 Section 11: ChannelSwitchNotification canonical (wireframe lines 3807-3835).
// Wireframe: sp-channel-switch overlay + sp-channel-switch-card + title/sub
// + sp-channel-switch-btns (.btn-yes/.btn-no) + sp-channel-switch-progress + bar.
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onDecline]);

  const progressPct = (secondsLeft / AUTO_DISMISS_S) * 100;

  return (
    <div className="sp-channel-switch" role="dialog" aria-modal="true">
      <div className="sp-channel-switch-card">
        <div className="sp-channel-switch-title">{t('sp.switch_prompt')}</div>
        <div className="sp-channel-switch-sub">
          {t('sp.switch_prompt_sub')} <strong>{channelName}</strong>?
        </div>
        <div className="sp-channel-switch-btns">
          <button className="btn-yes" onClick={onAccept}>{t('sp.yes')}</button>
          <button className="btn-no" onClick={onDecline}>{t('sp.no')}</button>
        </div>
        <div className="sp-channel-switch-progress">
          <div className="sp-channel-switch-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}
