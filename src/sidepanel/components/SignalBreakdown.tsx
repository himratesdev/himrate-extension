// TASK-035 FR-004: Live-Signal Breakdown — 11 signals with bars.
// Premium: open. Free/Guest: blur overlay (DS §1.2-A).

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Signal {
  type: string;
  value: number;
  confidence: number | null;
  weight: number | null;
  contribution: number;
  metadata: Record<string, unknown> | null;
}

interface Props {
  channelId: string | null;
  isPremium: boolean;
}

const SIGNAL_NAMES: Record<string, string> = {
  auth_ratio: 'Auth Ratio',
  chatter_to_ccv_ratio: 'Chatter-to-CCV',
  ccv_step_function: 'CCV Step Function',
  ccv_tier_clustering: 'CCV Tier Clustering',
  per_user_chat_behavior: 'Chat Behavior',
  channel_protection_score: 'Channel Protection',
  cross_channel_bot_presence: 'Cross-Channel Bots',
  known_bot_list_matching: 'Known Bot Match',
  raid_attribution: 'Raid Attribution',
  ccv_chat_rate_correlation: 'CCV+Chat Correlation',
  account_profile_scoring: 'Account Scoring',
};

export function SignalBreakdown({ channelId, isPremium }: Props) {
  const { t } = useTranslation();
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    if (!channelId) return;
    api.getTrust(channelId).then((data) => {
      if (data && 'signal_breakdown' in data) {
        setSignals((data as unknown as { signal_breakdown: Signal[] }).signal_breakdown || []);
      }
    });
  }, [channelId]);

  if (signals.length === 0) return null;

  const sorted = [...signals].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className={`sp-signals ${!isPremium ? 'sp-blur-content' : ''}`}>
      <div className="sp-signals-header">
        <span>📊 {t('tab.overview')}</span>
      </div>
      {sorted.map((sig, i) => (
        <div key={sig.type} className="sp-signal-bar" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="sp-signal-name">{SIGNAL_NAMES[sig.type] || sig.type}</div>
          <div className="sp-signal-track">
            <div
              className="sp-signal-fill"
              style={{ width: `${Math.min(100, sig.value * 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(sig.value * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="sp-signal-value">{(sig.value * 100).toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
}
