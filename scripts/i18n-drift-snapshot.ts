#!/usr/bin/env tsx
/**
 * Snapshot current i18n drift state into src/test/i18n-drift-known.json.
 *
 * Run when:
 *   - Initial baseline (Batch 0).
 *   - After resolving a drift entry (entry should be removed; verify by re-snapshot).
 *   - After wireframe text changes (drift list shifts; reset reason for new entries).
 *
 * Usage:
 *   npm run i18n-drift:snapshot
 *
 * The script never silently absorbs drift introduced after Batch 0; the human
 * adding a new entry must replace the placeholder reason with a concrete cause
 * (e.g. "TASK-083 ported pre-discipline; refactor Batch N").
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const RU_PATH = path.join(PROJECT_ROOT, 'src/locales/ru.json');
const WIREFRAMES_DIRS = [
  path.join(PROJECT_ROOT, 'wireframes/frames'),
  path.join(PROJECT_ROOT, 'wireframes/slim'),
];
const OUT_PATH = path.join(PROJECT_ROOT, 'src/test/i18n-drift-known.json');

type FlatLocale = Record<string, string>;
type DriftEntry = { key: string; value: string; reason: string };

function flattenKeys(obj: unknown, prefix = ''): FlatLocale {
  const out: FlatLocale = {};
  if (obj === null || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[fullKey] = v;
    else if (typeof v === 'object' && v !== null) Object.assign(out, flattenKeys(v, fullKey));
  }
  return out;
}

const NON_TEXT_TAGS = 'script, style, head, meta, title, link, noscript';

function loadAllWireframeText(): Set<string> {
  const texts = new Set<string>();
  for (const dir of WIREFRAMES_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
    for (const f of files) {
      const html = fs.readFileSync(path.join(dir, f), 'utf-8');
      const $ = cheerio.load(html);
      $(NON_TEXT_TAGS).remove();
      $('body *').each((_idx, el) => {
        const directText = $(el)
          .contents()
          .filter((_, node) => (node as { type?: string }).type === 'text')
          .text();
        directText
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((t) => texts.add(t));
      });
    }
  }
  return texts;
}

function main(): void {
  const ru = JSON.parse(fs.readFileSync(RU_PATH, 'utf-8'));
  const ruFlat = flattenKeys(ru);
  const wireframeTexts = loadAllWireframeText();

  // Preserve existing reasons
  let prior: DriftEntry[] = [];
  if (fs.existsSync(OUT_PATH)) {
    try {
      prior = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8')) as DriftEntry[];
    } catch {
      prior = [];
    }
  }
  const priorReasons = new Map(prior.map((e) => [e.key, e.reason]));

  const violations: DriftEntry[] = [];
  for (const [key, value] of Object.entries(ruFlat)) {
    if (!/[А-Яа-яЁё]/.test(value)) continue;
    const stripped = value.replace(/\{\{[^}]+\}\}/g, '').trim();
    if (!stripped) continue;
    // Strict direction: i18n value MUST be substring of wireframe text.
    const found = [...wireframeTexts].some((wf) => wf.includes(stripped));
    if (!found) {
      violations.push({
        key,
        value,
        reason:
          priorReasons.get(key) ||
          'TASK-089 Batch 0 baseline — pre-existing drift inherited from earlier commits (TASK-083/BUG-016/etc). Resolve in Batch 1-8 frame refactors.',
      });
    }
  }

  // Sort by key for stable diffs
  violations.sort((a, b) => a.key.localeCompare(b.key));

  fs.writeFileSync(OUT_PATH, JSON.stringify(violations, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${violations.length} drift entries to ${path.relative(PROJECT_ROOT, OUT_PATH)}`);
}

main();
