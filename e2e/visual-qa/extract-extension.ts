// Extract DOM manifest from extension for ALL scenarios in harness
// Reuses SCENARIOS array from harness.ts.

import { chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCENARIOS } from './harness.js';
import type { Scenario, AuthState, TrustCache } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE_BASE = path.resolve(__dirname, '.tmp-profile-ext');
const OUT = path.resolve(__dirname, 'extension-elements');
fs.mkdirSync(OUT, { recursive: true });

const WALKER_SCRIPT = `
(() => {
  function walk(el, depth = 0) {
    if (depth > 12) return null;
    const styles = el.getAttribute('style') || '';
    const cls = (el.getAttribute('class') || '').split(/\\s+/).filter(Boolean);
    const tag = el.tagName.toLowerCase();
    const title = el.getAttribute('title') || undefined;
    const id = el.getAttribute('id') || undefined;
    const directText = [];
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        const t = (node.textContent || '').trim();
        if (t) directText.push(t);
      }
    }
    const isClickable = tag === 'button' || tag === 'a' || styles.includes('cursor:pointer') || styles.includes('cursor: pointer') || el.onclick != null;
    const children = [];
    for (const child of el.children) {
      const c = walk(child, depth + 1);
      if (c) children.push(c);
    }
    return { tag, classes: cls, id, title, text: directText.join(' ') || undefined, styles, isClickable, children };
  }
  const root = document.querySelector('.panel') || document.body.firstElementChild;
  return walk(root);
})()
`;

async function captureScenario(s: Scenario, idx: number): Promise<void> {
  const profile = `${PROFILE_BASE}-${idx}`;
  fs.rmSync(profile, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-first-run', '--no-default-browser-check'],
    viewport: { width: 420, height: 900 },
  });

  let [sw] = ctx.serviceWorkers();
  if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  const extId = sw.url().split('/')[2];

  await sw.evaluate(async ({ accessToken, locale, channel, user }) => {
    await chrome.storage.session.clear();
    await chrome.storage.local.clear();
    if (accessToken) await chrome.storage.session.set({ access_token: accessToken });
    if (channel) await chrome.storage.session.set({ currentChannel: channel });
    await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-extract-uuid' });
    if (user) await chrome.storage.local.set({ user });
  }, {
    accessToken: s.accessToken,
    locale: s.locale,
    channel: s.channelLogin || null,
    user: s.authState.loggedIn ? { id: 'mock', tier: s.authState.tier } : null,
  });

  // api.himrate.com → staging redirect (same as harness)
  await ctx.route('https://api.himrate.com/**', async (route) => {
    const fixed = route.request().url().replace('https://api.himrate.com', 'https://staging.himrate.com');
    try {
      const resp = await route.fetch({ url: fixed });
      const body = await resp.text();
      await route.fulfill({ status: resp.status(), body, headers: resp.headers() });
    } catch {
      await route.abort();
    }
  });

  // Apply scenario route overrides
  if (s.routeOverrides) {
    for (const ov of s.routeOverrides) {
      await ctx.route(`https://staging.himrate.com${ov.pattern.startsWith('/') ? '**' + ov.pattern + '**' : '/**' + ov.pattern}**`, async (route) => {
        try {
          const resp = await route.fetch();
          let bodyStr = await resp.text();
          const headers = { ...resp.headers() };
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
          await route.fulfill({ status: ov.status ?? resp.status(), body: bodyStr, headers });
        } catch { await route.abort(); }
      });
    }
  }

  await ctx.addInitScript(`
(() => {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  const _origSend = chrome.runtime.sendMessage;
  const AUTH = ${JSON.stringify(s.authState)};
  const TRUST = ${JSON.stringify(s.trustCache)};
  const CHANNEL = ${JSON.stringify(s.channelLogin)};
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
`);

  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  if (s.initialTab !== 'overview') {
    const tabRegex: Record<string, RegExp> = {
      trends: /trend|тренд/i,
      audience: /audience|аудитор/i,
      watchlists: /watchlist|списк/i,
      compare: /compare|сравне/i,
      overlap: /overlap|пересеч/i,
      botraid: /bot.?raid/i,
      settings: /setting|настройк/i,
    };
    const re = tabRegex[s.initialTab];
    if (re) {
      await page.evaluate((src) => {
        const r = new RegExp(src.source, src.flags);
        const tabs = Array.from(document.querySelectorAll('button, [role="tab"]')) as HTMLElement[];
        const t = tabs.find((el) => r.test(el.textContent || ''));
        if (t) t.click();
      }, { source: re.source, flags: re.flags });
      await page.waitForTimeout(2500);
    }
  }
  if (s.postLoad) await s.postLoad(page);
  await page.waitForTimeout(1500);

  const tree = await page.evaluate(WALKER_SCRIPT);
  const out = path.join(OUT, `${s.name}.json`);
  fs.writeFileSync(out, JSON.stringify({ scenario: s.name, tree }, null, 2));
  console.log(`✓ ${s.name}`);

  await ctx.close();
}

(async () => {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const filter = onlyArg ? onlyArg.split('=')[1] : null;
  const scenarios = filter ? SCENARIOS.filter((s) => s.name.includes(filter)) : SCENARIOS;
  console.log(`Capturing ${scenarios.length} scenario(s)`);
  let idx = 0;
  for (const s of scenarios) {
    try { await captureScenario(s, idx++); } catch (e) { console.error(`✗ ${s.name}:`, (e as Error).message); }
  }
  process.exit(0);
})();
