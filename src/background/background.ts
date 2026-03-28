// HimRate Background Service Worker (MV3)
// TASK-018: OAuth flows, token management, message routing, auth event tracking

const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE || 'https://staging.himrate.com';
const EXT_VERSION = chrome.runtime.getManifest().version;

// === Auth Event Tracking (v1.1) ===

function trackAuthEvent(provider: string, result: string, errorType?: string): void {
  const payload = {
    provider,
    result,
    error_type: errorType || null,
    extension_version: EXT_VERSION,
  };

  // Fire-and-forget: never block auth flow
  fetch(`${API_BASE}/api/v1/analytics/auth_events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {}); // silently ignore if backend unavailable
}

interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: Record<string, unknown>;
}

// === Token Storage ===

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

// === OAuth Flows ===

async function authTwitch(): Promise<AuthResponse> {
  trackAuthEvent('twitch', 'attempt');
  try {
    // Step 1: Get redirect URL from backend
    const initRes = await fetch(`${API_BASE}/api/v1/auth/twitch`, { method: 'POST' });
    if (!initRes.ok) throw new Error('network');
    const initData = await initRes.json();
    const redirect_url = initData.redirect_url;

    // Step 2: Launch OAuth window
    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: redirect_url,
      interactive: true,
    });

    if (!callbackUrl) return { success: false, error: 'cancelled' };

    // Step 3: Extract code from callback URL and exchange for JWT
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) return { success: false, error: 'cancelled' };

    const cbRes = await fetch(
      `${API_BASE}/api/v1/auth/twitch/callback?code=${code}&state=${state}`
    );

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
    // Step 1: Get Google token via chrome.identity (1-click)
    const googleToken = await chrome.identity.getAuthToken({ interactive: true });

    if (!googleToken?.token) return { success: false, error: 'cancelled' };

    // Step 2: Exchange Google token for JWT via backend
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

  // Fire-and-forget backend logout
  if (token) {
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

// === Message Routing ===

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { action } = message;

  if (action === 'AUTH_TWITCH') {
    authTwitch().then(sendResponse);
    return true; // async response
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

  return false;
});

// === Init ===

chrome.runtime.onInstalled.addListener(() => {
  // Phase 2: initialize default settings
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
