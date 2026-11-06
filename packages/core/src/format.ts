// Locale-aware number formatting shared by the UI and the Gemini prompt.
// The locale is always explicit (core holds no active-locale state).

/** Format a number with the given Intl locale; "—" for missing/invalid values. */
export function formatNumber(
  value: number | undefined | null,
  digits = 0,
  intlLocale = 'en-GB',
): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}
