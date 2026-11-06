// Validation/normalization of the Gemini response into our domain types.
// Errors are CODES (not translated text): the web maps them to `errors.*`
// i18n keys and the API will map them to its own error codes (DECISIONS #35).

import type {
  DayPlan,
  Dish,
  Ingredient,
  MealSlot,
  ShoppingCategory,
  ShoppingItem,
  WeekDayId,
} from './types';
import {emptyMealSlot, SLOT_ORDER, WEEK_ORDER} from './plan';
import {SHOPPING_CATEGORIES} from './schema';
import type {Translate} from './translate';

export type PlanParseErrorCode = 'emptyResponse' | 'unparseable' | 'badResponse' | 'emptyPlan';

/** Normalization/parsing failure, identified by a stable code. */
export class PlanParseError extends Error {
  readonly code: PlanParseErrorCode;

  constructor(code: PlanParseErrorCode) {
    super(code);
    this.name = 'PlanParseError';
    this.code = code;
  }
}

interface RawDish {
  name?: unknown;
  description?: unknown;
  ingredients?: unknown;
  macros?: unknown;
  notes?: unknown;
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function normalizeDish(raw: unknown): Dish | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as RawDish;
  if (typeof d.name !== 'string' || !Array.isArray(d.ingredients)) return null;
  const ingredients: Ingredient[] = [];
  for (const ing of d.ingredients) {
    if (!ing || typeof ing !== 'object') continue;
    const i = ing as {
      item?: unknown;
      amountGrams?: unknown;
      unit?: unknown;
      shoppingKey?: unknown;
      rawGrams?: unknown;
    };
    if (typeof i.item !== 'string' || !isNumber(i.amountGrams) || i.amountGrams <= 0) continue;
    ingredients.push({
      item: i.item,
      amountGrams: Math.round(i.amountGrams * 10) / 10,
      shoppingKey: typeof i.shoppingKey === 'string' && i.shoppingKey ? i.shoppingKey : undefined,
      rawGrams:
        isNumber(i.rawGrams) && i.rawGrams > 0 ? Math.round(i.rawGrams * 10) / 10 : undefined,
      unit: typeof i.unit === 'string' ? i.unit : undefined,
    });
  }
  if (ingredients.length === 0) return null;

  const macros = d.macros as Record<string, unknown> | undefined;
  const macrosOk =
    macros && isNumber(macros.kcal) && isNumber(macros.protein) && isNumber(macros.carbs) && isNumber(macros.fat);
  return {
    name: d.name,
    description: typeof d.description === 'string' ? d.description : undefined,
    ingredients,
    macros: macrosOk
      ? {kcal: macros.kcal as number, protein: macros.protein as number, carbs: macros.carbs as number, fat: macros.fat as number}
      : undefined,
    notes: typeof d.notes === 'string' ? d.notes : undefined,
  };
}

/** Normalize the top-level shoppingItems catalog (defensive, deduped). */
export function normalizeShoppingItems(raw: unknown): ShoppingItem[] {
  if (!Array.isArray(raw)) return [];
  const byKey = new Map<string, ShoppingItem>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as {key?: unknown; name?: unknown; category?: unknown};
    if (typeof e.key !== 'string' || !e.key.trim()) continue;
    const key = e.key.trim().toLowerCase().replace(/\s+/g, '_');
    const name = typeof e.name === 'string' && e.name.trim() ? e.name.trim() : key;
    const category = SHOPPING_CATEGORIES.includes(e.category as ShoppingCategory)
      ? (e.category as ShoppingCategory)
      : 'other';
    const full = e as {
      unitWeightGrams?: unknown;
      packageGrams?: unknown;
      packageLabel?: unknown;
    };
    byKey.set(key, {
      key,
      name,
      category,
      unitWeightGrams:
        isNumber(full.unitWeightGrams) && full.unitWeightGrams > 0
          ? Math.round(full.unitWeightGrams)
          : undefined,
      packageGrams:
        isNumber(full.packageGrams) && full.packageGrams > 0 ? Math.round(full.packageGrams) : undefined,
      packageLabel:
        typeof full.packageLabel === 'string' && full.packageLabel.trim()
          ? full.packageLabel.trim()
          : undefined,
    });
  }
  return [...byKey.values()];
}

export function normalizeWeek(raw: unknown, t: Translate): DayPlan[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as {week?: unknown}).week)) {
    throw new PlanParseError('badResponse');
  }
  const byDay = new Map<WeekDayId, Map<MealSlot['id'], Dish[]>>();

  for (const day of (raw as {week: unknown[]}).week) {
    if (!day || typeof day !== 'object') continue;
    const d = day as {day?: unknown; meals?: unknown[]};
    if (typeof d.day !== 'string' || !(WEEK_ORDER as string[]).includes(d.day)) continue;
    const meals = new Map<MealSlot['id'], Dish[]>();
    for (const meal of Array.isArray(d.meals) ? d.meals : []) {
      if (!meal || typeof meal !== 'object') continue;
      const m = meal as {slot?: unknown; variations?: unknown[]};
      if (typeof m.slot !== 'string' || !(SLOT_ORDER as string[]).includes(m.slot)) continue;
      const variations = (Array.isArray(m.variations) ? m.variations : [])
        .map(normalizeDish)
        .filter((x): x is Dish => x !== null)
        .slice(0, 4);
      if (variations.length > 0) meals.set(m.slot as MealSlot['id'], variations);
    }
    byDay.set(d.day as WeekDayId, meals);
  }

  const week: DayPlan[] = WEEK_ORDER.map((day) => {
    const meals = byDay.get(day) ?? new Map();
    return {
      day,
      meals: SLOT_ORDER.map((id) => {
        const slot = emptyMealSlot(id, t);
        slot.variations = meals.get(id) ?? [];
        return slot;
      }),
    };
  });

  const populated = week.filter((d) => d.meals.some((m) => m.variations.length > 0));
  if (populated.length === 0) {
    throw new PlanParseError('emptyPlan');
  }
  return populated;
}

export function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)```|```\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1] ?? match[2]);
      } catch {
        // fall through
      }
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
    throw new PlanParseError('unparseable');
  }
}

export interface ParsedPlanResponse {
  week: DayPlan[];
  overview: string;
  shoppingItems: ShoppingItem[];
}

/**
 * Parse the raw model text into the normalized week + overview + shopping
 * catalog. Throws `PlanParseError` (code) on unusable output.
 */
export function parsePlanResponse(text: string, t: Translate): ParsedPlanResponse {
  if (!text) throw new PlanParseError('emptyResponse');
  const raw = extractJson(text);
  const week = normalizeWeek(raw, t);
  const overview =
    raw && typeof raw === 'object' && typeof (raw as {overview?: unknown}).overview === 'string'
      ? (raw as {overview: string}).overview
      : '';
  const shoppingItems = normalizeShoppingItems(
    raw && typeof raw === 'object' ? (raw as {shoppingItems?: unknown}).shoppingItems : undefined,
  );
  return {week, overview, shoppingItems};
}
