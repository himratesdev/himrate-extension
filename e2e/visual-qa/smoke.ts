// Smoke test — load extension, open sidepanel, screenshot.
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXT = path.resolve(__dirname, '../../dist');
const PROFILE = path.resolve(__dirname, '.tmp-profile');
const OUT = path.resolve(__dirname, 'screens');
fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
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
  console.log('Extension ID:', extId);

  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, '00-smoke.png'), fullPage: true });
  console.log('Saved 00-smoke.png');

  await ctx.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
