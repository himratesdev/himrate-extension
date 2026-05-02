// LITERAL PORT — wireframe slim/28_screen-1-trends-overview-premium.html.
// 3 insights + 2x grid 9 module cards.
// NOTE: wireframe slim/28 contained period toggle as a standalone screen header.
// Integrated в TrendsTab — period toggle owned by parent (PeriodToggle.tsx) → не дубликат
// (B11 fix). Также убран <div class="sp-content"> wrapper — parent .trends-tab делает flex
// layout, nested .sp-content конфликтовал и обрезал bottom 5 cards (B12 fix).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Insight {
  severity: 'red' | 'yellow' | 'green';
  title: string;
  detail: string;
  dismissable?: boolean;
}

interface Props {
  /** Click handlers per module (open drill-down view). */
  onOpenModule?: (key: string) => void;
}

export function Frame28TrendsOverview({ onOpenModule }: Props) {
  const { t } = useTranslation();
  const [dismissedInsights, setDismissedInsights] = useState<Set<number>>(() => new Set());

  // Wireframe defaults — will be replaced with API data when endpoints ready
  const insights: Insight[] = [
    { severity: 'red', title: 'Рейтинг доверия упал', detail: 'Рейтинг доверия снизился с\u00a089 до\u00a077 за\u00a030 дней. Причина: авторизация зрителей.' },
    { severity: 'yellow', title: 'Нестабильные реальные зрители', detail: 'Колебания 62-88% за последние 10 стримов. Канал нестабилен.' },
    { severity: 'green', title: 'Аномалий за\u00a0месяц не\u00a0замечено', detail: 'Стабильный рост рейтинга на\u00a04\u00a0пункта.', dismissable: true },
  ];

  const insightColors: Record<string, { border: string; bg: string; titleColor: string; detailColor: string }> = {
    red: { border: '#EF4444', bg: '#FEF2F2', titleColor: '#DC2626', detailColor: '#7F1D1D' },
    yellow: { border: '#EAB308', bg: '#FFFBEB', titleColor: '#A16207', detailColor: '#78350F' },
    green: { border: '#22C55E', bg: '#F0FDF4', titleColor: '#15803D', detailColor: '#166534' },
  };

  return (
    <>
      {/* Insights cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {insights.map((ins, i) => {
          if (dismissedInsights.has(i)) return null;
          const c = insightColors[ins.severity];
          return (
            <div
              key={i}
              style={{
                border: '2.5px solid var(--border-dark)',
                borderLeft: `4px solid ${c.border}`,
                borderRadius: 8,
                padding: '10px 12px',
                background: c.bg,
                boxShadow: '2px 2px 0 rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: c.titleColor }}>
                  {ins.title}
                </span>
                {ins.dismissable ? (
                  <button
                    onClick={() => setDismissedInsights(p => { const n = new Set(p); n.add(i); return n; })}
                    style={{ fontSize: 12, color: c.titleColor, cursor: 'pointer', background: 'none', border: 'none', padding: '0 2px', opacity: 0.5, fontWeight: 700 }}
                  >×</button>
                ) : (
                  <span
                    onClick={() => onOpenModule?.(`insight_${i}`)}
                    style={{ fontSize: 10, color: c.titleColor, fontWeight: 600, cursor: 'pointer' }}
                  >{t('sp.more')}</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: c.detailColor, lineHeight: 1.4 }}>
                {ins.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Module grid 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* ERV Timeline */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('erv')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('erv.real_viewers_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ ...moduleValueStyle, color: '#22C55E' }}>83%</div>
          <div style={moduleSubtitleStyle}>{t('trends.overview.module.erv_subtitle_clean')}</div>
          <svg viewBox="0 0 120 28" style={{ width: '100%', height: 24, marginTop: 8 }} preserveAspectRatio="none">
            <path d="M0,22 L20,16 L40,12 L60,18 L80,8 L100,10 L120,4" stroke="#22C55E" strokeWidth="1.5" fill="none" />
          </svg>
          <div style={moduleTrendStyle}>
            <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,1 7,6 1,6" fill="#22C55E" /></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#22C55E' }}>+4.2%</span>
            <span style={{ fontSize: 8, color: 'var(--ink-30)' }}>{t('trends.overview.module.delta_period_30d_short')}</span>
          </div>
        </div>

        {/* TI Timeline */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('ti')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('sp.trust_rating')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ ...moduleValueStyle, color: '#3B82F6' }}>77</div>
          <div style={moduleSubtitleStyle}>{t('trends.overview.module.ti_subtitle_attention')}</div>
          <svg viewBox="0 0 120 28" style={{ width: '100%', height: 24, marginTop: 8 }} preserveAspectRatio="none">
            <path d="M0,4 L20,8 L40,12 L60,14 L80,16 L100,18 L120,22" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
          </svg>
          <div style={moduleTrendStyle}>
            <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,7 7,2 1,2" fill="#EF4444" /></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444' }}>-12 pts</span>
            <span style={{ fontSize: 8, color: 'var(--ink-30)' }}>{t('trends.overview.module.delta_period_30d_short')}</span>
          </div>
        </div>

        {/* Stability */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('stability')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.stability_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ ...moduleValueStyle, color: '#22C55E' }}>88</span>
            <span style={{ fontSize: 10, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>/ 100</span>
          </div>
          <div style={moduleSubtitleStyle}>{t('trends.overview.module.stability_subtitle_stable')}</div>
          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginTop: 8 }}>
            <div style={{ height: '100%', width: '88%', background: '#22C55E', borderRadius: 2 }}></div>
          </div>
          <div style={{ fontSize: 8, color: 'var(--ink-30)', marginTop: 4 }}>Среднее в\u00a0категории: 78</div>
        </div>

        {/* Anomaly Events */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('anomalies')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.anomalies_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ ...moduleValueStyle, color: '#EAB308' }}>5</div>
          <div style={moduleSubtitleStyle}>событий за\u00a030 дней</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ fontSize: 8, padding: '2px 6px', background: '#FEF2F2', color: '#DC2626', borderRadius: 4, fontWeight: 600 }}>1 неизвестна</span>
            <span style={{ fontSize: 8, padding: '2px 6px', background: '#FFFBEB', color: '#A16207', borderRadius: 4, fontWeight: 600 }}>в 2.5× чаще</span>
          </div>
        </div>

        {/* Components */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('components')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.components_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ minHeight: 22, display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink)', lineHeight: 1.2 }}>Что влияет на\u00a0рейтинг</span>
          </div>
          <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 600, marginTop: 3 }}>Авторизация: −18 pts</div>
          <div style={{ display: 'flex', height: 8, gap: 1, borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ flex: 3, background: '#3B82F6' }}></div>
            <div style={{ flex: 2, background: '#22C55E' }}></div>
            <div style={{ flex: 1, background: '#EAB308' }}></div>
            <div style={{ flex: 1, background: '#EF4444' }}></div>
          </div>
        </div>

        {/* Rehabilitation */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('rehab')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.recovery_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ ...moduleValueStyle, color: '#22C55E' }}>8</span>
            <span style={{ fontSize: 10, color: 'var(--ink-30)' }}>/ 15 чистых</span>
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
            {[0,1,2,3,4,5,6,7].map(i => (<div key={i} style={{ flex: 1, height: 5, background: '#22C55E', borderRadius: 1 }}></div>))}
            <div style={{ flex: 1, height: 5, background: '#EF4444', borderRadius: 1 }}></div>
            {[0,1,2,3,4,5].map(i => (<div key={i} style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 1 }}></div>))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(139,92,246,0.1)', color: '#7C3AED', borderRadius: 4, fontWeight: 700 }}>+8 бонус</span>
            <span style={{ fontSize: 8, color: 'var(--ink-30)' }}>~7 стримов</span>
          </div>
        </div>

        {/* Peer Comparison */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('peer')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.peer_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ ...moduleValueStyle, color: '#3B82F6' }}>Топ 12%</div>
          <div style={moduleSubtitleStyle}>Just Chatting</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
            <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,1 7,6 1,6" fill="#22C55E" /></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#22C55E' }}>+8 мест</span>
            <span style={{ fontSize: 8, color: 'var(--ink-30)' }}>{t('trends.overview.module.delta_period_30d_short')}</span>
          </div>
        </div>

        {/* Category Pattern */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('category')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.category_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ minHeight: 22, display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink)', lineHeight: 1.2 }}>Лучшие в\u00a0Fortnite</span>
          </div>
          <div style={moduleSubtitleStyle}>JC: 28 стр. · FN: 6 стр.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
            <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,1 7,6 1,6" fill="#22C55E" /></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#22C55E' }}>+10 pts</span>
            <span style={{ fontSize: 8, color: 'var(--ink-30)' }}>в\u00a0Fortnite</span>
          </div>
        </div>

        {/* DoW Pattern */}
        <div className="sp-module-card" onClick={() => onOpenModule?.('weekday')} style={moduleCardStyle}>
          <div style={moduleHeaderStyle}><span style={moduleLabelStyle}>{t('trends.overview.module.weekday_label')}</span><span style={moduleArrowStyle}>→</span></div>
          <div style={{ minHeight: 22, display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink)', lineHeight: 1 }}>{t('trends.weekday.friday')}</span>
          </div>
          <div style={moduleSubtitleStyle}>лучший день · Дов. 81</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24, marginTop: 8 }}>
            <div style={{ flex: 1, height: '60%', background: '#3B82F6', borderRadius: '2px 2px 0 0', opacity: 0.4 }}></div>
            <div style={{ flex: 1, height: '45%', background: '#3B82F6', borderRadius: '2px 2px 0 0', opacity: 0.4 }}></div>
            <div style={{ flex: 1, height: '70%', background: '#3B82F6', borderRadius: '2px 2px 0 0', opacity: 0.4 }}></div>
            <div style={{ flex: 1, height: '55%', background: '#3B82F6', borderRadius: '2px 2px 0 0', opacity: 0.4 }}></div>
            <div style={{ flex: 1, height: '100%', background: '#22C55E', borderRadius: '2px 2px 0 0' }}></div>
            <div style={{ flex: 1, height: '75%', background: '#10B981', borderRadius: '2px 2px 0 0', opacity: 0.5 }}></div>
            <div style={{ flex: 1, height: '40%', background: '#10B981', borderRadius: '2px 2px 0 0', opacity: 0.3 }}></div>
          </div>
        </div>
      </div>
    </>
  );
}

const moduleCardStyle: React.CSSProperties = {
  border: '2.5px solid var(--border-dark)',
  borderRadius: 8,
  padding: '10px 12px',
  background: 'white',
  boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
  cursor: 'pointer',
};

const moduleHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
};

const moduleLabelStyle: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--ink-50)',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 600,
};

const moduleArrowStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--ink-30)',
};

const moduleValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace",
  lineHeight: 1,
};

const moduleSubtitleStyle: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--ink-50)',
  marginTop: 3,
};

const moduleTrendStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  marginTop: 4,
};
