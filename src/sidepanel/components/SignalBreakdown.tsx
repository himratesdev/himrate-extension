// BUG-016 PR-1 Section 6: SignalBreakdown canonical match (wireframe lines 1965-2001).
// Wireframe: side-panel-wireframe-TASK-039.html sp-signals + sp-signal-row.
// Canonical classes: sp-signals + sp-signals-title + sp-signal-row + sp-signal-name
// + sp-signal-bar-bg + sp-signal-bar-fill.{green/yellow/red} + sp-signal-val.{green/yellow/red}.

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
}

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

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

export function SignalBreakdown({ signals }: Props) {
  const { t } = useTranslation();

  if (signals.length === 0) return null;

  const sorted = [...signals].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className="sp-signals">
      <div className="sp-signals-title">{t('sp.signals_title', { count: sorted.length })}</div>
      {sorted.map((sig) => {
        const color = signalColor(sig.value);
        const pct = Math.round(sig.value * 100);
        return (
          <div key={sig.type} className="sp-signal-row">
            <span className="sp-signal-name">{t(SIGNAL_I18N[sig.type] || sig.type)}</span>
            <div className="sp-signal-bar-bg">
              <div
                className={`sp-signal-bar-fill ${color}`}
                style={{ width: `${Math.min(100, pct)}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className={`sp-signal-val ${color}`}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
