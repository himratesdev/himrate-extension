// LITERAL PORT — wireframe slim/39_screen-12-komponenty-reytinga-premium.html.

import { useTranslation } from 'react-i18next';

interface Props {
  onBack?: () => void;
}

const COMPONENTS = [
  { name: 'Авторизация', color: '#3B82F6', pct: 35, pts: 27, delta: -18, deltaColor: '#EF4444', bg: '#FEF2F2' },
  { name: 'Вовлечённость', color: '#22C55E', pct: 25, pts: 19, delta: 4, deltaColor: '#22C55E', bg: '#ECFDF5' },
  { name: 'Чат-паттерны', color: '#8B5CF6', pct: 18, pts: 14, delta: 1, deltaColor: '#22C55E', bg: '#ECFDF5' },
  { name: 'Рост аудитории', color: '#EAB308', pct: 14, pts: 11, delta: -2, deltaColor: '#EF4444', bg: '#FEF2F2' },
  { name: 'Другие', color: '#EF4444', pct: 8, pts: 6, delta: 0, deltaColor: 'var(--ink-30)', bg: '#F5F5F5' },
];

export function Frame39TrendsComponents({ onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Stacked chart */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{t('trends.components.title')}</span>
          <span style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>{t('trends.components.total')}</span>
        </div>
        <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
          {COMPONENTS.map((c) => (
            <div key={c.name} style={{ width: `${c.pct}%`, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.pct >= 10 && <span style={{ fontSize: c.pct >= 14 ? 8 : 7, fontWeight: 700, color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{c.pct}%</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {COMPONENTS.map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9 }}>
              <span style={{ width: 8, height: 8, background: c.color, borderRadius: 2, flexShrink: 0 }}></span>
              <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
              <span style={{ width: 38, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.pts} pts</span>
              <span style={{ width: 24, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-30)', flexShrink: 0 }}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Component changes 30d */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', padding: '8px 10px' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{t('trends.components.delta_30d')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
          {COMPONENTS.map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', background: c.bg, borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: c.color, borderRadius: 1, display: 'inline-block' }}></span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: c.deltaColor }}>
                {c.delta > 0 ? `+${c.delta}` : c.delta < 0 ? `−${Math.abs(c.delta)}` : '0'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
