// Gemini prompt builder (English instructions, localized output content).
//
// Prompt strategy (DECISIONS #25/#26): instructions and schema descriptions
// are written in ENGLISH (most reliable across models), with a mandatory
// output-language block and a country-of-residence block so dish content is
// written in the user's locale with country-typical ingredients.
// Core is i18n-runtime free: the locale and the translator are injected.

import type {BioRecord, NutritionTargets, Profile} from './types';
import {
  EXERCISE_TYPE_LABEL_KEYS,
  FREQUENCY_LABEL_KEYS,
  GOAL_LABEL_KEYS,
  INTENSITY_LABEL_KEYS,
  SEX_LABEL_KEYS,
} from './calculations';
import {countryName, type CountryCode} from './countries';
import {formatNumber} from './format';
import {INTL_LOCALES, LOCALE_LANGUAGE_NAMES, type Locale} from './locales';
import {parseTimeToMinutes, workoutMealIds} from './mealTimes';
import {SLOT_ORDER} from './plan';
import type {Translate} from './translate';

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

export interface PromptInput {
  profile: Profile;
  bio: BioRecord | null;
  targets: NutritionTargets;
  weightKg: number;
  /** Locale the plan content must be written in. */
  locale: Locale;
  /** Translator for the profile/meal labels used inside the prompt. */
  t: Translate;
}

export function buildPrompt({profile, bio, targets, weightKg, locale, t}: PromptInput): string {
  const intlLocale = INTL_LOCALES[locale];
  const fmt = (value: number | undefined | null, digits = 0) =>
    formatNumber(value, digits, intlLocale);
  const fmtGrams = (value: number | undefined | null) => formatNumber(value, 0, intlLocale);

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
    ? `${t(FREQUENCY_LABEL_KEYS[profile.exercise.frequency])}, ${t(
        INTENSITY_LABEL_KEYS[profile.exercise.intensity],
      )} intensity, type: ${t(EXERCISE_TYPE_LABEL_KEYS[profile.exercise.type])}` +
      (workoutMinutes !== null ? `, workout time ${profile.exercise.workoutTime}` : '')
    : 'does not exercise';

  const workoutSection = (() => {
    if (workoutMinutes === null) return '';
    const {preId, postId} = workoutMealIds(workoutMinutes);
    const lines = [`- Workout time: ${profile.exercise.workoutTime}`];
    if (preId) {
      lines.push(
        `- Pre-workout meal: ${t(`meal.${preId}`)} — reinforce moderate-digestion carbs and protein in this meal.`,
      );
    }
    if (postId) {
      lines.push(
        `- Post-workout meal: ${t(`meal.${postId}`)} — reinforce protein and carbs for recovery in this meal.`,
      );
    }
    return `\n## Workout\n${lines.join('\n')}\n`;
  })();

  const splitLines = targets.mealSplit
    .map((m) => `  - ${t(`meal.${m.id}`)}: ${m.percent}% (~${m.kcal} kcal, ${m.proteinG} g protein, ${m.carbsG} g carbs, ${m.fatG} g fat)`)
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
- Sex: ${t(SEX_LABEL_KEYS[profile.sex])}
- Age: ${profile.age} years
- Height: ${fmt(profile.height, 0)} cm
- Current weight: ${fmt(weightKg, 1)} kg (most recent scale reading or initial weight)
- Goal: ${t(GOAL_LABEL_KEYS[profile.goal])}
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
2. 5 meals per day, with EXACTLY 3 dish variations each: ${SLOT_ORDER.map((id) => t(`meal.${id}`)).join(', ')} (slot enum).
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
