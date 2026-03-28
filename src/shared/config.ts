// TASK-018: Shared configuration. Single source of truth for API_BASE.
// VITE_API_BASE must be set in build environment. No hardcoded staging URLs.

const env = (import.meta as unknown as { env: Record<string, string> }).env;
export const API_BASE = env?.VITE_API_BASE || 'https://api.himrate.com';
export const EXT_VERSION = typeof chrome !== 'undefined' ? chrome.runtime.getManifest().version : '0.0.0';
