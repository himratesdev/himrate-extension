// BUG-016 PR-1a (Sections 4-8 of wireframe): ERV Gauge canonical match.
// Wireframe: side-panel-wireframe-TASK-039.html lines 1538-1734 (Cold Start variants)
// + lines 1894+ (Live Free) + 2442+ (Live Premium) + 2790+ (Live Streamer 160px).
//
// Canonical structure (sp-gauge-section + sp-gauge-wrap + sp-gauge-center с absolute overlay):
//   - Insufficient (<3): grey bg circle + "—" + "Реальные зрители" + "Недостаточно данных"
//   - Provisional low (3-6): yellow dashed bg + yellow arc opacity 0.6 + percent + "Provisional · {N}/10"
//   - Provisional (7-9): full green/yellow/red arc + percent + "Реальные зрители"
//   - Full (10+): same как Provisional но без badge
//   - Deep (30+): + "Глубокая аналитика · {N} стрима" pill outside (handled by parent)

import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  /** Color comes from server (green / yellow / red); ERV label text resolved via i18n. */
  ervLabelColor: string | null;
  confidence: number | null;
  coldStartStatus: string | null;
  streamsCount: number;
  isLive: boolean;
  isOwnChannel: boolean;
}

const ARC_COLORS: Record<string, string> = {
  green: '#059669',
  yellow: '#D97706',
  red: '#DC2626',
};

export function ERVGauge({
  ervPercent, ervCount, ccv, ervLabelColor,
  confidence, coldStartStatus, streamsCount, isLive: _isLive, isOwnChannel,
}: Props) {
  const { t, i18n } = useTranslation();
  const size = isOwnChannel ? 160 : 120;
  const radius = (size - 8) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = isOwnChannel ? 10 : 8;

  const isInsufficient = coldStartStatus === 'insufficient';
  const isProvisionalLow = coldStartStatus === 'provisional_low';
  const isProvisional = coldStartStatus === 'provisional' || isProvisionalLow;

  const colorKey = ervLabelColor || 'grey';
  const arcColor = ARC_COLORS[colorKey];
  const percent = isInsufficient ? 0 : Math.min(100, Math.max(0, ervPercent ?? 0));
  const offset = circumference - (percent / 100) * circumference;

  const confidenceText = confidence != null
    ? confidence >= 0.7 ? t('confidence.sufficient')
      : confidence >= 0.3 ? t('confidence.moderate')
        : t('confidence.insufficient')
    : null;

  return (
    <>
      <div
        className="sp-gauge-section"
        role="img"
        aria-label={isInsufficient ? t('cold_start.insufficient') : `ERV ${percent}%`}
        style={{ cursor: isInsufficient ? 'default' : 'pointer' }}
      >
        <div className="sp-gauge-wrap">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle. Provisional Low (frame 07): yellow dashed
                outer ring instead of grey solid. */}
            <circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={isProvisionalLow ? '#D97706' : '#E5E7EB'}
              strokeWidth={isProvisionalLow ? 4 : strokeWidth}
              strokeDasharray={isProvisionalLow ? '8 4' : 'none'}
            />
            {/* Foreground arc — only when data sufficient */}
            {!isInsufficient && arcColor && (
              <circle
                cx={center} cy={center} r={radius}
                fill="none" stroke={arcColor}
                strokeWidth={isProvisionalLow ? 4 : strokeWidth}
                strokeDasharray={`${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                opacity={isProvisionalLow ? 0.6 : 1}
              />
            )}
          </svg>
          <div className="sp-gauge-center">
            <span
              className={`sp-gauge-percent ${isInsufficient ? 'grey' : colorKey}`}
              style={{ fontSize: isOwnChannel ? '36px' : isProvisionalLow ? '24px' : undefined }}
            >
              {isInsufficient ? '—' : `${percent}%`}
            </span>
            <span
              className="sp-gauge-sub"
              title={t('erv.tooltip')}
            >
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* Provisional badge (3-6 streams) */}
      {isProvisionalLow && streamsCount > 0 && (
        <div style={{ textAlign: 'center' }}>
          <span className="sp-health-provisional yellow">
            {t('cold_start.provisional_streams', { N: streamsCount })}
          </span>
        </div>
      )}

      {/* ERV hero number */}
      <div className={`sp-erv-hero ${isInsufficient ? 'grey' : colorKey}`}>
        {isInsufficient
          ? t('cold_start.insufficient_data')
          : ervCount != null
            ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
            : '—'}
      </div>

      {/* CCV / collecting status sub-line */}
      <div className="sp-erv-ccv">
        {isInsufficient
          ? t('cold_start.streams_for_analysis', { current: streamsCount, required: 3 })
          : ccv != null
            ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) })
            : ''}
      </div>

      {/* ERV Label badge — text comes from i18n by color (legally-safe v3 wording),
          NOT raw server string which is EN-only. Per CLAUDE.md ERV labels v3. */}
      {!isInsufficient && (colorKey === 'green' || colorKey === 'yellow' || colorKey === 'red') && (
        <div style={{ textAlign: 'center' }}>
          <span className={`sp-erv-label ${colorKey}`}>
            <span className="erv-dot" /> {t(`erv_label.${colorKey}`)}
            {ervPercent != null ? ` · ${ervPercent}%` : ''}
          </span>
        </div>
      )}

      {/* Confidence — frames 14/16 (full+deep state); hidden during cold start
          (insufficient → collecting banner; provisional_low → provisional badge;
          provisional 7-9 → frame 08 has no confidence text either). */}
      {confidenceText && !isProvisional && !isInsufficient && (
        <div
          className={`sp-confidence ${
            confidence != null && confidence >= 0.7
              ? 'high'
              : confidence != null && confidence >= 0.3
                ? 'medium'
                : 'low'
          }`}
        >
          {confidenceText}
        </div>
      )}
    </>
  );
}
