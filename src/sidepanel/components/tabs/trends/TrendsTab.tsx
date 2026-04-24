// TASK-039: Trends Tab shell — Period toggle + Overview routing + access gating.
// Full 9-module overview (Phase D2). Free → Paywall, Anonymous → AnonymousState,
// Premium → 7-90d, Business → 365d unlocked.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel } from '../../../../shared/trends-types';
import { PeriodToggle } from './PeriodToggle';
import { TrendsOverview } from './TrendsOverview';
import { AnonymousState } from './states/AnonymousState';
import { InsufficientData } from './states/InsufficientData';
import { Paywall } from './Paywall';

interface Props {
  channelId: string | null;
  accessLevel: AccessLevel;
  /** Optional hook — when user clicks "Sign in" в AnonymousState. Parent wires to login flow. */
  onRequestSignIn?: () => void;
  /** Called when user clicks paywall CTA — parent navigates to checkout. */
  onRequestUpgrade?: (target: 'premium' | 'business') => void;
}

const DEFAULT_PERIOD: TrendsPeriod = '30d';

export function TrendsTab({ channelId, accessLevel, onRequestSignIn, onRequestUpgrade }: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendsPeriod>(DEFAULT_PERIOD);

  // Anonymous viewer — sign-in CTA, no fetches.
  if (accessLevel === 'anonymous') {
    return (
      <div className="trends-tab">
        <AnonymousState onSignIn={onRequestSignIn} />
      </div>
    );
  }

  // Free viewer — full upgrade screen, no fetches.
  if (accessLevel === 'free') {
    return (
      <div className="trends-tab">
        <Paywall variant="free" onUpgrade={() => onRequestUpgrade?.('premium')} />
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="trends-tab trends-tab-empty">
        <InsufficientData reasonKey="no_channel" />
      </div>
    );
  }

  // Premium viewer hits 365d Business gate — Business paywall replaces overview.
  const showBusinessPaywall = period === '365d' && accessLevel !== 'business';

  const handlePeriodChange = (next: TrendsPeriod) => setPeriod(next);
  const handleRequestUpgrade = (_p: TrendsPeriod) => setPeriod('365d');

  return (
    <div className="trends-tab">
      <PeriodToggle
        currentPeriod={period}
        onChange={handlePeriodChange}
        accessLevel={accessLevel}
        onRequestUpgrade={handleRequestUpgrade}
      />
      {showBusinessPaywall ? (
        <Paywall variant="business" onUpgrade={() => onRequestUpgrade?.('business')} />
      ) : (
        <TrendsOverview channelId={channelId} period={period} />
      )}
      <span className="sr-only">{t('trends.period.aria')}</span>
    </div>
  );
}
