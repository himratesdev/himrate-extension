// BUG-016 PR-1 Section 6: Live ERV trend text indicator (wireframe line 1951).
// Wireframe: sp-trend.{up/down/stable} — "↑ Реальных зрителей стало больше: +5% за 30мин".
// Computes pct change from first/last erv_count over 30m sparkline data.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  channelId: string | null;
}

const STABLE_THRESHOLD = 5;

export function LiveTrendIndicator({ channelId }: Props) {
  const { t } = useTranslation();
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    if (!channelId) return;
    api.getTrustHistory(channelId, '30m').then((data) => {
      if (!data?.points || data.points.length < 2) return;
      const series = data.points.map((p) => p.erv_count ?? 0);
      const first = series[0];
      const last = series[series.length - 1];
      if (first === 0) return;
      setChange(Math.round(((last - first) / first) * 100));
    });
  }, [channelId]);

  if (change == null) return null;

  const direction: 'up' | 'down' | 'stable' =
    change >= STABLE_THRESHOLD ? 'up' : change <= -STABLE_THRESHOLD ? 'down' : 'stable';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const sign = change >= 0 ? '+' : '';
  const key =
    direction === 'up'
      ? 'sp.trend_real_up'
      : direction === 'down'
        ? 'sp.trend_real_down'
        : 'sp.trend_real_stable';

  return (
    <div className={`sp-trend ${direction}`}>
      {arrow} {t(key, { sign, pct: change })}
    </div>
  );
}
