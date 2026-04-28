// BUG-016 PR-1 (Section 5+ wireframe): TabBar canonical match.
// Wireframe: side-panel-wireframe-TASK-039.html line 154+ (sp-tab-bar CSS) + 1812+ (locked usage).
//
// 8 tabs: overview, trends, audience, watchlists, compare, overlap, bot-raid, settings.
// Lock state: opacity 0.55 + lock SVG icon (canonical, не emoji 🔒).
// Anomaly dot: yellow (ERV 50-79) или red (ERV <50). Pulse animation.

import { useTranslation } from 'react-i18next';

interface TabBarProps {
  tabs: readonly string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  lockedTabs?: string[];
  /** Map tab id → severity color для anomaly dot (yellow=50-79%, red=<50%). */
  anomalyTabs?: Record<string, 'yellow' | 'red'>;
}

export function TabBar({
  tabs,
  currentTab,
  onTabChange,
  lockedTabs = [],
  anomalyTabs = {},
}: TabBarProps) {
  const { t } = useTranslation();

  return (
    <div className="sp-tab-bar" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        const isLocked = lockedTabs.includes(tab);
        const anomalyColor = anomalyTabs[tab];
        const className = `sp-tab${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}`;

        return (
          <button
            key={tab}
            type="button"
            className={className}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isLocked}
            onClick={() => onTabChange(tab)}
          >
            {t(`tab.${tab}`)}
            {isLocked && (
              <svg
                className="ico ico-xs"
                viewBox="0 0 24 24"
                style={{ opacity: 0.5 }}
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  fill="currentColor"
                  stroke="none"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                />
              </svg>
            )}
            {anomalyColor && <span className={`anomaly-dot ${anomalyColor}`} />}
          </button>
        );
      })}
    </div>
  );
}
