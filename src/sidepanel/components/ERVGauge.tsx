// TASK-035 FR-002: ERV% Gauge — circular SVG indicator.
// 120x120 (160x160 for Streamer Mode own channel).
// Color by ERV%, animated arc, cold start states.

import { useTranslation } from 'react-i18next';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabel: string | null;
  ervLabelColor: string | null;
  confidence: number | null;
  coldStartStatus: string | null;
  isLive: boolean;
  isOwnChannel: boolean;
}

const GAUGE_COLORS: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  grey: '#9ca3af',
};

export function ERVGauge({
  ervPercent, ervCount, ccv, ervLabel, ervLabelColor,
  confidence, coldStartStatus, isLive, isOwnChannel,
}: Props) {
  const { t } = useTranslation();
  const size = isOwnChannel ? 160 : 120;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const isInsufficient = coldStartStatus === 'insufficient';
  const isProvisional = coldStartStatus === 'provisional_low' || coldStartStatus === 'provisional';

  const percent = isInsufficient ? 0 : Math.min(100, Math.max(0, ervPercent ?? 0));
  const offset = circumference - (percent / 100) * circumference;
  const color = GAUGE_COLORS[ervLabelColor ?? 'grey'] || GAUGE_COLORS.grey;

  const confidenceText = confidence != null
    ? confidence >= 0.7 ? t('confidence.sufficient')
    : confidence >= 0.3 ? t('confidence.moderate')
    : t('confidence.insufficient')
    : null;

  return (
    <div className="sp-erv-gauge" style={{ textAlign: 'center' }}>
      {/* SVG Gauge */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`ERV ${percent}%`}
        style={{ cursor: isInsufficient ? 'default' : 'pointer' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={isProvisional ? 2.5 : 8}
          strokeDasharray={isProvisional ? '8 4' : 'none'}
        />
        {/* Foreground arc */}
        {!isInsufficient && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="sp-gauge-arc"
          />
        )}
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="sp-gauge-percent"
          fill={isInsufficient ? '#9ca3af' : color}
        >
          {isInsufficient ? '—' : `${percent}%`}
        </text>
      </svg>

      {/* ERV hero number */}
      {ervCount != null && !isInsufficient ? (
        <div className="sp-erv-hero" style={{ color }}>
          ~{ervCount.toLocaleString()} {isLive ? t('popup.erv_hero_live').replace('Онлайн (HimRate): ~{N}', '').trim() || '' : ''}
        </div>
      ) : (
        <div className="sp-erv-hero" style={{ color: '#9ca3af' }}>
          {isInsufficient ? t('popup.cold_start') : '—'}
        </div>
      )}

      {/* CCV */}
      {ccv != null && (
        <div className="sp-erv-ccv">{t('popup.twitch_online', { N: ccv.toLocaleString() })}</div>
      )}

      {/* ERV Label */}
      {ervLabel && (
        <div className={`sp-erv-label ${ervLabelColor || 'grey'}`}>
          <span className="erv-dot"></span> {ervLabel} {ervPercent != null ? `· ${ervPercent}%` : ''}
        </div>
      )}

      {/* Confidence */}
      {confidenceText && (
        <div className={`sp-confidence ${confidence != null && confidence >= 0.7 ? 'green' : confidence != null && confidence >= 0.3 ? 'yellow' : 'red'}`}>
          {confidenceText}
        </div>
      )}

      {/* Provisional badge */}
      {isProvisional && (
        <div className="sp-provisional-badge">
          {t('popup.cold_start')} — {coldStartStatus === 'provisional_low' ? '3-6' : '7-9'}/10
        </div>
      )}
    </div>
  );
}
