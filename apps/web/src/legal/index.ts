// Lazy loader for the legal texts (roadmap item 5, phase 5.2).
//
// Same principle as the i18n catalogs (DECISIONS #12/#31): every locale is a
// dynamic import, so no legal text enters the main bundle — the reader only
// pays for the language it displays. A failed chunk falls back to the source
// locale (en-GB).

import {DEFAULT_LOCALE, type Locale} from '@nutribio/core';

import type {LegalCatalog} from './types';

const LOADERS: Record<Locale, () => Promise<{default: LegalCatalog}>> = {
  'en-GB': () => import('./en-GB'),
  'pt-PT': () => import('./pt-PT'),
  'pt-BR': () => import('./pt-BR'),
  es: () => import('./es'),
  fr: () => import('./fr'),
  de: () => import('./de'),
  it: () => import('./it'),
};

const cache = new Map<Locale, LegalCatalog>();

/** Load (and cache) the legal catalog for a locale, falling back to en-GB. */
export async function loadLegalCatalog(locale: Locale): Promise<LegalCatalog> {
  const cached = cache.get(locale);
  if (cached) return cached;
  try {
    const mod = await LOADERS[locale]();
    cache.set(locale, mod.default);
    return mod.default;
  } catch (err) {
    if (locale === DEFAULT_LOCALE) throw err;
    const mod = await LOADERS[DEFAULT_LOCALE]();
    cache.set(DEFAULT_LOCALE, mod.default);
    return mod.default;
  }
}
