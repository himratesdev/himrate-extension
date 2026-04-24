// TASK-039 FR-010 — Movement Insights banner: top P0/P1/P2 cards.
// Consumes GET /api/v1/channels/:id/trends/insights.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendsApi } from '../../../../shared/trends-api';
import type { InsightCard, InsightsResponse, TrendsPeriod } from '../../../../shared/trends-types';
import { useCurrentLocale } from '../../../../shared/use-current-locale';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  /** Optional callback — parent receives action key when user clicks "Details →". */
  onAction?: (action: string) => void;
}

const DISMISS_PREFIX = 'trends_insights_dismissed_';

export function InsightsBanner({ channelId, period, onAction }: Props) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setData(null);
    const ctrl = new AbortController();
    trendsApi
      .getInsights(channelId, period, ctrl.signal)
      .then((result) => {
        if (result.ok) setData(result.data);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      });
    return () => ctrl.abort();
  }, [channelId, period]);

  // Hydrate dismissed set from localStorage per channel.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${DISMISS_PREFIX}${channelId}`);
      setDismissed(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch {
      setDismissed(new Set());
    }
  }, [channelId]);

  if (!data) return null;
  const visible = data.data.insights.filter((i) => !dismissed.has(insightHash(i)));
  if (visible.length === 0) return null;

  const handleDismiss = (insight: InsightCard) => {
    const hash = insightHash(insight);
    const next = new Set(dismissed);
    next.add(hash);
    setDismissed(next);
    try {
      localStorage.setItem(`${DISMISS_PREFIX}${channelId}`, JSON.stringify([...next]));
    } catch {
      // Storage unavailable — dismissal lasts current session only.
    }
  };

  return (
    <div className="trends-insights-banner" role="region" aria-label={t('trends.insights.banner_title')}>
      {visible.map((insight) => (
        <div
          key={insightHash(insight)}
          className={`trends-insight-card priority-${insight.priority}`}
        >
          <div className="trends-insight-icon" aria-hidden="true">
            {insight.icon}
          </div>
          <div className="trends-insight-body">
            <span className="trends-insight-message">
              {locale === 'ru' ? insight.message_ru : insight.message_en}
            </span>
            {insight.action && (insight.priority === 'P0' || insight.priority === 'P1') && (
              <button
                type="button"
                className="trends-insight-action"
                onClick={() => onAction?.(insight.action!)}
              >
                {t('trends.insights.action_details')}
              </button>
            )}
          </div>
          <button
            type="button"
            className="trends-insight-dismiss"
            onClick={() => handleDismiss(insight)}
            aria-label={t('trends.insights.dismiss_aria')}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Stable hash для localStorage dismissal — приоритет + locale-agnostic message
// signature (action + priority). Не cryptographic — defensive de-dup.
function insightHash(i: InsightCard): string {
  return `${i.priority}|${i.action ?? '_'}|${i.message_en.slice(0, 64)}`;
}
