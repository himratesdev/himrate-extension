// TASK-039 Phase D1 CR N-1: dedup locale resolution pattern
// (i18n.language.startsWith('ru') ? 'ru' : 'en') across Trends modules.

import { useTranslation } from 'react-i18next';

export type Locale = 'ru' | 'en';

export function useCurrentLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language.startsWith('ru') ? 'ru' : 'en';
}
