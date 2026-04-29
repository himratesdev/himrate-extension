// TASK-039 Visual QA harness — full Side Panel coverage (PR #24).
// Loads extension persistent context, seeds chrome.storage via service worker,
// mocks chrome.runtime.sendMessage on the sidepanel page (background.getAuthState
// returns {loggedIn, user} but SidePanel expects {tier, twitchLinked, twitchLogin}
// — bug we surface; meanwhile mock so we can capture downstream UI).

import { chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE_BASE = path.resolve(__dirname, '.tmp-profile');
const OUT = path.resolve(__dirname, 'screens');
const ARCHIVE = path.resolve(__dirname, 'screens-archive');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ARCHIVE, { recursive: true });

// Auto-archive previous run by timestamp + commit SHA before clean
function autoArchive() {
  const existing = fs.readdirSync(OUT).filter((f) => f.endsWith('.png'));
  if (existing.length === 0) return;
  let sha = 'unknown';
  try {
    const { execSync } = require('child_process');
    sha = execSync('git rev-parse --short HEAD', { cwd: path.resolve(__dirname, '../..') }).toString().trim();
  } catch {}
  const ts = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '');
  const dir = path.join(ARCHIVE, `${ts}_${sha}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of existing) fs.copyFileSync(path.join(OUT, f), path.join(dir, f));
  console.log(`Archived ${existing.length} screens → ${dir}`);
}

// =======================
// Test data (PO-issued, 1h TTL)
// =======================

const TOKENS = {
  PREMIUM:
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwY2JlMWI5Ny05OTQ3LTQ2ODctYjYzYS0yYTdjODFkN2NkZTIiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3NDIwMzkyLCJpYXQiOjE3Nzc0MTY3OTJ9.cAfsUwNzhoan4TYgixsYSd9zOgazKRXCiIXsTFzzf7Y',
  FREE:
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwZThlMzZmNS0xNmYyLTQ1YTctYTkyNS1iNTMzNDg4OWQ4NjUiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3Mzk0NTY0LCJpYXQiOjE3NzczOTA5NjR9.GvPBK_joCZrUk7T4sC63WLdTxsr3WRCup7VfjJV4v5w',
  BUSINESS:
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwZjRkN2IwNC1kNzBkLTRhYzYtYWI3Zi0zZjIyYTkyNWVjZDMiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3NDIwMzkyLCJpYXQiOjE3Nzc0MTY3OTJ9._17d2aUJtYxupIsOdt3A3llhy-lFp_g2Pz4MhAWTtWo',
  STREAMER_OWN_OK:
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkYTFiMGY0Zi0xZTY5LTQ0OWQtYThlNS0yNjlhODgyMzUzODgiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3NDIwMzkyLCJpYXQiOjE3Nzc0MTY3OTJ9.oElGMj5pFaJKhHVCL_YItjxabLslGXwJVL3QBgGNVUM',
  STREAMER_REHAB:
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0YjdiNGQyYS00ZGE1LTQwMmItYWE4NC1mOTA2ZDI5MzE3ZmIiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3NDIwMzkyLCJpYXQiOjE3Nzc0MTY3OTJ9.53VTjuq6i1lOt7xNg6GaMybHJ64J9U8csPWOtMwogyY',
};

const CH_PREMIUM = '9362bba1-8d8a-4b6c-a204-69d316d83395';
const CH_PREMIUM_LOGIN = 'vqa_test_premium';
const CH_STREAMER_OWN = 'c1e9e092-e434-4825-97eb-5ee926d0cdfa';
const CH_STREAMER_OWN_LOGIN = 'vqa_test_streamer_own';
const CH_REHAB = 'b6afd864-d452-4af3-a141-1d0969ce0b10';
const CH_REHAB_LOGIN = 'vqa_test_rehab';

interface AuthState {
  loggedIn: boolean;
  tier: string;
  twitchLinked: boolean;
  twitchLogin: string | null;
}

interface TrustCache {
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
  confidence: string | null;
  cold_start_status: string | null;
  is_live: boolean;
  is_tracked: boolean;
  streamer_rating: any;
  category_avg_ti: number | null;
  percentile_in_category: number | null;
  expires_at: string | null;
  previous_ti_score: number | null;
  is_watched_by_user: boolean;
  signal_breakdown: any[];
  streamer_reputation: any;
  health_score: any;
  top_countries: any;
  ws_connected: boolean;
  error: any;
  loading: boolean;
  fetched_at: number;
}

function makeTrustCache(channelId: string, login: string, overrides: Partial<TrustCache> = {}): TrustCache {
  return {
    channel_id: channelId,
    login,
    display_name: login,
    avatar_url: null,
    ti_score: 91,
    classification: 'trusted',
    erv_percent: 91,
    erv_count: 4550,
    erv_label: 'No anomalies detected',
    erv_label_color: 'green',
    ccv: 5000,
    confidence: 'full',
    cold_start_status: null,
    is_live: true,
    is_tracked: true,
    streamer_rating: null,
    category_avg_ti: 72,
    percentile_in_category: 92,
    expires_at: null,
    previous_ti_score: 88,
    is_watched_by_user: false,
    signal_breakdown: [],
    streamer_reputation: null,
    health_score: null,
    top_countries: null,
    ws_connected: true,
    error: null,
    loading: false,
    fetched_at: Date.now(),
    ...overrides,
  };
}

// =======================
// Scenario shape
// =======================

interface RouteOverride {
  pattern: string;
  status?: number;
  bodyTransform?: (body: any) => any;
  freshness?: 'fresh' | 'stale';
}

interface Scenario {
  name: string;
  authState: AuthState;
  trustCache: TrustCache | null;
  accessToken: string | null;
  channelId: string | null;
  channelLogin: string;
  locale: 'ru' | 'en';
  initialTab: 'overview' | 'trends' | 'audience' | 'watchlists' | 'compare' | 'overlap' | 'botraid' | 'settings';
  postLoad?: (page: Page) => Promise<void>;
  routeOverrides?: RouteOverride[];
}

// === Helper auth state builders ===
const guestAuth = (): AuthState => ({ loggedIn: false, tier: 'guest', twitchLinked: false, twitchLogin: null });
const freeAuth = (): AuthState => ({ loggedIn: true, tier: 'free', twitchLinked: false, twitchLogin: null });
const premiumAuth = (login: string | null = null): AuthState => ({ loggedIn: true, tier: 'premium', twitchLinked: !!login, twitchLogin: login });
const businessAuth = (login: string | null = null): AuthState => ({ loggedIn: true, tier: 'business', twitchLinked: !!login, twitchLogin: login });
const streamerAuth = (login: string): AuthState => ({ loggedIn: true, tier: 'streamer', twitchLinked: true, twitchLogin: login });

// === Helper post-load actions ===
const clickTab = (matcher: RegExp) => async (page: Page) => {
  await page.evaluate((src) => {
    const re = new RegExp(src.source, src.flags);
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button, [data-tab]')) as HTMLElement[];
    const t = tabs.find((el) => re.test(el.textContent || ''));
    if (t) t.click();
  }, { source: matcher.source, flags: matcher.flags });
  await page.waitForTimeout(2200);
};
const clickPeriod = (label: string) => async (page: Page) => {
  await page.evaluate((l) => {
    const btns = Array.from(document.querySelectorAll('button')) as HTMLElement[];
    const b = btns.find((el) => (el.textContent || '').trim() === l);
    if (b) b.click();
  }, label);
  await page.waitForTimeout(2000);
};

// === API response transformers (route() helpers) ===
const transformErvColor = (color: 'yellow' | 'red', percent: number, label: string) => (body: any) => {
  if (body?.data) {
    body.data.summary = { ...(body.data.summary || {}), current: percent };
    body.data.classification_at_end = color === 'yellow' ? 'needs_review' : color === 'red' ? 'suspicious' : body.data.classification_at_end;
  }
  return body;
};

// =======================
// SCENARIOS — full coverage of 59 wireframe screens
// =======================

const COMMON_TRUST = makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN);
const STREAMER_TRUST = makeTrustCache(CH_STREAMER_OWN, CH_STREAMER_OWN_LOGIN);
const REHAB_TRUST = makeTrustCache(CH_REHAB, CH_REHAB_LOGIN);

const SCENARIOS: Scenario[] = [
  // ============================================================
  // STATE: Not Streaming Site / Skeleton / Error
  // ============================================================
  // Wireframe 01 Not Streaming Site
  { name: 'wf01-not-streaming-site', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: null, accessToken: TOKENS.PREMIUM, channelId: null, channelLogin: '', locale: 'en', initialTab: 'overview' },
  // Wireframe 02 Skeleton Loading (delayed API)
  { name: 'wf02-skeleton-loading', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: null, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview',
    routeOverrides: [{ pattern: '/api/v1/channels/', status: 200, bodyTransform: () => new Promise((r) => setTimeout(() => r(null), 8000)) as any }] },
  // Wireframe 19 Error Generic
  { name: 'wf19-error-generic', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { error: 'network', loading: false }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },

  // ============================================================
  // STATE: Not Tracked
  // ============================================================
  // Wireframe 03 Not Tracked Live (registered)
  { name: 'wf03-not-tracked-live-registered-en', authState: freeAuth(), trustCache: makeTrustCache('', 'unknown_streamer', { channel_id: null, is_tracked: false, is_live: true, ccv: 5000, ti_score: null, erv_percent: null, erv_label: null, classification: null }), accessToken: TOKENS.FREE, channelId: null, channelLogin: 'unknown_streamer', locale: 'en', initialTab: 'overview' },
  { name: 'wf03-not-tracked-live-registered-ru', authState: freeAuth(), trustCache: makeTrustCache('', 'unknown_streamer', { channel_id: null, is_tracked: false, is_live: true, ccv: 5000, ti_score: null, erv_percent: null, erv_label: null, classification: null }), accessToken: TOKENS.FREE, channelId: null, channelLogin: 'unknown_streamer', locale: 'ru', initialTab: 'overview' },
  // Wireframe 04 Not Tracked Live (guest)
  { name: 'wf04-not-tracked-live-guest', authState: guestAuth(), trustCache: makeTrustCache('', 'unknown_streamer', { channel_id: null, is_tracked: false, is_live: true, ccv: 5000, ti_score: null, erv_percent: null, erv_label: null, classification: null }), accessToken: null, channelId: null, channelLogin: 'unknown_streamer', locale: 'en', initialTab: 'overview' },
  // Wireframe 05 Not Tracked Offline
  { name: 'wf05-not-tracked-offline', authState: freeAuth(), trustCache: makeTrustCache('', 'unknown_streamer', { channel_id: null, is_tracked: false, is_live: false, ccv: null, ti_score: null, erv_percent: null, erv_label: null, classification: null }), accessToken: TOKENS.FREE, channelId: null, channelLogin: 'unknown_streamer', locale: 'en', initialTab: 'overview' },

  // ============================================================
  // STATE: Cold Start tiers (route override + trustCache)
  // ============================================================
  // Wireframe 06 Cold Start <3 streams
  { name: 'wf06-cold-start-lt3', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { cold_start_status: 'insufficient', streamer_rating: { score: null, streams_count: 2, classification: 'cold_start' }, ti_score: null, classification: null, erv_percent: null, erv_label: null, erv_count: null, confidence: 'insufficient' }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  // Wireframe 07 Cold Start 3-6
  { name: 'wf07-cold-start-3-6', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { cold_start_status: 'provisional_low', streamer_rating: { score: 65, streams_count: 5, classification: 'provisional' }, ti_score: 65, confidence: 'low', erv_label: 'No anomalies detected' }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  // Wireframe 08 Cold Start 7-9
  { name: 'wf08-cold-start-7-9', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { cold_start_status: 'provisional', streamer_rating: { score: 78, streams_count: 8, classification: 'provisional' }, ti_score: 78, confidence: 'medium' }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  // Wireframe 09 Cold Start 30+ Streamer (own channel)
  { name: 'wf09-cold-start-30plus-streamer', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: makeTrustCache(CH_STREAMER_OWN, CH_STREAMER_OWN_LOGIN, { streamer_rating: { score: 91, streams_count: 47, classification: 'trusted' }, health_score: { value: 87, tier: 'good' } }), accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview' },

  // ============================================================
  // STATE: Live × tier × ERV color
  // ============================================================
  // Wireframe 10 Live Guest Green
  { name: 'wf10-live-guest-green-en', authState: guestAuth(), trustCache: COMMON_TRUST, accessToken: null, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf10-live-guest-green-ru', authState: guestAuth(), trustCache: COMMON_TRUST, accessToken: null, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 11 Live Free Green 85%
  { name: 'wf11-live-free-green-en', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 85, ti_score: 85 }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf11-live-free-green-ru', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 85, ti_score: 85 }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 12 Live Free Yellow 62%
  { name: 'wf12-live-free-yellow-en', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 62, erv_label: 'Audience anomaly detected', erv_label_color: 'yellow', ti_score: 62, classification: 'needs_review' }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf12-live-free-yellow-ru', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 62, erv_label: 'Audience anomaly detected', erv_label_color: 'yellow', ti_score: 62, classification: 'needs_review' }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 13 Live Free Red 28%
  { name: 'wf13-live-free-red-en', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 28, erv_label: 'Significant audience anomaly', erv_label_color: 'red', ti_score: 32, classification: 'suspicious' }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf13-live-free-red-ru', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 28, erv_label: 'Significant audience anomaly', erv_label_color: 'red', ti_score: 32, classification: 'suspicious' }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 14 Live Premium Green 91%
  { name: 'wf14-live-premium-green-en', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf14-live-premium-green-ru', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 15 Live Streamer Own Channel
  { name: 'wf15-live-streamer-own-en', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf15-live-streamer-own-ru', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'ru', initialTab: 'overview' },

  // ============================================================
  // STATE: Offline post-stream
  // ============================================================
  // Wireframe 16 Offline <18h (data available)
  { name: 'wf16-offline-lt18h-en', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { is_live: false, expires_at: new Date(Date.now() + 16 * 3600 * 1000).toISOString() }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  { name: 'wf16-offline-lt18h-ru', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { is_live: false, expires_at: new Date(Date.now() + 16 * 3600 * 1000).toISOString() }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview' },
  // Wireframe 17 Offline >18h Free expired
  { name: 'wf17-offline-gt18h-expired', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { is_live: false, expires_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  // Wireframe 18 Offline <1h remaining (warning)
  { name: 'wf18-offline-lt1h-warning', authState: freeAuth(), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { is_live: false, expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() }), accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },

  // ============================================================
  // STREAMER MODE — Modals (Section 8)
  // ============================================================
  // Wireframe 20 Badge Modal
  { name: 'wf20-badge-modal', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/trust badge|бейдж/i) },
  // Wireframe 21 Channel Card Modal
  { name: 'wf21-channel-card-modal', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/channel card|карточка канала/i) },
  // Wireframe 22 Verification Request
  { name: 'wf22-verification-request', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/score dispute|запрос на проверку/i) },
  // Wireframe 23 Verification Limit Exhausted (5/5)
  { name: 'wf23-verification-limit-exhausted', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/score dispute|запрос на проверку/i) },

  // ============================================================
  // INTERACTIONS — Modals
  // ============================================================
  // Wireframe 24 Paywall Modal (Free clicks Audience)
  { name: 'wf24-paywall-modal-free-en', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/audience|аудитор/i) },
  { name: 'wf24-paywall-modal-free-ru', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'overview',
    postLoad: clickTab(/audience|аудитор/i) },
  // Wireframe 25 Channel Switch — TODO simulate via background message
  { name: 'wf25-channel-switch', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: async (page) => {
      await page.evaluate(() => {
        // Inject a CHANNEL_CHANGED notification
        chrome.runtime.onMessage.dispatch?.({ action: 'CHANNEL_CHANGED', channel: 'shroud' }, {} as any, () => {});
      });
      await page.waitForTimeout(800);
    } },
  // Wireframe 26 Anomaly Dots (ERV 62% yellow → dots on tabs)
  { name: 'wf26-anomaly-dots-erv62', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { erv_percent: 62, erv_label_color: 'yellow', erv_label: 'Audience anomaly detected', classification: 'needs_review' }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview' },
  // Wireframe 27 Watchlist Dropdown
  { name: 'wf27-watchlist-dropdown', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { is_watched_by_user: true }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overview',
    postLoad: clickTab(/in list|в списке|add to list|в список/i) },

  // ============================================================
  // TRENDS — Premium overview + period variants + paywalls + states
  // ============================================================
  // Wireframe 28 Trends Overview Premium
  { name: 'wf28-trends-overview-premium-en', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends' },
  { name: 'wf28-trends-overview-premium-ru', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'trends' },
  // Wireframe 32 Paywall Free → Premium (Trends)
  { name: 'wf32-trends-paywall-free-en', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends' },
  { name: 'wf32-trends-paywall-free-ru', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'trends' },
  // Wireframe 33 Paywall Guest → OAuth (Trends)
  { name: 'wf33-trends-paywall-guest-en', authState: guestAuth(), trustCache: COMMON_TRUST, accessToken: null, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends' },
  { name: 'wf33-trends-paywall-guest-ru', authState: guestAuth(), trustCache: COMMON_TRUST, accessToken: null, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'trends' },
  // Wireframe 34 Trends 7d period
  { name: 'wf34-trends-7d', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    postLoad: clickPeriod('7d') },
  // Wireframe 35 Trends 90d period
  { name: 'wf35-trends-90d', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    postLoad: clickPeriod('90d') },
  // Wireframe 36 Trends Insufficient Data (<5 streams)
  { name: 'wf36-trends-insufficient', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: makeTrustCache(CH_PREMIUM, CH_PREMIUM_LOGIN, { streamer_rating: { score: 75, streams_count: 3, classification: 'cold_start' }, cold_start_status: 'insufficient' }), accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    routeOverrides: [{ pattern: '/trends/erv', status: 400, bodyTransform: () => ({ error: 'INSUFFICIENT_DATA', message: 'Need at least 5 streams' }) }] },
  // Wireframe 44 Paywall Business 365d — Premium clicks 365d
  { name: 'wf44-trends-365d-paywall-business-en', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    postLoad: clickPeriod('365d') },
  { name: 'wf44-trends-365d-paywall-business-ru', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'trends',
    postLoad: clickPeriod('365д') },
  // Wireframe 45 Trends 365d Default Business
  { name: 'wf45-trends-365d-business', authState: businessAuth('vqa_test_business'), trustCache: COMMON_TRUST, accessToken: TOKENS.BUSINESS, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    postLoad: clickPeriod('365d') },
  // Wireframe 46 Stale Banner
  { name: 'wf46-trends-stale-banner', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends',
    routeOverrides: [{ pattern: '/trends/erv', freshness: 'stale' }, { pattern: '/trends/trust_index', freshness: 'stale' }, { pattern: '/trends/insights', freshness: 'stale' }] },
  // Wireframe 47 OAuth Revoked Banner
  { name: 'wf47-trends-oauth-revoked', authState: { loggedIn: true, tier: 'premium', twitchLinked: false, twitchLogin: null }, trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends' },

  // STREAMER REHAB — Trends Recovery (Wireframe 30)
  { name: 'wf30-trends-rehab-streamer', authState: streamerAuth(CH_REHAB_LOGIN), trustCache: REHAB_TRUST, accessToken: TOKENS.STREAMER_REHAB, channelId: CH_REHAB, channelLogin: CH_REHAB_LOGIN, locale: 'en', initialTab: 'trends' },
  { name: 'wf30-trends-rehab-streamer-ru', authState: streamerAuth(CH_REHAB_LOGIN), trustCache: REHAB_TRUST, accessToken: TOKENS.STREAMER_REHAB, channelId: CH_REHAB, channelLogin: CH_REHAB_LOGIN, locale: 'ru', initialTab: 'trends' },

  // ============================================================
  // OTHER TABS (PlaceholderTab expected — capture for documentation)
  // ============================================================
  // Wireframe 48 Audience Premium
  { name: 'wf48-audience-premium', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'audience' },
  // Wireframe 56 Compare Premium
  { name: 'wf56-compare-premium', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'compare' },
  // Wireframe 57 Overlap Premium
  { name: 'wf57-overlap-premium', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'overlap' },
  // Wireframe 58 BotRaid Premium
  { name: 'wf58-botraid-premium', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'botraid' },
  // Wireframe 59 Settings
  { name: 'wf59-settings', authState: premiumAuth(CH_PREMIUM_LOGIN), trustCache: COMMON_TRUST, accessToken: TOKENS.PREMIUM, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'settings' },

  // ============================================================
  // WATCHLISTS
  // ============================================================
  // Wireframe 49 Watchlists Free with data — mock filled response
  { name: 'wf49-watchlists-free-with-data-en', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'watchlists',
    routeOverrides: [{ pattern: '/api/v1/watchlists', bodyTransform: () => ({ data: [{ id: 'wl1', name: 'Мой список', items_count: 5, items: [
      { channel_id: 'c1', login: 'shroud', display_name: 'shroud', is_live: true, ti_score: 88, erv_percent: 85, ccv: 12000, erv_label_color: 'green' },
      { channel_id: 'c2', login: 'pokimane', display_name: 'pokimane', is_live: true, ti_score: 92, erv_percent: 91, ccv: 15000, erv_label_color: 'green' },
      { channel_id: 'c3', login: 'ninja', display_name: 'Ninja', is_live: false, ti_score: 75, erv_percent: 65, ccv: null, erv_label_color: 'yellow' },
      { channel_id: 'c4', login: 'xqc', display_name: 'xQc', is_live: true, ti_score: 50, erv_percent: 38, ccv: 25000, erv_label_color: 'red' },
      { channel_id: 'c5', login: 'asmongold', display_name: 'Asmongold', is_live: false, ti_score: 80, erv_percent: 78, ccv: null, erv_label_color: 'green' },
    ] }] }) }] },
  { name: 'wf49-watchlists-free-with-data-ru', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'watchlists',
    routeOverrides: [{ pattern: '/api/v1/watchlists', bodyTransform: () => ({ data: [{ id: 'wl1', name: 'Мой список', items_count: 5, items: [
      { channel_id: 'c1', login: 'shroud', display_name: 'shroud', is_live: true, ti_score: 88, erv_percent: 85, ccv: 12000, erv_label_color: 'green' },
      { channel_id: 'c2', login: 'pokimane', display_name: 'pokimane', is_live: true, ti_score: 92, erv_percent: 91, ccv: 15000, erv_label_color: 'green' },
      { channel_id: 'c3', login: 'ninja', display_name: 'Ninja', is_live: false, ti_score: 75, erv_percent: 65, ccv: null, erv_label_color: 'yellow' },
      { channel_id: 'c4', login: 'xqc', display_name: 'xQc', is_live: true, ti_score: 50, erv_percent: 38, ccv: 25000, erv_label_color: 'red' },
      { channel_id: 'c5', login: 'asmongold', display_name: 'Asmongold', is_live: false, ti_score: 80, erv_percent: 78, ccv: null, erv_label_color: 'green' },
    ] }] }) }] },
  // Wireframe 50 Watchlists Guest
  { name: 'wf50-watchlists-guest', authState: guestAuth(), trustCache: COMMON_TRUST, accessToken: null, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'watchlists' },
  // Wireframe 51 Watchlists Free Empty
  { name: 'wf51-watchlists-free-empty-en', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'watchlists' },
  { name: 'wf51-watchlists-free-empty-ru', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'ru', initialTab: 'watchlists' },
  // Wireframe 52 Watchlists Skeleton
  { name: 'wf52-watchlists-skeleton', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'watchlists',
    routeOverrides: [{ pattern: '/api/v1/watchlists', bodyTransform: () => new Promise((r) => setTimeout(() => r({ data: [] }), 8000)) as any }] },
  // Wireframe 53 Watchlists Error
  { name: 'wf53-watchlists-error', authState: freeAuth(), trustCache: COMMON_TRUST, accessToken: TOKENS.FREE, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'watchlists',
    routeOverrides: [{ pattern: '/api/v1/watchlists', status: 500, bodyTransform: () => ({ error: 'INTERNAL' }) }] },

  // ============================================================
  // TRENDS — Free/Streamer mode B variants
  // ============================================================
  { name: 'wf28-trends-business-overview', authState: businessAuth('vqa_test_business'), trustCache: COMMON_TRUST, accessToken: TOKENS.BUSINESS, channelId: CH_PREMIUM, channelLogin: CH_PREMIUM_LOGIN, locale: 'en', initialTab: 'trends' },
  { name: 'wf28-trends-streamer-own-overview', authState: streamerAuth(CH_STREAMER_OWN_LOGIN), trustCache: STREAMER_TRUST, accessToken: TOKENS.STREAMER_OWN_OK, channelId: CH_STREAMER_OWN, channelLogin: CH_STREAMER_OWN_LOGIN, locale: 'en', initialTab: 'trends' },
];

// =======================
// Run
// =======================

function buildMockScript(authState: AuthState, trustCache: TrustCache | null, currentChannel: string): string {
  return `
(() => {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  const _origSend = chrome.runtime.sendMessage;
  const AUTH = ${JSON.stringify(authState)};
  const TRUST = ${JSON.stringify(trustCache)};
  const CHANNEL = ${JSON.stringify(currentChannel)};
  chrome.runtime.sendMessage = function(msg, cb) {
    if (msg && typeof msg === 'object') {
      if (msg.action === 'GET_AUTH_STATE') { try { cb(AUTH); } catch(_) {} return true; }
      if (msg.action === 'GET_TRUST_DATA') { try { cb(TRUST); } catch(_) {} return true; }
      if (msg.action === 'GET_CURRENT_CHANNEL') { try { cb(CHANNEL || null); } catch(_) {} return true; }
      if (msg.action === 'TWITCH_RECONNECT') { try { cb({ success: true }); } catch(_) {} return true; }
      if (msg.action === 'FORCE_CHANNEL_LOAD') { try { cb({ success: true }); } catch(_) {} return true; }
    }
    try { return _origSend.apply(this, arguments); } catch (e) {}
  };
})();
`;
}

async function seedStorage(ctx: BrowserContext, scenario: Scenario): Promise<void> {
  let [sw] = ctx.serviceWorkers();
  if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  await sw.evaluate(
    async ({ accessToken, locale, channel, user }) => {
      await chrome.storage.session.clear();
      await chrome.storage.local.clear();
      if (accessToken) await chrome.storage.session.set({ access_token: accessToken });
      if (channel) await chrome.storage.session.set({ currentChannel: channel });
      await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-harness-uuid' });
      if (user) await chrome.storage.local.set({ user });
    },
    {
      accessToken: scenario.accessToken,
      locale: scenario.locale,
      channel: scenario.channelLogin || null,
      user: scenario.authState.loggedIn ? { id: 'mock', tier: scenario.authState.tier } : null,
    }
  );
}

async function applyRouteOverrides(ctx: BrowserContext, scenario: Scenario): Promise<void> {
  // Redirect api.himrate.com → staging.himrate.com (config.ts cast prevents Vite inline of VITE_API_BASE)
  await ctx.route('https://api.himrate.com/**', async (route) => {
    const orig = route.request().url();
    const fixed = orig.replace('https://api.himrate.com', 'https://staging.himrate.com');
    try {
      const resp = await route.fetch({ url: fixed });
      const headers = { ...resp.headers() };
      let bodyStr = await resp.text();
      const ov = scenario.routeOverrides?.find((o) => fixed.includes(o.pattern.replace(/\*/g, '')));
      if (ov && (ov.freshness || ov.bodyTransform)) {
        try {
          let body = JSON.parse(bodyStr);
          if (ov.freshness && body?.meta) body.meta.data_freshness = ov.freshness;
          if (ov.bodyTransform) {
            const t = ov.bodyTransform(body);
            body = (t && typeof (t as any).then === 'function') ? await t : t;
          }
          bodyStr = JSON.stringify(body);
          if (ov.freshness) headers['x-data-freshness'] = ov.freshness;
        } catch {}
      }
      await route.fulfill({ status: ov?.status ?? resp.status(), body: bodyStr, headers });
    } catch (e) {
      await route.abort();
    }
  });

  if (!scenario.routeOverrides) return;
  for (const ov of scenario.routeOverrides) {
    await ctx.route(`https://staging.himrate.com${ov.pattern.startsWith('/') ? '**' + ov.pattern + '**' : '/**' + ov.pattern}**`, async (route) => {
      try {
        if (ov.bodyTransform && !ov.status) {
          // Try real fetch first, then transform
          const resp = await route.fetch();
          let bodyStr = await resp.text();
          const headers = { ...resp.headers() };
          try {
            let body = JSON.parse(bodyStr);
            const t = ov.bodyTransform(body);
            body = (t && typeof (t as any).then === 'function') ? await t : t;
            bodyStr = JSON.stringify(body);
            if (ov.freshness) headers['x-data-freshness'] = ov.freshness;
          } catch {}
          await route.fulfill({ status: resp.status(), body: bodyStr, headers });
        } else {
          // Status-only override
          let body: any = {};
          if (ov.bodyTransform) {
            const t = ov.bodyTransform(body);
            body = (t && typeof (t as any).then === 'function') ? await t : t;
          }
          await route.fulfill({ status: ov.status ?? 200, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
        }
      } catch {
        await route.abort();
      }
    });
  }
}

