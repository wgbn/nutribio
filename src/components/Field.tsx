// Form primitives: labeled field, text/number inputs (pt-PT comma decimals),
// select and chip group.

import type {InputHTMLAttributes, ReactNode, SelectHTMLAttributes} from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 ' +
  'placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

/** Number input that accepts both comma and dot decimals (pt-PT). */
export function NumberInput({
  value,
  onChange,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number | '';
  onChange: (v: number | '') => void;
}) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value === '' ? '' : String(value).replace('.', ',')}
      onChange={(e) => {
        const raw = e.target.value.replace(',', '.');
        if (raw === '') return onChange('');
        const n = Number(raw);
        if (!Number.isNaN(n)) onChange(n);
      }}
      className={`${inputClass} ${rest.className ?? ''}`}
    />
  );
}

export function Select({
  options,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{value: string; label: string}>;
}) {
  return (
    <select
      {...rest}
      className={`${inputClass} appearance-none ${rest.className ?? ''}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{value: T; label: string}>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'rounded-full px-3.5 py-2 text-sm font-medium transition-colors ' +
              (active
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
