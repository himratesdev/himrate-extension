// BUG-016 PR-1a: MiniSparkline LITERAL PORT from wireframe slim/14_live-premium-green-91.html
// Wireframe sp-sparkline section (lines 277-315): full chart 340×160 with header,
// 3 stats, grid lines, Y/X labels, ERV area + ERV polyline + Total online dashed,
// 4 markers, legend.
//
// Empty state renders identical DOM structure with "—" stats + no polylines, so
// users see the chart shell + legend even before data arrives (frame 11 wireframe
// always shows full M5 with chart visible).

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import { formatNumber } from '../../shared/format';
import type { SparklinePoint } from '../../shared/api';

interface Props {
  channelId: string | null;
  isLive: boolean;
  isPremium: boolean;
  ervColor?: 'green' | 'yellow' | 'red';
  onNavigate?: (tab: string) => void;
}

const VIEWBOX_W = 340;
const VIEWBOX_H = 160;
const X_START = 34;
const X_END = 330;
const Y_TOP = 20;
const Y_BOTTOM = 125;
const Y_LABELS = [20, 55, 90, 125];
const ERV_COLOR_HEX: Record<string, string> = {
  green: '#059669',
  yellow: '#D97706',
  red: '#DC2626',
  grey: '#9CA3AF',
};

