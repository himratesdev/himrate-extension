// HimRate Background Service Worker (MV3)
// TASK-018: OAuth flows, token management, auth event tracking
// TASK-034: Trust data fetch, WS client, badge, notifications, side panel open

import { API_BASE, EXT_VERSION, WS_URL, TRUST_CACHE_TTL_MS, WS_RECONNECT_BASE_MS, WS_RECONNECT_MAX_MS, WS_MAX_RECONNECT_ATTEMPTS, REST_POLLING_INTERVAL_MS } from '../shared/config';
import { extractChannel, formatCCV, getBadgeColor } from '../shared/utils';
import { api, type TrustCache } from '../shared/api';
import { searchUsers } from '../shared/gql';

// =============================================
// AUTH (unchanged from TASK-018)
// =============================================

function trackAuthEvent(provider: string, result: string, errorType?: string): void {
  fetch(`${API_BASE}/api/v1/analytics/auth_events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, result, error_type: errorType || null, extension_version: EXT_VERSION }),
  }).catch(() => {});
}

interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: Record<string, unknown>;
}

async function saveTokens(accessToken: string, refreshToken: string, user: Record<string, unknown>) {
  await chrome.storage.session.set({ access_token: accessToken });
  await chrome.storage.local.set({ refresh_token: refreshToken, user });
}

async function clearTokens() {
  await chrome.storage.session.clear();
  await chrome.storage.local.remove(['refresh_token', 'user']);
}

async function getAccessToken(): Promise<string | null> {
  const data = await chrome.storage.session.get('access_token');
  return (data.access_token as string) || null;
}

async function getAuthState(): Promise<{ loggedIn: boolean; user: Record<string, unknown> | null }> {
  const data = await chrome.storage.local.get('user');
  return { loggedIn: !!data.user, user: (data.user as Record<string, unknown>) || null };
}

async function authTwitch(): Promise<AuthResponse> {
  trackAuthEvent('twitch', 'attempt');
  try {
    const initRes = await fetch(`${API_BASE}/api/v1/auth/twitch`, { method: 'POST' });
    if (!initRes.ok) throw new Error('network');
    const initData = await initRes.json();

    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: initData.redirect_url,
      interactive: true,
    });

    if (!callbackUrl) return { success: false, error: 'cancelled' };

    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return { success: false, error: 'cancelled' };

    const cbRes = await fetch(`${API_BASE}/api/v1/auth/twitch/callback?code=${code}&state=${state || ''}`);
    if (!cbRes.ok) {
      const err = await cbRes.json().catch(() => ({}));
      trackAuthEvent('twitch', 'failure', err.error || 'auth_failed');
      return { success: false, error: err.error || 'auth_failed', message: err.message };
    }

    const data = await cbRes.json();
    await saveTokens(data.access_token, data.refresh_token, data.user);
    trackAuthEvent('twitch', 'success');
    return { success: true, user: data.user };
  } catch (e) {
    if (e instanceof Error && e.message.includes('user')) {
      trackAuthEvent('twitch', 'failure', 'cancelled');
      return { success: false, error: 'cancelled' };
    }
    trackAuthEvent('twitch', 'failure', 'network');
    return { success: false, error: 'network' };
  }
}

async function authGoogle(): Promise<AuthResponse> {
  trackAuthEvent('google', 'attempt');
  try {
    const googleToken = await chrome.identity.getAuthToken({ interactive: true });
    if (!googleToken?.token) return { success: false, error: 'cancelled' };

    const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken.token }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      trackAuthEvent('google', 'failure', err.error || 'auth_failed');
      return { success: false, error: err.error || 'auth_failed', message: err.message };
    }

    const data = await res.json();
    await saveTokens(data.access_token, data.refresh_token, data.user);
    trackAuthEvent('google', 'success');
    return { success: true, user: data.user };
  } catch (e) {
    if (e instanceof Error && e.message.includes('user')) {
      trackAuthEvent('google', 'failure', 'cancelled');
      return { success: false, error: 'cancelled' };
    }
    trackAuthEvent('google', 'failure', 'network');
    return { success: false, error: 'network' };
  }
}

async function logout(): Promise<void> {
  const token = await getAccessToken();
  await clearTokens();
  wsDisconnect();
  if (token) {
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

// =============================================
// TRUST DATA FETCH (TASK-034 FR-001)
// =============================================

let currentChannel: string | null = null;
let fetchAbortController: AbortController | null = null;

async function getTrustCache(): Promise<TrustCache | null> {
  const data = await chrome.storage.session.get('trust_cache');
  return (data.trust_cache as TrustCache) || null;
}

async function setTrustCache(cache: TrustCache): Promise<void> {
  await chrome.storage.session.set({ trust_cache: cache });
}

function makeEmptyCache(login: string): TrustCache {
  return {
    channel_id: null, login, display_name: login, avatar_url: null,
    ti_score: null, classification: null, erv_percent: null, erv_count: null,
    erv_label: null, erv_label_color: null, ccv: null, confidence: null,
    cold_start_status: null, is_live: false, is_tracked: false,
    streamer_rating: null, category_avg_ti: null, percentile_in_category: null,
    expires_at: null, previous_ti_score: null, ws_connected: false,
    error: null, loading: false, fetched_at: 0,
  };
}

async function fetchTrustData(login: string): Promise<void> {
  // Cancel any pending request
  if (fetchAbortController) fetchAbortController.abort();
  fetchAbortController = new AbortController();
  const signal = fetchAbortController.signal;

  // Set loading state
  const existingCache = await getTrustCache();
  const cache = existingCache?.login === login ? { ...existingCache, loading: true, error: null } : { ...makeEmptyCache(login), loading: true };
  await setTrustCache(cache);
  notifyPopup({ action: 'TRUST_DATA_UPDATED', data: cache });

  try {
    // Step 1: Get channel
    const channelData = await api.getChannel(login, signal);

    if (signal.aborted) return;

    if (!channelData) {
      // Channel not tracked — try to get CCV from GQL for live check
      const updatedCache: TrustCache = {
        ...makeEmptyCache(login),
        is_tracked: false,
        is_live: false, // Will be updated if we can detect live via GQL
        loading: false,
        fetched_at: Date.now(),
      };
      await setTrustCache(updatedCache);
      await updateBadgeFromCache(updatedCache);
      notifyPopup({ action: 'TRUST_DATA_UPDATED', data: updatedCache });
      return;
    }

    // Step 2: Get trust data
    const trustData = await api.getTrust(channelData.id, signal);

    if (signal.aborted) return;

    const previousTi = existingCache?.login === login ? existingCache.ti_score : null;

    const updatedCache: TrustCache = {
      channel_id: channelData.id,
      login: channelData.login,
      display_name: channelData.display_name,
      avatar_url: channelData.profile_image_url,
      ti_score: trustData?.ti_score ?? null,
      classification: trustData?.classification ?? null,
      erv_percent: trustData?.erv_percent ?? null,
      erv_count: trustData?.erv_count ?? null,
      erv_label: trustData?.erv_label ?? null,
      erv_label_color: trustData?.erv_label_color ?? null,
      ccv: trustData?.ccv ?? null,
      confidence: trustData?.confidence ?? null,
      cold_start_status: trustData?.cold_start_status ?? null,
      is_live: trustData?.is_live ?? channelData.is_live,
      is_tracked: true,
      streamer_rating: trustData?.streamer_rating ?? null,
      category_avg_ti: trustData?.category_avg_ti ?? null,
      percentile_in_category: trustData?.percentile_in_category ?? null,
      expires_at: trustData?.post_stream_expires_at ?? null,
      previous_ti_score: previousTi,
      ws_connected: false,
      error: null,
      loading: false,
      fetched_at: Date.now(),
    };

    await setTrustCache(updatedCache);
    await updateBadgeFromCache(updatedCache);
    notifyPopup({ action: 'TRUST_DATA_UPDATED', data: updatedCache });

    // Step 3: Subscribe to WS if tracked + live
    if (updatedCache.is_tracked && updatedCache.channel_id) {
      wsSubscribe(updatedCache.channel_id);
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;

    const errorCache: TrustCache = {
      ...(existingCache?.login === login ? existingCache : makeEmptyCache(login)),
      error: 'network',
      loading: false,
      fetched_at: Date.now(),
    };
    await setTrustCache(errorCache);
    await updateBadgeFromCache(errorCache);
    notifyPopup({ action: 'TRUST_DATA_UPDATED', data: errorCache });
  }
}

// =============================================
// BADGE (TASK-034 FR-002)
// =============================================

async function updateBadgeFromCache(cache: TrustCache): Promise<void> {
  if (cache.error) {
    await setBadge('—', null);
    return;
  }

  if (cache.is_tracked && cache.is_live && cache.ccv !== null) {
    await setBadge(formatCCV(cache.ccv), cache.ti_score);
  } else if (cache.is_tracked && !cache.is_live) {
    const locale = ((await chrome.storage.local.get('himrate_locale')).himrate_locale as string) || 'en';
    await setBadge(locale === 'ru' ? 'офф' : 'OFF', cache.ti_score);
  } else if (!cache.is_tracked && cache.is_live && cache.ccv !== null) {
    await setBadge(formatCCV(cache.ccv), null); // grey for untracked
  } else {
    await setBadge('—', null);
  }
}

async function setBadge(text: string, ti: number | null): Promise<void> {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: getBadgeColor(ti) });
}

async function clearBadge(): Promise<void> {
  await chrome.action.setBadgeText({ text: '' });
}

// =============================================
// ACTIONCABLE MINIMAL WS CLIENT (TASK-034 FR-003, ADR)
// =============================================

let ws: WebSocket | null = null;
let wsChannelId: string | null = null;
let wsReconnectAttempts = 0;
let wsReconnectTimeout: ReturnType<typeof setTimeout> | null = null;

async function wsSubscribe(channelId: string): Promise<void> {
  // Unsubscribe from previous if different
  if (wsChannelId && wsChannelId !== channelId) {
    wsDisconnect();
  }

  if (ws?.readyState === WebSocket.OPEN && wsChannelId === channelId) return;

  wsChannelId = channelId;
  wsReconnectAttempts = 0;

  await wsConnect();
}

async function wsConnect(): Promise<void> {
  if (!wsChannelId) return;

  try {
    const token = await getAccessToken();
    const installData = await chrome.storage.local.get('extension_install_id');
    const installId = installData.extension_install_id;

    let url = WS_URL;
    if (token) url += `?token=${encodeURIComponent(token)}`;
    else if (installId) url += `?install_id=${encodeURIComponent(String(installId))}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      wsReconnectAttempts = 0;
      // Subscribe to TrustChannel
      const identifier = JSON.stringify({ channel: 'TrustChannel', channel_id: wsChannelId });
      ws?.send(JSON.stringify({ command: 'subscribe', identifier }));

      // Start keepalive alarm
      chrome.alarms.create('ws_keepalive', { periodInMinutes: 0.5 });

      // Stop REST polling if active
      chrome.alarms.clear('rest_polling');

      // Update cache ws_connected
      getTrustCache().then(cache => {
        if (cache) setTrustCache({ ...cache, ws_connected: true });
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWsMessage(data);
      } catch {
        // Invalid JSON, ignore
      }
    };

    ws.onclose = () => {
      ws = null;
      getTrustCache().then(cache => {
        if (cache) setTrustCache({ ...cache, ws_connected: false });
      });

      if (wsChannelId && wsReconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(WS_RECONNECT_BASE_MS * Math.pow(2, wsReconnectAttempts), WS_RECONNECT_MAX_MS);
        wsReconnectAttempts++;
        wsReconnectTimeout = setTimeout(() => wsConnect(), delay);
      } else {
        // Permanent REST fallback
        startRestPolling();
      }
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    if (wsReconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
      wsReconnectAttempts++;
      wsReconnectTimeout = setTimeout(() => wsConnect(), WS_RECONNECT_BASE_MS);
    } else {
      startRestPolling();
    }
  }
}

function wsDisconnect(): void {
  if (wsReconnectTimeout) clearTimeout(wsReconnectTimeout);
  wsReconnectTimeout = null;
  wsChannelId = null;
  wsReconnectAttempts = 0;
  chrome.alarms.clear('ws_keepalive');
  chrome.alarms.clear('rest_polling');
  if (ws) {
    ws.onclose = null; // prevent reconnect
    ws.close();
    ws = null;
  }
}

async function handleWsMessage(data: Record<string, unknown>): Promise<void> {
  // ActionCable ping
  if (data.type === 'ping') return;
  // Subscription confirmation
  if (data.type === 'confirm_subscription') return;
  // Rejection
  if (data.type === 'reject_subscription') {
    wsDisconnect();
    startRestPolling();
    return;
  }

  // Data message
  const message = data.message as Record<string, unknown> | undefined;
  if (!message) return;

  const msgType = message.type as string;

  if (msgType === 'trust_update') {
    const cache = await getTrustCache();
    if (!cache) return;

    const previousTi = cache.ti_score;
    const updatedCache: TrustCache = {
      ...cache,
      ti_score: (message.ti_score as number) ?? cache.ti_score,
      classification: (message.classification as string) ?? cache.classification,
      erv_percent: (message.erv_percent as number) ?? cache.erv_percent,
      erv_count: (message.erv_count as number) ?? cache.erv_count,
      erv_label_color: (message.erv_label_color as string) ?? cache.erv_label_color,
      ccv: (message.ccv as number) ?? cache.ccv,
      confidence: (message.confidence as number) ?? cache.confidence,
      cold_start_status: (message.cold_start_status as string) ?? cache.cold_start_status,
      previous_ti_score: previousTi,
      ws_connected: true,
      fetched_at: Date.now(),
    };

    await setTrustCache(updatedCache);
    await updateBadgeFromCache(updatedCache);
    notifyPopup({ action: 'TRUST_DATA_UPDATED', data: updatedCache });
  }

  if (msgType === 'stream_ended') {
    const cache = await getTrustCache();
    if (!cache) return;

    const updatedCache: TrustCache = {
      ...cache,
      is_live: false,
      ti_score: (message.ti_score as number) ?? cache.ti_score,
      erv_percent: (message.erv_percent as number) ?? cache.erv_percent,
      expires_at: (message.expires_at as string) ?? null,
      fetched_at: Date.now(),
    };

    await setTrustCache(updatedCache);
    await updateBadgeFromCache(updatedCache);
    notifyPopup({ action: 'TRUST_DATA_UPDATED', data: updatedCache });

    // Chrome notification
    sendNotification(
      'stream_ended',
      'HimRate',
      `Stream ended. ${cache.display_name}: ERV ${cache.erv_percent ?? '—'}%, TI ${cache.ti_score ?? '—'}`
    );
  }

  if (msgType === 'stream_expiring') {
    notifyPopup({
      action: 'STREAM_EXPIRING',
      data: { channel_id: message.channel_id, expires_at: message.expires_at },
    });

    const cache = await getTrustCache();
    sendNotification(
      'stream_expiring',
      'HimRate',
      `1 hour left for analytics of ${cache?.display_name ?? 'channel'}`
    );
  }
}

// =============================================
// REST POLLING FALLBACK (TASK-034 FR-013)
// =============================================

function startRestPolling(): void {
  chrome.alarms.create('rest_polling', { periodInMinutes: REST_POLLING_INTERVAL_MS / 60_000 });
}

// =============================================
// CHROME.ALARMS (TASK-034 FR-012)
// =============================================

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'ws_keepalive') {
    // Check if WS is still alive, reconnect if needed
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      if (wsChannelId) wsConnect();
    }
  }

  if (alarm.name === 'rest_polling') {
    // REST fallback: re-fetch trust data for current channel
    const cache = await getTrustCache();
    if (cache && cache.login && cache.is_tracked) {
      await fetchTrustData(cache.login);
    }
  }
});

