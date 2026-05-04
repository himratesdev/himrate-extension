// TASK-085 PR-2: hook fetching latest completed stream summary для post-stream frames (16/17/18).
// Backend endpoint: GET /api/v1/channels/:id/streams/latest/summary (Pundit-gated).
// Returns null когда:
//   - channelId пустой (caller skips)
//   - 404 нет completed streams
//   - 4xx auth/Pundit failure (Free expired window etc.)
//   - 503 Flipper :stream_summary_endpoint disabled
// Caller renders `—` fallback на null (matches existing wireframe behavior).
//
// Loading state: { loading: true } — caller может show spinner или сохранить fallback.
// Locale forwarded to Accept-Language → backend formats `duration_text` ("3ч 0м" / "3h 0m").

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import type { StreamSummaryResponse } from '../../shared/api';

export interface UseStreamSummaryResult {
  data: StreamSummaryResponse | null;
  loading: boolean;
}

export function useStreamSummary(
  channelId: string | null,
  enabled: boolean,
): UseStreamSummaryResult {
  const { i18n } = useTranslation();
  const [data, setData] = useState<StreamSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelId || !enabled) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.getStreamLatestSummary(channelId, i18n.language).then((resp) => {
      if (cancelled) return;
      setData(resp);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [channelId, enabled, i18n.language]);

  return { data, loading };
}
