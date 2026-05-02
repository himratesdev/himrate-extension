// LITERAL PORT — wireframe slim/35_screen-8-trends-90d-dlinnyy-period.html.

import { useTranslation } from 'react-i18next';

interface Props {
  onPeriodChange?: (period: '7d' | '30d' | '60d' | '90d' | '365d') => void;
  onUpgradeBusiness?: () => void;
}

export function Frame35Trends90d({ onPeriodChange, onUpgradeBusiness }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      <div className="sp-period-toggle">
        <button className="sp-period-pill" onClick={() => onPeriodChange?.('7d')}>7d</button>
        <button className="sp-period-pill" onClick={() => onPeriodChange?.('30d')}>30d</button>
        <button className="sp-period-pill" onClick={() => onPeriodChange?.('60d')}>60d</button>
        <button className="sp-period-pill active" onClick={() => onPeriodChange?.('90d')}>90d</button>
        <button
          className="sp-period-pill locked"
          onClick={() => onUpgradeBusiness?.()}
          aria-disabled={true}
          title="365d требует Business"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ display: 'inline', marginRight: 2 }}>
            <rect x="2" y="4" width="4" height="3" fill="none" stroke="currentColor" strokeWidth="0.6" rx="0.4" />
            <path d="M3 4V2.5a1 1 0 0 1 2 0V4" stroke="currentColor" strokeWidth="0.6" fill="none" />
          </svg>365d
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 100 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{t('erv.real_viewers_label')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#22C55E', lineHeight: 1 }}>83%</div>
          <svg viewBox="0 0 80 24" style={{ width: '100%', height: 20, marginTop: 'auto' }} preserveAspectRatio="none">
            <path d="M0,18 L10,16 L20,14 L30,17 L40,12 L50,10 L60,8 L70,9 L80,6" stroke="#22C55E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 9, color: '#22C55E', fontWeight: 600 }}>+8.1% за 90д</div>
        </div>
        <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: 10, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 100 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{t('sp.trust_rating')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6', lineHeight: 1 }}>77</div>
          <svg viewBox="0 0 80 24" style={{ width: '100%', height: 20, marginTop: 'auto' }} preserveAspectRatio="none">
            <path d="M0,6 L10,8 L20,9 L30,7 L40,12 L50,14 L60,16 L70,15 L80,18" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 600 }}>-8 pts за 90д</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-30)', textAlign: 'center', padding: 4 }}>+ ещё 7 модулей ниже (прокрутите)</div>
    </div>
  );
}
