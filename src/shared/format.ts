// Locale-aware number formatting. Uses i18next language (ru → "5 000", en → "5,000").
// CR #C7: prevents EN locale rendering RU-style space-separated numbers (which
// is what default toLocaleString() does in some browser locales).

export function formatNumber(value: number, lang: string): string {
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  return value.toLocaleString(locale);
}
