// TASK-034: ERV badge — 2-line: label + % on second line.
// Clickable → Side Panel.

import { useTranslation } from 'react-i18next';

interface Props {
  label: string | null;
  percent: number | null;
  color: string;
}

export function ErvBadge({ label, percent, color }: Props) {
  const { t } = useTranslation();
  if (!label && percent === null) return null;

  const handleClick = () => {
    chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL', tab: 'overview' });
  };

  const clampedPercent = percent !== null ? Math.min(100, Math.max(0, percent)) : null;

  return (
    <div className="erv-badge-wrap">
      <span
        className={`erv-badge ${color}`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <span className="erv-dot" />
        {label || t('placeholder.null')}
        {clampedPercent !== null && (
          <span className="erv-line2">{clampedPercent}% {t('label.erv_suffix')}</span>
        )}
      </span>
    </div>
  );
}
