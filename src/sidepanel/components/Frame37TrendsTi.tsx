// LITERAL PORT — wireframe slim/37_screen-10-reyting-doveriya-ti-premium.html.
// TI drill-down: hero + chart с tier zones + trend/forecast + explanation + best/worst.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack?: () => void;
  onOpenStream?: (date: string) => void;
}

export function Frame37TrendsTi({ onBack, onOpenStream }: Props) {
  const { t } = useTranslation();
  const [chartMode, setChartMode] = useState<'score' | 'tier'>('score');

  return (
    <div className="sp-content" role="tabpanel">
      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }} onClick={() => onBack?.()} role="button">← Все модули</div>

      {/* Hero */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '12px 14px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6', lineHeight: 1 }}>77</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{t('sp.trust_rating')}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-70)', marginBottom: 4 }}>{t('trends.overview.module.ti_subtitle_attention')}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', borderRadius: 4, fontWeight: 600 }}>3 смены</span>
            <span style={{ fontSize: 9, padding: '2px 6px', background: '#FEF2F2', color: '#DC2626', borderRadius: 4, fontWeight: 600 }}>2 аномалии</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Рейтинг доверия · 30д</span>
          <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border-dark)', borderRadius: 4, overflow: 'hidden' }}>
            <button onClick={() => setChartMode('score')} style={{ padding: '3px 10px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: chartMode === 'score' ? 600 : 500, border: 'none', background: chartMode === 'score' ? 'var(--ink)' : 'white', color: chartMode === 'score' ? 'white' : 'var(--ink-50)', cursor: 'pointer' }}>{t('trends.ti.chart_mode_score')}</button>
            <button onClick={() => setChartMode('tier')} style={{ padding: '3px 10px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: chartMode === 'tier' ? 600 : 500, border: 'none', borderLeft: '1.5px solid var(--border-dark)', background: chartMode === 'tier' ? 'var(--ink)' : 'white', color: chartMode === 'tier' ? 'white' : 'var(--ink-50)', cursor: 'pointer' }}>{t('trends.ti.chart_mode_tier')}</button>
          </div>
        </div>
        <svg width="100%" height="120" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
          <rect x="32" y="5" width="275" height="20" fill="#22C55E" opacity="0.04" />
          <rect x="32" y="25" width="275" height="20" fill="#EAB308" opacity="0.04" />
          <rect x="32" y="45" width="275" height="20" fill="#EF4444" opacity="0.04" />
          <line x1="32" y1="25" x2="305" y2="25" stroke="#22C55E" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.3" />
          <text x="28" y="18" textAnchor="end" fontSize="7" fill="#22C55E" fontFamily="'JetBrains Mono',monospace" opacity="0.5">80+</text>
          <line x1="32" y1="45" x2="305" y2="45" stroke="#EAB308" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.3" />
          <text x="28" y="38" textAnchor="end" fontSize="7" fill="#EAB308" fontFamily="'JetBrains Mono',monospace" opacity="0.5">60</text>
          <line x1="32" y1="65" x2="305" y2="65" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.3" />
          <text x="28" y="58" textAnchor="end" fontSize="7" fill="#EF4444" fontFamily="'JetBrains Mono',monospace" opacity="0.5">40</text>
          <text x="50" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">1 мар</text>
          <text x="135" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">10 мар</text>
          <text x="220" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">20 мар</text>
          <text x="300" y="100" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">30 мар</text>
          <polyline points="50,16 92,20 135,33 178,27 220,40 262,37 300,28" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="178" cy="27" r="4" fill="#F97316" opacity="0.9" />
          <text x="178" y="30" textAnchor="middle" fontSize="5" fill="white" fontWeight="700" fontFamily="'Space Grotesk',Arial,sans-serif">!</text>
          <circle cx="300" cy="28" r="3.5" fill="#3B82F6" stroke="white" strokeWidth="2" />
        </svg>
        <div style={{ display: 'flex', gap: 8, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>
          <span style={{ color: '#22C55E' }}>Доверенный (80+)</span>
          <span style={{ color: '#EAB308' }}>Внимание (60-79)</span>
          <span style={{ color: '#EF4444' }}>Риск (&lt;60)</span>
        </div>
      </div>

      {/* 3-col Trend/Forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div style={statCardStyle}><div style={statLabelStyle}>{t('trends.trend_label')}</div><div style={{ ...statValueStyle, color: '#EF4444' }}>−12</div><div style={statSubStyle}>{t('trends.delta_period_30d_full')}</div></div>
        <div style={statCardStyle}><div style={statLabelStyle}>{t('trends.forecast.short_7d')}</div><div style={{ ...statValueStyle, color: '#EAB308' }}>74</div><div style={statSubStyle}>разброс 70–78</div></div>
        <div style={statCardStyle}><div style={statLabelStyle}>{t('trends.forecast.short_30d')}</div><div style={{ ...statValueStyle, color: '#EAB308' }}>71</div><div style={statSubStyle}>разброс 64–78</div></div>
      </div>

      {/* Explanation */}
      <div style={{ border: '2.5px solid var(--border-dark)', borderRadius: 8, padding: '10px 12px', background: 'var(--bg-warm)', boxShadow: '2px 2px 0 rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-70)', lineHeight: 1.5 }}>Рейтинг снижается: авторизация зрителей упала (82→54%). Две аномалии сместили среднее. Рекомендуется проверить источники аудитории.</div>
      </div>

      {/* Best/Worst */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div onClick={() => onOpenStream?.('10 мар')} style={{ ...statCardStyle, borderLeft: '4px solid #22C55E', cursor: 'pointer' }} role="button">
          <div style={statLabelStyle}>{t('trends.common.best')}</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>84</div>
          <div style={statSubStyle}>10 мар · Just Chatting</div>
        </div>
        <div onClick={() => onOpenStream?.('19 фев')} style={{ ...statCardStyle, borderLeft: '4px solid #EF4444', cursor: 'pointer' }} role="button">
          <div style={statLabelStyle}>{t('trends.common.worst')}</div>
          <div style={{ ...statValueStyle, color: '#EF4444' }}>58</div>
          <div style={statSubStyle}>19 фев · Just Chatting</div>
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
const statLabelStyle: React.CSSProperties = {
  fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4,
};
const statValueStyle: React.CSSProperties = {
  fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
};
const statSubStyle: React.CSSProperties = { fontSize: 9, color: 'var(--ink-50)', marginTop: 3 };
