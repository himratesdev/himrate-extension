// Diff wireframe-elements/NN.json vs extension-elements/wfNN-*.json
// Output: diff-reports/NN.md with structured per-frame divergences

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIREFRAME = path.resolve(__dirname, 'wireframe-elements');
const EXTENSION = path.resolve(__dirname, 'extension-elements');
const OUT = path.resolve(__dirname, 'diff-reports');
fs.mkdirSync(OUT, { recursive: true });

interface Node {
  tag: string;
  classes: string[];
  title?: string;
  text?: string;
  styles: string | Record<string, string>;
  isClickable: boolean;
  children: Node[];
}

function parseStyles(s: string | Record<string, string>): Record<string, string> {
  if (typeof s !== 'string') return s;
  const out: Record<string, string> = {};
  for (const decl of s.split(';')) {
    const [prop, ...rest] = decl.split(':');
    if (prop && rest.length > 0) out[prop.trim()] = rest.join(':').trim();
  }
  return out;
}

// Collect a flat set of "signature" strings per node tree
function collectSignatures(node: Node, sigs: Set<string> = new Set(), texts: Set<string> = new Set(), titles: Set<string> = new Set(), classes: Set<string> = new Set()): { sigs: Set<string>; texts: Set<string>; titles: Set<string>; classes: Set<string> } {
  const cls = node.classes.length > 0 ? '.' + node.classes.sort().join('.') : '';
  const sig = `${node.tag}${cls}`;
  sigs.add(sig);
  for (const c of node.classes) classes.add(c);
  if (node.text) texts.add(node.text);
  if (node.title) titles.add(node.title);
  for (const child of node.children) collectSignatures(child, sigs, texts, titles, classes);
  return { sigs, texts, titles, classes };
}

function diffSets(label: string, wf: Set<string>, ext: Set<string>): string {
  const wfArr = Array.from(wf).sort();
  const extArr = Array.from(ext).sort();
  const inWfOnly = wfArr.filter((x) => !ext.has(x));
  const inExtOnly = extArr.filter((x) => !wf.has(x));
  let out = `### ${label}\n`;
  out += `**In wireframe only (missing in extension):** ${inWfOnly.length}\n`;
  for (const x of inWfOnly) out += `  - ${x}\n`;
  out += `\n**In extension only (extra not in wireframe):** ${inExtOnly.length}\n`;
  for (const x of inExtOnly) out += `  - ${x}\n`;
  out += '\n';
  return out;
}

// Auto-build pairs by matching wireframe slim filenames vs extension scenario names.
// Wireframe filenames: NN_slug.json | Extension scenario names: wfNN-* (or wfNN-*-en|ru)
function autoBuildPairs(): Array<[string, string]> {
  const wfFiles = fs.readdirSync(WIREFRAME).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  const extFiles = fs.readdirSync(EXTENSION).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  const pairs: Array<[string, string]> = [];

  // Map by frame number
  // wireframe slim: 01-27 = legacy frame numbers (per Index)
  // wireframe slim: 28-47 = Trends Screens 1-18 + 16b
  // wireframe slim: 48-59 = Audience/Watchlists/Compare/Overlap/BotRaid/Settings
  // Extension scenarios: wfNN where NN matches wireframe number (en variant priority)
  const wfByNum: Record<string, string> = {};
  for (const f of wfFiles) {
    const m = f.match(/^(\d{2})_/);
    if (m) wfByNum[m[1]] = f;
  }
  for (const ext of extFiles) {
    const m = ext.match(/^wf(\d{2})/);
    if (!m) continue;
    const num = m[1];
    const wf = wfByNum[num];
    if (wf) {
      // Prefer EN variant if exists
      pairs.push([wf, ext]);
    }
  }
  return pairs;
}

const FRAME_PAIRS = autoBuildPairs();
console.log(`Auto-paired ${FRAME_PAIRS.length} frames`);

let masterReport = `# Wireframe vs Extension Diff Report\n\n`;
masterReport += `**Generated:** ${new Date().toISOString()}\n\n`;

for (const [wfName, extName] of FRAME_PAIRS) {
  const wfPath = path.join(WIREFRAME, `${wfName}.json`);
  const extPath = path.join(EXTENSION, `${extName}.json`);
  if (!fs.existsSync(wfPath) || !fs.existsSync(extPath)) {
    console.warn(`Missing pair: ${wfName} / ${extName}`);
    continue;
  }
  const wfData = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  const extData = JSON.parse(fs.readFileSync(extPath, 'utf8'));
  const wfSig = collectSignatures(wfData.tree);
  const extSig = collectSignatures(extData.tree);

  let report = `# Diff: ${wfName} vs ${extName}\n\n`;
  report += diffSets('Element signatures (tag.classes)', wfSig.sigs, extSig.sigs);
  report += diffSets('Text content', wfSig.texts, extSig.texts);
  report += diffSets('Tooltips (title=)', wfSig.titles, extSig.titles);
  report += diffSets('CSS classes', wfSig.classes, extSig.classes);

  fs.writeFileSync(path.join(OUT, `${wfName}.md`), report);
  console.log(`✓ Diff saved: diff-reports/${wfName}.md`);

  // Add to master summary
  const txtMissing = Array.from(wfSig.texts).filter((x) => !extSig.texts.has(x));
  const txtExtra = Array.from(extSig.texts).filter((x) => !wfSig.texts.has(x));
  const titleMissing = Array.from(wfSig.titles).filter((x) => !extSig.titles.has(x));
  masterReport += `## ${wfName}\n`;
  masterReport += `- Text missing: ${txtMissing.length}\n`;
  masterReport += `- Text extra: ${txtExtra.length}\n`;
  masterReport += `- Tooltips missing: ${titleMissing.length}\n`;
  masterReport += `- Element sigs missing: ${Array.from(wfSig.sigs).filter((x) => !extSig.sigs.has(x)).length}\n`;
  masterReport += `- Element sigs extra: ${Array.from(extSig.sigs).filter((x) => !wfSig.sigs.has(x)).length}\n`;
  if (titleMissing.length > 0) masterReport += `\n  Missing tooltips:\n${titleMissing.map((t) => `    - ${t}`).join('\n')}\n`;
  masterReport += `\n`;
}

fs.writeFileSync(path.join(OUT, '_SUMMARY.md'), masterReport);
console.log(`\nMaster summary: diff-reports/_SUMMARY.md`);
