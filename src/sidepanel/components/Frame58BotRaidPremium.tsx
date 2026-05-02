// LITERAL PORT — wireframe slim/58_botraid-premium.html.
// Bot-Raid Chain Premium: Current stream summary + 3 incidents (expandable with viewer flow) + 30-day summary.
// NOTE: Per CLAUDE.md ERV labels v3 — wireframe «бот»/«накрутка» wording replaced with legal-safe «аномалия» equivalents.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FlowItem { icon: string; label: string; count: string; pct: string }

interface Incident {
  id: string;
  severity: 'red' | 'yellow' | 'green';
  title: string;
  badge: string;
  badgeColor: 'red' | 'yellow' | 'green';
  timeRange: string;
  delta: string;
  detail?: {
    cameFrom: FlowItem[];
    wentTo: FlowItem[];
    impact?: { ervBefore: string; ervDuring: string; ervAfter: string; recoveryTime: string; recoveryNote: string };
    note?: string;
    noteColor?: 'red' | 'yellow' | 'green' | 'neutral';
  };
}

interface Props {
  checkedViewers?: number;
  suspiciousViewers?: number;
  suspiciousPct?: number;
  raidsNow?: number;
  incidents?: Incident[];
  totals?: { incidents: number; redCount: number; yellowCount: number; greenCount: number };
}

const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'i1', severity: 'red', title: 'Аномальная волна', badge: 'Аномалия', badgeColor: 'red',
    timeRange: '01.04 · 14:32 — 14:47 · 15\u00a0мин', delta: '+3,200',
    detail: {
      cameFrom: [
        { icon: '🤖', label: 'Новые аккаунты (без истории)', count: '2,400', pct: '75%' },
        { icon: '🔴', label: 'bot_farm_nl (забанен)', count: '520', pct: '16%' },
        { icon: '❓', label: 'Разные каналы (мелкие)', count: '280', pct: '9%' },
      ],
      wentTo: [
        { icon: '💀', label: 'Отключились (оффлайн)', count: '2,800', pct: '88%' },
        { icon: '→', label: 'xQc', count: '250', pct: '8%' },
        { icon: '→', label: 'Другие каналы', count: '150', pct: '4%' },
      ],
      impact: { ervBefore: '85%', ervDuring: '42%', ervAfter: '85%', recoveryTime: '~3\u00a0мин', recoveryNote: 'Через 3\u00a0минуты после того как\u00a0аномалия ушла, ERV вернулся к\u00a0обычному уровню. Рейтинг канала не\u00a0пострадал.' },
    },
  },
  {
    id: 'i2', severity: 'yellow', title: 'Подозрительный рейд', badge: 'Рейд', badgeColor: 'yellow',
    timeRange: '28.03 · 08:15 — 08:28 (13 мин)', delta: '+1,800',
    detail: {
      cameFrom: [
        { icon: '⚠', label: 'unknown_channel', count: '1,400', pct: '78%' },
        { icon: '❓', label: 'Аккаунты < 7 дней', count: '400', pct: '22%' },
      ],
      wentTo: [
        { icon: '→', label: 'Вернулись на unknown_channel', count: '1,100', pct: '61%' },
        { icon: '💀', label: 'Отключились', count: '500', pct: '28%' },
        { icon: '→', label: 'Остались у shroud', count: '200', pct: '11%' },
      ],
      note: 'Связь: 85% аккаунтов привязаны через одного создателя',
      noteColor: 'neutral',
    },
  },
  {
    id: 'i3', severity: 'green', title: 'Рейд от Tarik', badge: 'Норма', badgeColor: 'green',
    timeRange: '25.03 · 19:44 — 20:10 (26 мин)', delta: '+500',
    detail: {
      cameFrom: [
        { icon: '✅', label: 'Tarik (100% реальные, история 1+ мес)', count: '500', pct: '100%' },
      ],
      wentTo: [
        { icon: '✅', label: 'Остались у shroud', count: '320', pct: '64%' },
        { icon: '→', label: 'Разошлись по другим каналам', count: '180', pct: '36%' },
      ],
      note: 'Влияние на\u00a0реальных зрителей: без изменений (все реальные)',
      noteColor: 'green',
    },
  },
];

const ervColor = (c: 'red' | 'yellow' | 'green'): string => {
  if (c === 'red') return 'var(--color-erv-red)';
  if (c === 'yellow') return 'var(--color-erv-yellow)';
  return 'var(--color-erv-green)';
};

