import { useTranslation } from 'react-i18next';

interface TabBarProps {
  tabs: readonly string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  alerts?: Record<string, boolean>;
}

export function TabBar({ tabs, currentTab, onTabChange, alerts }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        const hasAlert = alerts?.[tab];
        return (
          <button
            key={tab}
            className={`tab-item${isActive ? ' active' : ''}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
          >
            {t(`tab.${tab}`)}
            {hasAlert && <span className="tab-alert">!</span>}
          </button>
        );
      })}
    </div>
  );
}
