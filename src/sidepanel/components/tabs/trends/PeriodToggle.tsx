// TASK-039: Period toggle — 7/30/60/90/365d segmented control.
// Role gating: 365d is Business-only. FR-013.
//
// CR S-5 accessibility:
//   - aria-disabled + disabled=false для visual feedback но assistive tech awareness
//   - onClick early-return для gated (не fires onChange)
//   - title attr для native browser tooltip
//   - onRequestUpgrade callback — parent (TrendsTab) показывает business paywall modal

import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel } from '../../../../shared/trends-types';

const ALL_PERIODS: TrendsPeriod[] = ['7d', '30d', '60d', '90d', '365d'];

interface Props {
  currentPeriod: TrendsPeriod;
  onChange: (period: TrendsPeriod) => void;
  accessLevel: AccessLevel;
  /** Called когда user кликает на gated 365d — parent показывает Business upgrade modal / toast. */
  onRequestUpgrade?: (period: TrendsPeriod) => void;
}

export function PeriodToggle({ currentPeriod, onChange, accessLevel, onRequestUpgrade }: Props) {
  const { t } = useTranslation();

  return (
    <div className="trends-period-toggle" role="tablist" aria-label={t('trends.period.aria')}>
      {ALL_PERIODS.map((p) => {
        const isBusinessGated = p === '365d' && accessLevel !== 'business';
        const isActive = p === currentPeriod;
        const handleClick = () => {
          if (isBusinessGated) {
            onRequestUpgrade?.(p);
            return;
          }
          onChange(p);
        };

        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={isBusinessGated}
            className={`trends-period-btn${isActive ? ' active' : ''}${isBusinessGated ? ' gated' : ''}`}
            title={isBusinessGated ? t('trends.period.business_required') : undefined}
            onClick={handleClick}
          >
            {t(`trends.period.${p}`)}
            {isBusinessGated && <span className="trends-period-lock" aria-hidden="true"> 🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
