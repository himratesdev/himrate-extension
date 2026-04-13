// TASK-035 FR-008: Tab Bar — 8 tabs, horizontal scroll, lock icons, anomaly dots.

import { useTranslation } from 'react-i18next';

interface TabBarProps {
  tabs: readonly string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  lockedTabs?: string[];
  anomalyTabs?: string[];
}

export function TabBar({ tabs, currentTab, onTabChange, lockedTabs = [], anomalyTabs = [] }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        const isLocked = lockedTabs.includes(tab);
        const hasAnomaly = anomalyTabs.includes(tab);
        return (
          <button
            key={tab}
            className={`tab-item${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isLocked}
            onClick={() => onTabChange(tab)}
          >
            {t(`tab.${tab}`)}
            {isLocked && <span className="tab-lock"> 🔒</span>}
            {hasAnomaly && <span className="tab-anomaly-dot" />}
          </button>
        );
      })}
    </div>
  );
}
