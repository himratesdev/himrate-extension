// Extract structured manifest from each wireframe slim HTML file
// Output: wireframe-elements/NN.json with all elements (tags, classes, text, tooltips, styles)

import { JSDOM } from 'jsdom';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLIM_DIR = path.resolve(__dirname, '../../../verivio clode/_tasks/TASK-039/wireframe-screens/slim');
const OUT = path.resolve(__dirname, 'wireframe-elements');
fs.mkdirSync(OUT, { recursive: true });

interface ElementNode {
  tag: string;
  classes: string[];
  id?: string;
  title?: string;
  text?: string;
  styles: Record<string, string>;
  isClickable: boolean;
  children: ElementNode[];
}

function parseStyle(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!style) return out;
  for (const decl of style.split(';')) {
    const [prop, ...rest] = decl.split(':');
    if (!prop || rest.length === 0) continue;
    out[prop.trim()] = rest.join(':').trim();
  }
  return out;
}

function walkElement(el: Element): ElementNode {
  const styles = parseStyle(el.getAttribute('style') || '');
  const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  const tag = el.tagName.toLowerCase();
  const title = el.getAttribute('title') || undefined;
  const id = el.getAttribute('id') || undefined;

  // Direct text (immediate text nodes only)
  const directText: string[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      const t = (node.textContent || '').trim();
      if (t) directText.push(t);
    }
  }

  const isClickable = tag === 'button' || tag === 'a' || styles.cursor === 'pointer' || el.hasAttribute('onclick');

  const children: ElementNode[] = [];
  for (const child of Array.from(el.children)) {
    children.push(walkElement(child));
  }

  return {
    tag,
    classes,
    ...(id && { id }),
    ...(title && { title }),
    ...(directText.length > 0 && { text: directText.join(' ') }),
    styles,
    isClickable,
    children,
  };
}

function summarizeNode(n: ElementNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  const cls = n.classes.length > 0 ? '.' + n.classes.join('.') : '';
  const ttl = n.title ? ` [title="${n.title}"]` : '';
  const txt = n.text ? ` "${n.text.slice(0, 80)}"` : '';
  const click = n.isClickable ? ' 🖱' : '';
  const styleHints: string[] = [];
  if (n.styles['border-left']) styleHints.push(`border-left:${n.styles['border-left']}`);
  if (n.styles['background']) styleHints.push(`bg:${n.styles['background'].slice(0, 30)}`);
  if (n.styles['color']) styleHints.push(`color:${n.styles['color']}`);
  if (n.styles['font-family']) styleHints.push(`font:${n.styles['font-family'].split(',')[0].replace(/['"]/g, '')}`);
  const sty = styleHints.length > 0 ? ` {${styleHints.join('; ')}}` : '';
  let out = `${indent}<${n.tag}${cls}>${ttl}${txt}${click}${sty}\n`;
  for (const c of n.children) out += summarizeNode(c, depth + 1);
  return out;
}

function countByTag(n: ElementNode, counts: Record<string, number> = {}): Record<string, number> {
  counts[n.tag] = (counts[n.tag] || 0) + 1;
  for (const c of n.children) countByTag(c, counts);
  return counts;
}

function extractTooltips(n: ElementNode, out: string[] = []): string[] {
  if (n.title) out.push(n.title);
  for (const c of n.children) extractTooltips(c, out);
  return out;
}

function extractAllText(n: ElementNode, out: string[] = []): string[] {
  if (n.text) out.push(n.text);
  for (const c of n.children) extractAllText(c, out);
  return out;
}

const files = fs.readdirSync(SLIM_DIR).filter((f) => f.endsWith('.html')).sort();
console.log(`Extracting ${files.length} wireframe files...`);

for (const f of files) {
  const html = fs.readFileSync(path.join(SLIM_DIR, f), 'utf8');
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  const root = dom.window.document.body.firstElementChild;
  if (!root) continue;
  const tree = walkElement(root);
  const tooltips = extractTooltips(tree);
  const allText = extractAllText(tree);
  const tagCounts = countByTag(tree);
  const summary = summarizeNode(tree);

  const out = {
    file: f,
    tagCounts,
    tooltips,
    allText,
    summary,
    tree,
  };
  const outFile = path.join(OUT, f.replace('.html', '.json'));
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  // Also save human-readable summary
  fs.writeFileSync(outFile.replace('.json', '.txt'), `# ${f}\n\nTooltips:\n${tooltips.map((t) => `  - ${t}`).join('\n')}\n\nAll text:\n${allText.map((t) => `  - ${t}`).join('\n')}\n\nTag counts:\n${Object.entries(tagCounts).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\nDOM summary:\n${summary}`);
}
console.log('Done.');
