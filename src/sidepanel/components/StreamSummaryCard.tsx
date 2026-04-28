// BUG-016 PR-1 Section 9: Stream Summary card (wireframe lines 3120-3141).
// Wireframe: "Итоги стрима" — 4 stat tiles in 2×2 grid (Длительность / Пик зрителей
// / Средний онлайн / Реальные зрители %). Uses sp-signals container with custom grid.

import { useTranslation } from 'react-i18next';

interface Props {
  durationText: string | null;
  peakCcv: number | null;
  avgCcv: number | null;
  ervPercent: number | null;
  ervLabelColor?: 'green' | 'yellow' | 'red' | null;
}

const TILE_STYLE: React.CSSProperties = {
  background: 'var(--bg-page)',
  borderRadius: 6,
  padding: 8,
  textAlign: 'center',
};

const TILE_VALUE_STYLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace",
};

const TILE_LABEL_STYLE: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--ink-30)',
};

function colorVar(color?: 'green' | 'yellow' | 'red' | null): string | undefined {
  if (color === 'green') return 'var(--color-erv-green)';
  if (color === 'yellow') return 'var(--color-erv-yellow)';
  if (color === 'red') return 'var(--color-erv-red)';
  return undefined;
}

export function StreamSummaryCard({
  durationText,
  peakCcv,
  avgCcv,
  ervPercent,
  ervLabelColor,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="sp-signals" style={{ gap: 4 }}>
      <div className="sp-signals-title">{t('sp.stream_summary_title')}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: '4px 0',
        }}
      >
        <div style={TILE_STYLE}>
          <div style={TILE_VALUE_STYLE}>{durationText || '—'}</div>
          <div style={TILE_LABEL_STYLE}>{t('sp.stream_summary_duration')}</div>
        </div>
        <div style={TILE_STYLE}>
          <div style={TILE_VALUE_STYLE}>
            {peakCcv != null ? peakCcv.toLocaleString() : '—'}
          </div>
          <div style={TILE_LABEL_STYLE}>{t('sp.stream_summary_peak')}</div>
        </div>
        <div style={TILE_STYLE}>
          <div style={TILE_VALUE_STYLE}>
            {avgCcv != null ? avgCcv.toLocaleString() : '—'}
          </div>
          <div style={TILE_LABEL_STYLE}>{t('sp.stream_summary_avg')}</div>
        </div>
        <div style={TILE_STYLE}>
          <div style={{ ...TILE_VALUE_STYLE, color: colorVar(ervLabelColor) }}>
            {ervPercent != null ? `${Math.round(ervPercent)}%` : '—'}
          </div>
          <div style={TILE_LABEL_STYLE}>{t('sp.stream_summary_real_pct')}</div>
        </div>
      </div>
    </div>
  );
}
