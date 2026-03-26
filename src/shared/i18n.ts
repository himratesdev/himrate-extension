import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const STORAGE_KEY = 'himrate_locale';

async function getStoredLocale(): Promise<string> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) return result[STORAGE_KEY] as string;
  } catch {
    // chrome.storage not available (dev mode)
  }

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ru') ? 'ru' : 'en';
}

export async function initI18n(): Promise<typeof i18n> {
  const lng = await getStoredLocale();

  await i18n.use(initReactI18next).init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  document.documentElement.lang = lng;

  return i18n;
}

export async function changeLanguage(locale: string): Promise<void> {
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: locale });
  } catch {
    // chrome.storage not available (dev mode)
  }
}

export default i18n;
