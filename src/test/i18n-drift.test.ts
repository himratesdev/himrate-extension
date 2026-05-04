import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const WIREFRAMES_DIRS = [
  path.join(PROJECT_ROOT, 'wireframes/frames'),
  path.join(PROJECT_ROOT, 'wireframes/slim'),
];
const KNOWN_DRIFT_PATH = path.join(PROJECT_ROOT, 'src/test/i18n-drift-known.json');

type FlatLocale = Record<string, string>;
type DriftEntry = { key: string; value: string; reason: string };

function flattenKeys(obj: unknown, prefix = ''): FlatLocale {
  const out: FlatLocale = {};
  if (obj === null || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      out[fullKey] = v;
    } else if (typeof v === 'object' && v !== null) {
      Object.assign(out, flattenKeys(v, fullKey));
    }
  }
  return out;
}

function loadAllWireframeText(): Set<string> {
  const texts = new Set<string>();
  for (const dir of WIREFRAMES_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
    for (const f of files) {
      const html = fs.readFileSync(path.join(dir, f), 'utf-8');
      const $ = cheerio.load(html);
      $('*').each((_idx, el) => {
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

const ruFlat = flattenKeys(ru);
const enFlat = flattenKeys(en);
const wireframeTexts = loadAllWireframeText();

let knownDrift: DriftEntry[] = [];
if (fs.existsSync(KNOWN_DRIFT_PATH)) {
  knownDrift = JSON.parse(fs.readFileSync(KNOWN_DRIFT_PATH, 'utf-8')) as DriftEntry[];
}
const knownDriftKeys = new Set(knownDrift.map((d) => d.key));

describe('i18n drift guard', () => {
  describe('Phase 1: ru/en sync invariant', () => {
    it('ru and en have identical key set', () => {
      const ruKeys = new Set(Object.keys(ruFlat));
      const enKeys = new Set(Object.keys(enFlat));
      const onlyInRu = [...ruKeys].filter((k) => !enKeys.has(k)).sort();
      const onlyInEn = [...enKeys].filter((k) => !ruKeys.has(k)).sort();
      expect({ onlyInRu, onlyInEn }).toEqual({ onlyInRu: [], onlyInEn: [] });
    });

    it('all RU values are non-empty strings', () => {
      const empty = Object.entries(ruFlat).filter(([, v]) => !v || v.trim() === '');
      expect(empty).toEqual([]);
    });

    it('all EN values are non-empty strings', () => {
      const empty = Object.entries(enFlat).filter(([, v]) => !v || v.trim() === '');
      expect(empty).toEqual([]);
    });
  });

  describe('Phase 2: RU values are wireframe-verbatim (drift detection)', () => {
    it('wireframes mirror is populated', () => {
      expect(wireframeTexts.size).toBeGreaterThan(100);
    });

    it('all Cyrillic RU values appear verbatim in wireframes (excluding known drift)', () => {
      const violations: Array<{ key: string; value: string }> = [];
      for (const [key, value] of Object.entries(ruFlat)) {
        if (knownDriftKeys.has(key)) continue;
        if (!/[А-Яа-яЁё]/.test(value)) continue;
        const stripped = value.replace(/\{\{[^}]+\}\}/g, '').trim();
        if (!stripped) continue;
        const found = [...wireframeTexts].some(
          (wf) => wf.includes(stripped) || stripped.includes(wf),
        );
        if (!found) {
          violations.push({ key, value });
        }
      }
      expect(
        violations,
        `${violations.length} RU i18n keys drifted from wireframe text. Either fix the value to match wireframe verbatim, or add an entry to src/test/i18n-drift-known.json with reason. After Batch 8 of TASK-089, known-drift should be empty.`,
      ).toEqual([]);
    });
  });
});
