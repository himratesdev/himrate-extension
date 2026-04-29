// LITERAL PORT — wireframe slim/44_screen-16-paywall-business-365d.html.
// Premium → Business paywall: hook + social proof + 6 feature cards + dark pricing block.

interface Props {
  channelLogin?: string;
  onUpgrade?: () => void;
}

const lockBadge = (
  <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, width: 20, height: 20, borderRadius: '50%', background: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '1px 1px 0 rgba(0,0,0,0.15)', border: '1.5px solid var(--border-dark)' }}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  </div>
);

const cardStyle: React.CSSProperties = { border: '2.5px solid var(--border-dark)', borderRadius: 8, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden', padding: '8px 10px' };
const cardTitleStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--ink)', marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" };
const cardSubStyle: React.CSSProperties = { fontSize: 9, color: 'var(--ink-50)', lineHeight: 1.3, marginTop: 1 };

export function Frame44TrendsPaywallBusiness({ channelLogin = 'shroud', onUpgrade }: Props) {
  return (
    <div className="sp-content" role="tabpanel" style={{ gap: 10 }}>
      <div style={{ textAlign: 'center', padding: '0 6px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3, marginBottom: 4 }}>
          {channelLogin} в\u00a0<span style={{ color: '#22C55E' }}>Топ-12%</span> категории
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-50)', lineHeight: 1.4 }}>
          Год истории, 50 конкурентов, разбор по\u00a0компонентам. Business показывает полную картину.
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>
          230+ Business-пользователей · средний рост +47%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[
          { title: '365 дней истории', sub: 'Годовые тренды и\u00a0сезонность' },
          { title: 'Сравнение с\u00a0коллегами', sub: 'Позиция среди 800+ каналов' },
          { title: 'До 50 каналов', sub: 'Мониторинг конкурентов' },
          { title: 'Компоненты рейтинга', sub: 'Что влияет на\u00a0оценку' },
          { title: 'Анализ по\u00a0категориям', sub: 'Лучшие показатели по\u00a0играм' },
          { title: 'Экспорт CSV', sub: 'Отчёты для\u00a0спонсоров' },
        ].map((c, i) => (
          <div key={i} style={cardStyle}>
            {lockBadge}
            <div style={{ filter: 'blur(0.8px)', opacity: 0.7, height: 38, background: 'linear-gradient(180deg, rgba(79,54,238,0.05) 0%, transparent 100%)', borderRadius: 4 }}></div>
            <div style={cardTitleStyle}>{c.title}</div>
            <div style={cardSubStyle}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Dark pricing block */}
      <div style={{ background: '#1e1b4b', borderRadius: 10, padding: '16px 16px 24px', boxShadow: '3px 3px 0 rgba(79,54,238,0.4)', border: '2.5px solid var(--border-dark)', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(79,54,238,0.3), transparent 70%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Business</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'white', lineHeight: 1 }}>$99<span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>/мес</span></div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>всё включено</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Разовый отчёт</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'white', lineHeight: 1 }}>$4.99</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>1 стример</div>
            </div>
          </div>
          <button
            onClick={() => (onUpgrade ? onUpgrade() : chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=business' }))}
            style={{ width: '100%', padding: 12, background: 'white', color: '#1e1b4b', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >Открыть полный доступ</button>
        </div>
      </div>
    </div>
  );
}
