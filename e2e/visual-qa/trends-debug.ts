// Trends API debug capture — single scenario with FULL network + console logs
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXT = path.resolve(__dirname, '../../dist');
const PROFILE = path.resolve(__dirname, '.tmp-profile-debug');
const OUT = path.resolve(__dirname, 'trends-debug-logs');
fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });

const PREMIUM = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwY2JlMWI5Ny05OTQ3LTQ2ODctYjYzYS0yYTdjODFkN2NkZTIiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3Mzk0NTY0LCJpYXQiOjE3NzczOTA5NjR9.vZcz5eGd6ckJUo6jBThPJm7qZs5-zNIcu447aEYSGJs';
const CH_PREMIUM = '9362bba1-8d8a-4b6c-a204-69d316d83395';
const CH_PREMIUM_LOGIN = 'vqa_test_premium';

const networkLog: any[] = [];
const consoleLog: any[] = [];
const pageErrors: any[] = [];

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-first-run'],
    viewport: { width: 420, height: 900 },
  });

  let [sw] = ctx.serviceWorkers();
  if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  const extId = sw.url().split('/')[2];
  console.log('Extension ID:', extId);

  // Seed storage
  await sw.evaluate(async ({ token, channel }) => {
    await chrome.storage.session.clear();
    await chrome.storage.local.clear();
    await chrome.storage.session.set({ access_token: token, currentChannel: channel });
    await chrome.storage.local.set({ himrate_locale: 'en', extension_install_id: 'vqa-debug-uuid', user: { id: 'mock', tier: 'premium' } });
  }, { token: PREMIUM, channel: CH_PREMIUM_LOGIN });

  // api.himrate.com → staging.himrate.com redirect
  await ctx.route('https://api.himrate.com/**', async (route) => {
    const orig = route.request().url();
    const fixed = orig.replace('https://api.himrate.com', 'https://staging.himrate.com');
    networkLog.push({ event: 'redirect-route', from: orig, to: fixed });
    try {
      const resp = await route.fetch({ url: fixed });
      const body = await resp.text();
      networkLog.push({ event: 'redirect-response', url: fixed, status: resp.status(), bodyLength: body.length, bodyPreview: body.slice(0, 200) });
      await route.fulfill({ status: resp.status(), body, headers: resp.headers() });
    } catch (e) {
      networkLog.push({ event: 'redirect-error', url: fixed, error: (e as Error).message });
      await route.abort();
    }
  });

  // Mock chrome.runtime
  const trustCache = {
    channel_id: CH_PREMIUM, login: CH_PREMIUM_LOGIN, display_name: CH_PREMIUM_LOGIN,
    avatar_url: null, ti_score: 91, classification: 'trusted', erv_percent: 91, erv_count: 4550,
    erv_label: 'No anomalies detected', erv_label_color: 'green', ccv: 5000, confidence: 'full',
    cold_start_status: null, is_live: true, is_tracked: true, streamer_rating: null,
    category_avg_ti: 72, percentile_in_category: 92, expires_at: null, previous_ti_score: 88,
    is_watched_by_user: false, signal_breakdown: [], streamer_reputation: null, health_score: null,
    top_countries: null, ws_connected: true, error: null, loading: false, fetched_at: Date.now(),
  };
  const authState = { loggedIn: true, tier: 'premium', twitchLinked: true, twitchLogin: CH_PREMIUM_LOGIN };
  await ctx.addInitScript(`
(() => {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  const _origSend = chrome.runtime.sendMessage;
  const AUTH = ${JSON.stringify(authState)};
  const TRUST = ${JSON.stringify(trustCache)};
  const CHANNEL = ${JSON.stringify(CH_PREMIUM_LOGIN)};
  chrome.runtime.sendMessage = function(msg, cb) {
    if (msg && typeof msg === 'object') {
      if (msg.action === 'GET_AUTH_STATE') { try { cb(AUTH); } catch(_) {} return true; }
      if (msg.action === 'GET_TRUST_DATA') { try { cb(TRUST); } catch(_) {} return true; }
      if (msg.action === 'GET_CURRENT_CHANNEL') { try { cb({ currentChannel: CHANNEL }); } catch(_) {} return true; }
    }
    try { return _origSend.apply(this, arguments); } catch (e) {}
  };
})();
`);

  const page = await ctx.newPage();

  // Comprehensive logging
  page.on('request', (req) => {
    if (req.url().includes('himrate.com')) {
      networkLog.push({
        event: 'request',
        time: Date.now(),
        method: req.method(),
        url: req.url(),
        headers: req.headers(),
        postData: req.postData(),
      });
    }
  });
  page.on('response', async (resp) => {
    if (resp.url().includes('himrate.com')) {
      let body = '';
      try { body = (await resp.text()).slice(0, 500); } catch {}
      networkLog.push({
        event: 'response',
        time: Date.now(),
        url: resp.url(),
        status: resp.status(),
        statusText: resp.statusText(),
        headers: resp.headers(),
        bodyPreview: body,
      });
    }
  });
  page.on('requestfailed', (req) => {
    if (req.url().includes('himrate.com')) {
      networkLog.push({
        event: 'requestfailed',
        time: Date.now(),
        url: req.url(),
        failure: req.failure()?.errorText,
        method: req.method(),
        headers: req.headers(),
      });
    }
  });
  page.on('console', (msg) => {
    consoleLog.push({
      time: Date.now(),
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });
  page.on('pageerror', (err) => {
    pageErrors.push({ time: Date.now(), name: err.name, message: err.message, stack: err.stack });
  });

  console.log('Opening sidepanel...');
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  console.log('Clicking Trends tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button')) as HTMLElement[];
    const t = tabs.find((el) => /trend|тренд/i.test(el.textContent || ''));
    if (t) t.click();
  });
  await page.waitForTimeout(5000);

  console.log('Saving logs...');
  fs.writeFileSync(path.join(OUT, 'network.json'), JSON.stringify(networkLog, null, 2));
  fs.writeFileSync(path.join(OUT, 'console.json'), JSON.stringify(consoleLog, null, 2));
  fs.writeFileSync(path.join(OUT, 'page-errors.json'), JSON.stringify(pageErrors, null, 2));

  // Storage state
  const storage = await sw.evaluate(async () => {
    const session = await chrome.storage.session.get(null);
    const local = await chrome.storage.local.get(null);
    return { session, local };
  });
  fs.writeFileSync(path.join(OUT, 'storage.json'), JSON.stringify(storage, null, 2));

  console.log(`Logs saved to ${OUT}`);
  console.log(`Network events: ${networkLog.length}`);
  console.log(`Console events: ${consoleLog.length}`);
  console.log(`Page errors: ${pageErrors.length}`);

  await ctx.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
