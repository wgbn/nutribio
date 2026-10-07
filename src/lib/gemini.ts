// Gemini integration: generates the weekly meal plan with structured output
// (JSON schema), then validates and normalizes it into our domain types.
//
// Prompt strategy (DECISIONS #25/#26): instructions and schema descriptions
// are written in ENGLISH (most reliable across models), with a mandatory
// output-language block and a country-of-residence block so dish content is
// written in the user's locale with country-typical ingredients.
// User-facing errors are localized via i18n keys at throw time.

import {GoogleGenAI} from '@google/genai';
import i18next from 'i18next';

import type {
  BioRecord,
  DayPlan,
  Dish,
  Ingredient,
  MealSlot,
  NutritionTargets,
  Profile,
  ShoppingCategory,
  ShoppingItem,
  WeekDayId,
} from '../types';
import {activeLocale, LOCALE_LANGUAGE_NAMES} from '../i18n/locales';
import {
  EXERCISE_TYPE_LABEL_KEYS,
  FREQUENCY_LABEL_KEYS,
  GOAL_LABEL_KEYS,
  INTENSITY_LABEL_KEYS,
  SEX_LABEL_KEYS,
} from './calculations';
import {countryName, type CountryCode} from './countries';
import {describeError} from './errors';
import {parseTimeToMinutes, workoutMealIds} from './mealTimes';
import {emptyMealSlot, SLOT_ORDER, WEEK_ORDER} from './plan';
import {fmt, fmtGrams} from './units';

export class GeminiError extends Error {}

/**
 * Per-country cuisine hints (English, for the prompt): steer the model to
 * products commonly found in that country's supermarkets (DECISIONS #26).
 */
export const COUNTRY_CUISINE_HINTS: Record<CountryCode, string> = {
  PT: 'Typical Portuguese products: pescada (hake), dourada (sea bream), robalo (sea bass), bacalhau (salted cod), sardinhas, polvo, queijo fresco, requeijão, broa, pão de milho/centeio, azeite, legumes da horta (couve, nabo, abóbora), fruta portuguesa (maçã, pera, laranja do Algarve).',
  BR: 'Typical Brazilian products: frango, patinho/músculo, tilápia, pescada branca, ovos, arroz, feijão preto/carioca, mandioca/aipim, batata-doce, pão francês, tapioca, queijo minas, requeijão, iogurte natural, mamão, banana, abacaxi, acerola.',
  ES: 'Typical Spanish products: merluza, dorada, lubina, bacalao, jamón serrano (lean), pollo, pavo, huevos, arroz, patata, pan integral, aceite de oliva, gazpacho vegetables (tomate, pimiento, pepino), naranja, manzana, queso fresco.',
  FR: "Typical French products: cabillaud, dorade, saumon, poulet, dinde, œufs, fromage blanc 0%, yaourt nature, pain complet, riz, pommes de terre, huile d'olive, légumes du marché, pomme, poire, fromage frais léger.",
  DE: "Typical German products: Hähnchen, Pute, Lachs, Kabeljau, Eier, Magerquark, Skyr, Naturjoghurt, Vollkornbrot, Haferflocken, Kartoffeln, Reis, Olivenöl, Gemüse (Brokkoli, Paprika, Zucchini), Apfel, Birne, Harzer Käse.",
  IT: "Typical Italian products: merluzzo/nasello, orata, spigola, salmone, pollo, tacchino, uova, ricotta magra, yogurt bianco, pane integrale, riso, avena, olio d'oliva, pomodoro, zucchine, melanzane, mela, pera.",
  NL: "Typical Dutch products: kip, kalkoen, zalm, kabeljauw, eieren, magere kwark, skyr, magere yoghurt, volkorenbrood, haver, aardappelen, rijst, olijfolie, groenten (broccoli, paprika), appel, peer, magere kaas.",
  BE: "Typical Belgian products: chicken, turkey, salmon, cod, eggs, cottage cheese, skimmed yoghurt, wholegrain bread, oats, potatoes, rice, olive oil, vegetables (Belgian endive, carrots), apples, pears, lean cheese.",
  IE: "Typical Irish products: chicken, turkey, salmon, cod, haddock, eggs, cottage cheese, low-fat yoghurt, wholemeal bread, oats, potatoes, rice, olive oil, vegetables, apples, berries.",
  AT: "Typical Austrian products: Hühnchen, Pute, Lachs, Kabeljau, Eier, Magerquark, Skyr, Vollkornbrot, Haferflocken, Kartoffeln, Reis, Olivenöl, Gemüse, Apfel, Birne, magere Milchprodukte.",
  LU: "Typical Luxembourgish products: chicken, turkey, salmon, cod, eggs, cottage cheese, skyr, wholegrain bread, oats, potatoes, rice, olive oil, seasonal vegetables, apples, pears.",
  GB: "Typical British products: chicken, turkey, salmon, cod, haddock, eggs, cottage cheese, Greek-style yoghurt (0%), wholemeal bread, oats, potatoes, rice, olive oil, vegetables, apples, berries, lean mince.",
};

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  'produce',
  'meat_fish',
  'dairy_eggs',
  'bakery_grains',
  'pantry',
  'frozen',
  'drinks',
  'other',
];