const FlowList = ({ title, items }: { title: string; items: FlowItem[] }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 9, color: 'var(--ink-30)', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
    {items.map((it, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: i === items.length - 1 ? undefined : '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 10, width: 16, textAlign: 'center' }}>{it.icon}</span>
        <span style={{ fontSize: 10, flex: 1 }}>{it.label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{it.count}</span>
        <span style={{ fontSize: 9, color: 'var(--ink-30)' }}>{it.pct}</span>
      </div>
    ))}
  </div>
);

export function Frame58BotRaidPremium({
  checkedViewers = 5200,
  suspiciousViewers = 12,
  suspiciousPct = 0.2,
  raidsNow = 0,
  incidents = DEFAULT_INCIDENTS,
  totals = { incidents: 3, redCount: 1, yellowCount: 1, greenCount: 1 },
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['i1', 'i2', 'i3']));
  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  return (
    <div className="sp-content" role="tabpanel">
      {/* Current stream summary */}
      <div className="sp-signals" style={{ padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('botraid.current_stream')}</span>
          <span className="sp-erv-label green" style={{ fontSize: 9, padding: '2px 6px' }}>{t('botraid.status_clean')}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 6, background: 'var(--color-skeleton-from)', borderRadius: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{checkedViewers.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-50)' }}>{t('botraid.checked_label')}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 6, background: 'var(--color-skeleton-from)', borderRadius: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-erv-green)' }}>{suspiciousViewers}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-50)' }}>Подозрит. ({suspiciousPct}%)</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 6, background: 'var(--color-skeleton-from)', borderRadius: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{raidsNow}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-50)' }}>{t('botraid.raids_now')}</div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="sp-signals" style={{ gap: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="sp-signals-title" style={{ margin: 0 }}>{t('botraid.history_title')}</span>
          <span style={{ fontSize: 9, color: 'var(--ink-30)' }}>{t('botraid.history_subtitle_30d')}</span>
        </div>
        {incidents.map((inc, i) => {
          const isLast = i === incidents.length - 1;
          const isExpanded = expanded.has(inc.id);
          return (
            <div key={inc.id}>
              <div className="sp-signal-expandable" onClick={() => toggle(inc.id)} role="button" aria-expanded={isExpanded}
                style={{ borderBottom: isLast ? undefined : '1px solid var(--border-light)', padding: '8px 0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: ervColor(inc.severity) }}>●</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{inc.title}</span>
                      <span className={`sp-erv-label ${inc.badgeColor}`} style={{ fontSize: 8, padding: inc.badgeColor === 'red' ? '2px 6px' : '2px 5px', textTransform: inc.badgeColor === 'red' ? 'uppercase' : undefined, letterSpacing: inc.badgeColor === 'red' ? '0.05em' : undefined, fontFamily: inc.badgeColor === 'red' ? "'JetBrains Mono', monospace" : undefined, background: inc.badgeColor === 'red' ? 'rgba(239,68,68,0.12)' : undefined, color: inc.badgeColor === 'red' ? 'var(--color-erv-red)' : undefined, borderRadius: 4, fontWeight: 700 }}>{inc.badge}</span>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>{inc.timeRange}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: ervColor(inc.severity) }}>{inc.delta}</span>
                    {inc.severity === 'red' && (<span style={{ fontSize: 8, color: 'var(--ink-30)' }}>{t('botraid.viewers_word')}</span>)}
                  </div>
                  <span className="sp-signal-expand-icon" style={{ marginTop: inc.severity === 'red' ? 2 : 0, transform: isExpanded ? 'rotate(180deg)' : undefined }}>▾</span>
                </div>
              </div>
              {isExpanded && inc.detail && (
                <div className="sp-signal-detail">
                  <div style={{ fontSize: 10, color: 'var(--ink-50)', marginBottom: 6, fontWeight: 600 }}>{t('botraid.viewer_flow')}</div>
                  <FlowList title="Откуда пришли" items={inc.detail.cameFrom} />
                  <FlowList title="Куда ушли после" items={inc.detail.wentTo} />
                  {inc.detail.impact && (
                    <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.04)', borderRadius: 8, borderLeft: '3px solid var(--color-erv-red)', fontSize: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-50)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Что произошло с&nbsp;каналом</div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                          <span style={{ color: 'var(--ink-70)', fontWeight: 600 }}>Доля реальных зрителей (ERV)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>
                          <span style={{ color: 'var(--color-erv-green)' }}>{inc.detail.impact.ervBefore}</span>
                          <span style={{ color: 'var(--ink-30)' }}>→</span>
                          <span style={{ color: 'var(--color-erv-red)' }}>{inc.detail.impact.ervDuring}</span>
                          <span style={{ color: 'var(--ink-30)' }}>→</span>
                          <span style={{ color: 'var(--color-erv-green)' }}>{inc.detail.impact.ervAfter}</span>
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--ink-50)', marginTop: 3, lineHeight: 1.4 }}>До&nbsp;атаки · во&nbsp;время · после восстановления</div>
                      </div>
                      <div style={{ paddingTop: 8, borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                          <span style={{ color: 'var(--ink-70)', fontWeight: 600 }}>{t('botraid.recovery_label')} </span>
                          <span style={{ color: 'var(--color-erv-green)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{inc.detail.impact.recoveryTime}</span>
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--ink-50)', lineHeight: 1.4 }}>{inc.detail.impact.recoveryNote}</div>
                      </div>
                    </div>
                  )}
                  {inc.detail.note && (
                    <div style={{
                      fontSize: 9,
                      color: inc.detail.noteColor === 'green' ? 'var(--color-erv-green)' : 'var(--ink-50)',
                      padding: '4px 8px',
                      background: 'var(--color-skeleton-from)',
                      borderRadius: 4,
                    }}>{inc.detail.note}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 30-day summary */}
      <div className="sp-signals" style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 10, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Итого за&nbsp;30 дней</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
          {[
            { value: totals.incidents, label: 'Инцидента', color: undefined },
            { value: totals.redCount, label: 'Аномалия', color: 'var(--color-erv-red)' },
            { value: totals.yellowCount, label: 'Подозрит.', color: 'var(--color-erv-yellow)' },
            { value: totals.greenCount, label: 'Норма', color: 'var(--color-erv-green)' },
          ].map((t, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.color }}>{t.value}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
