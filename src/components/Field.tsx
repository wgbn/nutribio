// Form primitives: labeled field, text/number inputs (pt-PT comma decimals),
// select and chip group.

import {
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

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

/**
 * Number input that accepts both comma and dot decimals (pt-PT).
 *
 * Keeps a local draft string while typing so intermediate states like "78,"
 * are not normalized away before the decimal digits are typed; the parsed
 * number is committed on every valid keystroke and the display syncs back
 * from the committed value on blur / external changes.
 */
export function NumberInput({
  value,
  onChange,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number | '';
  onChange: (v: number | '') => void;
}) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  // Sync the draft from the committed value whenever we are not typing.
  useEffect(() => {
    if (!focused) setDraft(value === '' ? '' : String(value).replace('.', ','));
  }, [value, focused]);

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft}
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        const normalized = raw.replace(',', '.');
        // Reject anything that is not a valid partial decimal number.
        if (normalized !== '' && !/^-?\d*\.?\d*$/.test(normalized)) return;
        setDraft(raw);
        if (raw === '') return onChange('');
        const n = Number(normalized);
        onChange(Number.isNaN(n) ? '' : n);
      }}
      className={`${inputClass} ${rest.className ?? ''}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputClass} min-h-24 resize-y leading-relaxed ${props.className ?? ''}`}
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
