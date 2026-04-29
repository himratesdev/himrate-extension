// LITERAL PORT — wireframe slim/36_screen-9-nedostatochno-dannyh.html.

interface Props {
  streamsAnalyzed?: number;
  streamsRequired?: number;
}

export function Frame36TrendsInsufficient({ streamsAnalyzed = 2, streamsRequired = 5 }: Props) {
  const pct = Math.round((streamsAnalyzed / streamsRequired) * 100);
  return (
    <div className="sp-content" role="tabpanel" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-20)" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-4" strokeDasharray="2,2" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Пока недостаточно данных</div>
      <div style={{ fontSize: 12, color: 'var(--ink-50)', maxWidth: 240 }}>
        Для расчёта трендов нужно минимум {streamsRequired} стримов. Проанализировано {streamsAnalyzed} из\u00a0{streamsRequired}.
      </div>
      <div style={{ width: '80%', maxWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
          <span>{streamsAnalyzed} / {streamsRequired} стримов</span><span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-primary)', borderRadius: 3 }}></div>
        </div>
      </div>
    </div>
  );
}
