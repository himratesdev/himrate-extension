// TASK-039 Phase D1: Period toggle — 7/30/60/90/365d segmented control.
// Role gating: 365d is Business-only. Others unlocked for Premium/Business/Streamer.

import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel } from '../../../../shared/trends-types';

const ALL_PERIODS: TrendsPeriod[] = ['7d', '30d', '60d', '90d', '365d'];

interface Props {
  currentPeriod: TrendsPeriod;
  onChange: (period: TrendsPeriod) => void;
  accessLevel: AccessLevel;
}

export function PeriodToggle({ currentPeriod, onChange, accessLevel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="trends-period-toggle" role="tablist" aria-label={t('trends.period.aria')}>
      {ALL_PERIODS.map((p) => {
        const isBusinessGated = p === '365d' && accessLevel !== 'business';
        const isActive = p === currentPeriod;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`trends-period-btn${isActive ? ' active' : ''}${isBusinessGated ? ' gated' : ''}`}
            onClick={() => onChange(p)}
          >
            {t(`trends.period.${p}`)}
            {isBusinessGated && <span className="trends-period-lock" aria-hidden="true"> 🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
