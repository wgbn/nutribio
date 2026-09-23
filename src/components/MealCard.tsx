// Meal slot card: label, time window, selected dish, ingredients, macros,
// and an optional variation picker.

import type {Macros, MealSlot} from '../types';
import {getSelectedDish} from '../lib/plan';
import {fmt} from '../lib/units';

export function MacroChips({macros}: {macros: Macros}) {
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-medium tabular-nums">
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
        {fmt(macros.kcal, 0)} kcal
      </span>
      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
        P {fmt(macros.protein, 0)}g
      </span>
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
        C {fmt(macros.carbs, 0)}g
      </span>
      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
        G {fmt(macros.fat, 0)}g
      </span>
    </div>
  );
}

export function MealCard({
  meal,
  showPicker = false,
  onPick,
  badge = null,
}: {
  meal: MealSlot;
  showPicker?: boolean;
  onPick?: (index: number) => void;
  /** Dynamic workout badge: 'Pré-treino' | 'Pós-treino' | null. */
  badge?: 'Pré-treino' | 'Pós-treino' | null;
}) {
  const dish = getSelectedDish(meal);
  const badgeClass =
    badge === 'Pré-treino'
      ? 'bg-amber-100 text-amber-700'
      : badge === 'Pós-treino'
        ? 'bg-sky-100 text-sky-700'
        : '';
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-semibold text-slate-800">{meal.label}</h4>
            {badge ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-400">{meal.timeWindow}</p>
        </div>
        {dish?.macros ? <MacroChips macros={dish.macros} /> : null}
      </div>

      {dish ? (
        <>
          <p className="text-sm font-semibold text-emerald-700">{dish.name}</p>
          {dish.description ? (
            <p className="mt-0.5 text-sm text-slate-500">{dish.description}</p>
          ) : null}
          <ul className="mt-2 divide-y divide-slate-50">
            {dish.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-1 text-sm">
                <span className="text-slate-600">{ing.item}</span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {fmt(ing.amountGrams, 0)} g{ing.unit ? ` · ${ing.unit}` : ''}
                </span>
              </li>
            ))}
          </ul>
          {dish.notes ? (
            <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
              {dish.notes}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-slate-400">Sem sugestão para esta refeição.</p>
      )}

      {showPicker && meal.variations.length > 1 ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-medium text-slate-400">Trocar variação:</p>
          <div className="flex flex-wrap gap-1.5">
            {meal.variations.map((v, i) => (
              <button
                key={i}
                onClick={() => onPick?.(i)}
                className={
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (i === meal.selectedIndex
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300')
                }
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
