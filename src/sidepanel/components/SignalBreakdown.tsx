// BUG-016 PR-1a: SignalBreakdown LITERAL PORT from wireframe slim/14_live-premium-green-91.html
// Wireframe sp-signals section (lines 58-204): 11 rows × {name + bar + value + expand-icon}
// + per-row sp-signal-detail block with title + description + "Обновлено N назад".
//
// Premium (expandable=true): all 11 rows open by default per frame 14.
// Free (expandable=false): rows visible without expand icons or detail blocks.

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
  /** Premium: expandable rows with sp-signal-detail (all open by default per wf14).
      Free: collapsed rows only (no expand icons, no details). */
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

// Canonical signal types in wireframe display order (frame 14 lines 62-203).
const CANONICAL_SIGNAL_TYPES = [
  'auth_ratio',
  'chatter_to_ccv_ratio',
  'ccv_step_function',
  'ccv_tier_clustering',
  'per_user_chat_behavior',
  'channel_protection_score',
  'cross_channel_bot_presence',
  'known_bot_list_matching',
  'raid_attribution',
  'ccv_chat_rate_correlation',
  'account_profile_scoring',
] as const;

function signalColor(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

export function SignalBreakdown({ signals, expandable = false }: Props) {
  const { t } = useTranslation();

  // Per-signal lookup from real API data (if present).
  const byType = new Map<string, Signal>();
  for (const sig of signals) byType.set(sig.type, sig);

  // Premium: all 11 rows open by default (wireframe frame 14 — every row has
  // sp-signal-expand-icon `open` class). Free: nothing expanded.
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    expandable ? new Set(CANONICAL_SIGNAL_TYPES) : new Set()
  );

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
      <div className="sp-signals-title">{t(titleKey, { count: 11 })}</div>

      {CANONICAL_SIGNAL_TYPES.map((type) => {
        const i18n = SIGNAL_I18N[type];
        const sig = byType.get(type);
        const hasData = sig != null;
        const pct = hasData ? Math.round(sig.value * 100) : 0;
        const color: 'green' | 'yellow' | 'red' | 'grey' = hasData ? signalColor(sig.value) : 'grey';
        const valueLabel = hasData ? `${pct}%` : '—';
        const isOpen = expanded.has(type);

        return (
          <div key={type}>
            <div
              className={`sp-signal-row${expandable ? ' sp-signal-expandable' : ''}`}
              onClick={expandable ? () => toggleExpand(type) : undefined}
              role={expandable ? 'button' : undefined}
              aria-expanded={expandable ? isOpen : undefined}
            >
              <span className="sp-signal-name">{t(i18n.name)}</span>
              <div className="sp-signal-bar-bg">
                <div
                  className={`sp-signal-bar-fill ${color}`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className={`sp-signal-val ${color}`}>{valueLabel}</span>
              {expandable && (
                <span className={`sp-signal-expand-icon${isOpen ? ' open' : ''}`}>▾</span>
              )}
            </div>

            {expandable && isOpen && (
              <div className="sp-signal-detail">
                <div className="sp-signal-detail-title">
                  {t(i18n.name)}: {valueLabel}
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
