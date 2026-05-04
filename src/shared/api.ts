// TASK-018: Real API client with Bearer token + 401 auto-refresh.
// TASK-034: Extended with trust data types, request tracking, search enrichment.

import { API_BASE, API_TIMEOUT_MS } from './config';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Refresh mutex: prevent parallel refresh requests
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const data = await chrome.storage.local.get('refresh_token');
  if (!data.refresh_token) return false;

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: data.refresh_token }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    await chrome.storage.session.set({ access_token: json.access_token });
    if (json.refresh_token) {
      await chrome.storage.local.set({ refresh_token: json.refresh_token });
    }
    return true;
  } catch {
    return false;
  }
}

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<Response> {
  const tokenData = await chrome.storage.session.get('access_token');
  const token = tokenData.access_token;
  const installData = await chrome.storage.local.get('extension_install_id');

  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  if (installData.extension_install_id) {
    headers.set('X-Extension-Install-Id', String(installData.extension_install_id));
  }

  // AbortSignal.any merges caller signal + timeout — both work correctly (Chrome 116+)
  const timeoutSignal = AbortSignal.timeout(API_TIMEOUT_MS);
  const mergedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    signal: mergedSignal,
  });

  if (response.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newTokenData = await chrome.storage.session.get('access_token');
      const newHeaders = new Headers(options.headers);
      newHeaders.set('Authorization', `Bearer ${newTokenData.access_token}`);
      newHeaders.set('Content-Type', 'application/json');
      if (installData.extension_install_id) {
        newHeaders.set('X-Extension-Install-Id', String(installData.extension_install_id));
      }
      return fetch(`${API_BASE}${path}`, { ...options, headers: newHeaders, signal: mergedSignal });
    }
    await chrome.storage.session.clear();
    await chrome.storage.local.remove(['refresh_token', 'user']);
    throw new AuthError('session_expired');
  }

  return response;
}

// === TypeScript interfaces ===

export interface StreamerRating {
  score: number;
  streams_count: number;
  classification: string;
}

// TASK-085: anomaly_alerts derivation per AnomalyAlertsPresenter (backend SRS §10A).
// 7 type values + severity tier. Gated за :drill_down/:full views (Pundit ChannelPolicy).
export type AnomalyAlertType =
  | 'ccv_spike'
  | 'confirmed_raid'
  | 'anomaly_wave'
  | 'ti_drop'
  | 'chatter_to_ccv_anomaly'
  | 'chat_entropy_drop'
  | 'erv_divergence';

export type AnomalySeverity = 'red' | 'yellow' | 'info';

