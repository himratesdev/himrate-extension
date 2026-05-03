// LITERAL PORT — wireframe slim/56_compare-premium-2-kanala.html.
// Premium 2-channel compare: Period selector + Channel pickers + 12-metric table + Legend + Business banner.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Period = '7d' | '30d' | '90d';

interface ChannelInfo { name: string; ervPct: number; ervColor: 'green' | 'yellow' | 'red' }

interface MetricRow {
  leftValue: string;
  metricLabel: React.ReactNode;
  rightValue: string;
  leftWins: boolean; // 'green' = winner, 'red' = loser; if null both same color (just bg)
  leftColor?: 'green' | 'yellow' | 'red' | null;
  rightColor?: 'green' | 'yellow' | 'red' | null;
}

interface Props {
  channelLeft?: ChannelInfo;
  channelRight?: ChannelInfo;
  metrics?: MetricRow[];
  onAddThirdChannel?: () => void;
  onPickChannelLeft?: () => void;
  onPickChannelRight?: () => void;
  onUpgradeBusiness?: () => void;
  onMetricClick?: (index: number) => void;
}

const DEFAULT_LEFT: ChannelInfo = { name: 'shroud', ervPct: 85, ervColor: 'green' };
const DEFAULT_RIGHT: ChannelInfo = { name: 'xQc', ervPct: 62, ervColor: 'yellow' };

const colorFor = (c?: 'green' | 'yellow' | 'red' | null): string | undefined => {
  if (c === 'green') return 'var(--color-erv-green)';
  if (c === 'yellow') return 'var(--color-erv-yellow)';
  if (c === 'red') return 'var(--color-erv-red)';
  return undefined;
};

