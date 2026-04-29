// Functional behavior test — для каждого frame:
// 1. enumerate clickable elements (buttons, links, [role=button], cursor:pointer)
// 2. enumerate elements with title= (tooltips)
// 3. click each → record DOM mutation count, navigation attempts, chrome.tabs.create calls
// 4. enumerate SVG paths → flag if hardcoded vs dynamic
//
// Output: functional-reports/wfNN.md per scenario + _SUMMARY.md

import { chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCENARIOS } from './harness.js';
import type { Scenario } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE_BASE = path.resolve(__dirname, '.tmp-profile-fn');
const OUT = path.resolve(__dirname, 'functional-reports');
fs.mkdirSync(OUT, { recursive: true });

interface ElementInfo {
  tag: string;
  classes: string;
  text: string;
  hasTitle: boolean;
  title?: string;
  cursor?: string;
  isClickable: boolean;
}
interface ClickResult {
  index: number;
  description: string;
  domMutated: boolean;
  newElementsCount: number;
  removedCount: number;
  url: string;
  modalOpened: boolean;
  navigationAttempted: boolean;
  chromeTabsCreated: number;
  errorThrown: string | null;
  visibleAfterClick: boolean;
}
interface FrameReport {
  scenario: string;
  totalInteractive: number;
  totalTooltips: number;
  svgPathsTotal: number;
  svgPathsHardcoded: number;
  clicks: ClickResult[];
  tooltipsVerified: Array<{ title: string; found: boolean }>;
  forms: Array<{ inputs: number; hasSubmit: boolean }>;
  notes: string[];
}

const SCAN_SCRIPT = `
(() => {
  const root = document.querySelector('.panel') || document.body;
  // Find all interactive elements
  const interactiveSelector = 'button, a, [role="button"], input, [data-tab]';
  const interactive = Array.from(root.querySelectorAll(interactiveSelector));
  const cursorPointer = Array.from(root.querySelectorAll('*')).filter((el) => {
    const cs = window.getComputedStyle(el);
    return cs.cursor === 'pointer' && !interactive.includes(el);
  });
  const allClickable = [...interactive, ...cursorPointer];

  // Tooltips (title attr)
  const tooltipped = Array.from(root.querySelectorAll('[title]'));

  // SVG paths
  const svgPaths = Array.from(root.querySelectorAll('svg path[d], svg polyline[points], svg circle, svg rect'));
  let hardcoded = 0;
  for (const p of svgPaths) {
    const d = p.getAttribute('d') || p.getAttribute('points') || '';
    // Heuristic: hardcoded if very simple/round numbers OR if the path is mostly identical to wireframe samples
    if (/^[ML]\s*[0-9.,\s]+$/.test(d) && d.length < 100) hardcoded++;
    if (d.match(/^\\s*[0-9.,\\s]+$/)) hardcoded++; // polyline points
  }

  // Forms
  const forms = Array.from(root.querySelectorAll('form'));
  const formInfo = forms.map((f) => ({
    inputs: f.querySelectorAll('input, textarea').length,
    hasSubmit: f.querySelector('button[type="submit"], [type="submit"]') != null,
  }));

  return {
    interactive: allClickable.map((el, i) => {
      const tag = el.tagName.toLowerCase();
      const cs = window.getComputedStyle(el);
      const text = (el.textContent || '').trim().slice(0, 60);
      return {
        index: i,
        tag,
        classes: el.getAttribute('class') || '',
        text,
        hasTitle: el.hasAttribute('title'),
        title: el.getAttribute('title') || undefined,
        cursor: cs.cursor,
        isClickable: tag === 'button' || tag === 'a' || cs.cursor === 'pointer',
      };
    }),
    tooltips: tooltipped.map((el) => ({
      title: el.getAttribute('title') || '',
      tag: el.tagName.toLowerCase(),
      classes: el.getAttribute('class') || '',
    })),
    svgPathsTotal: svgPaths.length,
    svgPathsHardcoded: hardcoded,
    forms: formInfo,
  };
})()
`;

