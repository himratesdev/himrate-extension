// LITERAL PORT — wireframe slim/41_screen-13-sravnenie-s-kollegami-business.html.

import { useTranslation } from 'react-i18next';

interface Props { onBack?: () => void; }

const RANK_HISTORY = [
  { week: '4 нед.', value: '20%', current: false },
  { week: '3 нед.', value: '18%', current: false },
  { week: '2 нед.', value: '15%', current: false },
  { week: 'Сейчас', value: '12%', current: true },
];

export function Frame41TrendsComparison({ onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Hero */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '12px 14px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6', lineHeight: 1 }}>{t('trends.comparison.top_label')}</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6', lineHeight: 1 }}>12%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{t('trends.comparison.category_label')}</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 2 }}>Just Chatting</div>
          <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>Лучше 88% из 2,340 каналов</div>
        </div>
      </div>

      {/* Comparison bars */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{t('trends.comparison.you_vs_category')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Рейтинг доверия', value: 77, median: 71, color: '#3B82F6', valSuffix: '' },
            { name: 'Реальные зрители', value: 83, median: 71, color: '#22C55E', valSuffix: '%' },
            { name: 'Стабильность', value: 88, median: 77, color: '#22C55E', valSuffix: '' },
          ].map((b) => (
            <div key={b.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{b.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{b.value}{b.valSuffix} <span style={{ color: 'var(--ink-30)', fontWeight: 400 }}>(мед. {b.median}{b.valSuffix})</span></span>
              </div>
              <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, position: 'relative' }}>
                <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 3 }}></div>
                <div style={{ position: 'absolute', left: `${b.median}%`, top: -2, width: 1.5, height: 10, background: 'var(--ink-30)' }}></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', marginTop: 8 }}>Вертикальная линия = медиана категории</div>
      </div>

      {/* Rank history */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>{t('trends.comparison.position_dynamics')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
          {RANK_HISTORY.map((r) => (
            <div
              key={r.week}
              style={{
                textAlign: 'center', padding: '6px 4px', borderRadius: 4,
                background: r.current ? 'rgba(59,130,246,0.08)' : 'var(--bg-warm)',
                border: r.current ? '1.5px solid rgba(59,130,246,0.2)' : undefined,
              }}
            >
              <div style={{ fontSize: 8, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>{r.week}</div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: r.current ? '#3B82F6' : undefined }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
