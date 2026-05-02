// LITERAL PORT — wireframe slim/57_overlap-premium.html.
// Premium audience overlap: Channel selector + Period + 5 expandable rows + chart on first.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Period = '7d' | '30d' | '90d';

interface OverlapRow {
  login: string;
  letter: string;
  avatarBg: string;
  sharedViewers: number;
  pct: number;
  pattern?: { perWeek: string; trend: string; days: string; insight: string; hasChart?: boolean };
}

interface Props {
  channelLogin?: string;
  channelLetter?: string;
  channelViewers?: number;
  rows?: OverlapRow[];
  moreCount?: number;
  onChangeChannel?: () => void;
}

const DEFAULT_ROWS: OverlapRow[] = [
  { login: 'Tarik', letter: 'T', avatarBg: 'var(--color-twitch)', sharedViewers: 940, pct: 18, pattern: { perWeek: '5.2', trend: '14→18%', days: 'Пн,Ср,Пт', insight: 'Пересечение растёт: CS2 + общий жанр FPS', hasChart: true } },
  { login: 'Stewie2K', letter: 'S', avatarBg: 'var(--lime)', sharedViewers: 620, pct: 12, pattern: { perWeek: '3.1', trend: '10→12%', days: 'Вт,Чт', insight: 'Стабильное пересечение: общий жанр CS2' } },
  { login: 'Valorant_RU', letter: 'V', avatarBg: 'var(--pink)', sharedViewers: 415, pct: 8 },
  { login: 'n0thing', letter: 'N', avatarBg: 'var(--color-erv-green)', sharedViewers: 310, pct: 6 },
  { login: 'fl0m', letter: 'F', avatarBg: 'var(--color-erv-yellow)', sharedViewers: 210, pct: 4 },
];

export function Frame57OverlapPremium({
  channelLogin = 'shroud',
  channelLetter = 'S',
  channelViewers = 5200,
  rows = DEFAULT_ROWS,
  moreCount = 12,
  onChangeChannel,
}: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('7d');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Tarik', 'Stewie2K']));

  const toggle = (login: string) => {
    const next = new Set(expanded);
    if (next.has(login)) next.delete(login); else next.add(login);
    setExpanded(next);
  };

  return (
    <div className="sp-content" role="tabpanel">
      {/* Channel selector */}
      <div className="sp-signals" style={{ padding: '8px 10px', marginBottom: 8, cursor: 'pointer' }} onClick={() => onChangeChannel?.()} role="button">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-twitch)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>{channelLetter}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{channelLogin}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>{channelViewers.toLocaleString()} зрителей сейчас</div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--ink-30)' }}>Сменить ▾</span>
        </div>
      </div>

      {/* Period */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['7d', '30d', '90d'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`sp-tab ${period === p ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: 10, borderRadius: 20, border: period === p ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-light)' }}
          >{p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}</button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ fontSize: 10, color: 'var(--ink-50)', marginBottom: 10, lineHeight: 1.5 }}>
        Каналы, с&nbsp;которыми у&nbsp;{channelLogin} больше всего общих зрителей. Отсортировано по&nbsp;% пересечения.
      </div>

      {/* List */}
      <div className="sp-signals" style={{ gap: 0 }}>
        <div className="sp-signals-title">{t('overlap.audience_intersection')}</div>
        {rows.map((r, idx) => {
          const isLast = idx === rows.length - 1;
          const isExpanded = expanded.has(r.login);
          return (
            <div key={r.login}>
              <div className="sp-signal-expandable" onClick={() => toggle(r.login)} role="button" aria-expanded={isExpanded}
                style={{ borderBottom: isLast ? undefined : '1px solid var(--border-light)', padding: '8px 0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: r.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>{r.letter}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{r.login}</div>
                    <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>~{r.sharedViewers.toLocaleString()} общих зрителей</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-primary)' }}>{r.pct}%</div>
                  </div>
                  <span className="sp-signal-expand-icon" style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}>▾</span>
                </div>
                <div className="sp-signal-bar-bg" style={{ marginTop: 6 }}>
                  <div className="sp-signal-bar-fill" style={{ width: `${r.pct}%`, background: 'var(--color-primary)', borderRadius: 4 }}></div>
                </div>
              </div>
              {isExpanded && r.pattern && (
                <div className="sp-signal-detail">
                  <div style={{ fontSize: 10, color: 'var(--ink-50)', fontWeight: 600, marginBottom: 6 }}>{t('overlap.historical_pattern')}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: r.pattern.hasChart ? 8 : 4 }}>
                    {[
                      { value: r.pattern.perWeek, label: 'Раз в\u00a0неделю' },
                      { value: r.pattern.trend, label: 'Тренд 7д' },
                      { value: r.pattern.days, label: 'Частые дни' },
                    ].map((p) => (
                      <div key={p.label} style={{ flex: 1, padding: 6, background: 'var(--color-skeleton-from)', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{p.value}</div>
                        <div style={{ fontSize: 9, color: 'var(--ink-50)' }}>{p.label}</div>
                      </div>
                    ))}
                  </div>
                  {r.pattern.hasChart && (
                    <svg viewBox="0 0 340 130" width="100%" style={{ display: 'block', marginBottom: 6 }} preserveAspectRatio="none">
                      <line x1="34" y1="18" x2="330" y2="18" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
                      <line x1="34" y1="50" x2="330" y2="50" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
                      <line x1="34" y1="82" x2="330" y2="82" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
                      <line x1="34" y1="100" x2="330" y2="100" stroke="#9CA3AF" strokeWidth="1" />
                      <text x="30" y="22" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">25%</text>
                      <text x="30" y="54" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">15%</text>
                      <text x="30" y="86" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">5%</text>
                      <text x="30" y="104" textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="JetBrains Mono,monospace">0</text>
                      <text x="40" y="118" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Пн</text>
                      <text x="137" y="118" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Ср</text>
                      <text x="234" y="118" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Пт</text>
                      <text x="328" y="118" textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono,monospace">Вс</text>
                      <path d="M40,68 L88,62 L137,56 L186,48 L234,44 L283,38 L328,32 L328,100 L40,100 Z" fill="#6366f1" fillOpacity="0.08" />
                      <polyline points="40,68 88,62 137,56 186,48 234,44 283,38 328,32" fill="none" stroke="#6366f1" strokeWidth="2" />
                      <circle cx="40" cy="68" r="2.5" fill="#6366f1" />
                      <circle cx="186" cy="48" r="2.5" fill="#6366f1" />
                      <circle cx="328" cy="32" r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
                    </svg>
                  )}
                  <div style={{ fontSize: 9, color: 'var(--ink-50)', textAlign: 'center', padding: r.pattern.hasChart ? '6px 10px' : undefined, background: r.pattern.hasChart ? 'rgba(99,102,241,0.06)' : undefined, borderRadius: r.pattern.hasChart ? 6 : undefined, borderLeft: r.pattern.hasChart ? '3px solid var(--color-primary)' : undefined }}>{r.pattern.insight}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: 'var(--ink-30)', textAlign: 'center', marginTop: 6 }}>Показаны топ-{rows.length} · ещё {moreCount}&nbsp;каналов с&nbsp;пересечением &lt;&nbsp;4%</div>
    </div>
  );
}