async function runScenario(scenario: Scenario, idx: number): Promise<void> {
  const profile = `${PROFILE_BASE}-${idx}`;
  fs.rmSync(profile, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
    viewport: { width: 420, height: 900 },
  });

  let [sw] = ctx.serviceWorkers();
  if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  const extId = sw.url().split('/')[2];

  await seedStorage(ctx, scenario);
  await applyRouteOverrides(ctx, scenario);
  await ctx.addInitScript(buildMockScript(scenario.authState, scenario.trustCache, scenario.channelLogin));

  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.warn(`[${scenario.name}] pageerror:`, err.message));

  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  if (scenario.initialTab !== 'overview') {
    const tabRegex: Record<string, RegExp> = {
      trends: /trend|тренд/i,
      audience: /audience|аудитор/i,
      watchlists: /watchlist|списк/i,
      compare: /compare|сравне/i,
      overlap: /overlap|пересеч/i,
      botraid: /bot.?raid/i,
      settings: /setting|настройк/i,
    };
    const re = tabRegex[scenario.initialTab];
    if (re) {
      await page.evaluate((src) => {
        const r = new RegExp(src.source, src.flags);
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button, [data-tab]')) as HTMLElement[];
        const t = tabs.find((el) => r.test(el.textContent || ''));
        if (t) t.click();
      }, { source: re.source, flags: re.flags });
      await page.waitForTimeout(2500);
    }
  }

  if (scenario.postLoad) await scenario.postLoad(page);
  await page.waitForTimeout(1500);

  const screenshotPath = path.join(OUT, `${scenario.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ ${scenario.name}`);

  await ctx.close();
}

