// BUG-016 PR-1 Section 9: Stream Summary card (wireframe lines 3120-3141).
// Wireframe: "Итоги стрима" — 4 stat tiles in 2×2 grid (Длительность / Пик зрителей
// / Средний онлайн / Реальные зрители %). Canonical sp-summary-grid + sp-summary-tile.

import { useTranslation } from 'react-i18next';

interface Props {
  durationText: string | null;
  peakCcv: number | null;
  avgCcv: number | null;
  ervPercent: number | null;
  ervLabelColor?: 'green' | 'yellow' | 'red' | null;
}

export function StreamSummaryCard({
  durationText,
  peakCcv,
  avgCcv,
  ervPercent,
  ervLabelColor,
}: Props) {
  const { t } = useTranslation();
  const colorClass = ervLabelColor ? ` ${ervLabelColor}` : '';

  return (
    <div className="sp-signals" style={{ gap: 4 }}>
      <div className="sp-signals-title">{t('sp.stream_summary_title')}</div>
      <div className="sp-summary-grid">
        <div className="sp-summary-tile">
          <div className="sp-summary-tile-value">{durationText || '—'}</div>
          <div className="sp-summary-tile-label">{t('sp.stream_summary_duration')}</div>
        </div>
        <div className="sp-summary-tile">
          <div className="sp-summary-tile-value">
            {peakCcv != null ? peakCcv.toLocaleString() : '—'}
          </div>
          <div className="sp-summary-tile-label">{t('sp.stream_summary_peak')}</div>
        </div>
        <div className="sp-summary-tile">
          <div className="sp-summary-tile-value">
            {avgCcv != null ? avgCcv.toLocaleString() : '—'}
          </div>
          <div className="sp-summary-tile-label">{t('sp.stream_summary_avg')}</div>
        </div>
        <div className="sp-summary-tile">
          <div className={`sp-summary-tile-value${colorClass}`}>
            {ervPercent != null ? `${Math.round(ervPercent)}%` : '—'}
          </div>
          <div className="sp-summary-tile-label">{t('sp.stream_summary_real_pct')}</div>
        </div>
      </div>
    </div>
  );
}
