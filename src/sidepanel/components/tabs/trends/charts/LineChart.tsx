// TASK-039 Phase D1: uPlot React wrapper для TI/ERV timeline.
// SRS §14 OQ-3: uPlot 40KB (vs Chart.js 200KB), 5x faster на 365d — CWS bundle-size optimized.
//
// Props API minimal: series (label, values, color). Forecast dashed-line variant supported
// через dashed: true. Tooltip formatter via valueFormatter prop.

import { useEffect, useRef, useMemo } from 'react';
import uPlot from 'uplot';
import type { Options, AlignedData } from 'uplot';
import 'uplot/dist/uPlot.min.css';

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
  width?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
  valueFormatter?: (v: number) => string;
  dateFormatter?: (date: string) => string;
  /** Anomaly markers: date string → render vertical red line. */
  anomalyDates?: string[];
}

export function LineChart({
  dates,
  series,
  width = 320,
  height = 160,
  yMin,
  yMax,
  valueFormatter,
  dateFormatter,
  anomalyDates = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  // Convert dates → unix timestamps (uPlot x-axis requires numeric).
  const xValues = useMemo(
    () => dates.map((d) => Math.floor(new Date(d).getTime() / 1000)),
    [dates]
  );

  const data = useMemo<AlignedData>(
    () => [xValues, ...series.map((s) => s.values)] as AlignedData,
    [xValues, series]
  );

  const opts = useMemo<Options>(() => {
    const anomalyTimestamps = new Set(
      anomalyDates.map((d) => Math.floor(new Date(d).getTime() / 1000))
    );

    return {
      width,
      height,
      scales: {
        y: {
          range: (_u, min, max) => [yMin ?? min, yMax ?? max],
        },
      },
      axes: [
        {
          stroke: '#6b7280',
          size: 30,
          values: (_u, splits) =>
            splits.map((s) => {
              const iso = new Date(s * 1000).toISOString().slice(0, 10);
              return dateFormatter ? dateFormatter(iso) : iso.slice(5);
            }),
        },
        {
          stroke: '#6b7280',
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
            ctx.strokeStyle = '#dc2626';
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
  }, [width, height, yMin, yMax, series, valueFormatter, dateFormatter, anomalyDates]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (plotRef.current) {
      plotRef.current.setSize({ width, height });
      plotRef.current.setData(data);
      return;
    }
    plotRef.current = new uPlot(opts, data, containerRef.current);
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [data, opts, width, height]);

  return <div ref={containerRef} className="sp-linechart" />;
}
