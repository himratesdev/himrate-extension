// TASK-035 FR-017: "Coming soon" placeholder for non-Overview tabs.
// Shows tab name + suffix from i18n.

import { useTranslation } from 'react-i18next';

interface Props {
  tabId: string;
}

export function PlaceholderTab({ tabId }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="sp-placeholder-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '10px',
        textAlign: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          border: '2px dashed #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#9ca3af',
        }}
      >
        ···
      </div>
      <div style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>
        {t(`tab.${tabId}`)}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        {t('tab.placeholder_suffix')}
      </div>
    </div>
  );
}
