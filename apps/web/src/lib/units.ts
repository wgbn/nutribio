// Formatting helpers, localized to the active locale (comma decimals for
// pt-* locales, dot for en/es/fr/de/it — the app locale decides).
// NumberInput still accepts both separators (DECISIONS #9).

import {formatNumber} from '@nutribio/core';

import {activeIntlLocale} from '../i18n/locales';

const nf = new Intl.NumberFormat(activeIntlLocale(), {maximumFractionDigits: 1});

export function fmt(value: number | undefined | null, digits = 0): string {
  return formatNumber(value, digits, activeIntlLocale());
}

export function fmtKcal(value: number | undefined | null): string {
  return fmt(value, 0);
}

export function fmtGrams(value: number | undefined | null): string {
  return fmt(value, 0);
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(activeIntlLocale(), {day: '2-digit', month: 'short', year: 'numeric'});
}

export function fmtDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString(activeIntlLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Decimal separator for the active locale ("," for pt-*, "." for others). */
export function decimalSeparator(): string {
  const parts = new Intl.NumberFormat(activeIntlLocale()).formatToParts(1.1);
  return parts.find((p) => p.type === 'decimal')?.value ?? '.';
}

export {nf};
