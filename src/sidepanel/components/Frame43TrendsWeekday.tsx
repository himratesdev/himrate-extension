// LITERAL PORT — wireframe slim/43_screen-15-po-dnyam-nedeli-premium.html (Weekday drill-down).

interface Props {
  onBack?: () => void;
}

const DAYS = [
  { day: 'Пн', height: 60, color: '#3B82F6', opacity: 0.4, value: 73 },
  { day: 'Вт', height: 45, color: '#3B82F6', opacity: 0.4, value: 69 },
  { day: 'Ср', height: 70, color: '#3B82F6', opacity: 0.4, value: 76 },
  { day: 'Чт', height: 55, color: '#3B82F6', opacity: 0.4, value: 72 },
  { day: 'Пт', height: 100, color: '#22C55E', opacity: 1, value: 81 },
  { day: 'Сб', height: 75, color: '#10B981', opacity: 0.5, value: 78 },
  { day: 'Вс', height: 40, color: '#10B981', opacity: 0.3, value: 67 },
];

export function Frame43TrendsWeekday({ onBack }: Props) {
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Hero */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '12px 14px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Лучший день недели</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink)', lineHeight: 1 }}>Пятница</div>
          <div style={{ fontSize: 11, color: 'var(--ink-50)' }}>Дов. 81 · ERV 87%</div>
        </div>
      </div>

      {/* 7-bar chart */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>Рейтинг доверия по дням</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {DAYS.map((d) => (
            <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: d.height === 100 ? '#22C55E' : 'var(--ink-50)' }}>{d.value}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
          {DAYS.map((d) => (
            <div key={d.day} style={{ flex: 1, height: `${d.height}%`, background: d.color, borderRadius: '3px 3px 0 0', opacity: d.opacity }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {DAYS.map((d) => (
            <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-30)' }}>{d.day}</div>
          ))}
        </div>
      </div>

      {/* Best/Worst summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ border: '2.5px solid var(--border-dark)', borderLeft: '4px solid #22C55E', borderRadius: 8, padding: '8px 10px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>Лучший</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>Пт</div>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', marginTop: 3 }}>+8 над средним</div>
        </div>
        <div style={{ border: '2.5px solid var(--border-dark)', borderLeft: '4px solid #EF4444', borderRadius: 8, padding: '8px 10px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>Худший</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>Вс</div>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', marginTop: 3 }}>−6 от среднего</div>
        </div>
      </div>
    </div>
  );
}
