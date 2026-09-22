// Formatting helpers (pt-PT conventions: comma decimal separator).

const nf = new Intl.NumberFormat('pt-PT', {maximumFractionDigits: 1});

export function fmt(value: number | undefined | null, digits = 0): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-PT', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
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
  return date.toLocaleDateString('pt-PT', {day: '2-digit', month: 'short', year: 'numeric'});
}

export function fmtDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export {nf};