export { SCENARIOS, TOKENS, CH_PREMIUM, CH_PREMIUM_LOGIN, CH_STREAMER_OWN, CH_STREAMER_OWN_LOGIN, CH_REHAB, CH_REHAB_LOGIN };
export type { Scenario, AuthState, TrustCache };

const isMainEntry = process.argv[1] && process.argv[1].endsWith('harness.ts');
if (isMainEntry) {
  (async () => {
    const onlyArg = process.argv.find((a) => a.startsWith('--only='));
    const filter = onlyArg ? onlyArg.split('=')[1] : null;
    const scenarios = filter ? SCENARIOS.filter((s) => s.name.includes(filter)) : SCENARIOS;
    if (!process.argv.includes('--no-archive')) autoArchive();
    // Clean only when running full sweep (no --only filter)
    if (!filter) {
      for (const f of fs.readdirSync(OUT).filter((x) => x.endsWith('.png'))) fs.unlinkSync(path.join(OUT, f));
    }
    console.log(`Running ${scenarios.length} scenario(s)`);

    let idx = 0;
    for (const s of scenarios) {
      try {
        await runScenario(s, idx++);
      } catch (e) {
        console.error(`✗ ${s.name}:`, (e as Error).message);
      }
    }
    console.log('Done.');
    process.exit(0);
  })();
}
