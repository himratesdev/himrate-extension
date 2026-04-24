// TASK-039: Trends API client methods. Consumes Phase C endpoints.
// Uses existing apiFetch (Bearer + 401 auto-refresh).

import { apiFetch } from './api';
import type {
  ErvResponse,
  TrustIndexResponse,
  RehabilitationResponse,
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
};