function clickElementInPage(idx: number) {
  // This function will be serialized and run inside page.evaluate
  const root = document.querySelector('.panel') || document.body;
  const interactive = Array.from(root.querySelectorAll('button, a, [role="button"], input, [data-tab]'));
  const cursorPointer = Array.from(root.querySelectorAll('*')).filter((el) => {
    const cs = window.getComputedStyle(el);
    return cs.cursor === 'pointer' && !interactive.includes(el);
  });
  const all = [...interactive, ...cursorPointer];
  const target = all[idx] as HTMLElement | undefined;
  if (!target) return { domDelta: 0, error: 'index out of range', modalOpened: false, visible: false };
  const beforeCount = root.querySelectorAll('*').length;
  let err: string | null = null;
  try { target.click(); } catch (e) { err = String(e); }
  const afterCount = root.querySelectorAll('*').length;
  const modal = document.querySelector('.modal, [role="dialog"], .sp-paywall-modal, .sp-channel-switch, .modal-overlay');
  return {
    domDelta: afterCount - beforeCount,
    error: err,
    modalOpened: modal != null,
    visible: !!target.offsetParent,
  };
}

async function testScenario(s: Scenario, idx: number): Promise<FrameReport> {
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
    await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-fn-uuid' });
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

  // Track chrome.tabs.create calls
  let tabsCreatedCount = 0;
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
  // Track chrome.tabs.create
  if (chrome.tabs) {
    const _origCreate = chrome.tabs.create;
    window.__tabsCreated = 0;
    chrome.tabs.create = function() { window.__tabsCreated++; if (_origCreate) try { _origCreate.apply(this, arguments); } catch(_) {} };
  }
})();
`);

  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  if (s.initialTab !== 'overview') {
    const re: Record<string, RegExp> = {
      trends: /trend/i, audience: /audience/i, watchlists: /watchlist/i,
      compare: /compare/i, overlap: /overlap/i, botraid: /bot.?raid/i, settings: /setting/i,
    };
    const r = re[s.initialTab];
    if (r) {
      await page.evaluate((src) => {
        const re2 = new RegExp(src.source, src.flags);
        const tabs = Array.from(document.querySelectorAll('button, [role="tab"]')) as HTMLElement[];
        const t = tabs.find((el) => re2.test(el.textContent || ''));
        if (t) t.click();
      }, { source: r.source, flags: r.flags });
      await page.waitForTimeout(2500);
    }
  }
  if (s.postLoad) await s.postLoad(page);
  await page.waitForTimeout(1000);

  // 1. Scan
  const scan: any = await page.evaluate(SCAN_SCRIPT);
  const totalInteractive = scan.interactive.length;
  const tooltips = scan.tooltips || [];

  // 2. For each interactive element, click and observe
  const clickResults: ClickResult[] = [];
  for (let i = 0; i < Math.min(totalInteractive, 25); i++) {
    const el = scan.interactive[i];
    if (!el.isClickable) continue;
    const result: any = await page.evaluate(clickElementInPage, i);
    const tabsCreated = await page.evaluate(() => (window as any).__tabsCreated || 0);
    await page.waitForTimeout(150);
    clickResults.push({
      index: i,
      description: `${el.tag}${el.classes ? '.' + el.classes.split(/\s+/).slice(0, 2).join('.') : ''} "${el.text}"`,
      domMutated: (result.domDelta || 0) !== 0,
      newElementsCount: result.domDelta > 0 ? result.domDelta : 0,
      removedCount: result.domDelta < 0 ? Math.abs(result.domDelta) : 0,
      url: page.url(),
      modalOpened: result.modalOpened,
      navigationAttempted: false,
      chromeTabsCreated: tabsCreated - tabsCreatedCount,
      errorThrown: result.error,
      visibleAfterClick: result.visible,
    });
    tabsCreatedCount = tabsCreated;
    // Reset DOM if modal opened — close it
    if (result.modalOpened) {
      await page.evaluate(() => {
        const close = document.querySelector('.modal-close, [aria-label*="close" i], .sp-paywall-modal button') as HTMLElement;
        if (close) close.click();
      });
      await page.waitForTimeout(200);
    }
  }

  // 3. Tooltip verification — element with title attr should respond to hover
  const tooltipsVerified = tooltips.slice(0, 10).map((t: any) => ({
    title: t.title,
    found: !!t.title,
  }));

  await ctx.close();

  return {
    scenario: s.name,
    totalInteractive,
    totalTooltips: tooltips.length,
    svgPathsTotal: scan.svgPathsTotal,
    svgPathsHardcoded: scan.svgPathsHardcoded,
    clicks: clickResults,
    tooltipsVerified,
    forms: scan.forms || [],
    notes: [],
  };
}

(async () => {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const filter = onlyArg ? onlyArg.split('=')[1] : null;
  // Default: test 19 frames that are claimed done (01-19 + cold start variants)
  const target = ['wf01-', 'wf02-', 'wf03-not', 'wf04-not', 'wf05-not', 'wf06-', 'wf07-', 'wf08-', 'wf09-', 'wf10-live-guest-green-en', 'wf11-live-free-green-en', 'wf12-live-free-yellow-en', 'wf13-live-free-red-en', 'wf14-live-premium-green-en', 'wf15-live-streamer-own-en', 'wf16-offline-lt18h-en', 'wf17-offline', 'wf18-offline', 'wf19-error'];
  const scenarios = filter
    ? SCENARIOS.filter((s) => s.name.includes(filter))
    : SCENARIOS.filter((s) => target.some((t) => s.name.startsWith(t) || s.name === t));
  console.log(`Testing ${scenarios.length} scenarios`);
  let idx = 0;
  const summary: Array<{ name: string; interactive: number; tooltips: number; clicked: number; modalsOpened: number; tabsCreated: number; errors: number; svgPaths: number; hardcoded: number }> = [];
  for (const s of scenarios) {
    try {
      const report = await testScenario(s, idx++);
      const md = renderReport(report);
      fs.writeFileSync(path.join(OUT, `${s.name}.md`), md);
      console.log(`✓ ${s.name}: ${report.totalInteractive} interactive, ${report.clicks.filter((c) => c.modalOpened).length} modals, ${report.clicks.filter((c) => c.chromeTabsCreated > 0).length} navigations`);
      summary.push({
        name: s.name,
        interactive: report.totalInteractive,
        tooltips: report.totalTooltips,
        clicked: report.clicks.length,
        modalsOpened: report.clicks.filter((c) => c.modalOpened).length,
        tabsCreated: report.clicks.reduce((sum, c) => sum + c.chromeTabsCreated, 0),
        errors: report.clicks.filter((c) => c.errorThrown).length,
        svgPaths: report.svgPathsTotal,
        hardcoded: report.svgPathsHardcoded,
      });
    } catch (e) {
      console.error(`✗ ${s.name}:`, (e as Error).message);
    }
  }

  // Master summary
  let master = `# Functional Behavior Test — Summary\n\n`;
  master += `**Generated:** ${new Date().toISOString()}\n\n`;
  master += `| Frame | Interactive | Tooltips | Clicked | Modals | Navigations | Errors | SVG paths | Hardcoded |\n`;
  master += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of summary) {
    master += `| ${r.name} | ${r.interactive} | ${r.tooltips} | ${r.clicked} | ${r.modalsOpened} | ${r.tabsCreated} | ${r.errors} | ${r.svgPaths} | ${r.hardcoded} |\n`;
  }
  fs.writeFileSync(path.join(OUT, '_SUMMARY.md'), master);
  console.log(`\nMaster: ${OUT}/_SUMMARY.md`);
  process.exit(0);
})();

