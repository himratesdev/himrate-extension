// LITERAL PORT — wireframe slim/42_screen-14-po-kategoriyam-premium.html.

interface Props { onBack?: () => void; }

interface CategoryStats {
  name: string;
  streams: number;
  trust: number;
  trustMedian: number;
  viewers: number;
  viewersMedian: number;
  stability: number;
  stabilityMedian: number;
  best?: boolean;
  trustColor?: string;
  viewersColor?: string;
  stabilityColor?: string;
}

const CATEGORIES: CategoryStats[] = [
  { name: 'Just Chatting', streams: 28, trust: 74, trustMedian: 71, viewers: 81, viewersMedian: 71, stability: 85, stabilityMedian: 77, trustColor: '#3B82F6', viewersColor: '#22C55E', stabilityColor: '#22C55E' },
  { name: 'Fortnite', streams: 6, trust: 84, trustMedian: 71, viewers: 89, viewersMedian: 71, stability: 88, stabilityMedian: 77, best: true, trustColor: '#22C55E', viewersColor: '#22C55E', stabilityColor: '#22C55E' },
  { name: 'IRL', streams: 4, trust: 68, trustMedian: 71, viewers: 75, viewersMedian: 71, stability: 72, stabilityMedian: 77, trustColor: '#EAB308', viewersColor: '#22C55E', stabilityColor: '#EAB308' },
];

export function Frame42TrendsCategories({ onBack }: Props) {
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {CATEGORIES.map((cat) => (
        <div
          key={cat.name}
          style={{
            border: cat.best ? '2.5px solid #22C55E' : '2.5px solid var(--border-dark)',
            borderRadius: 8,
            padding: '10px 12px',
            background: 'white',
            boxShadow: cat.best ? '2px 2px 0 rgba(34,197,94,0.2)' : '2px 2px 0 rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          {cat.best && (
            <div style={{ position: 'absolute', top: -8, right: 12, fontSize: 8, padding: '2px 8px', background: '#22C55E', color: 'white', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>Лучшая</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{cat.name}</span>
            <span style={{ fontSize: 9, color: 'var(--ink-30)' }}>{cat.streams} стримов</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Доверие', value: cat.trust, median: cat.trustMedian, color: cat.trustColor, suffix: '' },
              { label: 'Зрители', value: cat.viewers, median: cat.viewersMedian, color: cat.viewersColor, suffix: '%' },
              { label: 'Стабильность', value: cat.stability, median: cat.stabilityMedian, color: cat.stabilityColor, suffix: '' },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px',
                  background: cat.best ? 'rgba(34,197,94,0.08)' : (m.color === '#22C55E' ? 'rgba(34,197,94,0.05)' : (m.color === '#3B82F6' ? 'rgba(59,130,246,0.05)' : 'rgba(234,179,8,0.05)')),
                  borderRadius: 4, position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${m.median}%`, width: 1, borderLeft: '1px dashed var(--ink-30)', opacity: 0.4 }}></div>
                <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: m.color, marginTop: 4 }}>{m.value}{m.suffix}</div>
                <div style={{ fontSize: 7, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>сред. {m.median}{m.suffix}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
