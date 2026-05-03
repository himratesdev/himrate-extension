// Render each wireframe HTML file at 420x900 viewport → save screenshot
// → enables pixel-by-pixel side-by-side comparison with extension screenshots
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIREFRAME_DIR = path.resolve(__dirname, '../../../verivio clode/_tasks/TASK-039/wireframe-screens');
const OUT = path.resolve(__dirname, 'screens-wireframe');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await ctx.newPage();

  const files = fs.readdirSync(WIREFRAME_DIR).filter((f) => f.endsWith('.html')).sort();
  console.log(`Rendering ${files.length} wireframe files...`);

  for (const f of files) {
    const url = `file://${path.join(WIREFRAME_DIR, f)}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);
      const out = path.join(OUT, f.replace('.html', '.png'));
      // Find .panel element and screenshot just it (with padding)
      const panel = await page.$('.panel');
      if (panel) {
        await panel.screenshot({ path: out });
      } else {
        await page.screenshot({ path: out, fullPage: true });
      }
      console.log(`✓ ${f} → ${path.basename(out)}`);
    } catch (e) {
      console.warn(`✗ ${f}: ${(e as Error).message}`);
    }
  }

  await browser.close();
  console.log('Done.');
})();
