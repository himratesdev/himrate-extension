// Deep functional + visual sweep:
// For each scenario:
//   1. Load page
//   2. Scroll top → middle → bottom, capture screenshot at each position
//   3. For each tab in tab-bar (including locked):
//        a. Click tab
//        b. Wait for content render
//        c. Scroll top → middle → bottom — capture screenshot
//        d. Enumerate ALL interactive elements (no cap)
//        e. Click each — record DOM mutation / chrome.tabs.create / modal / errors
//   4. Output per-scenario report + screenshots-by-scroll for full coverage

import { chromium, BrowserContext, Page, ElementHandle } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCENARIOS } from './harness.js';
import type { Scenario } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE_BASE = path.resolve(__dirname, '.tmp-profile-deep');
const OUT_REPORTS = path.resolve(__dirname, 'functional-deep');
const OUT_SCREENS = path.resolve(__dirname, 'screens-deep');
fs.mkdirSync(OUT_REPORTS, { recursive: true });
fs.mkdirSync(OUT_SCREENS, { recursive: true });

interface ClickRow {
  idx: number;
  tag: string;
  classes: string;
  text: string;
  domDelta: number;
  modalOpened: boolean;
  tabsCreated: number;
  hasError: boolean;
  errorBrief: string;
}
interface TabResult {
  tabName: string;
  pageHeight: number;
  totalInteractive: number;
  clicks: ClickRow[];
  screenshots: string[]; // file names
  visibleTextSnippet: string;
}
interface DeepReport {
  scenario: string;
  tabs: TabResult[];
}

const TABS_LIST = ['Overview', 'Trends', 'Audience', 'Watchlists', 'Compare', 'Overlap', 'Bot-Raid', 'Settings'];

async function closeAnyModal(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Try multiple close strategies
    const closeBtn = document.querySelector('.sp-paywall-modal-close, .modal-close, [aria-label*="close" i], button.close') as HTMLElement;
    if (closeBtn) { closeBtn.click(); return; }
    const overlay = document.querySelector('.modal-overlay, .sp-paywall-overlay') as HTMLElement;
    if (overlay) { overlay.click(); return; }
    // Press Escape on focused element
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  await page.waitForTimeout(300);
}

async function clickTabByIndex(page: Page, idx: number): Promise<{ found: boolean; tabName: string; modalOpened: boolean }> {
  await closeAnyModal(page);
  const result = await page.evaluate((i) => {
    const tabs = Array.from(document.querySelectorAll('.sp-tab')) as HTMLElement[];
    const t = tabs[i];
    if (!t) return { found: false, tabName: '', modalOpened: false };
    const tabName = (t.textContent || '').trim().slice(0, 30);
    try { t.scrollIntoView({ block: 'center', behavior: 'instant' as any }); } catch (e) {}
    t.click();
    return { found: true, tabName, modalOpened: false };
  }, idx);
  // Long wait for tab content render
  await page.waitForTimeout(3500);
  const modalOpened = await page.evaluate(() => {
    return document.querySelector('.sp-paywall-modal, .modal-overlay, [role="dialog"]') != null;
  });
  return { found: result.found, tabName: result.tabName, modalOpened };
}

