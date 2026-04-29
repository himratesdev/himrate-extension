// TASK-084 Phase G1 chart wiring: hook computing sparkline polyline/area/labels
// from api.getTrustHistory(). Returns computed strings to inject into wireframe SVG.
// Falls back to null когда нет data — caller renders wireframe defaults.

import { useState, useEffect } from 'react';
import { api } from '../../shared/api';
import type { SparklinePoint } from '../../shared/api';

const X_START = 34;
const X_END = 330;
const Y_TOP = 20;
const Y_BOTTOM = 125;

export interface SparklineComputed {
  ervAreaPath: string;
  ervPolylinePoints: string;
  ccvPolylinePoints: string;
  yLabels: { y: number; label: string }[];
  markers: { cx: number; cy: number; r: number; isLast: boolean }[];
  stats: {
    now: number | null;
    max: number | null;
    change: number | null;
  };
}

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

export function useSparkline(
  channelId: string | null,
  isLive: boolean,
  isPremium: boolean,
): SparklineComputed | null {
  const [points, setPoints] = useState<SparklinePoint[]>([]);

  useEffect(() => {
    if (!channelId) return;
    const period = isLive ? '30m' : '7d';
    if (period === '7d' && !isPremium) return; // Free user — нет 7d access
    let cancelled = false;
    api.getTrustHistory(channelId, period).then((data) => {
      if (cancelled) return;
      if (data?.points) setPoints(data.points);
    });
    return () => { cancelled = true; };
  }, [channelId, isLive, isPremium]);

  if (points.length < 2) return null;

  const ervSeries = points.map((p) => p.erv_count ?? 0);
  const ccvSeries = points.map((p) => p.ccv ?? 0);
  const maxVal = Math.max(...ervSeries, ...ccvSeries, 1);
  const yMax = niceCeil(maxVal);
  const yScale = (v: number) => Y_BOTTOM - (Math.max(0, v) / yMax) * (Y_BOTTOM - Y_TOP);
  const xScale = (i: number) => X_START + (i / (points.length - 1)) * (X_END - X_START);

  const ervPts = ervSeries.map((v, i) => `${xScale(i).toFixed(0)},${yScale(v).toFixed(0)}`);
  const ccvPts = ccvSeries.map((v, i) => `${xScale(i).toFixed(0)},${yScale(v).toFixed(0)}`);
  const ervPolylinePoints = ervPts.join(' ');
  const ccvPolylinePoints = ccvPts.join(' ');
  const ervAreaPath = `M${X_START},${Y_BOTTOM} L${ervPts.join(' L')} L${X_END},${Y_BOTTOM} Z`;

  // Y labels: 4 уровня (top, ⅓, ⅔, bottom). Bottom = 0.
  const yLabels = [
    { y: 24, label: formatK(yMax) },
    { y: 59, label: formatK(yMax * 0.667) },
    { y: 94, label: formatK(yMax * 0.333) },
    { y: 129, label: '0' },
  ];

  // Markers — 4 circles: start, ⅓, ⅔, end (last bigger).
  const idxs = [0, Math.floor(points.length / 3), Math.floor((points.length * 2) / 3), points.length - 1];
  const markers = idxs.map((idx, i) => ({
    cx: xScale(idx),
    cy: yScale(ervSeries[idx]),
    r: i === 3 ? 4 : 2.5,
    isLast: i === 3,
  }));

  const lastErv = ervSeries[ervSeries.length - 1];
  const maxErv = Math.max(...ervSeries);
  const change = pctChange(ervSeries[0], lastErv);

  return {
    ervAreaPath,
    ervPolylinePoints,
    ccvPolylinePoints,
    yLabels,
    markers,
    stats: { now: lastErv, max: maxErv, change },
  };
}
