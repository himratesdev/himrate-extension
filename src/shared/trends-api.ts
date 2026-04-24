// TASK-039: Trends API client methods. Consumes Phase C endpoints.
// Uses existing apiFetch (Bearer + 401 auto-refresh).

import { apiFetch } from './api';
import type {
  ErvResponse,
  TrustIndexResponse,
  RehabilitationResponse,
  StabilityResponse,
  AnomaliesResponse,
  ComponentsResponse,
  ComparisonResponse,
  CategoriesResponse,
  WeekdayPatternsResponse,
  InsightsResponse,
  TrendsPeriod,
  TrendsGranularity,
} from './trends-types';

export type TrendsResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'paywall' | 'business_required' | 'network' | 'not_found' | 'insufficient_data' | 'unknown'; code?: string; message?: string };

async function request<T>(path: string, signal?: AbortSignal): Promise<TrendsResult<T>> {
  try {
    const res = await apiFetch(path, {}, signal);

    if (res.status === 401) return { ok: false, error: 'paywall', code: 'UNAUTHORIZED' };
    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      const code = body?.error?.code;
      const message = body?.error?.message;
      if (code === 'TRENDS_BUSINESS_REQUIRED') return { ok: false, error: 'business_required', code, message };
      return { ok: false, error: 'paywall', code, message };
    }
    if (res.status === 404) return { ok: false, error: 'not_found' };
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: 'insufficient_data', code: body?.error, message: body?.message };
    }
    if (!res.ok) return { ok: false, error: 'unknown' };

    const json = (await res.json()) as T;
    return { ok: true, data: json };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    if (aborted) throw e;
    return { ok: false, error: 'network' };
  }
}

export const trendsApi = {
  /** FR-001: GET /api/v1/channels/:id/trends/erv */
  getErv(
    channelId: string,
    period: TrendsPeriod,
    granularity: TrendsGranularity = 'daily',
    signal?: AbortSignal
  ): Promise<TrendsResult<ErvResponse>> {
    const qs = new URLSearchParams({ period, granularity });
    return request<ErvResponse>(`/api/v1/channels/${channelId}/trends/erv?${qs}`, signal);
  },

  /** FR-002: GET /api/v1/channels/:id/trends/trust_index */
  getTrustIndex(
    channelId: string,
    period: TrendsPeriod,
    granularity: TrendsGranularity = 'daily',
    signal?: AbortSignal
  ): Promise<TrendsResult<TrustIndexResponse>> {
    const qs = new URLSearchParams({ period, granularity });
    return request<TrustIndexResponse>(`/api/v1/channels/${channelId}/trends/trust_index?${qs}`, signal);
  },

  /** FR-006: GET /api/v1/channels/:id/trends/rehabilitation */
  getRehabilitation(
    channelId: string,
    period: TrendsPeriod = '30d',
    signal?: AbortSignal
  ): Promise<TrendsResult<RehabilitationResponse>> {
    const qs = new URLSearchParams({ period });
    return request<RehabilitationResponse>(`/api/v1/channels/${channelId}/trends/rehabilitation?${qs}`, signal);
  },

  /** FR-003: GET /api/v1/channels/:id/trends/stability (M3) */
  getStability(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<StabilityResponse>> {
    const qs = new URLSearchParams({ period });
    return request<StabilityResponse>(`/api/v1/channels/${channelId}/trends/stability?${qs}`, signal);
  },

  /** FR-004: GET /api/v1/channels/:id/trends/anomalies (M4) */
  getAnomalies(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<AnomaliesResponse>> {
    const qs = new URLSearchParams({ period });
    return request<AnomaliesResponse>(`/api/v1/channels/${channelId}/trends/anomalies?${qs}`, signal);
  },

  /** FR-005: GET /api/v1/channels/:id/trends/components (M5) */
  getComponents(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<ComponentsResponse>> {
    const qs = new URLSearchParams({ period });
    return request<ComponentsResponse>(`/api/v1/channels/${channelId}/trends/components?${qs}`, signal);
  },

  /** FR-007: GET /api/v1/channels/:id/trends/comparison (M11) */
  getComparison(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<ComparisonResponse>> {
    const qs = new URLSearchParams({ period });
    return request<ComparisonResponse>(`/api/v1/channels/${channelId}/trends/comparison?${qs}`, signal);
  },

  /** FR-008: GET /api/v1/channels/:id/trends/categories (M13) */
  getCategories(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<CategoriesResponse>> {
    const qs = new URLSearchParams({ period });
    return request<CategoriesResponse>(`/api/v1/channels/${channelId}/trends/categories?${qs}`, signal);
  },

  /** FR-009: GET /api/v1/channels/:id/trends/patterns/weekday (M14) */
  getWeekdayPatterns(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<WeekdayPatternsResponse>> {
    const qs = new URLSearchParams({ period });
    return request<WeekdayPatternsResponse>(`/api/v1/channels/${channelId}/trends/patterns/weekday?${qs}`, signal);
  },

  /** FR-010: GET /api/v1/channels/:id/trends/insights (Movement Insights banner) */
  getInsights(
    channelId: string,
    period: TrendsPeriod,
    signal?: AbortSignal
  ): Promise<TrendsResult<InsightsResponse>> {
    const qs = new URLSearchParams({ period });
    return request<InsightsResponse>(`/api/v1/channels/${channelId}/trends/insights?${qs}`, signal);
  },
};
