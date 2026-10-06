// Supported countries (roadmap item 6, DECISIONS #26).
// The user's country of residence drives: cuisine hints in the Gemini
// prompt, Stripe currency (later, item 3) and the applicable legal regime
// (later, item 5). Language follows the app locale; cuisine follows country.

import {activeLocale} from '../i18n/locales';

/**
 * Curated list (owner decision 2026-10-06): main/most relevant EU countries
 * (NOT all 27) + United Kingdom + Brazil. LU included for its large
 * Portuguese-speaking community. Keep this constant as the single list.
 */
export const SUPPORTED_COUNTRIES = [
  'PT',
  'BR',
  'ES',
  'FR',
  'DE',
  'IT',
  'NL',
  'BE',
  'IE',
  'AT',
  'LU',
  'GB',
] as const;

export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export function isSupportedCountry(value: unknown): value is CountryCode {
  return (
    typeof value === 'string' &&
    (SUPPORTED_COUNTRIES as readonly string[]).includes(value)
  );
}

/** Country name in the given locale (via Intl.DisplayNames). */
export function countryName(code: CountryCode, intlLocale?: string): string {
  const dn = new Intl.DisplayNames([intlLocale ?? 'en'], {type: 'region'});
  return dn.of(code) ?? code;
}

/** Country options sorted alphabetically in the active (or given) locale. */
export function countryOptions(intlLocale?: string): Array<{value: CountryCode; label: string}> {
  const locale = intlLocale ?? 'en';
  return [...SUPPORTED_COUNTRIES]
    .map((code) => ({value: code, label: countryName(code, locale)}))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

/** Fallback country when nothing else matches. */
export const DEFAULT_COUNTRY: CountryCode = 'PT';

const LOCALE_DEFAULT_COUNTRY: Record<string, CountryCode> = {
  'pt-PT': 'PT',
  'pt-BR': 'BR',
  'en-GB': 'GB',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
};

/**
 * Preselect the country for a new user:
 * 1. device region when supported (de-AT -> AT, pt-BR -> BR, en-GB -> GB…);
 * 2. else the app locale's default country;
 * 3. else DEFAULT_COUNTRY.
 */
export function defaultCountryFor(
  candidates: readonly string[],
  locale = activeLocale(),
): CountryCode {
  for (const tag of candidates) {
    const match = /^([a-zA-Z]{2,3})[-_]([a-zA-Z]{2}|\d{3})$/.exec(tag.trim());
    const region = match?.[2]?.toUpperCase();
    if (region && (SUPPORTED_COUNTRIES as readonly string[]).includes(region)) {
      return region as CountryCode;
    }
  }
  return LOCALE_DEFAULT_COUNTRY[locale] ?? DEFAULT_COUNTRY;
}
