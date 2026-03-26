import { useTranslation } from 'react-i18next';

interface TabBarProps {
  tabs: readonly string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ tabs, currentTab, onTabChange }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <div role="tablist" style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e5e5e5', padding: '0 4px', scrollbarWidth: 'none' }}>
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
            style={{
              flexShrink: 0,
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#4F36EE' : '#525252',
              borderBottom: isActive ? '2px solid #4F36EE' : '2px solid transparent',
              background: 'none',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: isActive ? '#4F36EE' : 'transparent',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {t(`tab.${tab}`)}
          </button>
        );
      })}
    </div>
  );
}
