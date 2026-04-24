// TASK-039 CR S-6: Single source of truth для Trends theme colors.
// uPlot API принимает CSS color strings, dark-mode требует runtime resolution через
// CSS custom properties. Этот модуль reads --trends-* vars с hex fallback (для
// testing / older browsers / SSR contexts).
//
// Values declared в src/shared/neo-brutiful.css (:root scope). Dark mode ready —
// runtime CSS custom property resolution означает автоматическое переключение при
// @media (prefers-color-scheme: dark) override без code change.

const DEFAULTS = {
  erv: '#16a34a',
  ti: '#2563eb',
  anomaly: '#dc2626',
  axisStroke: '#6b7280',
  forecast: '#94a3b8',
  gridLine: '#e5e7eb',
} as const;

type TrendColor = keyof typeof DEFAULTS;

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--trends-${name}-color`)
    .trim();
  return value || fallback;
}

export function trendsColor(name: TrendColor): string {
  return readCssVar(name, DEFAULTS[name]);
}

/** Cached snapshot on first call per mount — avoids getComputedStyle per-render. */
export function trendsPalette() {
  return {
    erv: trendsColor('erv'),
    ti: trendsColor('ti'),
    anomaly: trendsColor('anomaly'),
    axisStroke: trendsColor('axisStroke'),
    forecast: trendsColor('forecast'),
    gridLine: trendsColor('gridLine'),
  };
}
