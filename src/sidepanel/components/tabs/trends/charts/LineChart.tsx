// TASK-039 Phase D1: uPlot React wrapper для TI/ERV timeline.
// SRS §14 OQ-3: uPlot 40KB (vs Chart.js 200KB), 5x faster на 365d — CWS bundle optimized.
//
// Build-for-years:
//   - Colors через CSS custom properties (src/shared/trends-theme.ts)
//   - Responsive width через ResizeObserver (container-width driven, не magic numbers)
//   - Dashed series support для forecast projection (CR S-1)
//   - Anomaly markers через draw hook (canvas-level, zero DOM overhead)

import { useEffect, useRef, useMemo } from 'react';
import uPlot from 'uplot';
import type { Options, AlignedData } from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { trendsPalette } from '../../../../../shared/trends-theme';

export interface Series {
  label: string;
  values: (number | null)[];
  color: string;
  dashed?: boolean;
  width?: number;
}

interface Props {
  dates: string[];
  series: Series[];
  /** Fixed width. Если не передано → auto-expand to container (responsive). */
  width?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
  valueFormatter?: (v: number) => string;
  dateFormatter?: (date: string) => string;
  /** Anomaly markers: date string → vertical red line (canvas draw hook). */
  anomalyDates?: string[];
}

const DEFAULT_HEIGHT = 160;

export function LineChart({
  dates,
  series,
  width,
  height = DEFAULT_HEIGHT,
  yMin,
  yMax,
  valueFormatter,
  dateFormatter,
  anomalyDates = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const palette = useMemo(() => trendsPalette(), []);

  // Convert dates → unix timestamps (uPlot x-axis requires numeric).
  const xValues = useMemo(
    () => dates.map((d) => Math.floor(new Date(d).getTime() / 1000)),
    [dates]
  );

  const data = useMemo<AlignedData>(
    () => [xValues, ...series.map((s) => s.values)] as AlignedData,
    [xValues, series]
  );

  // Initial plot creation — build options once, then .setData / .setSize.
  useEffect(() => {
    if (!containerRef.current) return;
    if (plotRef.current) return; // already created; see update effect below

    const initialWidth = width ?? containerRef.current.clientWidth ?? 320;
    const anomalyTimestamps = new Set(
      anomalyDates.map((d) => Math.floor(new Date(d).getTime() / 1000))
    );

    const opts: Options = {
      width: initialWidth,
      height,
      scales: {
        y: {
          range: (_u, min, max) => [yMin ?? min, yMax ?? max],
        },
      },
      axes: [
        {
          stroke: palette.axisStroke,
          size: 30,
          values: (_u, splits) =>
            splits.map((s) => {
              const iso = new Date(s * 1000).toISOString().slice(0, 10);
              return dateFormatter ? dateFormatter(iso) : iso.slice(5);
            }),
        },
        {
          stroke: palette.axisStroke,
          size: 40,
          values: (_u, splits) =>
            splits.map((v) => (valueFormatter ? valueFormatter(v) : v.toFixed(0))),
        },
      ],
      series: [
        { label: 'Date' },
        ...series.map((s) => ({
          label: s.label,
          stroke: s.color,
          width: s.width ?? 2,
          dash: s.dashed ? [4, 4] : undefined,
          points: { show: false },
        })),
      ],
      hooks: {
        draw: [
          (u) => {
            if (anomalyTimestamps.size === 0) return;
            const { ctx } = u;
            ctx.save();
            ctx.strokeStyle = palette.anomaly;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            u.data[0].forEach((ts) => {
              if (!anomalyTimestamps.has(ts as number)) return;
              const x = u.valToPos(ts as number, 'x', true);
              ctx.beginPath();
              ctx.moveTo(x, u.bbox.top);
              ctx.lineTo(x, u.bbox.top + u.bbox.height);
              ctx.stroke();
            });
            ctx.restore();
          },
        ],
      },
      legend: { show: false },
      cursor: { drag: { x: false, y: false } },
    };

    plotRef.current = new uPlot(opts, data, containerRef.current);
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
    // Mount-only effect — uPlot instance created once, lifecycle managed manually.
    // Subsequent updates (data, size) handled отдельными effects ниже чтобы избежать
    // recreate-on-every-render overhead. If series structure changes (count), consumer
    // должен remount компонент через key prop.
  }, []);

  // Data updates — don't recreate plot, just setData + setSize.
  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    plot.setData(data);
  }, [data]);

  // Responsive: resize to container width unless explicit width prop.
  useEffect(() => {
    if (width != null) {
      plotRef.current?.setSize({ width, height });
      return;
    }
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !plotRef.current) return;
      plotRef.current.setSize({ width: Math.floor(entry.contentRect.width), height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [width, height]);

  return <div ref={containerRef} className="sp-linechart" style={{ width: '100%', height }} />;
}
