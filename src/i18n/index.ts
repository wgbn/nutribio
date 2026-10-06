// i18n runtime: i18next instance + lazy per-locale catalogs.
// en-GB is statically imported (guaranteed fallback bundle); the other six
// locales are lazy-loaded chunks so they stay out of the main bundle
// (same principle as DECISIONS #12 for the Gemini SDK).
//
// i18next v26 note: resource bundles are registered via init({resources})
// (the addResourceBundle/hasResourceBundle instance API is gone). Switching
// to a locale lazily loaded later is done by re-running init with the full
// set of already-loaded catalogs — verified working with v26.

import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';

import enGB from './catalogs/en-GB';
import {
  DEFAULT_LOCALE,
  resolveLocale,
  setActiveLocale,
  type Locale,
  type LocaleSetting,
} from './locales';

const LAZY_CATALOGS: Record<Exclude<Locale, 'en-GB'>, () => Promise<{default: object}>> = {
  'pt-PT': () => import('./catalogs/pt-PT'),
  'pt-BR': () => import('./catalogs/pt-BR'),
  es: () => import('./catalogs/es'),
  fr: () => import('./catalogs/fr'),
  de: () => import('./catalogs/de'),
  it: () => import('./catalogs/it'),
};

/** Catalogs loaded so far (en-GB always present as the fallback). */
const loadedCatalogs: Partial<Record<Locale, object>> = {[DEFAULT_LOCALE]: enGB};

let initialized = false;

/** Locale actually in use for a persisted setting ('auto' resolves the device). */
export function localeForSetting(setting: LocaleSetting): Locale {
  return setting === 'auto' ? resolveLocale(navigator.languages ?? [navigator.language]) : setting;
}

async function ensureCatalog(locale: Locale): Promise<void> {
  if (loadedCatalogs[locale]) return;
  const loader = LAZY_CATALOGS[locale as Exclude<Locale, 'en-GB'>];
  const mod = await loader();
  loadedCatalogs[locale] = mod.default;
}

function resources(): Record<string, {translation: object}> {
  const out: Record<string, {translation: object}> = {};
  for (const [locale, catalog] of Object.entries(loadedCatalogs)) {
    out[locale] = {translation: catalog};
  }
  return out;
}

function applyLocale(locale: Locale): void {
  setActiveLocale(locale);
  document.documentElement.lang = locale;
}

async function initInternal(locale: Locale): Promise<void> {
  await ensureCatalog(locale);
  await i18next.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources: resources(),
    interpolation: {escapeValue: false}, // React already escapes.
    react: {useSuspense: false},
  });
  applyLocale(locale);
}

/** Initialize i18n (called once from main.tsx before rendering). */
export async function initI18n(setting: LocaleSetting): Promise<void> {
  if (initialized) return;
  await initInternal(localeForSetting(setting));
  initialized = true;
}

/** Switch language (Settings selector / Welcome selector). */
export async function changeLocale(setting: LocaleSetting): Promise<Locale> {
  const locale = localeForSetting(setting);
  if (locale !== i18next.language) {
    await ensureCatalog(locale);
    // Re-init so the newly loaded catalog is part of the registered
    // resources (i18next v26 has no post-init resource registration).
    await initInternal(locale);
  } else {
    applyLocale(locale);
  }
  return locale;
}
