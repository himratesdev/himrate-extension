// LITERAL PORT — wireframe slim/38_screen-11-stabilnost-kanala-premium.html.

import { useTranslation } from 'react-i18next';

interface Props {
  onBack?: () => void;
}

export function Frame38TrendsStability({ onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Hero */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '12px 14px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#22C55E', lineHeight: 1 }}>88</div>
          <div style={{ fontSize: 10, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>/ 100</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{t('trends.stability.title')}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-70)', marginBottom: 2 }}>{t('trends.stability.subtitle_stable')}</div>
          <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>{t('trends.stability.category_avg')}</div>
        </div>
      </div>

      {/* Weekly history */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>{t('trends.stability.weekly_history')}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
          {[{ v: '82', c: 'var(--ink-50)' }, { v: '84', c: 'var(--ink-50)' }, { v: '86', c: 'var(--ink-50)' }, { v: '88', c: '#22C55E' }].map((b, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: b.c }}>{b.v}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40, marginBottom: 4 }}>
          {[{ h: '75%', o: 0.5 }, { h: '82%', o: 0.6 }, { h: '90%', o: 0.7 }, { h: '100%', o: 1 }].map((b, i) => (
            <div key={i} style={{ flex: 1, height: b.h, background: '#22C55E', borderRadius: '3px 3px 0 0', opacity: b.o }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4'].map((d) => (
            <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-30)' }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Peer comparison */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Сравнение · Just Chatting</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, width: 24 }}>Вы</span>
            <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4 }}>
              <div style={{ height: '100%', width: '88%', background: '#22C55E', borderRadius: 4 }}></div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>88</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-30)', width: 24 }}>50%</span>
            <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4 }}>
              <div style={{ height: '100%', width: '77%', background: 'var(--ink-20)', borderRadius: 4 }}></div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>77</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-30)', width: 24 }}>90%</span>
            <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4 }}>
              <div style={{ height: '100%', width: '93%', background: 'var(--ink-20)', borderRadius: 4 }}></div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>93</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 6 }}>Выше медианы. Входит в топ-25% категории.</div>
      </div>

      {/* Explanation */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'var(--bg-warm)', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-70)', lineHeight: 1.5 }}>Стабильность показывает, насколько равномерны показатели канала от\u00a0стрима к\u00a0стриму. Чем выше\u00a0— тем предсказуемее канал для\u00a0рекламодателей и\u00a0зрителей.</div>
      </div>
    </div>
  );
}
