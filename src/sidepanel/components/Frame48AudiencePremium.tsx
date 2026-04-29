// LITERAL PORT — wireframe slim/48_audience-premium.html.
// Audience Premium tab: Geography (5 countries grid) + Language (3 langs) + New vs Returning (numbers + stacked bar + expanded 7d trend chart).

import { useState } from 'react';

interface CountryRow { flag: string; name: string; pct: number }
interface LangRow { name: string; pct: number }

interface Props {
  countries?: CountryRow[];
  otherCountriesCount?: number;
  otherCountriesPct?: number;
  languages?: LangRow[];
  newCount?: number;
  newPct?: number;
  returningCount?: number;
  returningPct?: number;
  newDelta7d?: string;
  insight?: string;
}

const DEFAULT_COUNTRIES: CountryRow[] = [
  { flag: '🇺🇸', name: 'США', pct: 45 },
  { flag: '🇬🇧', name: 'Великобритания', pct: 18 },
  { flag: '🇩🇪', name: 'Германия', pct: 12 },
  { flag: '🇫🇷', name: 'Франция', pct: 8 },
  { flag: '🇧🇷', name: 'Бразилия', pct: 5 },
];

const DEFAULT_LANGUAGES: LangRow[] = [
  { name: 'Английский', pct: 65 },
  { name: 'Немецкий', pct: 15 },
  { name: 'Испанский', pct: 10 },
];

export function Frame48AudiencePremium({
  countries = DEFAULT_COUNTRIES,
  otherCountriesCount = 12,
  otherCountriesPct = 12,
  languages = DEFAULT_LANGUAGES,
  newCount = 1664,
  newPct = 32,
  returningCount = 3536,
  returningPct = 68,
  newDelta7d = '+6пп',
  insight = 'Доля новых снижается (38% → 32%). Аудитория становится лояльнее.',
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sp-content" role="tabpanel">
      {/* Geography */}
      <div className="sp-signals" style={{ gap: 6 }}>
        <div className="sp-signals-title">География зрителей</div>
        {countries.map((c) => (
          <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 110px 32px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <span style={{ fontSize: 16 }}>{c.flag}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-70)', fontWeight: 500 }}>{c.name}</span>
            <div style={{ height: 8, background: 'var(--color-skeleton-from)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${c.pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 4 }}></div>
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: 'right' }}>{c.pct}%</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: 'var(--ink-30)', textAlign: 'center', paddingTop: 2 }}>
          + ещё {otherCountriesCount}&nbsp;стран ({otherCountriesPct}%)
        </div>
      </div>

      {/* Language */}
      <div className="sp-signals" style={{ gap: 6 }}>
        <div className="sp-signals-title">Язык зрителей</div>
        {languages.map((l) => (
          <div key={l.name} className="sp-signal-row">
            <span className="sp-signal-name">{l.name}</span>
            <div className="sp-signal-bar-bg"><div className="sp-signal-bar-fill" style={{ width: `${l.pct}%`, background: 'var(--color-primary)' }}></div></div>
            <span className="sp-signal-val" style={{ color: 'var(--color-primary)' }}>{l.pct}%</span>
          </div>
        ))}
      </div>

      {/* New vs Returning */}
      <div className="sp-signals sp-signal-expandable" style={{ gap: 6, cursor: 'pointer' }} onClick={() => setExpanded(v => !v)} role="button" aria-expanded={expanded}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="sp-signals-title">Новые vs повторные зрители</span>
          <span className="sp-signal-expand-icon" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}>▾</span>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px', background: 'var(--color-skeleton-from)', borderRadius: 8, border: '1.5px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-primary)' }}>{newCount.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 2 }}>Новые · {newPct}%</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px', background: 'var(--color-skeleton-from)', borderRadius: 8, border: '1.5px solid rgba(5,150,105,0.2)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-erv-green)' }}>{returningCount.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 2 }}>Повторные · {returningPct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${newPct}%`, background: 'var(--color-primary)' }}></div>
          <div style={{ width: `${returningPct}%`, background: 'var(--color-erv-green)' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-30)', marginTop: 2 }}>
          <span>Новые {newPct}%</span>
          <span>Повторные {returningPct}%</span>
        </div>
      </div>

      {/* Expanded — trend chart */}
      {expanded && (
        <div className="sp-signal-detail">
          <div style={{ fontSize: 10, color: 'var(--ink-50)', fontWeight: 600, marginBottom: 8 }}>Тренд за&nbsp;7 дней</div>
          <div className="sp-chart-stats">
            <div className="sp-chart-stat"><div className="sp-chart-stat-label">Новые</div><div className="sp-chart-stat-value" style={{ color: 'var(--color-primary)' }}>{newPct}%</div></div>
            <div className="sp-chart-stat"><div className="sp-chart-stat-label">Повторные</div><div className="sp-chart-stat-value green">{returningPct}%</div></div>
            <div className="sp-chart-stat"><div className="sp-chart-stat-label">Изм. 7д</div><div className="sp-chart-stat-value green">{newDelta7d}</div></div>
          </div>
          <svg className="sp-sparkline-chart" viewBox="0 0 340 160" preserveAspectRatio="none">
            <line x1="34" y1="20" x2="330" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
            <line x1="34" y1="55" x2="330" y2="55" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
            <line x1="34" y1="90" x2="330" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
            <line x1="34" y1="125" x2="330" y2="125" stroke="#9CA3AF" strokeWidth="1" />
            <text x="30" y="24" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">100%</text>
            <text x="30" y="59" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">66%</text>
            <text x="30" y="94" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">33%</text>
            <text x="30" y="129" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0%</text>
            <text x="40" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Пн</text>
            <text x="88" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Вт</text>
            <text x="137" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Ср</text>
            <text x="186" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Чт</text>
            <text x="234" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Пт</text>
            <text x="283" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Сб</text>
            <text x="328" y="145" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Вс</text>
            <path d="M40,60 L88,58 L137,56 L186,50 L234,48 L283,44 L328,40 L328,125 L40,125 Z" fill="#059669" fillOpacity="0.08" />
            <polyline points="40,60 88,58 137,56 186,50 234,48 283,44 328,40" fill="none" stroke="#059669" strokeWidth="2" />
            <polyline points="40,82 88,84 137,88 186,90 234,94 283,96 328,100" fill="none" stroke="#6366f1" strokeWidth="2" />
            <circle cx="40" cy="60" r="2.5" fill="#059669" />
            <circle cx="328" cy="40" r="4" fill="#059669" stroke="white" strokeWidth="2" />
            <circle cx="40" cy="82" r="2.5" fill="#6366f1" />
            <circle cx="328" cy="100" r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
          </svg>
          <div className="sp-sparkline-legend" style={{ marginTop: 6 }}>
            <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line" style={{ background: '#6366f1' }}></span> Новые</span>
            <span className="sp-sparkline-legend-item"><span className="sp-sparkline-legend-line green"></span> Повторные</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 8, padding: '8px 10px', background: 'rgba(5,150,105,0.06)', borderRadius: 6, borderLeft: '3px solid var(--color-erv-green)' }}>{insight}</div>
        </div>
      )}
    </div>
  );
}
