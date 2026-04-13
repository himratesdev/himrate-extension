// TASK-035 FR-004: Live-Signal Breakdown — 11 signals with bars.
// Premium: open. Free/Guest: blur overlay (DS §1.2-A).

import { useTranslation } from 'react-i18next';

interface Signal {
  type: string;
  value: number;
  confidence: number | null;
  weight: number | null;
  contribution: number;
  metadata: Record<string, unknown> | null;
}

interface Props {
  signals: Signal[];
  isPremium: boolean;
}

// Signal type → i18n key mapping
const SIGNAL_I18N: Record<string, string> = {
  auth_ratio: 'signal.auth_ratio',
  chatter_to_ccv_ratio: 'signal.chatter_ccv',
  ccv_step_function: 'signal.ccv_step',
  ccv_tier_clustering: 'signal.ccv_tier',
  per_user_chat_behavior: 'signal.chat_behavior',
  channel_protection_score: 'signal.channel_protection',
  cross_channel_bot_presence: 'signal.cross_channel',
  known_bot_list_matching: 'signal.known_bots',
  raid_attribution: 'signal.raid',
  ccv_chat_rate_correlation: 'signal.ccv_chat_corr',
  account_profile_scoring: 'signal.account_scoring',
};

export function SignalBreakdown({ signals, isPremium }: Props) {
  const { t } = useTranslation();

  if (signals.length === 0) return null;

  const sorted = [...signals].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className={`sp-signals ${!isPremium ? 'sp-blur-content' : ''}`}>
      <div className="sp-signals-header">
        <span>📊 {t('tab.overview')}</span>
      </div>
      {sorted.map((sig, i) => (
        <div key={sig.type} className="sp-signal-bar" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="sp-signal-name">{t(SIGNAL_I18N[sig.type] || sig.type)}</div>
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
