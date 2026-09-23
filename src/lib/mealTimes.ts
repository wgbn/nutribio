// Meal slot definitions with their time windows (minutes since midnight).

import type {MealSlotId} from '../types';

export interface MealSlotDef {
  id: MealSlotId;
  label: string;
  startMin: number;
  endMin: number;
}

export const MEAL_SLOTS: MealSlotDef[] = [
  {id: 'breakfast', label: 'Pequeno-almoço', startMin: 6 * 60, endMin: 9 * 60 + 59},
  {id: 'morning_snack', label: 'Lanche da manhã', startMin: 10 * 60, endMin: 11 * 60 + 59},
  {id: 'lunch', label: 'Almoço', startMin: 12 * 60, endMin: 14 * 60 + 29},
  {id: 'afternoon_snack', label: 'Lanche da tarde', startMin: 14 * 60 + 30, endMin: 18 * 60 + 59},
  {id: 'dinner', label: 'Jantar', startMin: 19 * 60, endMin: 22 * 60 + 59},
];

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timeWindowLabel(slot: MealSlotDef): string {
  return `${formatMinutes(slot.startMin)} – ${formatMinutes(slot.endMin)}`;
}

/** Parse "HH:MM" (24h) into minutes since midnight; null if empty/invalid. */
export function parseTimeToMinutes(hhmm: string | undefined | null): number | null {
  if (!hhmm) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export interface WorkoutMeals {
  preId: MealSlotId | null;
  postId: MealSlotId | null;
}

/**
 * Which existing meal slots are the "pré-treino" and "pós-treino" meals,
 * derived from the workout time of day:
 * - pre: the slot whose window contains the workout time; if the time falls
 *   outside all windows, the last slot that ended before it; else null.
 * - post: the slot right after the pre slot; if pre is null (workout before
 *   the first meal), the first meal of the day; else null.
 */
export function workoutMealIds(workoutMinutes: number): WorkoutMeals {
  const pre =
    MEAL_SLOTS.find((s) => workoutMinutes >= s.startMin && workoutMinutes <= s.endMin) ??
    [...MEAL_SLOTS].reverse().find((s) => s.endMin < workoutMinutes) ??
    null;
  if (!pre) {
    const post = MEAL_SLOTS.find((s) => s.startMin >= workoutMinutes) ?? null;
    return {preId: null, postId: post?.id ?? null};
  }
  const idx = MEAL_SLOTS.findIndex((s) => s.id === pre.id);
  const post = idx >= 0 && idx < MEAL_SLOTS.length - 1 ? MEAL_SLOTS[idx + 1] : null;
  return {preId: pre.id, postId: post?.id ?? null};
}

export type WorkoutBadge = 'Pré-treino' | 'Pós-treino' | null;

/** Badge label for a meal slot given the workout-derived pre/post ids. */
export function workoutBadgeFor(
  mealId: MealSlotId,
  workoutMeals: WorkoutMeals | null,
): WorkoutBadge {
  if (!workoutMeals) return null;
  if (mealId === workoutMeals.preId) return 'Pré-treino';
  if (mealId === workoutMeals.postId) return 'Pós-treino';
  return null;
}

/** Current meal slot based on the local time, or null if outside all windows. */
export function currentMealSlot(date: Date = new Date()): MealSlotDef | null {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return MEAL_SLOTS.find((s) => minutes >= s.startMin && minutes <= s.endMin) ?? null;
}

export interface NextMeal {
  slot: MealSlotDef;
  startsInMinutes: number;
}

/** Upcoming meal slots (starting from the next one) with time until start. */
export function nextMeals(date: Date = new Date(), count = 4): NextMeal[] {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const upcoming = MEAL_SLOTS.filter((s) => s.startMin > minutes);
  // If the day is over, wrap to tomorrow's first slots.
  const order = upcoming.length > 0 ? upcoming : [...MEAL_SLOTS];
  const startsInMinutes = (slot: MealSlotDef) => {
    const diff = slot.startMin - minutes;
    return diff > 0 ? diff : diff + 24 * 60;
  };
  return order.slice(0, count).map((slot) => ({
    slot,
    startsInMinutes: startsInMinutes(slot),
  }));
}

export function startsInLabel(minutes: number): string {
  if (minutes <= 0) return 'agora';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `em ${m} min`;
  if (m === 0) return `em ${h}h`;
  return `em ${h}h${String(m).padStart(2, '0')}`;
}

/** Weekday name (PT) for the Plan screen. */
export const WEEKDAY_LABELS: Record<string, string> = {
  sunday: 'Domingo',
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
};

/** Order used by the Plan screen: Monday-first (matches PT convention). */
export const WEEK_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
