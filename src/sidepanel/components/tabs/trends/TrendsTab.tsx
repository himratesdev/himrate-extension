// TASK-039 Phase D1: Trends Tab shell — Period toggle + Overview/drill-down routing.
// D1 scope: Overview с 3 core modules. Drill-down для M1/M2/M6 — defer D2 (use same module
// в "compact: false" mode is enough для D1; dedicated drill screens come with D2 + other modules).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel } from '../../../../shared/trends-types';
import { PeriodToggle } from './PeriodToggle';
import { TrendsOverview } from './TrendsOverview';
import { ErrorState } from './states/ErrorState';

interface Props {
  channelId: string | null;
  accessLevel: AccessLevel;
}

const DEFAULT_PERIOD: TrendsPeriod = '30d';

export function TrendsTab({ channelId, accessLevel }: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendsPeriod>(DEFAULT_PERIOD);

  if (!channelId) {
    return (
      <div className="trends-tab trends-tab-empty">
        <div className="trends-empty-channel">{t('trends.no_channel')}</div>
      </div>
    );
  }

  const handlePeriodChange = (p: TrendsPeriod) => {
    if (p === '365d' && accessLevel !== 'business') {
      // 365d gated — Business only. D2 будет показывать paywall modal.
      // Для D1 — просто no-op (UI показывает 🔒 icon).
      return;
    }
    setPeriod(p);
  };

  return (
    <div className="trends-tab">
      <PeriodToggle currentPeriod={period} onChange={handlePeriodChange} accessLevel={accessLevel} />
      {accessLevel === 'anonymous' ? (
        <ErrorState onRetry={() => undefined} />
      ) : (
        <TrendsOverview channelId={channelId} period={period} />
      )}
    </div>
  );
}
