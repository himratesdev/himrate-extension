#!/usr/bin/env tsx
/**
 * Wireframe ↔ Frame SHA256 manifest — guards against silent divergence between
 * wireframe HTML (canonical SoT) and Frame*.tsx (literal port).
 *
 * Manifest tracks SHA256 of:
 *   - wireframes/full/side-panel-wireframe-TASK-039.html (master SoT)
 *   - wireframes/frames/NN_*.html (canonical per-frame extracts)
 *   - wireframes/slim/NN_*.html (secondary quick-reference)
 *   - src/sidepanel/components/Frame*.tsx (literal port outputs)
 *
 * Frame ↔ wireframe mapping by NN prefix:
 *   Frame11LiveFreeGreen.tsx ↔ frames/11_*.html ↔ slim/11_*.html
 *
 * Usage:
 *   npm run wireframe-manifest:update    — recompute + write manifest
 *   npm run wireframe-manifest:check     — verify manifest current; exit 1 on drift
 *
 * CI integration: .github/workflows/wireframe-manifest-check.yml runs check mode
 * on every PR. If a wireframe SHA changed без matching Frame*.tsx SHA change →
 * fail (unless PR labeled `wireframe-only`). Detects "wireframe edited without
 * propagating to React component" drift.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'e2e/visual-qa/wireframe-manifest.json');

const TRACKED_DIRS: Array<{ root: string; glob: RegExp; key: string }> = [
  { root: 'wireframes/full', glob: /\.html$/, key: 'wireframes_full' },
  { root: 'wireframes/frames', glob: /\.html$/, key: 'wireframes_frames' },
  { root: 'wireframes/slim', glob: /\.html$/, key: 'wireframes_slim' },
  { root: 'src/sidepanel/components', glob: /^Frame\d+.*\.tsx$/, key: 'frames_tsx' },
];

type Manifest = {
  generated_at: string;
  schema_version: number;
  wireframes_full: Record<string, string>;
  wireframes_frames: Record<string, string>;
  wireframes_slim: Record<string, string>;
  frames_tsx: Record<string, string>;
};

function sha256(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
}

function listFiles(rootRel: string, glob: RegExp): string[] {
  const root = path.join(PROJECT_ROOT, rootRel);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((f) => glob.test(f))
    .sort();
}

function buildManifest(): Manifest {
  const m: Manifest = {
    generated_at: new Date().toISOString(),
    schema_version: 1,
    wireframes_full: {},
    wireframes_frames: {},
    wireframes_slim: {},
    frames_tsx: {},
  };
  for (const { root, glob, key } of TRACKED_DIRS) {
    const bucket = m[key as keyof Manifest] as Record<string, string>;
    for (const f of listFiles(root, glob)) {
      const rel = path.join(root, f);
      bucket[rel] = sha256(path.join(PROJECT_ROOT, rel));
    }
  }
  return m;
}

function loadManifest(): Manifest | null {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Manifest;
}

function stripVolatile(m: Manifest): Omit<Manifest, 'generated_at'> {
  const { generated_at: _, ...rest } = m;
  void _;
  return rest;
}

function frameNumberFromFilename(filename: string): string | null {
  const base = path.basename(filename);
  if (base.startsWith('Frame')) {
    const m = base.match(/^Frame(\d+)/);
    return m ? m[1].padStart(2, '0') : null;
  }
  const m = base.match(/^(\d+)_/);
  return m ? m[1].padStart(2, '0') : null;
}

function tsxFrameNumbersFor(manifest: Manifest): Set<string> {
  const nums = new Set<string>();
  for (const tsxPath of Object.keys(manifest.frames_tsx)) {
    const num = frameNumberFromFilename(path.basename(tsxPath));
    if (num) nums.add(num);
  }
  return nums;
}

function diffManifests(prior: Manifest, current: Manifest): {
  changedWireframes: string[];
  changedFrameTsx: string[];
  added: string[];
  removed: string[];
} {
  const all = (m: Manifest): Record<string, string> => ({
    ...m.wireframes_full,
    ...m.wireframes_frames,
    ...m.wireframes_slim,
    ...m.frames_tsx,
  });
  const priorFlat = all(prior);
  const currentFlat = all(current);

  const changedWireframes: string[] = [];
  const changedFrameTsx: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  for (const [k, v] of Object.entries(currentFlat)) {
    if (!(k in priorFlat)) {
      added.push(k);
    } else if (priorFlat[k] !== v) {
      if (k.startsWith('wireframes/')) changedWireframes.push(k);
      else if (k.startsWith('src/sidepanel/components/')) changedFrameTsx.push(k);
    }
  }
  for (const k of Object.keys(priorFlat)) {
    if (!(k in currentFlat)) removed.push(k);
  }
  return { changedWireframes, changedFrameTsx, added, removed };
}

function verifyDriftMapping(
  diff: ReturnType<typeof diffManifests>,
  current: Manifest,
): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const isPerFrameWireframe = (p: string): boolean =>
    p.startsWith('wireframes/') && !p.includes('/full/');

  // 1. Changed wireframes: matching Frame*.tsx must also be changed
  const changedFrameNumbers = new Set<string>();
  for (const wfPath of diff.changedWireframes) {
    if (!isPerFrameWireframe(wfPath)) continue; // master full → manual review
    const num = frameNumberFromFilename(path.basename(wfPath));
    if (num) changedFrameNumbers.add(num);
  }

  const changedFrameTsxNumbers = new Set<string>();
  for (const tsxPath of diff.changedFrameTsx) {
    const num = frameNumberFromFilename(path.basename(tsxPath));
    if (num) changedFrameTsxNumbers.add(num);
  }

  for (const num of changedFrameNumbers) {
    if (!changedFrameTsxNumbers.has(num)) {
      errors.push(
        `Wireframe ${num} CHANGED but matching Frame${num}*.tsx not updated. ` +
          `Per literal-port discipline: wireframe edits propagate to React component within same PR. ` +
          `Override: label PR \`wireframe-only\` (defer Frame port to follow-up PR within 7 days per ADR-OQ-5).`,
      );
    }
  }

  // 2. Added wireframes: matching Frame*.tsx must exist (added or pre-existing)
  const addedWireframeNumbers = new Set<string>();
  for (const wfPath of diff.added.filter(isPerFrameWireframe)) {
    const num = frameNumberFromFilename(path.basename(wfPath));
    if (num) addedWireframeNumbers.add(num);
  }
  const tsxNumbersInCurrent = tsxFrameNumbersFor(current);
  for (const num of addedWireframeNumbers) {
    if (!tsxNumbersInCurrent.has(num)) {
      errors.push(
        `Wireframe ${num} ADDED but no Frame${num}*.tsx exists в src/sidepanel/components/. ` +
          `Per literal-port discipline: new wireframe = new Frame*.tsx в same PR. ` +
          `Override: label PR \`wireframe-only\` (port в follow-up PR within 7 days per ADR-OQ-5).`,
      );
    }
  }

  // 3. Removed wireframes: matching Frame*.tsx must also be removed (no orphans)
  const removedWireframeNumbers = new Set<string>();
  for (const wfPath of diff.removed.filter(isPerFrameWireframe)) {
    const num = frameNumberFromFilename(path.basename(wfPath));
    if (num) removedWireframeNumbers.add(num);
  }
  for (const num of removedWireframeNumbers) {
    if (tsxNumbersInCurrent.has(num)) {
      errors.push(
        `Wireframe ${num} REMOVED but Frame${num}*.tsx still exists (orphan component). ` +
          `Either remove src/sidepanel/components/Frame${num}*.tsx or restore wireframe.`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

function cmdUpdate(): void {
  const m = buildManifest();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n', 'utf-8');
  const totals = {
    full: Object.keys(m.wireframes_full).length,
    frames: Object.keys(m.wireframes_frames).length,
    slim: Object.keys(m.wireframes_slim).length,
    tsx: Object.keys(m.frames_tsx).length,
  };
  console.log(
    `Wireframe manifest updated: ${path.relative(PROJECT_ROOT, MANIFEST_PATH)}`,
  );
  console.log(
    `  full: ${totals.full}, frames: ${totals.frames}, slim: ${totals.slim}, tsx: ${totals.tsx}`,
  );
}

function cmdCheck(): void {
  const prior = loadManifest();
  const current = buildManifest();

  if (!prior) {
    console.error('ERROR: manifest does not exist. Run npm run wireframe-manifest:update.');
    process.exit(1);
  }

  // Compare (excluding volatile generated_at field)
  const priorBlob = JSON.stringify(stripVolatile(prior), null, 2);
  const currentBlob = JSON.stringify(stripVolatile(current), null, 2);

  if (priorBlob === currentBlob) {
    console.log('Wireframe manifest is current. No drift.');
    return;
  }

  const diff = diffManifests(prior, current);
  console.error('Wireframe manifest stale. Differences detected:');
  if (diff.added.length > 0) console.error(`  Added (${diff.added.length}):`, diff.added);
  if (diff.removed.length > 0) console.error(`  Removed (${diff.removed.length}):`, diff.removed);
  if (diff.changedWireframes.length > 0)
    console.error(
      `  Changed wireframes (${diff.changedWireframes.length}):`,
      diff.changedWireframes,
    );
  if (diff.changedFrameTsx.length > 0)
    console.error(
      `  Changed Frame*.tsx (${diff.changedFrameTsx.length}):`,
      diff.changedFrameTsx,
    );

  const driftCheck = verifyDriftMapping(diff, current);
  if (!driftCheck.ok) {
    console.error('\nDrift mapping violations:');
    for (const e of driftCheck.errors) console.error(`  - ${e}`);
  }

  console.error(
    '\nIf wireframe или Frame*.tsx changes are intentional: run `npm run wireframe-manifest:update` and commit.',
  );
  process.exit(1);
}

const cmd = process.argv[2] ?? 'update';
if (cmd === 'update') cmdUpdate();
else if (cmd === 'check') cmdCheck();
else {
  console.error(`Unknown command: ${cmd}. Use 'update' or 'check'.`);
  process.exit(2);
}
