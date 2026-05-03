// Single-frame deep training test — wf14 Premium Live Green
// Show explicitly:
//   1. Page height + viewport height
//   2. Screenshots at top / mid / bottom — saved to single-frame-screens/
//   3. List ALL interactive elements with bounding boxes
//   4. Click each element, record result
//
// Output: single-frame-output/wf14-DETAILED.md

import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCENARIOS } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE = path.resolve(__dirname, '.tmp-profile-single');
const OUT_SCREENS = path.resolve(__dirname, 'single-frame-screens');
const OUT_REPORT = path.resolve(__dirname, 'single-frame-output');
fs.mkdirSync(OUT_SCREENS, { recursive: true });
fs.mkdirSync(OUT_REPORT, { recursive: true });

const SCENARIO_NAME = process.argv.find((a) => a.startsWith('--scenario='))?.split('=')[1] || 'wf14-live-premium-green-en';

(async () => {
  const s = SCENARIOS.find((x) => x.name === SCENARIO_NAME);
  if (!s) { console.error('Scenario not found:', SCENARIO_NAME); process.exit(1); }
  console.log(`=== Testing scenario: ${s.name} ===`);

  fs.rmSync(PROFILE, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-first-run'],
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
    await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-single-uuid' });
    if (user) await chrome.storage.local.set({ user });
  }, {
    accessToken: s.accessToken,
    locale: s.locale,
    channel: s.channelLogin || null,
    user: s.authState.loggedIn ? { id: 'mock', tier: s.authState.tier } : null,
  });

  await ctx.route('https://api.himrate.com/**', async (route) => {
    const fixed = route.request().url().replace('https://api.himrate.com', 'https://staging.himrate.com');
    try {
      const resp = await route.fetch({ url: fixed });
      const body = await resp.text();
      await route.fulfill({ status: resp.status(), body, headers: resp.headers() });
    } catch { await route.abort(); }
  });

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
    }
    try { return _origSend.apply(this, arguments); } catch (e) {}
  };
  if (chrome.tabs) {
    const _orig = chrome.tabs.create;
    window.__tabsCreated = 0;
    window.__lastUrl = null;
    chrome.tabs.create = function(opts) { window.__tabsCreated++; window.__lastUrl = opts && opts.url; if (_orig) try { _orig.apply(this, arguments); } catch(_) {} };
  }
})();
`);

  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 1. Find the actual scrollable container inside .panel
  const dim = await page.evaluate(() => {
    // Walk DOM, find element with overflow:auto/scroll AND scrollHeight > clientHeight
    const candidates = ['.sp-content', '.panel', 'body'];
    let scroller: Element = document.documentElement;
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight + 10) {
        scroller = el;
        break;
      }
    }
    // Fallback: scan for any overflow:auto element
    if (scroller === document.documentElement) {
      const all = Array.from(document.querySelectorAll('*')).filter((e) => {
        const cs = window.getComputedStyle(e);
        return (cs.overflow === 'auto' || cs.overflowY === 'auto' || cs.overflow === 'scroll' || cs.overflowY === 'scroll')
          && e.scrollHeight > e.clientHeight + 10;
      });
      if (all.length > 0) scroller = all[0];
    }
    return {
      scrollerSelector: scroller.tagName.toLowerCase() + (scroller.className ? '.' + (scroller.getAttribute('class') || '').split(/\s+/)[0] : ''),
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
      windowScrollHeight: document.documentElement.scrollHeight,
      windowClientHeight: document.documentElement.clientHeight,
      bodyHeight: document.body.scrollHeight,
    };
  });
  console.log(`Scroll container: ${dim.scrollerSelector}`);
  console.log(`  Container height: ${dim.scrollHeight}px (viewport: ${dim.clientHeight}px) — overflow: ${(dim.scrollHeight - dim.clientHeight)}px`);
  console.log(`  Document height: ${dim.windowScrollHeight}px (window: ${dim.windowClientHeight}px)`);

  async function scrollContainer(yPos: number): Promise<number> {
    return await page.evaluate((target) => {
      const candidates = ['.sp-content', '.panel'];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && el.scrollHeight > el.clientHeight + 10) {
          el.scrollTop = target;
          return el.scrollTop;
        }
      }
      // Fallback
      const all = Array.from(document.querySelectorAll('*')).filter((e) => {
        const cs = window.getComputedStyle(e);
        return (cs.overflow === 'auto' || cs.overflowY === 'auto' || cs.overflow === 'scroll' || cs.overflowY === 'scroll')
          && e.scrollHeight > e.clientHeight + 10;
      });
      if (all.length > 0) {
        (all[0] as HTMLElement).scrollTop = target;
        return (all[0] as HTMLElement).scrollTop;
      }
      window.scrollTo({ top: target, behavior: 'instant' as any });
      return window.scrollY;
    }, yPos);
  }

  // 2. Screenshots at 3 scroll positions inside container
  const max = Math.max(0, dim.scrollHeight - dim.clientHeight);
  const positions = [
    { label: 'top', y: 0 },
    { label: 'mid', y: max / 2 },
    { label: 'bottom', y: max },
  ];
  for (const p of positions) {
    const actual = await scrollContainer(p.y);
    await page.waitForTimeout(500);
    const file = path.join(OUT_SCREENS, `${s.name}_${p.label}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  Screenshot ${p.label} (target=${p.y.toFixed(0)}, actual=${actual}): ${path.basename(file)}`);
  }
  // Reset
  await scrollContainer(0);
  await page.waitForTimeout(300);

  // Also one full-page screenshot (will only show first viewport since scroll is inside container)
  const fullFile = path.join(OUT_SCREENS, `${s.name}_FULL.png`);
  await page.screenshot({ path: fullFile, fullPage: true });
  console.log(`  Full-page screenshot: ${path.basename(fullFile)}`);

  // 3. Enumerate all elements + bounding boxes
  const elements: any = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab'));
    const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !all.includes(e);
    });
    const merged = [...all, ...cursorPointer];
    return merged.map((e, i) => {
      const r = e.getBoundingClientRect();
      const cs = window.getComputedStyle(e);
      return {
        idx: i,
        tag: e.tagName.toLowerCase(),
        classes: (e.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'),
        text: (e.textContent || '').trim().slice(0, 40),
        x: r.x.toFixed(0),
        y: (r.y + window.scrollY).toFixed(0), // absolute Y
        w: r.width.toFixed(0),
        h: r.height.toFixed(0),
        cursor: cs.cursor,
        clickable: e.tagName.toLowerCase() === 'button' || e.tagName.toLowerCase() === 'a' || cs.cursor === 'pointer',
      };
    });
  });

  console.log(`\nTotal interactive elements: ${elements.length}`);
  // Distribute by Y position to show scroll spans
  const byY = [...elements].sort((a: any, b: any) => +a.y - +b.y);
  console.log(`Y range: ${byY[0]?.y}px → ${byY[byY.length - 1]?.y}px`);

  // 4. Click each element + record result
  const clicks: any[] = [];
  let prevTabsCreated = 0;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el.clickable) {
      clicks.push({ ...el, skipped: 'not clickable', domDelta: 0, modalOpened: false, tabsCreated: 0, lastUrl: null });
      continue;
    }
    const result: any = await page.evaluate((idx) => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab'));
      const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
        const cs = window.getComputedStyle(e);
        return cs.cursor === 'pointer' && !all.includes(e);
      });
      const merged = [...all, ...cursorPointer];
      const target = merged[idx] as HTMLElement | undefined;
      if (!target) return { domDelta: 0, error: 'oob', modalOpened: false };
      try {
        // Scroll element into view inside container
        const r = target.getBoundingClientRect();
        const containers = ['.sp-content', '.panel'];
        for (const sel of containers) {
          const el = document.querySelector(sel) as HTMLElement;
          if (el && el.scrollHeight > el.clientHeight + 10) {
            const elR = el.getBoundingClientRect();
            // Position element at middle of container
            const offset = (r.top - elR.top) - el.clientHeight / 2 + r.height / 2;
            el.scrollTop = el.scrollTop + offset;
            break;
          }
        }
        target.scrollIntoView({ block: 'center', behavior: 'instant' as any });
      } catch (e) {}
      const beforeCount = document.body.querySelectorAll('*').length;
      let err: string | null = null;
      try {
        if (typeof (target as any).click === 'function') {
          (target as any).click();
        } else {
          target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
      } catch (e) { err = String(e).slice(0, 80); }
      const afterCount = document.body.querySelectorAll('*').length;
      const modal = document.querySelector('.modal, [role="dialog"], .sp-paywall-modal, .modal-overlay');
      const lastUrl = (window as any).__lastUrl || null;
      return { domDelta: afterCount - beforeCount, error: err, modalOpened: modal != null, lastUrl };
    }, i);
    const totalTabs = await page.evaluate(() => (window as any).__tabsCreated || 0);
    const tabsDelta = totalTabs - prevTabsCreated;
    prevTabsCreated = totalTabs;
    clicks.push({ ...el, ...result, tabsCreated: tabsDelta });
    await page.waitForTimeout(80);
    // Auto-close any modal
    if (result.modalOpened) {
      await page.evaluate(() => {
        const close = document.querySelector('.sp-paywall-modal-close, .modal-close, [aria-label*="close" i]') as HTMLElement;
        if (close) close.click();
        else {
          const overlay = document.querySelector('.modal-overlay') as HTMLElement;
          if (overlay) overlay.click();
        }
      });
      await page.waitForTimeout(150);
    }
  }

  // 5. Render report
  let md = `# Single-frame deep test — ${s.name}\n\n`;
  md += `**Page height:** ${dim.scrollHeight}px (viewport ${dim.clientHeight}px = **${(dim.scrollHeight / dim.clientHeight).toFixed(1)}x viewport**)\n`;
  md += `**Total interactive elements:** ${elements.length}\n`;
  md += `**Y range:** ${byY[0]?.y}px → ${byY[byY.length - 1]?.y}px (spans ${(+byY[byY.length - 1]?.y - +byY[0]?.y).toFixed(0)}px)\n\n`;
  md += `**Screenshots saved:** \`single-frame-screens/${s.name}_{top,mid,bottom,FULL}.png\`\n\n`;
  md += `## Element list (sorted by Y position)\n\n`;
  md += `| # | Y | Tag.classes | Text | Clickable | DOM Δ | Modal | Tabs | URL opened | Error |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|\n`;
  const sorted = [...clicks].sort((a, b) => +a.y - +b.y);
  for (const c of sorted) {
    const cls = c.classes ? `.${c.classes.replace(/\|/g, '\\|')}` : '';
    md += `| ${c.idx} | ${c.y} | \`${c.tag}${cls}\` | "${c.text.replace(/\|/g, '\\|')}" | ${c.clickable ? 'Y' : '-'} | ${c.domDelta || 0} | ${c.modalOpened ? 'Y' : '-'} | ${c.tabsCreated || 0} | ${c.lastUrl || '-'} | ${c.error || '-'} |\n`;
  }
  fs.writeFileSync(path.join(OUT_REPORT, `${s.name}-DETAILED.md`), md);
  console.log(`\nReport: ${path.join(OUT_REPORT, `${s.name}-DETAILED.md`)}`);

  await ctx.close();
  process.exit(0);
})();
