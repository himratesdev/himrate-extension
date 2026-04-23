// TASK-039 Phase D1: Trends Tab shell — Period toggle + Overview/drill-down routing + anonymous gate.
// D1 scope: Overview с 3 core modules. Drill-down defer D2.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel } from '../../../../shared/trends-types';
import { PeriodToggle } from './PeriodToggle';
import { TrendsOverview } from './TrendsOverview';
import { AnonymousState } from './states/AnonymousState';
import { InsufficientData } from './states/InsufficientData';

interface Props {
  channelId: string | null;
  accessLevel: AccessLevel;
  /** Optional hook — when user clicks "Sign in" в AnonymousState. Parent wires to login flow. */
  onRequestSignIn?: () => void;
}

const DEFAULT_PERIOD: TrendsPeriod = '30d';

export function TrendsTab({ channelId, accessLevel, onRequestSignIn }: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendsPeriod>(DEFAULT_PERIOD);
  const [upgradeToast, setUpgradeToast] = useState<string | null>(null);

  // CR S-4: anonymous — dedicated state instead of misleading "Error, retry".
  if (accessLevel === 'anonymous') {
    return (
      <div className="trends-tab">
        <AnonymousState onSignIn={onRequestSignIn} />
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

  const handleRequestUpgrade = (p: TrendsPeriod) => {
    setUpgradeToast(t('trends.period.business_required'));
    // Auto-dismiss toast через 4 сек — D2 заменит full paywall modal.
    window.setTimeout(() => setUpgradeToast(null), 4000);
    void p;
  };

  return (
    <div className="trends-tab">
      <PeriodToggle
        currentPeriod={period}
        onChange={setPeriod}
        accessLevel={accessLevel}
        onRequestUpgrade={handleRequestUpgrade}
      />
      {upgradeToast && (
        <div className="trends-upgrade-toast" role="status" aria-live="polite">
          {upgradeToast}
        </div>
      )}
      <TrendsOverview channelId={channelId} period={period} />
    </div>
  );
}