export interface AnomalyAlert {
  id: string;
  type: AnomalyAlertType;
  severity: AnomalySeverity;
  value: number | null;
  threshold: number | null;
  window_minutes: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface TrustData {
  ti_score: number | null;
  classification: string | null;
  erv_percent: number | null;
  erv_count: number | null;
  erv_label: string | null;
  erv_label_color: string | null;
  ccv: number | null;
  confidence: number | null;
  cold_start_status: string | null;
  is_live: boolean;
  streamer_rating: StreamerRating | null;
  category_avg_ti: number | null;
  percentile_in_category: number | null;
  post_stream_expires_at: string | null;
  // TASK-035: drill_down/full scope fields (nullable for headline scope)
  signal_breakdown?: Array<{ type: string; value: number; confidence: number | null; weight: number | null; contribution: number; metadata: Record<string, unknown> | null }>;
  streamer_reputation?: ReputationData | null;
  health_score?: HealthScoreData | null;
  top_countries?: Array<{ country_code: string; percentage: number; viewer_count: number }> | null;
  // TASK-085: anomaly alerts (drill_down/full scope only — headline view does NOT include this key)
  anomaly_alerts?: AnomalyAlert[];
}

// TASK-085 FR-001..006: GET /api/v1/channels/:id/streams/latest/summary response shape.
export interface StreamSummaryData {
  session_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  duration_text: string;          // formatted backend per Accept-Language ("3ч 0м" / "3h 0m")
  peak_viewers: number | null;
  avg_ccv: number | null;
  erv_percent_final: number | null;
  erv_count_final: number | null;
  category: string | null;
  partial: boolean;
}

export interface StreamSummaryResponse {
  data: StreamSummaryData;
  meta: { preliminary: boolean }; // true когда post_stream_report ещё не сгенерирован
}

export interface ChannelData {
  id: string;
  login: string;
  twitch_id: string;
  display_name: string;
  profile_image_url: string | null;
  is_monitored: boolean;
  is_live: boolean;
  is_watched_by_user: boolean;
}

export interface TrustCache {
  channel_id: string | null;
  login: string;
  display_name: string;
  avatar_url: string | null;
  ti_score: number | null;
  classification: string | null;
  erv_percent: number | null;
  erv_count: number | null;
  erv_label: string | null;
  erv_label_color: string | null;
  ccv: number | null;
  confidence: number | null;
  cold_start_status: string | null;
  is_live: boolean;
  is_tracked: boolean;
  streamer_rating: StreamerRating | null;
  category_avg_ti: number | null;
  percentile_in_category: number | null;
  expires_at: string | null;
  previous_ti_score: number | null;
  is_watched_by_user: boolean;
  // TASK-035: extended fields from drill_down/full scope
  signal_breakdown: Array<{ type: string; value: number; confidence: number | null; weight: number | null; contribution: number; metadata: Record<string, unknown> | null }>;
  streamer_reputation: ReputationData | null;
  health_score: HealthScoreData | null;
  top_countries: Array<{ country_code: string; percentage: number; viewer_count: number }> | null;
  // TASK-085: anomaly alerts (drill_down/full scope only)
  anomaly_alerts?: AnomalyAlert[];
  ws_connected: boolean;
  error: string | null;
  loading: boolean;
  fetched_at: number;
}

export type PopupScreen =
  | 'skeleton'
  | 'live'
  | 'offline'
  | 'not_tracked_live'
  | 'not_tracked_offline'
  | 'not_twitch'
  | 'error';

export interface SearchResult {
  login: string;
  display_name: string;
  avatar_url: string | null;
  is_live: boolean;
  viewers_count: number | null;
  game_name: string | null;
  // Enriched from our API (may be null if channel not tracked)
  ti_score: number | null;
  erv_percent: number | null;
  erv_label: string | null;
  erv_label_color: string | null;
  rating_score: number | null;
}

// TASK-035: Sparkline data
export interface SparklinePoint {
  timestamp: string;
  ccv: number | null;
  erv_count: number | null;
  erv_percent: number | null;
  ti_score: number | null;
}

export interface SparklineData {
  period: '30m' | '7d';
  points: SparklinePoint[];
  anomalies: Array<{ timestamp: string; type: string; severity: string; delta: number | null }>;
}

// TASK-035: Badge embed data
export interface BadgeData {
  html: string;
  markdown: string;
  bbcode: string;
  svg_url: string;
  ti_score: number;
  color: string;
}

// TASK-035: Channel Card data
export interface CardData {
  channel: {
    login: string;
    display_name: string;
    avatar_url: string | null;
    partner_status: string | null;
    created_at: string;
    followers_count: number;
  };
  trust: {
    ti_score: number | null;
    classification: string | null;
    erv_percent: number | null;
    erv_label: string | null;
    erv_label_color: string | null;
  };
  health_score: HealthScoreData | null;
  reputation: ReputationData | null;
  stats: {
    total_streams: number;
    avg_ccv: number | null;
    peak_ccv: number | null;
    avg_duration_hours: number | null;
    streams_per_week: number | null;
  };
  recent_streams: Array<{
    date: string;
    duration_hours: number | null;
    peak_ccv: number | null;
    avg_ccv: number | null;
    ti_score: number | null;
    erv_percent: number | null;
  }>;
  badge_url: string;
  public_url: string;
}

export interface HealthScoreData {
  score: number;
  components: Record<string, { score: number | null; weight: number; label: string }>;
  streams_count: number;
  provisional_status: string;
  percentile: number | null;
}

export interface ReputationData {
  growth_pattern_score: number | null;
  follower_quality_score: number | null;
  engagement_consistency_score: number | null;
}

// TASK-036: Watchlist interfaces
export interface WatchlistStats {
  avg_erv: number | null;
  live_count: number;
  tracked_count: number;
  total: number;
}

export interface WatchlistItem {
  id: string;
  name: string;
  channels_count: number;
  position: number;
  stats: WatchlistStats;
  created_at: string;
}

export interface WatchlistChannel {
  channel_id: string;
  login: string;
  display_name: string;
  avatar_url: string | null;
  erv_percent: number | null;
  erv_label_color: string | null;
  ti_score: number | null;
  ccv: number | null;
  is_live: boolean;
  is_tracked: boolean;
  last_ti_at: string | null;
  last_stream_at: string | null;
  inactive: boolean;
  tags: string[];
  notes: string | null;
  added_at: string;
  position: number | null;
}

// === Typed API methods ===

export const api = {
  /** Get channel by login. Returns null if not found (404 = not tracked). */
  getChannel: async (login: string, signal?: AbortSignal): Promise<ChannelData | null> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${encodeURIComponent(login)}`, {}, signal);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  /** Get trust data for channel. */
  getTrust: async (channelIdOrLogin: string, signal?: AbortSignal): Promise<TrustData | null> => {
    try {
      const res = await apiFetch(
        `/api/v1/channels/${encodeURIComponent(channelIdOrLogin)}/trust`,
        {},
        signal
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  /** Request tracking for an untracked channel. */
  requestTracking: async (channelLogin: string): Promise<{ status: string } | null> => {
    try {
      const res = await apiFetch(
        `/api/v1/channels/${encodeURIComponent(channelLogin)}/request_tracking`,
        { method: 'POST' }
      );
      if (res.status === 409) return { status: 'already_requested' };
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  /** Track a channel (watchlist). Requires Premium or owns_channel. */
  trackChannel: async (channelId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${channelId}/track`, { method: 'POST' });
      if (res.status === 409) return { success: false, error: 'already_tracked' };
      if (res.status === 403) return { success: false, error: 'subscription_required' };
      if (!res.ok) return { success: false, error: 'unknown' };
      return { success: true };
    } catch {
      return { success: false, error: 'network' };
    }
  },

  /** Untrack a channel. */
  untrackChannel: async (channelId: string): Promise<{ success: boolean }> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${channelId}/track`, { method: 'DELETE' });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  },

  /** TASK-035: Get sparkline history (30m live / 7d offline). */
  getTrustHistory: async (channelId: string, period: '30m' | '7d', signal?: AbortSignal): Promise<SparklineData | null> => {
    try {
      const res = await apiFetch(
        `/api/v1/channels/${encodeURIComponent(channelId)}/trust/history?period=${period}`,
        {},
        signal
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  /**
   * TASK-085 FR-001..006: Get latest completed stream summary.
   * Pundit gates: registered + 18h post-stream window OR Premium tracked OR own channel.
   * Returns null on 4xx/5xx (e.g., 401/403 gates, 404 no completed streams, 503 Flipper kill).
   * Backend formats `duration_text` per Accept-Language header (i18n.language passed via locale).
   */
  getStreamLatestSummary: async (
    channelId: string,
    locale?: string,
    signal?: AbortSignal
  ): Promise<StreamSummaryResponse | null> => {
    try {
      const headers: Record<string, string> = {};
      if (locale) headers['Accept-Language'] = locale;
      const res = await apiFetch(
        `/api/v1/channels/${encodeURIComponent(channelId)}/streams/latest/summary`,
        { headers },
        signal
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  /** TASK-035: Get badge embed codes (streamer own channel). */
  getBadge: async (channelId: string): Promise<BadgeData | null> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${encodeURIComponent(channelId)}/badge`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  /** TASK-035: Get channel card data (streamer own channel). */
  getCard: async (channelId: string): Promise<CardData | null> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${encodeURIComponent(channelId)}/card`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // TASK-036: Watchlists API

  /** List user's watchlists with stats. */
  getWatchlists: async (signal?: AbortSignal): Promise<WatchlistItem[]> => {
    try {
      const res = await apiFetch('/api/v1/watchlists', {}, signal);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  /** Create a new watchlist. */
  createWatchlist: async (name: string): Promise<WatchlistItem | null> => {
    try {
      const res = await apiFetch('/api/v1/watchlists', {
        method: 'POST',
        body: JSON.stringify({ watchlist: { name } }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  /** Rename a watchlist. */
  renameWatchlist: async (id: string, name: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ watchlist: { name } }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Delete a watchlist. */
  deleteWatchlist: async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Get enriched channels in a watchlist. */
  getWatchlistChannels: async (
    watchlistId: string, sort?: string, filters?: Record<string, string>, signal?: AbortSignal
  ): Promise<{ data: WatchlistChannel[]; meta: { total: number; watchlist_name: string } }> => {
    try {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (filters) Object.entries(filters).forEach(([k, v]) => params.set(k, v));
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiFetch(`/api/v1/watchlists/${watchlistId}/channels${qs}`, {}, signal);
      if (!res.ok) return { data: [], meta: { total: 0, watchlist_name: '' } };
      return res.json();
    } catch {
      return { data: [], meta: { total: 0, watchlist_name: '' } };
    }
  },

  /** Add channel to watchlist. */
  addToWatchlist: async (watchlistId: string, channelId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${watchlistId}/channels`, {
        method: 'POST',
        body: JSON.stringify({ channel_id: channelId }),
      });
      if (res.status === 409) return { success: false, error: 'already_in_list' };
      if (res.status === 422) return { success: false, error: 'limit_reached' };
      return { success: res.ok };
    } catch {
      return { success: false, error: 'network' };
    }
  },

  /** Remove channel from watchlist. */
  removeFromWatchlist: async (watchlistId: string, channelId: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${watchlistId}/channels/${channelId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Move channel to another watchlist. */
  moveChannel: async (watchlistId: string, channelId: string, targetId: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${watchlistId}/channels/${channelId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ target_watchlist_id: targetId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Update tags/notes for a channel in a watchlist. */
  updateChannelMeta: async (watchlistId: string, channelId: string, tags: string[], notes: string | null): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/${watchlistId}/channels/${channelId}/meta`, {
        method: 'PATCH',
        body: JSON.stringify({ tags, notes }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Tag autocomplete. */
  getWatchlistTags: async (query: string): Promise<string[]> => {
    try {
      const res = await apiFetch(`/api/v1/watchlists/tags?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },
};
