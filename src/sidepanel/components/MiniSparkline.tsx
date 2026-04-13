// TASK-035 FR-006: Mini Sparkline — SVG line chart.
// LIVE: 30min CCV+ERV. OFFLINE: 7d ERV%+TI.
// FR-024: hover tooltip with timestamp + values.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import type { SparklinePoint } from '../../shared/api';

interface Props {
  channelId: string | null;
  isLive: boolean;
  isPremium: boolean;
  onNavigate?: (tab: string) => void;
}

const WIDTH = 280;
const HEIGHT = 80;
const PADDING = 4;

export function MiniSparkline({ channelId, isLive, isPremium, onNavigate }: Props) {
  const { t } = useTranslation();
  const [points, setPoints] = useState<SparklinePoint[]>([]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!channelId) return;
    const period = isLive ? '30m' : '7d';
    // Free users can only see 30m (live). 7d requires premium.
    if (period === '7d' && !isPremium) {
      setPoints([]);
      return;
    }
    api.getTrustHistory(channelId, period).then((data) => {
      if (data?.points) setPoints(data.points);
    });
  }, [channelId, isLive, isPremium]);

  if (points.length < 2) {
    if (!isLive && !isPremium) {
      return (
        <div className="sp-sparkline-paywall">
          <div className="sp-paywall-blur" style={{ height: HEIGHT }}>
            <span>{t('sp.upgrade')}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  // Compute SVG path for ERV line
  const values = points.map((p) => p.erv_percent ?? p.ti_score ?? 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const pathPoints = values.map((v, i) => {
    const x = PADDING + (i / (values.length - 1)) * (WIDTH - 2 * PADDING);
    const y = HEIGHT - PADDING - ((v - minVal) / range) * (HEIGHT - 2 * PADDING);
    return `${x},${y}`;
  });
  const pathD = `M ${pathPoints.join(' L ')}`;

  // CCV line (secondary, grey)
  const ccvValues = points.map((p) => p.ccv ?? 0);
  const ccvMin = Math.min(...ccvValues);
  const ccvMax = Math.max(...ccvValues);
  const ccvRange = ccvMax - ccvMin || 1;
  const ccvPathPoints = ccvValues.map((v, i) => {
    const x = PADDING + (i / (ccvValues.length - 1)) * (WIDTH - 2 * PADDING);
    const y = HEIGHT - PADDING - ((v - ccvMin) / ccvRange) * (HEIGHT - 2 * PADDING);
    return `${x},${y}`;
  });
  const ccvPathD = `M ${ccvPathPoints.join(' L ')}`;

  const hoverPoint = hoverIdx != null ? points[hoverIdx] : null;

  return (
    <div className="sp-sparkline">
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={isLive ? '30min CCV+ERV trend' : '7d ERV+TI trend'}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.round((x / WIDTH) * (points.length - 1));
          setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* CCV line (grey) */}
        <path d={ccvPathD} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
        {/* ERV line (colored) */}
        <path d={pathD} fill="none" stroke="#22c55e" strokeWidth={2} />
        {/* Hover dot */}
        {hoverIdx != null && (
          <circle
            cx={PADDING + (hoverIdx / (points.length - 1)) * (WIDTH - 2 * PADDING)}
            cy={HEIGHT - PADDING - ((values[hoverIdx] - minVal) / range) * (HEIGHT - 2 * PADDING)}
            r={4}
            fill="#22c55e"
            stroke="white"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoverPoint && (
        <div className="sp-sparkline-tooltip">
          <div>{new Date(hoverPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          {hoverPoint.ccv != null && <div>CCV: {hoverPoint.ccv.toLocaleString()}</div>}
          {hoverPoint.erv_percent != null && <div>ERV: {hoverPoint.erv_percent}%</div>}
          {hoverPoint.ti_score != null && <div>TI: {hoverPoint.ti_score}</div>}
        </div>
      )}

      <div className="sp-sparkline-footer">
        <button className="sp-more-link" onClick={() => onNavigate?.('trends')}>{t('sp.more')}</button>
      </div>
    </div>
  );
}
