// LITERAL PORT — wireframe slim/30_screen-3-vosstanovlenie-reytinga-premium.html.
// Recovery drill-down: 15-progress bars + TI projection curve + bonus tooltip + stream history.

import { useTranslation } from 'react-i18next';

interface Props {
  onBack?: () => void;
}

export function Frame30TrendsRecovery({ onBack }: Props) {
  const { t: _t } = useTranslation();

  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Progress section — 15 bar segments */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: 16, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Прогресс восстановления</div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
          {[0,1,2,3,4,5,6,7].map(i => (<div key={i} style={{ flex: 1, height: 8, background: '#22C55E', borderRadius: 2 }}></div>))}
          <div style={{ flex: 1, height: 8, background: '#EF4444', borderRadius: 2 }}></div>
          {[0,1,2,3,4,5].map(i => (<div key={i} style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 2 }}></div>))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#22C55E' }}>8</span>
            <span style={{ fontSize: 14, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}> / 15</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--ink-50)', padding: '3px 8px', background: 'var(--bg-warm)', borderRadius: 4 }}>Ещё ~7 чистых стримов</span>
        </div>
      </div>

      {/* TI projection with recovery curve */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '14px 16px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', marginBottom: 2 }}>Сейчас</div>
            <div style={{ fontSize: 28, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#EAB308' }}>66</div>
          </div>
          <svg width="160" height="48" viewBox="0 0 160 48" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="recoveryGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>
            <polygon points="8,40 28,35 48,30 68,25 88,20 108,15 128,10 152,5 152,48 8,48" fill="url(#recoveryGrad)" opacity="0.12" />
            <polyline points="8,40 28,35 48,30 68,25 88,20 108,15 128,10 152,5" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,3" fill="none" opacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="28" cy="35" r="3.5" fill="#8B5CF6" opacity="0.5" />
            <circle cx="48" cy="30" r="3.5" fill="#8B5CF6" opacity="0.55" />
            <circle cx="68" cy="25" r="3.5" fill="#8B5CF6" opacity="0.6" />
            <circle cx="88" cy="20" r="3.5" fill="#8B5CF6" opacity="0.65" />
            <circle cx="108" cy="15" r="3.5" fill="#8B5CF6" opacity="0.7" />
            <circle cx="128" cy="10" r="3.5" fill="#8B5CF6" opacity="0.75" />
            <circle cx="8" cy="40" r="4.5" fill="#EAB308" stroke="white" strokeWidth="1.5" />
            <circle cx="152" cy="5" r="4.5" fill="#22C55E" stroke="white" strokeWidth="1.5" />
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', marginBottom: 2 }}>Прогноз</div>
            <div style={{ fontSize: 28, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#22C55E' }}>80</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>Если сохранить темп · ~7 стримов</span>
        </div>
      </div>

      {/* Bonus block (purple) */}
      <div style={{ border: '2.5px solid #8B5CF6', borderRadius: 8, padding: 12, background: 'rgba(139,92,246,0.04)', boxShadow: '2px 2px 0 rgba(139,92,246,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: '#7C3AED', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600 }}>Бонус за хорошие показатели</span>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#7C3AED' }}>+8 pts</span>
        </div>
        <div style={{ height: 4, background: 'rgba(139,92,246,0.15)', borderRadius: 2, marginBottom: 6 }}>
          <div style={{ height: '100%', width: '53%', background: '#8B5CF6', borderRadius: 2 }}></div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>Максимум: +15 баллов. Начисляется за качество чата и вовлечённость зрителей.</div>
        <div style={{ border: '1.5px solid #8B5CF6', borderRadius: 8, padding: 10, background: 'rgba(139,92,246,0.06)', marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>За что начислен бонус</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="#8B5CF6" opacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
                <path d="M3.5 5l1.2 1.2L6.5 4" stroke="#8B5CF6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 10, color: 'var(--ink-70)' }}>Качество чата:</span>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#7C3AED' }}>85 / 100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="#8B5CF6" opacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
                <path d="M3.5 5l1.2 1.2L6.5 4" stroke="#8B5CF6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 10, color: 'var(--ink-70)' }}>Вовлечённость:</span>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#7C3AED' }}>82 / 100</span>
            </div>
          </div>
          <div style={{ fontSize: 9, color: 'var(--ink-30)', marginTop: 6 }}>Продолжай в\u00a0том же духе\u00a0— бонус ускоряет восстановление</div>
        </div>
      </div>

      {/* Stream history */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>Последние стримы</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { date: '15 апр', clean: true, score: 72 },
            { date: '14 апр', clean: true, score: 70 },
            { date: '13 апр', clean: false, score: 58 },
            { date: '12 апр', clean: true, score: 68 },
          ].map((s, i, arr) => (
            <div key={s.date} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--ink-10)' : undefined }}>
              <div style={{ width: 16, flexShrink: 0 }}>
                {s.clean ? (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="#22C55E" opacity="0.15" stroke="#22C55E" strokeWidth="1.5" />
                    <path d="M3.5 5l1.2 1.2L6.5 4" stroke="#22C55E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="1.5" />
                    <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span style={{ width: 52, flexShrink: 0, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: s.clean ? undefined : '#EF4444' }}>{s.date}</span>
              <span style={{ flex: 1, fontSize: 11, color: s.clean ? 'var(--ink-30)' : '#EF4444' }}>{s.clean ? 'Чистый' : 'Не зачтён'}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11, color: s.clean ? undefined : '#EF4444', width: 28, textAlign: 'right' }}>{s.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
