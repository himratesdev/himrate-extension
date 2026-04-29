// LITERAL PORT — wireframe slim/32_screen-5-paywall-free-premium.html.
// Free → Premium paywall: hook + social proof + 6 blurred feature cards + pricing CTA.
// LEGAL NOTE: wireframe contains "накрутки" — replaced с legal-safe "аномалии" per CLAUDE.md.

interface Props {
  channelLogin?: string;
  anomalyCount?: number;
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

const cardStyle: React.CSSProperties = {
  border: '2.5px solid var(--border-dark)',
  borderRadius: 8,
  background: 'white',
  boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  padding: '8px 10px',
};

const cardTitleStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--ink)', marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" };
const cardSubStyle: React.CSSProperties = { fontSize: 9, color: 'var(--ink-50)', lineHeight: 1.3, marginTop: 1 };

export function Frame32TrendsPaywallFree({ channelLogin = 'shroud', anomalyCount = 2, onUpgrade }: Props) {
  return (
    <div className="sp-content" role="tabpanel" style={{ justifyContent: 'center', gap: 12 }}>
      {/* Hook */}
      <div style={{ textAlign: 'center', padding: '0 6px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3, marginBottom: 4 }}>
          У {channelLogin} <span style={{ color: '#EF4444' }}>{anomalyCount} аномалии</span> за месяц
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-50)', lineHeight: 1.4 }}>
          Рейтинг доверия упал на\u00a012 баллов. Что происходит с\u00a0аудиторией? Premium даёт ответ.
        </div>
      </div>
      {/* Social proof */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>
          2,400+ пользователей · 12,000+ каналов под наблюдением
        </div>
      </div>
      {/* 6 Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {/* 1. Реальные зрители */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <path d="M0,30 L20,24 L40,26 L60,20 L80,22 L100,16 L120,14 L140,10 L140,38 L0,38 Z" fill="#22C55E" opacity="0.15" />
              <polyline points="0,30 20,24 40,26 60,20 80,22 100,16 120,14 140,10" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={cardTitleStyle}>Реальные зрители</div>
          <div style={cardSubStyle}>Живые люди, история 90\u00a0дней</div>
        </div>
        {/* 2. Детектор аномалий */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <polyline points="0,28 15,26 30,28 45,26 55,24 60,4 65,26 80,28 95,26 110,28 125,26 140,28" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
              <line x1="57" y1="0" x2="63" y2="0" stroke="#EF4444" strokeWidth="6" opacity="0.15" />
              <circle cx="60" cy="4" r="3" fill="#EF4444" opacity="0.3" />
            </svg>
          </div>
          <div style={cardTitleStyle}>Детектор аномалий</div>
          <div style={cardSubStyle}>Рейды, аномалии — первым</div>
        </div>
        {/* 3. Прогнозы рейтинга */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <polyline points="0,30 20,26 40,22 60,18 80,16 95,14" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
              <polyline points="95,14 110,10 125,8 140,4" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" />
              <rect x="90" y="0" width="50" height="38" fill="#3B82F6" opacity="0.04" />
            </svg>
          </div>
          <div style={cardTitleStyle}>Прогнозы рейтинга</div>
          <div style={cardSubStyle}>Рост, стагнация или падение</div>
        </div>
        {/* 4. Восстановление */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <rect x="0" y="6" width="140" height="10" rx="4" fill="#E5E7EB" />
              <rect x="0" y="6" width="90" height="10" rx="4" fill="#22C55E" opacity="0.5" />
              <rect x="0" y="22" width="140" height="10" rx="4" fill="#E5E7EB" />
              <rect x="0" y="22" width="50" height="10" rx="4" fill="#EAB308" opacity="0.5" />
            </svg>
          </div>
          <div style={cardTitleStyle}>Восстановление рейтинга</div>
          <div style={cardSubStyle}>15 чистых стримов до восстановления</div>
        </div>
        {/* 5. История 90 дней */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <polyline points="0,28 14,22 28,24 42,18 56,20 70,14 84,16 98,10 112,12 126,8 140,6" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
              <polyline points="0,30 14,28 28,30 42,26 56,28 70,24 84,26 98,22 112,24 126,20 140,18" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={cardTitleStyle}>90 дней истории</div>
          <div style={cardSubStyle}>Долгосрочная аналитика</div>
        </div>
        {/* 6. По дням недели */}
        <div style={cardStyle}>
          {lockBadge}
          <div style={{ filter: 'blur(0.8px)', opacity: 0.7 }}>
            <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
              <rect x="2" y="22" width="16" height="14" rx="2" fill="#3B82F6" opacity="0.4" />
              <rect x="22" y="18" width="16" height="18" rx="2" fill="#3B82F6" opacity="0.4" />
              <rect x="42" y="14" width="16" height="22" rx="2" fill="#3B82F6" opacity="0.4" />
              <rect x="62" y="20" width="16" height="16" rx="2" fill="#3B82F6" opacity="0.4" />
              <rect x="82" y="6" width="16" height="30" rx="2" fill="#22C55E" opacity="0.6" />
              <rect x="102" y="12" width="16" height="24" rx="2" fill="#10B981" opacity="0.5" />
              <rect x="122" y="22" width="16" height="14" rx="2" fill="#10B981" opacity="0.3" />
            </svg>
          </div>
          <div style={cardTitleStyle}>По дням недели</div>
          <div style={cardSubStyle}>Когда канал на пике</div>
        </div>
      </div>
      {/* Pricing — dark electric block */}
      <div style={{ background: '#1e1b4b', borderRadius: 10, padding: '16px 16px 24px', boxShadow: '3px 3px 0 rgba(79,54,238,0.4)', border: '2.5px solid var(--border-dark)', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(79,54,238,0.3), transparent 70%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Premium</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'white', lineHeight: 1 }}>$9.99<span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>/мес</span></div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>1 канал</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Разовый отчёт</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'white', lineHeight: 1 }}>$4.99</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>1 стример</div>
            </div>
          </div>
          <button
            onClick={() => (onUpgrade ? onUpgrade() : chrome.tabs.create({ url: 'https://himrate.com/pricing?plan=premium' }))}
            style={{ width: '100%', padding: 12, background: 'white', color: '#1e1b4b', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            Открыть полный доступ
          </button>
        </div>
      </div>
    </div>
  );
}
