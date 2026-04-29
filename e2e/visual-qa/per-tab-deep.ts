// Per-tab thorough interactor for ONE scenario.
// For each tab:
//   1. Click tab → wait 3s for content load
//   2. Take screenshot at scroll top
//   3. Scroll mid → screenshot
//   4. Scroll bottom → screenshot
//   5. Reset scroll to top
//   6. Enumerate ALL clickable elements
//   7. For each clickable:
//      a. Scroll into view
//      b. Screenshot BEFORE
//      c. Click
//      d. Wait 600ms
//      e. Screenshot AFTER
//      f. If modal opened — capture modal screenshot + click each modal element
//      g. Close modal if exists
//   8. Save report markdown with screenshot references

import { chromium, Page, ElementHandle } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCENARIOS } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE = path.resolve(__dirname, '.tmp-profile-pertab');
const OUT_SCREENS = path.resolve(__dirname, 'per-tab-screens');
const OUT_REPORT = path.resolve(__dirname, 'per-tab-output');
fs.mkdirSync(OUT_SCREENS, { recursive: true });
fs.mkdirSync(OUT_REPORT, { recursive: true });

const SCENARIO_NAME = process.argv.find((a) => a.startsWith('--scenario='))?.split('=')[1] || 'wf14-live-premium-green-en';
const SHOTS_PER_CLICK = process.argv.includes('--no-screenshots-per-click') ? false : true;

interface ClickInteraction {
  tabIdx: number;
  tabName: string;
  elemIdx: number;
  selector: string;
  text: string;
  beforeShot: string | null;
  afterShot: string | null;
  modalOpened: boolean;
  modalShot: string | null;
  domDelta: number;
  classChanged: boolean;
  newClasses: string;
  scrollChanged: boolean;
  tabsCreated: number;
  urlOpened: string | null;
  modalInteractions: number;
  error: string | null;
}

const TABS_LIST = ['Overview', 'Trends', 'Audience', 'Watchlists', 'Compare', 'Overlap', 'Bot-Raid', 'Settings'];

function safeName(s: string): string {
  return s.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
}

async function findScrollContainer(page: Page) {
  return await page.evaluate(() => {
    const sels = ['.sp-content', '.panel'];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight + 10) return sel;
    }
    return null;
  });
}

async function scrollContainerTo(page: Page, sel: string | null, y: number): Promise<void> {
  if (!sel) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' as any }), y);
  } else {
    await page.evaluate(([s, yy]) => {
      const el = document.querySelector(s as string) as HTMLElement | null;
      if (el) el.scrollTop = yy as number;
    }, [sel, y]);
  }
  await page.waitForTimeout(250);
}

async function closeModalIfOpen(page: Page): Promise<boolean> {
  const closed = await page.evaluate(() => {
    const close = document.querySelector('.sp-paywall-modal-close, .modal-close, [aria-label*="close" i], button.close') as HTMLElement;
    if (close) { close.click(); return true; }
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    if (overlay) { overlay.click(); return true; }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return false;
  });
  await page.waitForTimeout(300);
  return closed;
}

async function captureCurrentTabSetup(page: Page, scenarioName: string, tabIdx: number, tabName: string): Promise<{ topShot: string; midShot: string; botShot: string }> {
  const sel = await findScrollContainer(page);
  const dim = await page.evaluate((s) => {
    const el = s ? document.querySelector(s) : null;
    if (el) return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
    return { scrollHeight: document.documentElement.scrollHeight, clientHeight: document.documentElement.clientHeight };
  }, sel);
  const max = Math.max(0, dim.scrollHeight - dim.clientHeight);
  const positions = [{ label: 'top', y: 0 }, { label: 'mid', y: max / 2 }, { label: 'bot', y: max }];
  const shots: any = {};
  for (const p of positions) {
    await scrollContainerTo(page, sel, p.y);
    await page.waitForTimeout(300);
    const file = `${safeName(scenarioName)}__tab${tabIdx}_${safeName(tabName)}__${p.label}.png`;
    await page.screenshot({ path: path.join(OUT_SCREENS, file), fullPage: false });
    shots[`${p.label}Shot`] = file;
  }
  await scrollContainerTo(page, sel, 0);
  await page.waitForTimeout(150);
  return shots;
}

async function clickTabByIndex(page: Page, idx: number): Promise<{ found: boolean; tabName: string; modalOpened: boolean }> {
  await closeModalIfOpen(page);
  const result = await page.evaluate((i) => {
    const tabs = Array.from(document.querySelectorAll('.sp-tab')) as HTMLElement[];
    const t = tabs[i];
    if (!t) return { found: false, tabName: '', modalOpened: false };
    const tabName = (t.textContent || '').trim().slice(0, 30);
    try { t.scrollIntoView({ block: 'center', behavior: 'instant' as any }); } catch (e) {}
    t.click();
    return { found: true, tabName, modalOpened: false };
  }, idx);
  await page.waitForTimeout(3500);
  const modalOpened = await page.evaluate(() => document.querySelector('.sp-paywall-modal, .modal-overlay, [role="dialog"]') != null);
  return { found: result.found, tabName: result.tabName, modalOpened };
}

