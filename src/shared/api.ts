// TASK-018: Real API client with Bearer token + 401 auto-refresh
// All API calls go through apiFetch which handles auth transparently.

import { API_BASE } from './config';

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

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const tokenData = await chrome.storage.session.get('access_token');
  const token = tokenData.access_token;

  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Retry with new token
      const newTokenData = await chrome.storage.session.get('access_token');
      const newHeaders = new Headers(options.headers);
      newHeaders.set('Authorization', `Bearer ${newTokenData.access_token}`);
      newHeaders.set('Content-Type', 'application/json');
      return fetch(`${API_BASE}${path}`, { ...options, headers: newHeaders });
    }
    // Refresh failed — logout
    await chrome.storage.session.clear();
    await chrome.storage.local.remove(['refresh_token', 'user']);
    throw new AuthError('session_expired');
  }

  return response;
}

// === Typed API methods ===

export interface Channel {
  id: string;
  twitch_id: string;
  display_name: string;
  avatar_url: string | null;
  is_live: boolean;
}

export interface TrustData {
  erv_number: number | null;
  erv_percent: number | null;
  erv_label: string | null;
  ccv: number | null;
  trust_index: number | null;
  rating: number | null;
  confidence: number | null;
}

export const api = {
  getChannel: async (twitchId: string): Promise<Channel | null> => {
    try {
      const res = await apiFetch(`/api/v1/channels?twitch_id=${twitchId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.channel || data;
    } catch {
      return null;
    }
  },

  getTrust: async (channelId: string): Promise<TrustData | null> => {
    try {
      const res = await apiFetch(`/api/v1/channels/${channelId}/trust`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
};