const SHOPPING_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      description:
        'Stable lowercase slug identifying this purchasable product, e.g. "chicken_breast", "brown_rice", "olive_oil". Reuse the SAME key whenever the same product appears',
    },
    name: {
      type: 'string',
      description:
        'Product name a shopper would find in the country\'s supermarkets, in the required output language, e.g. "Peito de frango"',
    },
    category: {
      type: 'string',
      enum: [...SHOPPING_CATEGORIES],
      description:
        'Supermarket section: produce, meat_fish, dairy_eggs, bakery_grains, pantry, frozen, drinks or other',
    },
    unitWeightGrams: {
      type: 'number',
      description:
        'Typical weight of one practical unit if applicable, e.g. 60 for an egg, 120 for a potato (omit if not applicable)',
    },
    packageGrams: {
      type: 'number',
      description:
        'Typical package weight if the product is usually sold in packages, e.g. 500 for chicken breast (omit for loose produce)',
    },
    packageLabel: {
      type: 'string',
      description: 'Short package description in the required output language, e.g. "pack of 2" (omit if not useful)',
    },
  },
  required: ['key', 'name', 'category'],
};

const DISH_SCHEMA = {
  type: 'object',
  properties: {
    name: {type: 'string', description: 'Short, appealing dish name, in the required output language'},
    description: {type: 'string', description: 'Brief preparation description, in the required output language'},
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description:
              'Ingredient name, in the required output language, typical of the user country (e.g. "grilled chicken breast")',
          },
          amountGrams: {type: 'number', description: 'Precise quantity in grams'},
          shoppingKey: {
            type: 'string',
            description:
              'Key of the matching entry in the top-level shoppingItems catalog — the same key for the same product',
          },
          rawGrams: {
            type: 'number',
            description:
              'Raw/purchase-weight equivalent of amountGrams when the recipe weight is cooked (e.g. 150 g cooked rice ~ 50 g raw); equal to amountGrams when the weight is already raw',
          },
          unit: {
            type: 'string',
            description: 'Additional practical unit if helpful, e.g. "1 unit", "1 tbsp"',
          },
        },
        required: ['item', 'amountGrams'],
      },
    },
    macros: {
      type: 'object',
      description: 'Approximate macros for the whole portion',
      properties: {
        kcal: {type: 'number'},
        protein: {type: 'number', description: 'grams'},
        carbs: {type: 'number', description: 'grams'},
        fat: {type: 'number', description: 'grams'},
      },
      required: ['kcal', 'protein', 'carbs', 'fat'],
    },
    notes: {type: 'string', description: 'Preparation or substitution tip, in the required output language'},
  },
  required: ['name', 'ingredients'],
};

const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    slot: {type: 'string', enum: [...SLOT_ORDER]},
    variations: {
      type: 'array',
      description: 'Exactly 3 dish variations for this meal',
      items: DISH_SCHEMA,
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['slot', 'variations'],
};