async function clickElementInTab(
  page: Page,
  tabIdx: number,
  tabName: string,
  elemIdx: number,
  scenarioName: string
): Promise<ClickInteraction | null> {
  const sel = await findScrollContainer(page);

  // 1. Re-enumerate elements
  const elemMeta: any = await page.evaluate((idx) => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab, .sp-streamer-btn, .sp-info-banner-close, .sp-period-pill'));
    const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !all.includes(e);
    });
    const merged = [...all, ...cursorPointer];
    const target = merged[idx] as HTMLElement | undefined;
    if (!target) return null;
    const r = target.getBoundingClientRect();
    return {
      tag: target.tagName.toLowerCase(),
      classes: (target.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'),
      text: (target.textContent || '').trim().slice(0, 40),
      x: r.x, y: r.y, w: r.width, h: r.height,
      classesFullBefore: target.getAttribute('class') || '',
    };
  }, elemIdx);
  if (!elemMeta) return null;
  // Skip non-interactive (text spans inside)
  if (!['button', 'a'].includes(elemMeta.tag) && !elemMeta.classes.split('.').some((c: string) => ['sp-signal-row', 'sp-rep-row', 'sp-tab', 'sp-watchlist-btn', 'sp-paywall-cta', 'sp-streamer-btn', 'sp-info-banner-close', 'sp-period-pill'].includes(c))) {
    return null;
  }

  const baseName = `${safeName(scenarioName)}__tab${tabIdx}_${safeName(tabName)}__elem${elemIdx}_${safeName(elemMeta.classes || elemMeta.tag)}_${safeName(elemMeta.text)}`;

  // Scroll into view inside container
  await page.evaluate(([s, idx]) => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab, .sp-streamer-btn, .sp-info-banner-close, .sp-period-pill'));
    const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !all.includes(e);
    });
    const merged = [...all, ...cursorPointer];
    const target = merged[idx as number] as HTMLElement | undefined;
    if (!target) return;
    const container = (s as string | null) ? document.querySelector(s as string) as HTMLElement : null;
    if (container) {
      const r = target.getBoundingClientRect();
      const cR = container.getBoundingClientRect();
      const offset = r.top - cR.top - container.clientHeight / 2 + r.height / 2;
      container.scrollTop = container.scrollTop + offset;
    } else {
      target.scrollIntoView({ block: 'center', behavior: 'instant' as any });
    }
  }, [sel, elemIdx]);
  await page.waitForTimeout(250);

  // 2. Screenshot BEFORE
  let beforeShot: string | null = null;
  if (SHOTS_PER_CLICK) {
    beforeShot = `${baseName}__before.png`;
    await page.screenshot({ path: path.join(OUT_SCREENS, beforeShot), fullPage: false });
  }

  // 3. Click
  const prevTabsCreated = await page.evaluate(() => (window as any).__tabsCreated || 0);
  const prevScrollPos = await page.evaluate((s) => {
    const el = (s as string | null) ? document.querySelector(s as string) as HTMLElement | null : null;
    return el ? el.scrollTop : window.scrollY;
  }, sel);
  const clickResult: any = await page.evaluate((idx) => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab, .sp-streamer-btn, .sp-info-banner-close, .sp-period-pill'));
    const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !all.includes(e);
    });
    const merged = [...all, ...cursorPointer];
    const target = merged[idx] as HTMLElement | undefined;
    if (!target) return { error: 'oob' };
    const beforeCount = document.body.querySelectorAll('*').length;
    const beforeClasses = target.getAttribute('class') || '';
    let err: string | null = null;
    try {
      if (typeof (target as any).click === 'function') (target as any).click();
      else target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (e) { err = String(e).slice(0, 80); }
    const afterCount = document.body.querySelectorAll('*').length;
    const afterClasses = target.getAttribute('class') || '';
    const modal = document.querySelector('.modal, [role="dialog"], .sp-paywall-modal, .modal-overlay');
    const lastUrl = (window as any).__lastUrl || null;
    return {
      domDelta: afterCount - beforeCount,
      classChanged: beforeClasses !== afterClasses,
      newClasses: afterClasses,
      modalOpened: modal != null,
      lastUrl,
      error: err,
    };
  }, elemIdx);
  await page.waitForTimeout(600);

  // 4. Screenshot AFTER
  let afterShot: string | null = null;
  if (SHOTS_PER_CLICK) {
    afterShot = `${baseName}__after.png`;
    await page.screenshot({ path: path.join(OUT_SCREENS, afterShot), fullPage: false });
  }

  const totalTabs = await page.evaluate(() => (window as any).__tabsCreated || 0);
  const tabsCreated = totalTabs - prevTabsCreated;

  // 5. Modal interaction
  let modalShot: string | null = null;
  let modalInteractions = 0;
  if (clickResult.modalOpened && SHOTS_PER_CLICK) {
    modalShot = `${baseName}__modal.png`;
    await page.screenshot({ path: path.join(OUT_SCREENS, modalShot), fullPage: false });
    // Click each interactive within modal
    const modalElements: any = await page.evaluate(() => {
      const modal = document.querySelector('.sp-paywall-modal, .modal-overlay, [role="dialog"]');
      if (!modal) return [];
      const buttons = Array.from(modal.querySelectorAll('button, a, [role="button"], .sp-paywall-cta'));
      return buttons.map((b: any, i: number) => ({
        idx: i,
        tag: b.tagName.toLowerCase(),
        classes: (b.getAttribute('class') || '').split(/\s+/).slice(0, 3).join('.'),
        text: (b.textContent || '').trim().slice(0, 40),
      }));
    });
    for (let mi = 0; mi < modalElements.length; mi++) {
      const me = modalElements[mi];
      // Click but don't close — capture each
      const beforeMTabs = await page.evaluate(() => (window as any).__tabsCreated || 0);
      await page.evaluate((idx) => {
        const modal = document.querySelector('.sp-paywall-modal, .modal-overlay, [role="dialog"]');
        if (!modal) return;
        const btns = Array.from(modal.querySelectorAll('button, a, [role="button"], .sp-paywall-cta'));
        const t = btns[idx] as HTMLElement | undefined;
        if (t) try { t.click(); } catch (e) {}
      }, mi);
      await page.waitForTimeout(300);
      const afterMTabs = await page.evaluate(() => (window as any).__tabsCreated || 0);
      modalInteractions++;
      // Save screenshot if it caused new state
      const file = `${baseName}__modal_btn${mi}_${safeName(me.text)}.png`;
      await page.screenshot({ path: path.join(OUT_SCREENS, file), fullPage: false });
      // Re-check if modal still there (close button may have closed it)
      const stillOpen = await page.evaluate(() => document.querySelector('.sp-paywall-modal, .modal-overlay, [role="dialog"]') != null);
      if (!stillOpen) break;
    }
    // Ensure modal closed
    await closeModalIfOpen(page);
  }

  // 6. Detect scroll change
  const newScroll = await page.evaluate((s) => {
    const el = (s as string | null) ? document.querySelector(s as string) as HTMLElement | null : null;
    return el ? el.scrollTop : window.scrollY;
  }, sel);

  return {
    tabIdx,
    tabName,
    elemIdx,
    selector: `${elemMeta.tag}.${elemMeta.classes}`,
    text: elemMeta.text,
    beforeShot,
    afterShot,
    modalOpened: clickResult.modalOpened || false,
    modalShot,
    domDelta: clickResult.domDelta || 0,
    classChanged: clickResult.classChanged || false,
    newClasses: clickResult.newClasses || '',
    scrollChanged: newScroll !== prevScrollPos,
    tabsCreated,
    urlOpened: clickResult.lastUrl || null,
    modalInteractions,
    error: clickResult.error || null,
  };
}