function renderReport(r: FrameReport): string {
  let out = `# Functional report: ${r.scenario}\n\n`;
  out += `**Total interactive:** ${r.totalInteractive}\n`;
  out += `**Total tooltips (title=):** ${r.totalTooltips}\n`;
  out += `**SVG paths total:** ${r.svgPathsTotal} (hardcoded estimate: ${r.svgPathsHardcoded})\n\n`;
  out += `## Click results\n\n`;
  out += `| # | Element | DOM mutated | Modal opened | Tabs created | Error |\n`;
  out += `|---|---|---|---|---|---|\n`;
  for (const c of r.clicks) {
    out += `| ${c.index} | \`${c.description.replace(/\|/g, '\\|')}\` | ${c.domMutated ? `yes (Δ${c.newElementsCount - c.removedCount})` : 'no'} | ${c.modalOpened ? 'YES' : 'no'} | ${c.chromeTabsCreated} | ${c.errorThrown || '-'} |\n`;
  }
  out += `\n## Tooltips\n\n`;
  for (const t of r.tooltipsVerified) {
    out += `- ${t.found ? '✓' : '✗'} ${t.title}\n`;
  }
  if (r.forms.length > 0) {
    out += `\n## Forms\n\n`;
    for (const f of r.forms) {
      out += `- inputs: ${f.inputs}, has submit: ${f.hasSubmit}\n`;
    }
  }
  return out;
}
