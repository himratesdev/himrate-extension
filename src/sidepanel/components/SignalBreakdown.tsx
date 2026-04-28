// BUG-016 PR-1 Section 6+7: SignalBreakdown canonical with Premium expand UX.
// Wireframe: side-panel-wireframe-TASK-039.html sp-signals (Section 6 lines 1965-2001
// for collapsed state, Section 7 lines 2502-2648 for Premium expandable).
// Free Live: drill-down rows visible (no expand). Premium: expandable rows + detail.

import { useState } from 'react';
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
  /** Premium: expandable rows with sp-signal-detail. Free: collapsed rows. */
  expandable?: boolean;
}

const SIGNAL_I18N: Record<string, { name: string; desc: string }> = {
  auth_ratio: { name: 'signal.auth_ratio', desc: 'signal.auth_ratio_desc' },
  chatter_to_ccv_ratio: { name: 'signal.chatter_ccv', desc: 'signal.chatter_ccv_desc' },
  ccv_step_function: { name: 'signal.ccv_step', desc: 'signal.ccv_step_desc' },
  ccv_tier_clustering: { name: 'signal.ccv_tier', desc: 'signal.ccv_tier_desc' },
  per_user_chat_behavior: { name: 'signal.chat_behavior', desc: 'signal.chat_behavior_desc' },
  channel_protection_score: { name: 'signal.channel_protection', desc: 'signal.channel_protection_desc' },
  cross_channel_bot_presence: { name: 'signal.cross_channel', desc: 'signal.cross_channel_desc' },
  known_bot_list_matching: { name: 'signal.known_bots', desc: 'signal.known_bots_desc' },
  raid_attribution: { name: 'signal.raid', desc: 'signal.raid_desc' },
  ccv_chat_rate_correlation: { name: 'signal.ccv_chat_corr', desc: 'signal.ccv_chat_corr_desc' },
  account_profile_scoring: { name: 'signal.account_scoring', desc: 'signal.account_scoring_desc' },
};

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

export function SignalBreakdown({ signals, expandable = false }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (signals.length === 0) return null;

  const sorted = [...signals].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const toggleExpand = (type: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const titleKey = expandable ? 'sp.signals_title_premium' : 'sp.signals_title';

  return (
    <div className="sp-signals">
      <div className="sp-signals-title">{t(titleKey, { count: sorted.length })}</div>
      {sorted.map((sig) => {
        const color = signalColor(sig.value);
        const pct = Math.round(sig.value * 100);
        const i18n = SIGNAL_I18N[sig.type];
        const label = i18n ? t(i18n.name) : sig.type;
        const isOpen = expanded.has(sig.type);

        return (
          <div key={sig.type}>
            <div
              className={`sp-signal-row${expandable ? ' sp-signal-expandable' : ''}`}
              onClick={expandable ? () => toggleExpand(sig.type) : undefined}
              role={expandable ? 'button' : undefined}
              aria-expanded={expandable ? isOpen : undefined}
            >
              <span className="sp-signal-name">{label}</span>
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
              {expandable && (
                <span className={`sp-signal-expand-icon${isOpen ? ' open' : ''}`}>▾</span>
              )}
            </div>
            {expandable && isOpen && i18n && (
              <div className="sp-signal-detail">
                <div className="sp-signal-detail-title">
                  {t(i18n.name)}: {pct}%
                </div>
                {t(i18n.desc)}
                <div className="sp-signal-detail-source">{t('sp.signal_freshness')}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
