// Weekly shopping list aggregation (roadmap item 7, DECISIONS #27).
// Deterministic local sum of the shopping catalog referenced by the plan's
// ingredients: totals per canonical item, practical units and the dishes
// each item is used in. The LLM only canonicalizes; the math is ours.

import type {DayPlan, MealSlotId, ShoppingCategory, ShoppingItem, WeekDayId} from './types';

/** One aggregated shopping row (per canonical shopping item). */
export interface ShoppingRow {
  key: string;
  name: string;
  category: ShoppingCategory;
  /** Sum of rawGrams (fallback amountGrams) across ALL variations. */
  totalGrams: number;
  /** Human-friendly quantity, e.g. "≈ 1.1 kg", "≈ 2 × 500 g", "≈ 6". */
  quantityLabel: string;
  /** Optional package hint from the model (e.g. "pack of 2"). */
  packageLabel?: string;
  /** Where the item is used: day · meal label key · dish name · grams. */
  dishes: Array<{day: WeekDayId; meal: MealSlotId; dish: string; grams: number}>;
}

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  'produce',
  'meat_fish',
  'dairy_eggs',
  'bakery_grains',
  'pantry',
  'frozen',
  'drinks',
  'other',
];

/** Practical quantity label from total grams + catalog hints. */
export function quantityLabel(item: ShoppingItem, totalGrams: number): string {
  if (totalGrams <= 0) return '—';
  if (item.packageGrams && item.packageGrams > 0) {
    const units = Math.ceil(totalGrams / item.packageGrams);
    return `≈ ${units} × ${Math.round(item.packageGrams)} g`;
  }
  if (item.unitWeightGrams && item.unitWeightGrams > 0) {
    const units = Math.ceil(totalGrams / item.unitWeightGrams);
    return `≈ ${units}`;
  }
  if (totalGrams >= 1000) return `≈ ${(totalGrams / 1000).toFixed(1).replace('.', ',')} kg`;
  return `≈ ${Math.round(totalGrams)} g`;
}

/**
 * Build the aggregated shopping list from a plan week.
 * Covers ALL variations (owner decision); every ingredient contributes, so
 * the list is a SUGGESTION (the UI shows which dishes use each item and the
 * disclaimer tells the user to buy only what they will cook).
 * Ingredients without a valid shoppingKey fall into an "other" pseudo-item
 * keyed by their raw name (graceful degradation).
 */
export function buildShoppingList(
  week: DayPlan[],
  shoppingItems: ShoppingItem[],
): ShoppingRow[] {
  const catalog = new Map(shoppingItems.map((s) => [s.key, s]));
  const acc = new Map<string, ShoppingRow>();

  const add = (row: ShoppingRow) => {
    const existing = acc.get(row.key);
    if (existing) {
      existing.totalGrams += row.totalGrams;
      existing.dishes.push(...row.dishes);
    } else {
      acc.set(row.key, row);
    }
  };

  for (const day of week) {
    for (const meal of day.meals) {
      for (const dish of meal.variations) {
        for (const ing of dish.ingredients) {
          const grams = ing.rawGrams ?? ing.amountGrams;
          const item = ing.shoppingKey ? catalog.get(ing.shoppingKey) : undefined;
          if (item) {
            add({
              key: item.key,
              name: item.name,
              category: item.category,
              totalGrams: grams,
              quantityLabel: '', // filled after the totals are known
              packageLabel: item.packageLabel,
              dishes: [{day: day.day, meal: meal.id, dish: dish.name, grams}],
            });
          } else {
            // No catalog reference: fall back to a pseudo "other" item.
            add({
              key: `other:${ing.item.toLowerCase()}`,
              name: ing.item,
              category: 'other',
              totalGrams: grams,
              quantityLabel: '',
              dishes: [{day: day.day, meal: meal.id, dish: dish.name, grams}],
            });
          }
        }
      }
    }
  }

  const rows = [...acc.values()];
  for (const row of rows) {
    row.totalGrams = Math.round(row.totalGrams);
    row.quantityLabel = quantityLabel(
      catalog.get(row.key) ?? {key: row.key, name: row.name, category: row.category},
      row.totalGrams,
    );
  }

  const categoryIndex = new Map(SHOPPING_CATEGORY_ORDER.map((c, i) => [c, i]));
  rows.sort(
    (a, b) =>
      (categoryIndex.get(a.category) ?? 99) - (categoryIndex.get(b.category) ?? 99) ||
      a.name.localeCompare(b.name),
  );
  return rows;
}
