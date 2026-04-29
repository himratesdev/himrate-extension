// LITERAL PORT — wireframe slim/31_screen-4-anomalnye-sobytiya-premium.html.
// Anomalies drill-down: yellow summary + DoW distribution + 3 type counts + event list.
// LEGAL: wireframe contains "Бот-рейд" — replaced с "Аномальный рейд" per CLAUDE.md ERV labels v3.

interface Props {
  onBack?: () => void;
  onOpenEvent?: (id: string) => void;
}

export function Frame31TrendsAnomalies({ onBack, onOpenEvent }: Props) {
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Summary banner */}
      <div style={{ border: '2.5px solid #EAB308', borderRadius: 10, padding: '12px 14px', background: '#FFFBEB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#A16207', lineHeight: 1 }}>5</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(161,98,7,0.15)', flexShrink: 0 }}></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: '#A16207', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Аномалий за\u00a030 дней</div>
            <div style={{ fontSize: 10, color: '#78350F', marginTop: 2, lineHeight: 1.3 }}>Резкие скачки зрителей, не\u00a0связанные с\u00a0контентом</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 8, padding: '2px 7px', background: '#FEF2F2', color: '#DC2626', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>1 без причины</span>
          <span style={{ fontSize: 8, padding: '2px 7px', background: 'rgba(234,179,8,0.1)', color: '#A16207', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap' }}>×2.5 от\u00a0нормы</span>
        </div>
      </div>

      {/* DoW distribution */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>Когда происходят аномалии</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
          {[
            { value: '2', color: '#3B82F6' },
            { value: '1', color: '#3B82F6' },
            { value: '2', color: '#EAB308' },
            { value: '0', color: 'var(--ink-20)', empty: true },
            { value: '1', color: '#EF4444' },
            { value: '0', color: 'var(--ink-20)', empty: true },
            { value: '0', color: 'var(--ink-20)', empty: true },
          ].map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontWeight: c.empty ? undefined : 700, fontFamily: "'JetBrains Mono', monospace", color: c.color }}>
              {c.value}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40, marginBottom: 4 }}>
          <div style={{ flex: 1, height: '100%', background: '#3B82F6', borderRadius: '3px 3px 0 0', opacity: 0.7 }}></div>
          <div style={{ flex: 1, height: '50%', background: '#3B82F6', borderRadius: '3px 3px 0 0', opacity: 0.5 }}></div>
          <div style={{ flex: 1, height: '100%', background: '#EAB308', borderRadius: '3px 3px 0 0', opacity: 0.7 }}></div>
          <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: '3px 3px 0 0' }}></div>
          <div style={{ flex: 1, height: '50%', background: '#EF4444', borderRadius: '3px 3px 0 0', opacity: 0.7 }}></div>
          <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: '3px 3px 0 0' }}></div>
          <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: '3px 3px 0 0' }}></div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-30)' }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Type breakdown 3-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[
          { label: 'Неизвестно', value: 2, color: '#F97316' },
          { label: 'Аномальный рейд', value: 1, color: '#EF4444' },
          { label: 'Чистый рейд', value: 2, color: '#22C55E' },
        ].map((c) => (
          <div key={c.label} style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '8px 10px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: c.color, lineHeight: 1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Event list */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, borderBottom: '1px solid var(--ink-10)' }}>События</div>
        {[
          { id: 'e1', date: '12 мар, 18:22', type: 'Аномальный рейд', typeColor: '#DC2626', typeBg: '#FEF2F2', dot: '#EF4444', detail: 'Зрители: +450% · Рейтинг доверия: 78 → 41' },
          { id: 'e2', date: '19 фев, 20:34', type: 'Неизвестно', typeColor: '#EA580C', typeBg: 'rgba(249,115,22,0.1)', dot: '#F97316', detail: 'Зрители: +280% · Причина не определена' },
          { id: 'e3', date: '5 мар, 14:10', type: 'Чистый рейд', typeColor: '#059669', typeBg: '#ECFDF5', dot: '#22C55E', detail: 'Зрители: +120% · Рейтинг доверия стабилен' },
        ].map((e, i, arr) => (
          <div
            key={e.id}
            onClick={() => onOpenEvent?.(e.id)}
            style={{ padding: '10px 12px', borderBottom: i < arr.length - 1 ? '1px solid var(--ink-10)' : undefined, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
            role="button"
          >
            <div style={{ flexShrink: 0, width: 4, height: 4, borderRadius: '50%', background: e.dot, marginTop: 5 }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{e.date}</span>
                <span style={{ fontSize: 9, padding: '2px 6px', background: e.typeBg, color: e.typeColor, borderRadius: 4, fontWeight: 600 }}>{e.type}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>{e.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
