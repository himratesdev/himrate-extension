// LITERAL PORT — wireframe slim/29_screen-2-realnye-zriteli-erv-premium.html.
// ERV drill-down: hero + chart 30d + trend/forecast cards + explanation + best/worst.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack?: () => void;
  onOpenStream?: (date: string) => void;
}

export function Frame29TrendsErv({ onBack, onOpenStream }: Props) {
  const { t } = useTranslation();
  const [chartMode, setChartMode] = useState<'pct' | 'count'>('pct');

  return (
    <div className="sp-content" role="tabpanel">
      {/* Back link */}
      <div
        style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }}
        onClick={() => onBack?.()}
        role="button"
      >← Все модули</div>

      {/* Hero card */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '14px 16px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#22C55E', lineHeight: 1 }}>85%</div>
        </div>
        <div style={{ width: 1, height: 40, background: 'rgba(0,0,0,0.08)', flexShrink: 0 }}></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{t('erv.real_viewers_label')}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-70)', marginTop: 4 }}>~4,200 из\u00a05,000 настоящие</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#ECFDF5', borderRadius: 12, marginTop: 4 }}>
            <svg width="5" height="5" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#22C55E" /></svg>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#059669' }}>Аномалий не\u00a0замечено</span>
          </div>
        </div>
      </div>

      {/* Chart card */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{t('erv.real_viewers_label')} · 30д</span>
          <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border-dark)', borderRadius: 4, overflow: 'hidden' }}>
            <button
              onClick={() => setChartMode('pct')}
              style={{ padding: '3px 10px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: chartMode === 'pct' ? 600 : 500, border: 'none', background: chartMode === 'pct' ? 'var(--ink)' : 'white', color: chartMode === 'pct' ? 'white' : 'var(--ink-50)', cursor: 'pointer' }}
            >%</button>
            <button
              onClick={() => setChartMode('count')}
              style={{ padding: '3px 10px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: chartMode === 'count' ? 600 : 500, border: 'none', borderLeft: '1.5px solid var(--border-dark)', background: chartMode === 'count' ? 'var(--ink)' : 'white', color: chartMode === 'count' ? 'white' : 'var(--ink-50)', cursor: 'pointer' }}
            >{t('trends.erv.chart_mode_count')}</button>
          </div>
        </div>
        <svg width="100%" height="120" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ervG2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 0.12 }} />
              <stop offset="100%" style={{ stopColor: '#22C55E', stopOpacity: 0.01 }} />
            </linearGradient>
          </defs>
          <line x1="32" y1="10" x2="305" y2="10" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,3" />
          <line x1="32" y1="30" x2="305" y2="30" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,3" />
          <line x1="32" y1="50" x2="305" y2="50" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.25" />
          <line x1="32" y1="70" x2="305" y2="70" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,3" />
          <text x="28" y="13" textAnchor="end" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">100%</text>
          <text x="28" y="33" textAnchor="end" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">75%</text>
          <text x="28" y="53" textAnchor="end" fontSize="7" fill="#EF4444" fontFamily="'JetBrains Mono',monospace" opacity="0.5">50%</text>
          <text x="28" y="73" textAnchor="end" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">25%</text>
          <text x="50" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">1 мар</text>
          <text x="135" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">10 мар</text>
          <text x="220" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">20 мар</text>
          <text x="300" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">30 мар</text>
          <path d="M50,22 L92,20 L135,18 L178,28 L220,16 L262,19 L300,14 L300,88 L50,88 Z" fill="url(#ervG2)" />
          <polyline points="50,22 92,20 135,18 178,28 220,16 262,19 300,14" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="178" cy="28" r="4" fill="#F97316" opacity="0.9" />
          <text x="178" y="28" textAnchor="middle" dominantBaseline="central" fontSize="5" fill="white" fontWeight="700" fontFamily="'Space Grotesk',Arial,sans-serif">!</text>
          <circle cx="262" cy="19" r="4" fill="#EF4444" opacity="0.9" />
          <text x="262" y="19" textAnchor="middle" dominantBaseline="central" fontSize="5" fill="white" fontWeight="700" fontFamily="'Space Grotesk',Arial,sans-serif">R</text>
          <circle cx="300" cy="14" r="3.5" fill="#22C55E" stroke="white" strokeWidth="2" />
        </svg>
        <div style={{ display: 'flex', gap: 12, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 10, height: 2, background: '#22C55E', borderRadius: 1, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--ink-30)' }}>{t('erv.real_viewers_label')}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#F97316" /></svg>
            <span style={{ color: 'var(--ink-30)' }}>{t('trends.erv.cause_unknown')}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#EF4444" /></svg>
            <span style={{ color: 'var(--ink-30)' }}>{t('trends.erv.cause_raid')}</span>
          </span>
        </div>
      </div>

      {/* Trend + Forecast 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>{t('trends.trend_label')}</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>+4.2%</div>
          <div style={statSubStyle}>{t('trends.delta_period_30d_full')}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>{t('trends.forecast.short_7d')}</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>84%</div>
          <div style={statSubStyle}>разброс 81–87%</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>{t('trends.forecast.short_30d')}</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>87%</div>
          <div style={statSubStyle}>разброс 80–94%</div>
        </div>
      </div>

      {/* Explanation block */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'var(--bg-warm)', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-70)', lineHeight: 1.5 }}>
          Доля реальных зрителей выросла на\u00a04.2% за\u00a030\u00a0дней. Улучшилась авторизация зрителей (78→84%). Стабильный рост чистой аудитории.
        </div>
      </div>

      {/* Best/Worst grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div
          onClick={() => onOpenStream?.('14 апр')}
          style={{ ...bestWorstCardStyle, borderLeft: '4px solid #22C55E' }}
          role="button"
        >
          <div style={statLabelStyle}>{t('trends.common.best')}</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>91%</div>
          <div style={statSubStyle}>14 апр · Just Chatting</div>
        </div>
        <div
          onClick={() => onOpenStream?.('2 апр')}
          style={{ ...bestWorstCardStyle, borderLeft: '4px solid #EF4444' }}
          role="button"
        >
          <div style={statLabelStyle}>{t('trends.common.worst')}</div>
          <div style={{ ...statValueStyle, color: '#EF4444' }}>62%</div>
          <div style={statSubStyle}>2 апр · Just Chatting</div>
        </div>
      </div>
    </div>
  );
}

const statCardStyle: React.CSSProperties = {
  border: '2.5px solid var(--border-dark)',
  borderRadius: 8,
  padding: '8px 10px',
  background: 'white',
  boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
};

const bestWorstCardStyle: React.CSSProperties = {
  ...statCardStyle,
  cursor: 'pointer',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--ink-50)',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 600,
  marginBottom: 4,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace",
  lineHeight: 1,
};

const statSubStyle: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--ink-30)',
  marginTop: 3,
};
