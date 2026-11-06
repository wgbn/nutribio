// Web-side locale state: the mutable "active locale" used by the UI helpers.
// The pure locale definitions and the device-language resolution live in
// @nutribio/core (shared with the API) and are re-exported here so the app
// keeps a single import path (DECISIONS #35).

import {DEFAULT_LOCALE, INTL_LOCALES, type Locale} from '@nutribio/core';

export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_LANGUAGE_NAMES,
  INTL_LOCALES,
  resolveLocale,
  normalizeLocaleSetting,
} from '@nutribio/core';
export type {Locale, LocaleSetting} from '@nutribio/core';

let active: Locale = DEFAULT_LOCALE;

/** Set by the i18n runtime on init/language change. */
export function setActiveLocale(locale: Locale): void {
  active = locale;
}

/** Current active locale. */
export function activeLocale(): Locale {
  return active;
}

/** Locale tag usable by Intl APIs. */
export function activeIntlLocale(): string {
  return INTL_LOCALES[active];
}