async function processTab(page: Page, scenarioName: string, tabIdx: number): Promise<{ tabName: string; modalOpened: boolean; tabSetup: any; interactions: ClickInteraction[]; clickableTotal: number }> {
  const tabClick = await clickTabByIndex(page, tabIdx);
  if (!tabClick.found) return { tabName: 'NOT_FOUND', modalOpened: false, tabSetup: {}, interactions: [], clickableTotal: 0 };

  console.log(`  Tab ${tabIdx}: "${tabClick.tabName}" ${tabClick.modalOpened ? '[locked → modal]' : ''}`);
  await closeModalIfOpen(page);

  // Initial scroll setup screenshots
  const tabSetup = await captureCurrentTabSetup(page, scenarioName, tabIdx, tabClick.tabName);

  // Enumerate interactive elements
  const elemList: any = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"], input, [data-tab], .sp-signal-row, .sp-rep-row, .sp-watchlist-btn, .sp-paywall-cta, [onclick], .sp-tab, .sp-streamer-btn, .sp-info-banner-close, .sp-period-pill'));
    const cursorPointer = Array.from(document.querySelectorAll('*')).filter((e) => {
      const cs = window.getComputedStyle(e);
      return cs.cursor === 'pointer' && !all.includes(e);
    });
    const merged = [...all, ...cursorPointer];
    return merged.map((e, i) => ({ idx: i, tag: e.tagName.toLowerCase(), classes: (e.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join('.') }));
  });

  // Filter to "primary clickable" — buttons/links/named-clickable-classes (skip raw spans/svgs)
  const primaryClasses = ['sp-signal-row', 'sp-rep-row', 'sp-tab', 'sp-watchlist-btn', 'sp-paywall-cta', 'sp-streamer-btn', 'sp-info-banner-close', 'sp-period-pill', 'sp-ti-expand', 'sp-rep-expandable', 'sp-signal-expandable', 'sp-header-back', 'sp-header-icon', 'sp-header-avatar', 'sp-footer-link', 'sp-sparkline-more', 'sp-audience-more', 'btn', 'btn-primary'];
  const primaryIndexes = elemList
    .filter((e: any) => e.tag === 'button' || e.tag === 'a' || e.classes.split('.').some((c: string) => primaryClasses.includes(c)))
    .map((e: any) => e.idx);

  console.log(`    ${elemList.length} total interactive, ${primaryIndexes.length} primary clickable`);

  const interactions: ClickInteraction[] = [];
  for (const idx of primaryIndexes) {
    const interaction = await clickElementInTab(page, tabIdx, tabClick.tabName, idx, scenarioName);
    if (interaction) {
      interactions.push(interaction);
      // Re-click tab to reset state (in case click navigated)
    }
  }

  return { tabName: tabClick.tabName, modalOpened: tabClick.modalOpened, tabSetup, interactions, clickableTotal: primaryIndexes.length };
}