function niceCeil(v: number): number {
  if (v <= 0) return 1000;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

function formatK(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : v % 1000 === 0 ? 0 : 1)}K`;
  return v.toString();
}

function pctChange(first: number, last: number): number {
  if (first === 0) return 0;
  return Math.round(((last - first) / first) * 100);
}

export function MiniSparkline({ channelId, isLive, isPremium, ervColor = 'green', onNavigate }: Props) {
  const { t, i18n } = useTranslation();
  const [points, setPoints] = useState<SparklinePoint[]>([]);

  useEffect(() => {
    if (!channelId) return;
    const period = isLive ? '30m' : '7d';
    if (period === '7d' && !isPremium) {
      setPoints([]);
      return;
    }
    let cancelled = false;
    api.getTrustHistory(channelId, period).then((data) => {
      if (cancelled) return;
      if (data?.points) setPoints(data.points);
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, isLive, isPremium]);

  const computed = useMemo(() => {
    if (points.length < 2) return null;
    const ervSeries = points.map((p) => p.erv_count ?? 0);
    const ccvSeries = points.map((p) => p.ccv ?? 0);
    const maxVal = Math.max(...ervSeries, ...ccvSeries);
    const yMax = niceCeil(maxVal);
    const yScale = (v: number) => Y_BOTTOM - (Math.max(0, v) / yMax) * (Y_BOTTOM - Y_TOP);
    const xScale = (i: number) => X_START + (i / (points.length - 1)) * (X_END - X_START);
    const ervPath = ervSeries.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    const ccvPath = ccvSeries.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    const ervArea = `M${X_START},${Y_BOTTOM} L${ervPath.split(' ').map((p) => `${p}`).join(' L')} L${X_END},${Y_BOTTOM} Z`;
    return { ervSeries, ccvSeries, yMax, ervPath, ccvPath, ervArea, xScale, yScale };
  }, [points]);

  const ervStroke = ERV_COLOR_HEX[ervColor] || ERV_COLOR_HEX.green;
  const lastErv = computed ? computed.ervSeries[computed.ervSeries.length - 1] : null;
  const maxErv = computed ? Math.max(...computed.ervSeries) : null;
  const change = computed ? pctChange(computed.ervSeries[0], lastErv!) : null;
  const changeColor: 'green' | 'yellow' | 'red' =
    change == null ? 'green' : change >= 5 ? 'green' : change <= -5 ? 'red' : 'yellow';

  const markerIdx = computed
    ? [0, Math.floor(points.length / 3), Math.floor((2 * points.length) / 3), points.length - 1]
    : [];

  return (
    <div className="sp-sparkline">
      {/* Header — title + "Подробнее →" link */}
      <div className="sp-sparkline-header">
        <span className="sp-sparkline-title">
          {isLive ? t('sp.sparkline_title_live') : t('sp.sparkline_title_7d')}
        </span>
        <a
          href="#"
          className="sp-sparkline-more"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('trends');
          }}
        >
          {t('sp.more')}
        </a>
      </div>

      {/* 3 stats — populated or "—" placeholders */}
      <div className="sp-chart-stats">
        <div className="sp-chart-stat">
          <div className="sp-chart-stat-label">{t('sp.chart_now')}</div>
          <div className={`sp-chart-stat-value ${computed ? ervColor : ''}`}>
            {lastErv != null ? formatNumber(lastErv, i18n.language) : '—'}
          </div>
        </div>
        <div className="sp-chart-stat">
          <div className="sp-chart-stat-label">{t('sp.chart_max')}</div>
          <div className="sp-chart-stat-value">
            {maxErv != null ? formatNumber(maxErv, i18n.language) : '—'}
          </div>
        </div>
        <div className="sp-chart-stat">
          <div className="sp-chart-stat-label">{t('sp.chart_change_30m')}</div>
          <div className={`sp-chart-stat-value ${computed ? changeColor : ''}`}>
            {change != null ? `${change >= 0 ? '+' : ''}${change}%` : '—'}
          </div>
        </div>
      </div>

      {/* SVG chart 340×160 — always rendered with full structure */}
      <svg
        className="sp-sparkline-chart"
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={isLive ? '30min ERV+CCV trend' : '7d ERV+TI trend'}
      >
        {/* Horizontal grid — 3 dashed + 1 solid bottom */}
        {Y_LABELS.slice(0, -1).map((y) => (
          <line key={y} x1={X_START} y1={y} x2={X_END} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,3" />
        ))}
        <line x1={X_START} y1={Y_BOTTOM} x2={X_END} y2={Y_BOTTOM} stroke="#9CA3AF" strokeWidth="1" />

        {/* Y axis labels — only when data present (otherwise scale unknown) */}
        {computed &&
          Y_LABELS.map((y) => {
            const ratio = (Y_BOTTOM - y) / (Y_BOTTOM - Y_TOP);
            const value = computed.yMax * ratio;
            return (
              <text
                key={y}
                x={30}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#9ca3af"
                fontFamily="JetBrains Mono, monospace"
              >
                {value === 0 ? '0' : formatK(value)}
              </text>
            );
          })}

        {/* X axis labels — always rendered (time-based, doesn't need data) */}
        {[
          { x: X_START, anchor: 'start' as const, label: isLive ? '−30м' : '−7д' },
          { x: X_START + (X_END - X_START) / 3, anchor: 'middle' as const, label: isLive ? '−20м' : '−5д' },
          { x: X_START + ((X_END - X_START) * 2) / 3, anchor: 'middle' as const, label: isLive ? '−10м' : '−2д' },
          { x: X_END, anchor: 'end' as const, label: t('sp.chart_now_label') },
        ].map((lbl) => (
          <text
            key={lbl.label}
            x={lbl.x}
            y={145}
            textAnchor={lbl.anchor}
            fontSize="9"
            fill="#6b7280"
            fontFamily="JetBrains Mono, monospace"
          >
            {lbl.label}
          </text>
        ))}

        {/* Polylines + area + markers — only when data present */}
        {computed && (
          <>
            <path d={computed.ervArea} fill={ervStroke} fillOpacity="0.08" />
            <polyline points={computed.ccvPath} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2" />
            <polyline points={computed.ervPath} fill="none" stroke={ervStroke} strokeWidth="2" />
            {markerIdx.map((idx, i) => {
              const isLast = i === markerIdx.length - 1;
              return (
                <circle
                  key={idx}
                  cx={computed.xScale(idx)}
                  cy={computed.yScale(computed.ervSeries[idx])}
                  r={isLast ? 4 : 2.5}
                  fill={ervStroke}
                  stroke={isLast ? 'white' : 'none'}
                  strokeWidth={isLast ? 2 : 0}
                />
              );
            })}
          </>
        )}
      </svg>

      {/* Legend — always rendered (constant text) */}
      <div className="sp-sparkline-legend">
        <span className="sp-sparkline-legend-item">
          <span className="sp-sparkline-legend-line" style={{ background: ervStroke }} />{' '}
          {t('sp.legend_real_viewers')}
        </span>
        <span className="sp-sparkline-legend-item">
          <span className="sp-sparkline-legend-line grey" /> {t('sp.legend_total_online')}
        </span>
      </div>
    </div>
  );
}