async function scrollAndCapture(page: Page, prefix: string): Promise<string[]> {
  const dim = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
  }));
  const positions = [0, Math.max(0, (dim.scrollHeight - dim.clientHeight) / 2), Math.max(0, dim.scrollHeight - dim.clientHeight)];
  const labels = ['top', 'mid', 'bottom'];
  const files: string[] = [];
  for (let i = 0; i < positions.length; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as any }), positions[i]);
    await page.waitForTimeout(300);
    const filePath = path.join(OUT_SCREENS, `${prefix}_${labels[i]}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    files.push(`${prefix}_${labels[i]}.png`);
  }
  // Reset to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as any }));
  return files;
}

async function clickEveryInteractive(page: Page): Promise<{ totalInteractive: number; clicks: ClickRow[] }> {
  // Re-scan
  const scan: any = await page.evaluate(() => {
    const root = document.body;
    const el = Array.from(root.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta'));
    const cursorPointer = Array.from(root.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !el.includes(e);
    });
    const all = [...el, ...cursorPointer];
    return all.map((e, i) => {
      const cs = window.getComputedStyle(e);
      return {
        idx: i,
        tag: e.tagName.toLowerCase(),
        classes: e.getAttribute('class') || '',
        text: (e.textContent || '').trim().slice(0, 50),
        cursor: cs.cursor,
        clickable: e.tagName.toLowerCase() === 'button' || e.tagName.toLowerCase() === 'a' || cs.cursor === 'pointer',
      };
    });
  });

  const clicks: ClickRow[] = [];
  let prevTabsCreated = 0;
  for (let i = 0; i < scan.length; i++) {
    const meta = scan[i];
    if (!meta.clickable) continue;
    const result: any = await page.evaluate((idx) => {
      const root = document.body;
      const el = Array.from(root.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta'));
      const cursorPointer = Array.from(root.querySelectorAll('*')).filter((e) => {
        const cs = window.getComputedStyle(e);
        return cs.cursor === 'pointer' && !el.includes(e);
      });
      const all = [...el, ...cursorPointer];
      const target = all[idx] as HTMLElement | undefined;
      if (!target) return { domDelta: 0, error: 'oob', modalOpened: false };
      try {
        target.scrollIntoView({ block: 'center', behavior: 'instant' as any });
      } catch (e) {}
      const beforeCount = root.querySelectorAll('*').length;
      let err: string | null = null;
      try {
        if (typeof (target as any).click === 'function') {
          (target as any).click();
        } else {
          target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
      } catch (e) {
        err = String(e).slice(0, 60);
      }
      const afterCount = root.querySelectorAll('*').length;
      const modal = document.querySelector('.modal, [role="dialog"], .sp-paywall-modal, .modal-overlay');
      return { domDelta: afterCount - beforeCount, error: err, modalOpened: modal != null };
    }, i);
    const totalTabs = await page.evaluate(() => (window as any).__tabsCreated || 0);
    const tabsDelta = totalTabs - prevTabsCreated;
    prevTabsCreated = totalTabs;
    clicks.push({
      idx: i,
      tag: meta.tag,
      classes: meta.classes.split(/\s+/).slice(0, 3).join(' '),
      text: meta.text,
      domDelta: result.domDelta,
      modalOpened: result.modalOpened,
      tabsCreated: tabsDelta,
      hasError: !!result.error,
      errorBrief: result.error || '',
    });
    await page.waitForTimeout(80);
    // Auto-close any open modal so subsequent clicks aren't gated
    if (result.modalOpened) {
      await page.evaluate(() => {
        const close = document.querySelector('.sp-paywall-modal-close, .modal-close, [aria-label*="close" i]') as HTMLElement;
        if (close) close.click();
        else {
          // Click overlay backdrop
          const overlay = document.querySelector('.modal-overlay') as HTMLElement;
          if (overlay) overlay.click();
        }
      });
      await page.waitForTimeout(200);
    }
  }
  return { totalInteractive: scan.length, clicks };
}

async function captureTab(page: Page, scenarioName: string, tabName: string, tabModalOpened = false): Promise<TabResult> {
  const prefix = `${scenarioName}__${tabName.replace(/[^a-z0-9]/gi, '_')}`;
  // 1. Capture initial visual at top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as any }));
  await page.waitForTimeout(400);
  // 2. Take screenshots at 3 scroll positions
  const screenshots = await scrollAndCapture(page, prefix);
  const dim = await page.evaluate(() => document.documentElement.scrollHeight);
  const visibleTextSnippet = (await page.evaluate(() => (document.body.innerText || '').slice(0, 500))).replace(/\n+/g, ' ');
  // 3. Click ALL interactive elements at the CURRENT scroll positions (top, mid, bottom)
  // For each scroll pos: scroll, click all visible-after-scroll elements
  let totalInteractive = 0;
  const clicks: ClickRow[] = [];
  const scrollPositions = [0, Math.max(0, (dim - 900) / 2), Math.max(0, dim - 900)];
  // First close any modal that might be lingering
  if (tabModalOpened) {
    await closeAnyModal(page);
    // Re-open the tab modal by clicking its tab again to capture its content if intentional
  }
  for (let pi = 0; pi < scrollPositions.length; pi++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as any }), scrollPositions[pi]);
    await page.waitForTimeout(400);
  }
  // Reset to top before clicking
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as any }));
  await page.waitForTimeout(300);
  const { totalInteractive: ti, clicks: cl } = await clickEveryInteractive(page);
  totalInteractive = ti;
  clicks.push(...cl);
  return { tabName, pageHeight: dim, totalInteractive, clicks, screenshots, visibleTextSnippet };
}

async function runScenario(s: Scenario, idx: number): Promise<DeepReport> {
  const profile = `${PROFILE_BASE}-${idx}`;
  fs.rmSync(profile, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(profile, {
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
    await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-deep-uuid' });
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
    chrome.tabs.create = function() { window.__tabsCreated++; if (_orig) try { _orig.apply(this, arguments); } catch(_) {} };
  }
})();
`);

  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const tabs: TabResult[] = [];
  // 1. initial tab capture (scenario startTab)
  const startMap: Record<string, number> = { overview: 0, trends: 1, audience: 2, watchlists: 3, compare: 4, overlap: 5, botraid: 6, settings: 7 };
  if (s.initialTab !== 'overview') {
    const startIdx = startMap[s.initialTab] ?? 0;
    await clickTabByIndex(page, startIdx);
  }
  if (s.postLoad) await s.postLoad(page);
  await page.waitForTimeout(500);
  tabs.push(await captureTab(page, s.name, `0_initial_${s.initialTab}`));

  // 2. Visit ALL 8 tabs by index
  for (let tabIdx = 0; tabIdx < 8; tabIdx++) {
    const { found, tabName, modalOpened } = await clickTabByIndex(page, tabIdx);
    if (!found) {
      console.warn(`  Tab idx ${tabIdx} not found in DOM`);
      continue;
    }
    const result = await captureTab(page, s.name, `${tabIdx}_${tabName}`, modalOpened);
    if (modalOpened) result.tabName = `${result.tabName}_LOCKED_MODAL`;
    tabs.push(result);
    await closeAnyModal(page);
  }

  await ctx.close();
  return { scenario: s.name, tabs };
}