// =============================================
// NOTIFICATIONS (TASK-034 FR-026)
// =============================================

const notificationThrottle: Record<string, number> = {};

function sendNotification(type: string, title: string, message: string): void {
  const key = `${type}_${currentChannel}`;
  const now = Date.now();
  if (notificationThrottle[key] && now - notificationThrottle[key] < 3600_000) return; // 1hr throttle
  notificationThrottle[key] = now;

  chrome.notifications.create(`himrate_${type}_${Date.now()}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.svg'),
    title,
    message,
  }).catch(() => {}); // Permission may not be granted
}

// =============================================
// POPUP COMMUNICATION
// =============================================

function notifyPopup(message: Record<string, unknown>): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup not open — no-op
  });
}

// =============================================
// SIDE PANEL (TASK-034 FR-027)
// =============================================

async function openSidePanel(_tab?: string): Promise<void> {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      await chrome.sidePanel.open({ tabId: activeTab.id });
    }
  } catch {
    // sidePanel API may not be available
  }
}

// =============================================
// MESSAGE ROUTING
// =============================================

let lastHandledChannel: string | null = null;
let lastHandledAt = 0;
const DEBOUNCE_MS = 3000;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { action } = message;

  if (action === 'AUTH_TWITCH') {
    authTwitch().then(sendResponse);
    return true;
  }
  if (action === 'AUTH_GOOGLE') {
    authGoogle().then(sendResponse);
    return true;
  }
  if (action === 'LOGOUT') {
    logout().then(() => sendResponse({ success: true }));
    return true;
  }
  if (action === 'GET_AUTH_STATE') {
    getAuthState().then(sendResponse);
    return true;
  }

  if (action === 'CHANNEL_CHANGED') {
    const channel = message.channel as string | null;
    const now = Date.now();

    if (channel === lastHandledChannel && now - lastHandledAt < DEBOUNCE_MS) {
      sendResponse();
      return false;
    }
    lastHandledChannel = channel;
    lastHandledAt = now;
    currentChannel = channel;

    chrome.storage.session.set({ currentChannel: channel });

    if (!channel) {
      clearBadge();
      wsDisconnect();
      sendResponse();
      return false;
    }

    fetchTrustData(channel).then(() => sendResponse());
    return true;
  }

  if (action === 'GET_CURRENT_CHANNEL') {
    chrome.storage.session.get('currentChannel').then(data => {
      sendResponse({ currentChannel: data.currentChannel || null });
    });
    return true;
  }

  if (action === 'GET_TRUST_DATA') {
    getTrustCache().then(cache => {
      if (cache && cache.login === currentChannel && Date.now() - cache.fetched_at < TRUST_CACHE_TTL_MS) {
        sendResponse(cache);
      } else if (currentChannel) {
        fetchTrustData(currentChannel).then(() => getTrustCache().then(sendResponse));
      } else {
        sendResponse(null);
      }
    });
    return true;
  }

  if (action === 'SEARCH_STREAMERS') {
    const query = message.query as string;
    if (!query) { sendResponse({ results: [] }); return false; }
    searchUsers(query, 5).then(results => sendResponse({ results }));
    return true;
  }

  if (action === 'OPEN_SIDE_PANEL') {
    openSidePanel(message.tab).then(() => sendResponse({ success: true }));
    return true;
  }

  return false;
});

// === webNavigation backup ===

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  const channel = extractChannel(details.url);
  if (channel !== currentChannel) {
    currentChannel = channel;
    chrome.storage.session.set({ currentChannel: channel });
    if (channel) fetchTrustData(channel);
    else { clearBadge(); wsDisconnect(); }
  }
}, { url: [{ hostContains: 'twitch.tv' }] });

// === Init ===

chrome.runtime.onInstalled.addListener(async () => {
  clearBadge();
  // Generate extension_install_id if not exists
  const data = await chrome.storage.local.get('extension_install_id');
  if (!data.extension_install_id) {
    await chrome.storage.local.set({ extension_install_id: crypto.randomUUID() });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
