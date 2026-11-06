// Locale definitions and device-language resolution (pure module, testable).
// Rules (DECISIONS #25): pt-BR -> pt-BR; any other pt-* -> pt-PT; en-* -> en-GB;
// es/fr/de/it language match; anything else -> en-GB (default/fallback).

export const LOCALES = ['pt-PT', 'pt-BR', 'en-GB', 'es', 'fr', 'de', 'it'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en-GB';

export type LocaleSetting = 'auto' | Locale;

/** Native labels shown in the language selector (not translated further). */
export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-PT': 'Português (Portugal)',
  'pt-BR': 'Português (Brasil)',
  'en-GB': 'English (UK)',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

/**
 * English names of each output language, used in the Gemini prompt
 * ("write everything in European Portuguese (pt-PT)"). English instruction
 * text plus the English language name is the most reliable combination
 * across models.
 */
export const LOCALE_LANGUAGE_NAMES: Record<Locale, string> = {
  'pt-PT': 'European Portuguese',
  'pt-BR': 'Brazilian Portuguese',
  'en-GB': 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

/** BCP-47 tags accepted by Intl APIs for each supported locale. */
export const INTL_LOCALES: Record<Locale, string> = {
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-BR',
  'en-GB': 'en-GB',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
};

/** Normalize a language tag: keep language + region, lowercase language. */
function normalizeTag(tag: string): {language: string; region?: string} {
  const trimmed = tag.trim();
  const match = /^([a-zA-Z]{2,3})(?:[-_]([a-zA-Z]{2}|[0-9]{3}))?$/.exec(trimmed);
  if (!match) return {language: trimmed.toLowerCase()};
  return {language: match[1].toLowerCase(), region: match[2]?.toUpperCase()};
}

/** Resolve a single candidate language tag to a supported locale, or null. */
function resolveTag(tag: string): Locale | null {
  const {language, region} = normalizeTag(tag);
  if (language === 'pt') return region === 'BR' ? 'pt-BR' : 'pt-PT';
  if (language === 'en') return 'en-GB';
  if (language === 'es') return 'es';
  if (language === 'fr') return 'fr';
  if (language === 'de') return region === 'AT' || region === 'CH' ? 'de' : 'de';
  if (language === 'it') return 'it';
  return null;
}

/**
 * Resolve the app locale from a list of user-preferred language tags
 * (usually `navigator.languages`). First match wins; fallback en-GB.
 */
export function resolveLocale(candidates: readonly string[]): Locale {
  for (const candidate of candidates) {
    const resolved = resolveTag(candidate);
    if (resolved) return resolved;
  }
  return DEFAULT_LOCALE;
}

/** Validate/normalize a persisted locale setting; invalid -> 'auto'. */
export function normalizeLocaleSetting(value: unknown): LocaleSetting {
  if (value === 'auto') return 'auto';
  if (typeof value === 'string' && (LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return 'auto';
}

// ---------------------------------------------------------------------------
// Active locale tracking (kept in this pure module so units.ts etc. can read
// the current locale without importing i18next).
// ---------------------------------------------------------------------------

let active: Locale = DEFAULT_LOCALE;

/** Set by the i18n runtime on init/language change. */
export function setActiveLocale(locale: Locale): void {
  active = locale;
}

/** Current active locale (pure accessor). */
export function activeLocale(): Locale {
  return active;
}

/** Locale tag usable by Intl APIs. */
export function activeIntlLocale(): string {
  return INTL_LOCALES[active];
}