const DAY_SCHEMA = {
  type: 'object',
  properties: {
    day: {type: 'string', enum: [...WEEK_ORDER]},
    meals: {type: 'array', items: MEAL_SCHEMA},
  },
  required: ['day', 'meals'],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    overview: {type: 'string', description: '2-3 sentence summary of the weekly plan, in the required output language'},
    week: {type: 'array', items: DAY_SCHEMA},
    shoppingItems: {
      type: 'array',
      description:
        'Canonical shopping catalog for the whole week: ONE entry per purchasable product, referenced by the ingredients\' shoppingKey fields. Include every product used across all dishes and variations',
      items: SHOPPING_ITEM_SCHEMA,
    },
  },
  required: ['week', 'shoppingItems'],
};

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

export function normalizeWeek(raw: unknown): DayPlan[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as {week?: unknown}).week)) {
    throw new GeminiError(i18next.t('errors.badResponse'));
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
        const slot = emptyMealSlot(id);
        slot.variations = meals.get(id) ?? [];
        return slot;
      }),
    };
  });

  const populated = week.filter((d) => d.meals.some((m) => m.variations.length > 0));
  if (populated.length === 0) {
    throw new GeminiError(i18next.t('errors.emptyPlan'));
  }
  return populated;
}

export function buildPrompt(
  profile: Profile,
  bio: BioRecord | null,
  targets: NutritionTargets,
  weightKg: number,
): string {
  const locale = activeLocale();
  const languageName = LOCALE_LANGUAGE_NAMES[locale];
  const country = profile.country;
  // English country name for the English-instruction prompt.
  const countryLabel = countryName(country, 'en');

  const bioLines = bio
    ? [
        `- Weight: ${fmt(bio.weight, 1)} kg`,
        bio.bodyFat !== undefined ? `- Body fat: ${fmt(bio.bodyFat, 1)}%` : null,
        bio.water !== undefined ? `- Body water: ${fmt(bio.water, 1)}%` : null,
        bio.bmr !== undefined ? `- Basal metabolism (scale): ${fmt(bio.bmr)} kcal` : null,
        bio.visceralFat !== undefined ? `- Visceral fat: ${fmt(bio.visceralFat, 1)}` : null,
        bio.bmi !== undefined ? `- BMI: ${fmt(bio.bmi, 1)}` : null,
        bio.muscle !== undefined ? `- Muscle mass: ${fmt(bio.muscle, 1)} kg` : null,
        bio.protein !== undefined ? `- Body protein: ${fmt(bio.protein, 1)}%` : null,
        bio.boneMass !== undefined ? `- Bone mass: ${fmt(bio.boneMass, 1)} kg` : null,
        bio.bodyAge !== undefined ? `- Body age: ${fmt(bio.bodyAge)}` : null,
        bio.idealWeight !== undefined ? `- Ideal weight: ${fmt(bio.idealWeight, 1)} kg` : null,
      ].filter((l): l is string => l !== null)
    : ['- No bioimpedance measurements recorded.'];

  const workoutMinutes = profile.exercise.active
    ? parseTimeToMinutes(profile.exercise.workoutTime)
    : null;
  const exercise = profile.exercise.active
    ? `${i18next.t(FREQUENCY_LABEL_KEYS[profile.exercise.frequency])}, ${i18next.t(
        INTENSITY_LABEL_KEYS[profile.exercise.intensity],
      )} intensity, type: ${i18next.t(EXERCISE_TYPE_LABEL_KEYS[profile.exercise.type])}` +
      (workoutMinutes !== null ? `, workout time ${profile.exercise.workoutTime}` : '')
    : 'does not exercise';

  const workoutSection = (() => {
    if (workoutMinutes === null) return '';
    const {preId, postId} = workoutMealIds(workoutMinutes);
    const lines = [`- Workout time: ${profile.exercise.workoutTime}`];
    if (preId) {
      lines.push(
        `- Pre-workout meal: ${i18next.t(`meal.${preId}`)} — reinforce moderate-digestion carbs and protein in this meal.`,
      );
    }
    if (postId) {
      lines.push(
        `- Post-workout meal: ${i18next.t(`meal.${postId}`)} — reinforce protein and carbs for recovery in this meal.`,
      );
    }
    return `\n## Workout\n${lines.join('\n')}\n`;
  })();

  const splitLines = targets.mealSplit
    .map((m) => `  - ${i18next.t(`meal.${m.id}`)}: ${m.percent}% (~${m.kcal} kcal, ${m.proteinG} g protein, ${m.carbsG} g carbs, ${m.fatG} g fat)`)
    .join('\n');

  const excludedFoods = (profile.excludedFoods ?? '').trim();
  const observations = (profile.observations ?? '').trim();
  const preferencesLines: string[] = [];
  if (excludedFoods) {
    preferencesLines.push(
      `- Excluded foods: ${excludedFoods} — NEVER include any of these foods in any dish.`,
    );
  }
  if (observations) {
    preferencesLines.push(
      `- General observations from the user/nutritionist: ${observations} — take these into account when creating the plan.`,
    );
  }
  const preferencesSection =
    preferencesLines.length > 0
      ? `\n## User restrictions and preferences\n${preferencesLines.join('\n')}\n`
      : '';

  // Optional supplements (DECISIONS #32): only include what the user opted in.
  const supplementsSection = (() => {
    const whey = !!profile.supplements?.wheyProtein;
    const creatine = !!profile.supplements?.creatine;
    if (!whey && !creatine) {
      return `\n## Supplements\n- The user does NOT take supplements. Do NOT include whey protein or creatine in any meal — build the plan from whole foods only.\n`;
    }
    const lines: string[] = [];
    if (whey) {
      lines.push(
        `- Include whey protein powder where appropriate (e.g. post-workout or as a protein top-up snack), with PRECISE grams per serving, written in ${languageName}.`,
      );
    }
    if (creatine) {
      lines.push(
        `- Include creatine monohydrate (3–5 g per day, e.g. mixed into the post-workout meal or a shake), with PRECISE grams per serving.`,
      );
    }
    return `\n## Supplements\n${lines.join('\n')}\n`;
  })();

  return `You are an expert nutritionist. Create a complete weekly meal plan for one person.

## User profile
- Sex: ${i18next.t(SEX_LABEL_KEYS[profile.sex])}
- Age: ${profile.age} years
- Height: ${fmt(profile.height, 0)} cm
- Current weight: ${fmt(weightKg, 1)} kg (most recent scale reading or initial weight)
- Goal: ${i18next.t(GOAL_LABEL_KEYS[profile.goal])}
- Exercise: ${exercise}

## Country of residence (IMPORTANT)
The user lives in ${countryLabel}. Prioritize ingredients, foods and dishes that are typical of, or commonly found in supermarkets in ${countryLabel}, so shopping is easy. Use the local product names, written in ${languageName}. Typical products to prefer: ${COUNTRY_CUISINE_HINTS[country]}

## Bioimpedance (latest measurement)
${bioLines.join('\n')}

## Calculations (already done — use these values, do NOT recalculate)
- BMR Mifflin-St Jeor: ${fmt(targets.bmrMifflin)} kcal
- BMR Harris-Benedict: ${fmt(targets.bmrHarrisBenedict)} kcal
- TDEE (total daily energy expenditure): ${fmt(targets.tdee)} kcal
- Daily calorie range: ${fmt(targets.calorieMin)} – ${fmt(targets.calorieMax)} kcal (target: ${fmt(targets.calorieTarget)} kcal)
- Protein: ${fmtGrams(targets.proteinG)} g/day
- Fat: ${fmtGrams(targets.fatG)} g/day (saturated < ${fmtGrams(targets.saturatedFatLimitG)} g/day)
- Carbohydrates: ${fmtGrams(targets.carbsG)} g/day

## Calorie distribution per meal (approximate targets)
${splitLines}
${workoutSection}${supplementsSection}${preferencesSection}
## Output language (MANDATORY)
Write ALL human-readable content — the overview, dish names, descriptions, ingredient names, units, notes, shopping item names and package labels — in ${languageName} (${locale}). Food and product names must be the ones a shopper finds in ${countryLabel}, written in ${languageName}.

## Mandatory rules
1. 7 days: monday, tuesday, wednesday, thursday, friday, saturday, sunday (day enum).
2. 5 meals per day, with EXACTLY 3 dish variations each: ${SLOT_ORDER.map((id) => i18next.t(`meal.${id}`)).join(', ')} (slot enum).
3. PRECISE quantities in grams (weighed), e.g. "grilled chicken breast: 180 g", "boiled sweet potato: 280 g".
4. Protein in every meal: lean meats and fish typical of ${countryLabel}, eggs, tuna (in water), low-fat dairy.
5. Carbs: prefer the staple carbs of ${countryLabel} (e.g. potatoes, rice, wholegrain bread, oats, fruit).
6. Fats: olive oil measured by the spoon, cheese, yoghurt, small portions of nuts. Avoid fried food, butter, ghee, cured sausages, cream. Keep saturated fat low.
7. Generous vegetables/salad at lunch and dinner.
8. Each dish variation's macros should approximately match the corresponding meal targets (±10-15%).
9. The sum of the selected daily macros should approach the daily totals.
10. Short dish names; notes with preparation tips or substitutions, in ${languageName}.
11. Strictly respect the excluded foods and the observations listed in "User restrictions and preferences" — no dish may contain an excluded food, and the observations must be reflected in the plan.
12. Shopping catalog: emit ONE entry in shoppingItems per purchasable product used across ALL dishes and ALL their variations (e.g. "chicken_breast", not "grilled chicken breast" and "shredded chicken" as separate entries). Names must be what the shopper finds in ${countryLabel} supermarkets. Provide packageGrams/packageLabel for packaged products (meat, fish, dairy, grains) and unitWeightGrams for count-based produce (eggs, fruit). Categories: produce, meat_fish, dairy_eggs, bakery_grains, pantry, frozen, drinks, other.
13. Every ingredient's shoppingKey MUST reference an existing shoppingItems entry, and rawGrams MUST be the raw/purchase-weight equivalent when the recipe amount is cooked (e.g. 150 g cooked rice ≈ 50 g raw rice; 100 g cooked chicken breast ≈ 130 g raw). When the amount is already raw, rawGrams equals amountGrams.
14. Follow the "Supplements" section exactly: include the selected supplements with precise grams per serving, or NO supplements at all when the user opted out.

Return ONLY the JSON in the given schema.`;
}

