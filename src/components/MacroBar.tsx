// Small horizontal progress bar for a macro vs its daily target.

import {fmt} from '../lib/units';

export interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string; // tailwind bg class for the fill
}

export function MacroBar({label, value, target, unit, color}: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-500">
          {fmt(value, 0)} / {fmt(target, 0)} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{width: `${pct}%`}}
        />
      </div>
    </div>
  );
}
