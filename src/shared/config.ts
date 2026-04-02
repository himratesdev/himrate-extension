// TASK-018: Shared configuration. Single source of truth for API_BASE.
// TASK-034: Added WS_URL and DONATION_URL.

const env = (import.meta as unknown as { env: Record<string, string> }).env;
export const API_BASE = env?.VITE_API_BASE || 'https://api.himrate.com';
export const EXT_VERSION = typeof chrome !== 'undefined' ? chrome.runtime.getManifest().version : '0.0.0';

// TASK-034: WebSocket URL (replace https with wss, add /cable)
export const WS_URL = API_BASE.replace(/^http/, 'ws') + '/cable';

// TASK-034 FR-014: DonationAlerts (placeholder until configured)
export const DONATION_URL = env?.VITE_DONATION_URL || '';

// TASK-034: Trust data cache TTL
export const TRUST_CACHE_TTL_MS = 30_000;

// TASK-034: API request timeout
export const API_TIMEOUT_MS = 5_000;

// TASK-034: Search debounce
export const SEARCH_DEBOUNCE_MS = 300;

// TASK-034: WS reconnect settings
export const WS_RECONNECT_BASE_MS = 1_000;
export const WS_RECONNECT_MAX_MS = 30_000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// TASK-034: REST polling fallback interval
export const REST_POLLING_INTERVAL_MS = 30_000;
