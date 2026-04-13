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
};