(async () => {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const filter = onlyArg ? onlyArg.split('=')[1] : null;
  const target = ['wf01-', 'wf02-', 'wf03-not', 'wf04-not', 'wf05-not', 'wf06-', 'wf07-', 'wf08-', 'wf09-', 'wf10-live-guest-green-en', 'wf11-live-free-green-en', 'wf14-live-premium-green-en', 'wf15-live-streamer-own-en', 'wf16-offline-lt18h-en', 'wf17-offline', 'wf18-offline', 'wf19-error'];
  const scenarios = filter
    ? SCENARIOS.filter((s) => s.name.includes(filter))
    : SCENARIOS.filter((s) => target.some((t) => s.name.startsWith(t) || s.name === t));
  console.log(`Running ${scenarios.length} scenarios`);

  const summary: any[] = [];
  let idx = 0;
  for (const s of scenarios) {
    try {
      const report = await runScenario(s, idx++);
      const md = renderDeepReport(report);
      fs.writeFileSync(path.join(OUT_REPORTS, `${s.name}.md`), md);
      const total = report.tabs.reduce((sum, t) => sum + t.totalInteractive, 0);
      const totalClicks = report.tabs.reduce((sum, t) => sum + t.clicks.length, 0);
      const tabsCreated = report.tabs.reduce((sum, t) => sum + t.clicks.reduce((s2, c) => s2 + c.tabsCreated, 0), 0);
      const modals = report.tabs.reduce((sum, t) => sum + t.clicks.filter((c) => c.modalOpened).length, 0);
      console.log(`✓ ${s.name}: ${report.tabs.length} tabs, ${total} interactive, ${totalClicks} clicked, ${modals} modals, ${tabsCreated} navigations`);
      summary.push({ name: s.name, tabsVisited: report.tabs.length, total, totalClicks, modals, tabsCreated });
    } catch (e) {
      console.error(`✗ ${s.name}:`, (e as Error).message);
    }
  }

  let master = `# Deep Functional + Visual Sweep Summary\n\n**Generated:** ${new Date().toISOString()}\n\n`;
  master += `| Scenario | Tabs visited | Total interactive | Clicks | Modals opened | Navigations |\n|---|---|---|---|---|---|\n`;
  for (const r of summary) {
    master += `| ${r.name} | ${r.tabsVisited} | ${r.total} | ${r.totalClicks} | ${r.modals} | ${r.tabsCreated} |\n`;
  }
  fs.writeFileSync(path.join(OUT_REPORTS, '_SUMMARY.md'), master);
  console.log('\nMaster:', path.join(OUT_REPORTS, '_SUMMARY.md'));
  process.exit(0);
})();

function renderDeepReport(r: DeepReport): string {
  let out = `# Deep report: ${r.scenario}\n\n`;
  for (const t of r.tabs) {
    out += `## Tab: ${t.tabName}\n\n`;
    out += `**Page height:** ${t.pageHeight}px\n`;
    out += `**Total interactive:** ${t.totalInteractive}\n`;
    out += `**Visible text snippet:** "${t.visibleTextSnippet.slice(0, 200)}…"\n\n`;
    out += `**Screenshots:**\n`;
    for (const s of t.screenshots) out += `- ${s}\n`;
    out += `\n**Click results (${t.clicks.length}):**\n\n`;
    out += `| # | Element | DOM | Modal | Tabs | Error |\n|---|---|---|---|---|---|\n`;
    for (const c of t.clicks) {
      out += `| ${c.idx} | \`${c.tag}.${c.classes.replace(/\|/g, '\\|')}\` "${c.text.replace(/\|/g, '\\|')}" | ${c.domDelta !== 0 ? `Δ${c.domDelta}` : '-'} | ${c.modalOpened ? 'Y' : '-'} | ${c.tabsCreated} | ${c.errorBrief.replace(/\|/g, '\\|')} |\n`;
    }
    out += `\n---\n\n`;
  }
  return out;
}