export function Frame56ComparePremium({
  channelLeft = DEFAULT_LEFT,
  channelRight = DEFAULT_RIGHT,
  metrics: metricsProp,
  onAddThirdChannel,
  onPickChannelLeft,
  onPickChannelRight,
  onUpgradeBusiness,
  onMetricClick,
}: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('7d');

  // Build metric labels through i18n (defaults — wireframe verbatim)
  const metrics: MetricRow[] = metricsProp ?? [
    { leftValue: '85%', rightValue: '62%', leftWins: true, leftColor: 'green', rightColor: 'yellow', metricLabel: <>{t('compare.row.real_line1')}<br />{t('compare.row.real_line2')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '4,420', rightValue: '26,040', leftWins: false, leftColor: 'green', rightColor: 'yellow', metricLabel: <>{t('compare.row.real')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '5,200', rightValue: '42,000', leftWins: false, metricLabel: <>{t('compare.row.avg_online')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>Twitch</span></> },
    { leftValue: '7,800', rightValue: '156,000', leftWins: false, metricLabel: <>{t('compare.row.peak_online')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>Twitch</span></> },
    { leftValue: '88', rightValue: '62', leftWins: true, leftColor: 'green', rightColor: 'yellow', metricLabel: <>{t('compare.row.trust_line1')}<br />{t('compare.row.trust_line2')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '92%', rightValue: '55%', leftWins: true, leftColor: 'green', rightColor: 'red', metricLabel: <>{t('compare.row.auth_ratio')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '8.2%', rightValue: '5.1%', leftWins: true, leftColor: 'green', rightColor: 'yellow', metricLabel: <>{t('signal.chatter_ccv')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '34%', rightValue: '12%', leftWins: true, leftColor: 'green', rightColor: 'red', metricLabel: <>{t('compare.row.subscribers')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>Twitch</span></> },
    { leftValue: '78%', rightValue: '88%', leftWins: true, leftColor: null, rightColor: 'red', metricLabel: <>{t('compare.row.silent')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '5ч 20м', rightValue: '8ч 45м', leftWins: false, metricLabel: <>{t('compare.row.avg_duration')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>Twitch</span></> },
    { leftValue: '85', rightValue: '45', leftWins: true, leftColor: 'green', rightColor: 'red', metricLabel: <>{t('compare.row.reputation')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate</span></> },
    { leftValue: '+12%', rightValue: '-8%', leftWins: true, leftColor: 'green', rightColor: 'red', metricLabel: <>{t('compare.row.reputation_trend')}<br /><span style={{ fontSize: 7, color: 'var(--ink-30)' }}>HimRate 30д</span></> },
  ];

  return (
    <div className="sp-content" role="tabpanel">
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['7d', '30d', '90d'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`sp-tab ${period === p ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: 10, borderRadius: 20, border: period === p ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-light)' }}
          >{p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}</button>
        ))}
      </div>

      {/* Channel selectors */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'stretch' }}>
        <div className="sp-signals" style={{ flex: 1, padding: 8, textAlign: 'center', cursor: 'pointer' }} onClick={() => onPickChannelLeft?.()} role="button">
          <div style={{ fontSize: 9, color: 'var(--ink-30)', marginBottom: 2 }}>{t('compare.legend.channel_1')}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colorFor(channelLeft.ervColor) }}>{channelLeft.name}</div>
          <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>Зрит. {channelLeft.ervPct}%</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 10, color: 'var(--ink-30)', fontWeight: 700 }}>vs</div>
        <div className="sp-signals" style={{ flex: 1, padding: 8, textAlign: 'center', cursor: 'pointer' }} onClick={() => onPickChannelRight?.()} role="button">
          <div style={{ fontSize: 9, color: 'var(--ink-30)', marginBottom: 2 }}>{t('compare.legend.channel_2')}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colorFor(channelRight.ervColor) }}>{channelRight.name}</div>
          <div style={{ fontSize: 9, color: 'var(--ink-30)' }}>Зрит. {channelRight.ervPct}%</div>
        </div>
        <div className="sp-signals" style={{ width: 40, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.6 }} onClick={() => onAddThirdChannel?.()} role="button" aria-label="Add 3rd channel">
          <span style={{ fontSize: 20, color: 'var(--color-primary)', fontWeight: 300 }}>+</span>
        </div>
      </div>

      {/* Comparison table */}
      <div className="sp-signals" style={{ gap: 0 }}>
        <div style={{ display: 'flex', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: '4px 0', borderBottom: '2px solid var(--border-dark)', color: 'var(--ink-30)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span style={{ flex: 1, textAlign: 'center', color: colorFor(channelLeft.ervColor) }}>{channelLeft.name}</span>
          <span style={{ width: 90, textAlign: 'center' }}>{t('compare.metric_header')}</span>
          <span style={{ flex: 1, textAlign: 'center', color: colorFor(channelRight.ervColor) }}>{channelRight.name}</span>
          <span style={{ width: 14 }}></span>
        </div>
        {metrics.map((row, i) => {
          const leftBg = row.leftWins ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
          const rightBg = row.leftWins ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)';
          const leftBorder = row.leftWins ? '3px solid #22c55e' : '3px solid #ef4444';
          const rightBorder = row.leftWins ? '3px solid #ef4444' : '3px solid #22c55e';
          const isLast = i === metrics.length - 1;
          return (
            <div key={i} role="button" onClick={() => onMetricClick?.(i)}
              style={{ display: 'flex', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '6px 0', borderBottom: isLast ? undefined : '1px solid var(--border-light)', cursor: 'pointer', alignItems: 'center' }}
            >
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: colorFor(row.leftColor), background: leftBg, borderLeft: leftBorder, padding: '4px 0' }}>{row.leftValue}</span>
              <span style={{ width: 90, textAlign: 'center', color: 'var(--ink-50)', fontSize: 9 }}>{row.metricLabel}</span>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: colorFor(row.rightColor), background: rightBg, borderLeft: rightBorder, padding: '4px 0' }}>{row.rightValue}</span>
              <span style={{ width: 14, textAlign: 'center', color: 'var(--ink-30)', fontSize: 9 }}>→</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: 6, fontSize: 10, color: 'var(--ink-70)' }}>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>{t('compare.legend.data_source')}</div>
        <div style={{ marginBottom: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--color-primary)', borderRadius: 2, verticalAlign: 'middle', marginRight: 6 }}></span>HimRate&nbsp;— наши расчёты</div>
        <div style={{ marginBottom: 10 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--ink-50)', borderRadius: 2, verticalAlign: 'middle', marginRight: 6 }}></span>Twitch&nbsp;— официальные данные</div>
        <div style={{ fontSize: 9, color: 'var(--ink-30)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, paddingTop: 8, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>{t('compare.legend.row_color')}</div>
        <div style={{ marginBottom: 4 }}><span style={{ display: 'inline-block', width: 3, height: 12, background: '#22c55e', verticalAlign: 'middle', marginRight: 8 }}></span>Лучше у&nbsp;канала</div>
        <div><span style={{ display: 'inline-block', width: 3, height: 12, background: '#ef4444', verticalAlign: 'middle', marginRight: 8 }}></span>Хуже у&nbsp;канала</div>
      </div>
      <div style={{ fontSize: 9, color: 'var(--ink-30)', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>Нажмите на&nbsp;строку для&nbsp;графика сравнения за&nbsp;период</div>

      {/* Business banner */}
      <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1e5e 100%)', border: '2.5px solid #1a1a1a', color: 'white', position: 'relative', boxShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Business</div>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'white', marginBottom: 4, lineHeight: 1.3 }}>Сравнивайте до&nbsp;5 каналов одновременно</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: 10 }}>Premium ограничен 2 каналами. Business снимает лимит + даёт API-доступ для&nbsp;интеграций в&nbsp;ваши дашборды.</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => onUpgradeBusiness?.()} style={{ flex: 1, padding: '8px 12px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid white', borderRadius: 8, background: 'white', color: '#1a1a1a', cursor: 'pointer' }}>Перейти на&nbsp;Business</button>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', fontWeight: 700, whiteSpace: 'nowrap' }}>$99/мес</span>
        </div>
      </div>
    </div>
  );
}
