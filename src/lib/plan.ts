// Helpers to assemble and query generated plans.

import type {
  BioRecord,
  DayPlan,
  Dish,
  Macros,
  MealSlot,
  MealSlotId,
  NutritionTargets,
  Plan,
  Profile,
  WeekDayId,
} from '../types';
import {mealLabel} from './calculations';
import {MEAL_SLOTS, timeWindowLabel} from './mealTimes';

export const SLOT_ORDER: MealSlotId[] = [
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'dinner',
];

export const WEEK_ORDER: WeekDayId[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function emptyMealSlot(id: MealSlotId): MealSlot {
  const def = MEAL_SLOTS.find((s) => s.id === id)!;
  return {id, label: mealLabel(id), timeWindow: timeWindowLabel(def), variations: [], selectedIndex: 0};
}

export function getSelectedDish(meal: MealSlot): Dish | null {
  if (meal.variations.length === 0) return null;
  const idx = Math.min(meal.selectedIndex, meal.variations.length - 1);
  return meal.variations[idx];
}

export function sumMacros(items: Array<Macros | undefined>): Macros {
  return items.reduce<Macros>(
    (acc, m) => {
      if (!m) return acc;
      acc.kcal += m.kcal ?? 0;
      acc.protein += m.protein ?? 0;
      acc.carbs += m.carbs ?? 0;
      acc.fat += m.fat ?? 0;
      return acc;
    },
    {kcal: 0, protein: 0, carbs: 0, fat: 0},
  );
}

/** Daily totals from the *selected* variation of each meal. */
export function dayTotals(day: DayPlan): Macros {
  return sumMacros(day.meals.map((m) => getSelectedDish(m)?.macros));
}

export function weekTotals(week: DayPlan[]): Macros {
  return sumMacros(week.map(dayTotals));
}

export function assemblePlan(
  profile: Profile,
  bio: BioRecord | null,
  targets: NutritionTargets,
  week: DayPlan[],
  inputsHash: string,
  overview?: string,
): Plan {
  return {
    generatedAt: Date.now(),
    inputsHash,
    profileSnapshot: profile,
    biometricsSnapshot: bio,
    targets,
    week,
    overview,
  };
}