(async () => {
  const s = SCENARIOS.find((x) => x.name === SCENARIO_NAME);
  if (!s) { console.error('Scenario not found:', SCENARIO_NAME); process.exit(1); }
  console.log(`=== Per-tab thorough test: ${s.name} ===`);

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
    await chrome.storage.local.set({ himrate_locale: locale, extension_install_id: 'vqa-pertab-uuid' });
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

  // Process all 8 tabs
  const tabResults: any[] = [];
  for (let ti = 0; ti < 8; ti++) {
    const result = await processTab(page, s.name, ti);
    tabResults.push({ tabIdx: ti, ...result });
  }

  // Render report
  let md = `# Per-tab thorough test — ${s.name}\n\n`;
  md += `**Scenario:** ${s.name}\n**Tabs processed:** ${tabResults.length}\n\n`;
  for (const tr of tabResults) {
    md += `## Tab ${tr.tabIdx}: "${tr.tabName}"${tr.modalOpened ? ' [locked → modal]' : ''}\n\n`;
    if (tr.tabSetup.topShot) {
      md += `**Setup screenshots (3 scroll positions):**\n`;
      md += `- Top: \`${tr.tabSetup.topShot}\`\n`;
      md += `- Mid: \`${tr.tabSetup.midShot}\`\n`;
      md += `- Bot: \`${tr.tabSetup.botShot}\`\n\n`;
    }
    md += `**Primary clickable elements:** ${tr.clickableTotal} | **Interactions captured:** ${tr.interactions.length}\n\n`;
    md += `| # | Selector | Text | DOM Δ | Class Δ | Modal | Tabs | URL | Modal interacts | Error | Before/After |\n`;
    md += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const i of tr.interactions) {
      md += `| ${i.elemIdx} | \`${i.selector.replace(/\|/g, '\\|')}\` | "${i.text.replace(/\|/g, '\\|')}" | ${i.domDelta} | ${i.classChanged ? 'YES' : '-'} | ${i.modalOpened ? 'Y' : '-'} | ${i.tabsCreated} | ${i.urlOpened || '-'} | ${i.modalInteractions} | ${i.error || '-'} | ${i.beforeShot ? '[B](' + i.beforeShot + ')' : ''} ${i.afterShot ? '[A](' + i.afterShot + ')' : ''} ${i.modalShot ? '[M](' + i.modalShot + ')' : ''} |\n`;
    }
    md += `\n`;
  }
  fs.writeFileSync(path.join(OUT_REPORT, `${s.name}-PER-TAB.md`), md);
  console.log(`\nReport: ${path.join(OUT_REPORT, `${s.name}-PER-TAB.md`)}`);

  // Summary stats
  const totalInteractions = tabResults.reduce((sum, t) => sum + t.interactions.length, 0);
  const totalNavigations = tabResults.reduce((sum, t) => sum + t.interactions.reduce((s2: any, i: any) => s2 + i.tabsCreated, 0), 0);
  const totalModals = tabResults.reduce((sum, t) => sum + t.interactions.filter((i: any) => i.modalOpened).length, 0);
  const totalClassChanged = tabResults.reduce((sum, t) => sum + t.interactions.filter((i: any) => i.classChanged).length, 0);
  console.log(`\nTotals: ${totalInteractions} interactions, ${totalNavigations} navigations, ${totalModals} modals, ${totalClassChanged} class changes`);

  await ctx.close();
  process.exit(0);
})();