function extractJson(text: string): unknown {
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
    throw new GeminiError(i18next.t('errors.unparseable'));
  }
}

export interface GenerateOptions {
  apiKey: string;
  model: string;
  profile: Profile;
  bio: BioRecord | null;
  targets: NutritionTargets;
  weightKg: number;
  onProgress?: (stage: string) => void;
}

/** Generation progress stage keys (translated by the UI). */
export const STAGE_GENERATING = 'generation.stage.generating';
export const STAGE_RETRYING = 'generation.stage.retrying';

/** Generate the weekly plan via Gemini. Returns the normalized week + shopping catalog. */
export async function generateWeeklyPlan(
  options: GenerateOptions,
): Promise<{week: DayPlan[]; overview: string; locale: string; shoppingItems: ShoppingItem[]}> {
  if (!options.apiKey.trim()) {
    throw new GeminiError(i18next.t('errors.missingKey'));
  }

  const ai = new GoogleGenAI({apiKey: options.apiKey.trim()});
  const prompt = buildPrompt(options.profile, options.bio, options.targets, options.weightKg);

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      options.onProgress?.(attempt === 0 ? STAGE_GENERATING : STAGE_RETRYING);
      const response = await ai.models.generateContent({
        model: options.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: PLAN_SCHEMA,
          temperature: 0.7,
          maxOutputTokens: 65536,
        },
      });
      const text = response.text;
      if (!text) {
        throw new GeminiError(i18next.t('errors.emptyResponse'));
      }
      const raw = extractJson(text);
      const week = normalizeWeek(raw);
      const overview =
        raw && typeof raw === 'object' && typeof (raw as {overview?: unknown}).overview === 'string'
          ? (raw as {overview: string}).overview
          : '';
      const shoppingItems = normalizeShoppingItems(
        raw && typeof raw === 'object' ? (raw as {shoppingItems?: unknown}).shoppingItems : undefined,
      );
      return {week, overview, locale: activeLocale(), shoppingItems};
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof GeminiError) throw lastError;
  // Surface the real API error (e.g. "401 UNAUTHENTICATED: API key not
  // valid") instead of a generic message, so it can be diagnosed on mobile.
  throw new GeminiError(i18next.t('errors.apiFailed', {detail: describeError(lastError)}));
}
