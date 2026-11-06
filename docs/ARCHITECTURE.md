# Nutribio — Architecture

Detailed technical documentation for future agents. Companion docs:
[`../AGENTS.md`](../AGENTS.md) (entry point),
[`DECISIONS.md`](./DECISIONS.md) (decision log — read first, never undo) and
[`CHANGELOG.md`](./CHANGELOG.md) (mandatory change log).

---

## 1. Overview

Nutribio is an installable PWA that generates **weekly meal plans** for a
single user, personalized from:

- basic profile (name, sex, age, height, weight, goal, exercise habits);
- bioimpedance scale readings (weight, body fat %, water %, basal metabolism,
  visceral fat, BMI, muscle, protein %, bone mass, body age, ideal weight);
- diet preferences (excluded foods + free-text observations, e.g. from a
  nutritionist).

**Core principle:** all nutrition math is deterministic and computed locally;
Google Gemini (via `@google/genai`) is used only for the creative part —
building the 7-day × 5-meal × 3-variations plan with precise gram amounts.
The generated plan is cached locally; the API is only called when the user
explicitly confirms a (re)generation.

There is **no backend and no database**. All data lives in `localStorage`
(namespace `nutribio.v1`) and is intentionally single-device.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 7 + TypeScript (strict) |
| Repo layout | npm workspaces: `apps/web` (`@nutribio/web`) + `packages/core` (`@nutribio/core`, source-only, no deps) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| AI | `@google/genai` ^2.x (lazy-loaded, web only) |
| Charts | chart.js + react-chartjs-2 |
| PWA | `vite-plugin-pwa` (generateSW, autoUpdate) |
| Icons (PNG) | Python + PIL script (`scripts/generate_icons.py`) |
| i18n | `i18next` + `react-i18next` (26.x) — lazy per-locale catalogs |
| Deployment | GitHub Pages project site (`/nutribio/`) via GitHub Actions |
| UI language | 7 locales: `pt-PT`, `pt-BR`, `en-GB` (fallback), `es`, `fr`, `de`, `it` · Code language: English |

## 3. Project structure

The repo is an **npm-workspaces monorepo** (roadmap 4.1, DECISIONS #34):
`apps/web` is the shipped PWA (Vite root, GitHub Pages), `packages/core` is the
shared pure logic (roadmap 4.2, DECISIONS #35) and `apps/api` (Nuxt) arrives
with roadmap 4.4. App commands are always run per workspace from the root
(`npm run build -w @nutribio/web`); the root `package.json` only declares
`workspaces`.

```
nutribio/
├── AGENTS.md                    # agent entry point + critical decisions
├── package.json                 # workspaces only (apps/*, packages/*)
├── package-lock.json            # single lockfile for the whole monorepo
├── docs/
│   ├── ARCHITECTURE.md          # this file
│   ├── CHANGELOG.md             # mandatory change log
│   └── DECISIONS.md             # decision log (ADR-style)
├── apps/
│   └── web/                     # the shipped PWA
│       ├── package.json         # @nutribio/web — scripts + dependencies
│       ├── index.html           # viewport-fit=cover, manifest, apple meta
│       ├── vite.config.ts       # react + tailwind + VitePWA + base + allowedHosts
│       ├── tsconfig.json        # extends ../../tsconfig.base.json
│       ├── public/icons/        # icon-192/512.png, maskable-512.png
│       ├── scripts/             # generate_icons.py, check_i18n.mjs
│       └── src/
│           ├── main.tsx         # React root + SW registration + schema check + i18n init
│           ├── App.tsx          # welcome/onboarding gate, tab/sidebar routing, settings overlay
│           ├── index.css        # Tailwind v4 theme + global styles
│           ├── types.ts         # app-only types (Settings, TabId)
│           ├── i18n/
│           │   ├── locales.ts   # active locale tracking (pure definitions live in core)
│           │   ├── index.ts     # i18next runtime (lazy catalogs, changeLocale via re-init)
│           │   └── catalogs/    # en-GB (source), pt-PT, pt-BR, es, fr, de, it (TS modules)
│           ├── lib/
│           │   ├── storage.ts   # localStorage keys, defaults, bio merge/remove, export/import
│           │   ├── models.ts    # live model listing (ai.models.list)
│           │   ├── gemini.ts    # SDK call + retry (prompt/schema/parsing come from core)
│           │   └── units.ts     # locale-aware number/date formatting (delegates to core)
│           ├── hooks/
│           │   ├── useStore.tsx # global store + persistence + generatePlan
│           │   └── useInstallPrompt.ts
│           ├── components/      # TabBar/Sidebar, Field, dialogs, charts, meal cards, icons
│           └── screens/         # Welcome, Onboarding, Today, Plan, Shopping, Progress, EditData, Settings
└── packages/
    └── core/                    # @nutribio/core — pure domain logic (see §3.1)
        ├── package.json         # no runtime dependencies, source-only exports
        ├── tsconfig.json        # ES2022 only (no DOM, no Node types)
        └── src/
            ├── types.ts, locales.ts, countries.ts, calculations.ts, mealTimes.ts,
            ├── plan.ts, shopping.ts, hash.ts, errors.ts, format.ts,
            ├── prompt.ts, schema.ts, normalize.ts
            └── index.ts         # barrel
```

### 3.1 `packages/core` boundaries (DECISIONS #35)

- **Pure logic only**: domain types, locale definitions (`resolveLocale`,
  labels, language names), countries, calculations, meal slots/plan helpers,
  shopping aggregation, FNV-1a hash, `describeError`, `formatNumber`, the
  Gemini prompt builder, the JSON schema and the response normalizers.
- **No runtime dependencies** (no i18next, no `@google/genai`, no React) and
  **no DOM/Node globals** (tsconfig `lib: ES2022`, `types: []`) so the same
  code runs in the browser and in the future Nuxt server.
- **No hidden state**: anything locale-dependent takes the locale explicitly
  (`buildPrompt({locale})`, `formatNumber(…, intlLocale)`), and translated
  labels take an injected translator `Translate` (`computeTargets(input, t)`,
  `mealLabel(id, t)`, `normalizeWeek(raw, t)`). The mutable active-locale
  tracker stays in `apps/web/src/i18n/locales.ts` (module state would leak
  across requests on a server).
- **Errors are codes**: `PlanParseError { code }` (`emptyResponse`,
  `unparseable`, `badResponse`, `emptyPlan`) — the web maps them to
  `errors.*` i18n keys.
- The package is consumed as **TypeScript source** (`exports: "./src/index.ts"`)
  by Vite and, later, Nitro; `apps/web`'s build runs `tsc --noEmit` on it too.

Unless stated otherwise, module paths in the rest of this document are relative
to `apps/web/`; modules that live in the shared package are written as
`packages/core/src/...` (or `@nutribio/core` when imported).

## 4. Data model & storage

Storage keys (see `src/lib/storage.ts`): `nutribio.v1.profile`,
`nutribio.v1.biometrics`, `nutribio.v1.plan`, `nutribio.v1.settings`,
`nutribio.v1.schemaVersion` (currently 1).

### Profile (`packages/core/src/types.ts`)
```ts
interface Profile {
  name: string;
  sex: 'male' | 'female';
  age: number;
  height: number;        // cm
  initialWeight: number; // kg
  goal: 'maintain' | 'lose_fat' | 'lose_weight' | 'gain_mass';
  country: CountryCode;  // ISO alpha-2 from SUPPORTED_COUNTRIES (packages/core/src/countries.ts)
  exercise: {
    active: boolean;
    frequency: 'none' | '1_2' | '3_4' | '5_6' | '7';   // sessions/week
    intensity: 'low' | 'moderate' | 'high';
    type: 'cardio' | 'strength' | 'mixed' | 'other';
    workoutTime?: string;  // "HH:MM" (24h); empty when not set/inactive
  };
  supplements: {
    wheyProtein: boolean;  // include whey protein in the plan (DECISIONS #32)
    creatine: boolean;     // include creatine monohydrate in the plan
  };
  excludedFoods: string;   // free text, empty = none
  observations: string;    // free text (nutritionist instructions)
  updatedAt: number;
}
```
`loadProfile()` normalizes profiles saved before
`excludedFoods`/`observations`/`workoutTime`/`country`/`supplements` existed
(fills `''`/`false`; country is preselected from the device region/locale).
Any code that writes a profile must carry
`excludedFoods`/`observations`/`country`/`supplements` through (see
DECISIONS #11, #26, #32) and set `workoutTime` (see DECISIONS #18).

### Biometrics
```ts
interface BioRecord {
  date: string;            // yyyy-mm-dd
  weight?: number; bodyFat?: number; water?: number; bmr?: number;
  visceralFat?: number; bmi?: number; muscle?: number; protein?: number;
  boneMass?: number; bodyAge?: number; idealWeight?: number;
}
interface BiometricsState { latest: BioRecord | null; history: BioRecord[]; }
```
- `mergeBioRecord`: insert/replace by `date` (dedupe), history sorted asc.
- `removeBioRecord`: remove by `date`; `latest` falls back to the newest one.

### Plan (cached generation)
```ts
interface Plan {
  generatedAt: number;
  inputsHash: string;            // FNV-1a of {profile, latest, locale} — cache key
  locale: string;                // locale the plan content was generated in
  profileSnapshot: Profile;
  biometricsSnapshot: BioRecord | null;
  targets: NutritionTargets;     // see §5
  week: DayPlan[];               // 7 entries (monday..sunday)
  overview?: string;             // Gemini's short plan summary
}
interface DayPlan { day: 'monday' | ... | 'sunday'; meals: MealSlot[]; }
interface MealSlot {
  id: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner';
  label: string; timeWindow: string;        // e.g. "06:00 – 09:59"
  variations: Dish[];                        // 3 per meal
  selectedIndex: number;                     // user's chosen variation
}
interface Dish {
  name: string; description?: string;
  ingredients: { item: string; amountGrams: number; unit?: string }[];
  macros?: { kcal: number; protein: number; carbs: number; fat: number };
  notes?: string;
}
```

### Settings
```ts
interface Settings {
  geminiApiKey: string;
  model: string;
  locale: 'auto' | Locale;  // app language; 'auto' follows the device
}
```
Defaults: `model = 'gemini-2.5-flash'`; `MODEL_OPTIONS` (static fallback):
`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3-flash-preview`,
`gemini-3-pro-preview`.

## 5. Calculations (`packages/core/src/calculations.ts`)

All numbers are computed locally; the Gemini prompt receives them.

- **BMR Mifflin-St Jeor**: male `10w + 6.25h − 5a + 5`, female `… − 161`.
- **BMR Harris-Benedict (revised)**: male
  `88.362 + 13.397w + 4.799h − 5.677a`, female `447.593 + 9.247w + 3.098h − 4.330a`.
- **BMR average** = mean of both → used for TDEE.
- **Activity factor**: `none` 1.2 · `1_2` 1.375 · `3_4` 1.55 · `5_6` 1.725 ·
  `7` 1.9; intensity adjusts: `low −0.075`, `moderate 0`, `high +0.1`
  (min 1.2). Inactive users always use the base factor.
- **TDEE** = BMR × factor.
- **Goal calorie range** (×TDEE, min/target/max):
  maintain 0.95/1.00/1.05 · lose_fat 0.80/0.84/0.90 · lose_weight
  0.75/0.78/0.84 · gain_mass 1.05/1.12/1.20.
- **Protein** g/kg: maintain 1.8 · lose_fat 2.0 · lose_weight 2.2 ·
  gain_mass 2.0.
- **Fat**: 27% of target kcal ÷ 9; **saturated fat cap 20 g/day** (constant).
- **Carbs**: `(kcal − protein×4 − fat×9) ÷ 4`.
- **Meal split** (percent of day): breakfast 20 · morning snack 10 · lunch 30 ·
  afternoon snack 15 · dinner 25. Per-meal gram targets are passed to Gemini.
- **Effective weight**: latest bioimpedance weight, else `profile.initialWeight`.

Labels used in the UI are i18n **keys** here (`GOAL_LABEL_KEYS`,
`SEX_LABEL_KEYS`, `FREQUENCY_LABEL_KEYS`, `INTENSITY_LABEL_KEYS`,
`EXERCISE_TYPE_LABEL_KEYS`) — translated at render / prompt build time.
`computeTargets(input, t)` / `computeTargetsFromProfile(profile, weight, t)`
take the translator because `targets.mealSplit[].label` is a translated meal
name; the web passes `coreT` (`apps/web/src/i18n/translate.ts`).

## 6. Gemini integration (`packages/core/src/{prompt,schema,normalize}.ts` + `apps/web/src/lib/gemini.ts`)

### Flow (`useStore.generatePlan` → lazy `import('../lib/gemini')`)
1. Guard: profile + targets exist.
2. Compute `inputsHash` (FNV-1a over `{profile, biometrics.latest, locale}`).
3. `generateWeeklyPlan({apiKey, model, profile, bio, targets, weightKg})`:
   - builds the prompt with the core `buildPrompt({profile, bio, targets,
     weightKg, locale, t})` (exported for testing);
   - calls `ai.models.generateContent` with
     `responseMimeType: 'application/json'` + `responseJsonSchema` (structured
     output, core `PLAN_SCHEMA`), `temperature: 0.7`,
     `maxOutputTokens: 65536`;
   - up to **2 attempts** (stage keys `generation.stage.generating` /
     `generation.stage.retrying`, translated by the UI);
   - core `parsePlanResponse(text, t)` → `extractJson` (plain JSON / fenced
     code blocks / first `{…}` span) → `normalizeWeek` (drops unknown
     days/slots, keeps max 4 variations, fills missing slots with empty
     variations) + `normalizeShoppingItems`; unusable output raises
     `PlanParseError` with a **code**, which the web maps to `errors.<code>`
     and rethrows as `GeminiError`;
   - returns `{week, overview, locale, shoppingItems}` (the active locale the
     content was generated in).
4. `assemblePlan(..., locale)` builds and stores the `Plan` with
   `generatedAt`, `inputsHash`, `locale`, snapshots, targets and the Gemini
   `overview`.

### Prompt structure (English instructions, localized output — DECISIONS #25/#26)
The instructions and JSON-schema descriptions are written in **English**
(most reliable across models). Sections: user profile (sex/age/height/weight/
goal/exercise — labels resolved in the active locale; the **name is NOT sent**,
minimization per DECISIONS #29) → **country of residence** ("The user lives in
{Country}… prioritize ingredients typical of / commonly found in supermarkets
in {Country}" + `COUNTRY_CUISINE_HINTS[country]`) → bioimpedance (latest) →
`Calculations (already done — use these values, do NOT recalculate)` →
`Calorie distribution per meal` → `## Workout` (only when active + time set:
workout time + pre/post-workout meal labels) → **`## Supplements`** (always
present — DECISIONS #32: opted-in whey/creatine are included with precise
grams per serving; both off → "the user does NOT take supplements… build the
plan from whole foods only") → `User restrictions and
preferences` (only when non-empty: excluded foods — "NEVER include any of
these foods in any dish"; observations) → **`Output language (MANDATORY)`**
("Write ALL human-readable content … in {LanguageName} ({locale}). Food and
product names must be the ones a shopper finds in {Country}") → `Mandatory
rules` (14 rules; rules 4–5 prefer country-typical protein sources and staple
carbs; rule 14 follows the Supplements section) → "Return ONLY the JSON in
the given schema."

### Workout time & pre/post-workout meals (`packages/core/src/mealTimes.ts`)
- `parseTimeToMinutes("HH:MM") → number | null`.
- `workoutMealIds(minutes) → { preId, postId }`: `preId` = the meal slot whose
  window contains the workout time; if the time falls outside all windows
  (night), the last slot that ended before it; null if none. `postId` = the
  next slot after `preId`; if `preId` is null (workout before breakfast), the
  first meal of the day; null if there is no next slot.
- `workoutBadgeFor(mealId, workoutMeals) → 'pre' | 'post' | null` (translated
  at render via `badge.pre` / `badge.post`).
- The store derives `workoutMeals` from `profile.exercise` (only when active +
  valid time). MealCard/Today/Plan render the badges; the prompt receives the
  same derivation. Changing the time invalidates the plan hash (DECISIONS #18).

### JSON schema (`PLAN_SCHEMA`)
Top level `{ overview?: string, week: DayPlan[], shoppingItems?: ShoppingItem[] }`;
each day `{ day, meals }`; each meal `{ slot, variations: 3× Dish }`; dish
`{ name, description?, ingredients[{item, amountGrams, shoppingKey?,
rawGrams?, unit?}], macros{kcal,protein,carbs,fat}, notes? }`; shopping item
`{ key, name, category, unitWeightGrams?, packageGrams?, packageLabel? }`
(categories: `produce | meat_fish | dairy_eggs | bakery_grains | pantry |
frozen | drinks | other`). `normalizeWeek` accepts 3–4 variations
defensively; `normalizeShoppingItems` dedupes by key and falls back to
`other` for unknown categories. All schema descriptions are in English and
instruct the model to write content in the required output language.

### Shopping list (`packages/core/src/shopping.ts`, DECISIONS #27)
`buildShoppingList(week, shoppingItems)` sums `rawGrams` (fallback
`amountGrams`) per canonical item across ALL dish variations — the list is a
**suggestion** (the UI shows which dishes use each item and the disclaimer
tells the user to buy only what they will cook). Rows are sorted by
category (SHOPPING_CATEGORY_ORDER) then name, with practical quantity labels
(`quantityLabel`: packages via `packageGrams`, count via `unitWeightGrams`,
else grams/kg) and dish references (day · meal · dish · grams). Ingredients
without a valid `shoppingKey` fall into an "other" pseudo-item keyed by raw
name. The store keeps `shoppingChecks` (bought item keys) persisted per plan
hash (`nutribio.v1.shoppingChecks`) — reset when a new plan is generated.

### Errors
Core raises `PlanParseError` with a **code** (`emptyResponse`, `unparseable`,
`badResponse`, `emptyPlan`); `apps/web/src/lib/gemini.ts` translates the code
to the `errors.<code>` i18n key and rethrows it as `GeminiError`, which also
covers missing key and repeated failures. The store surfaces
`generationError` to the UI. Real API errors are NOT swallowed:
`describeError()` (`packages/core/src/errors.ts`) extracts a readable message
from the SDK's errors (including the embedded API JSON body, e.g. "400
INVALID_ARGUMENT: API key not valid"), and `generateWeeklyPlan` rethrows
`GeminiError(t('errors.apiFailed', {detail}))` so the global toast shows the
cause. The Settings model-list status line shows the real error too, and
falls back to the static list when the API returns nothing compatible
(DECISIONS #20).

### i18n runtime (`src/i18n/`)
- Locales: `pt-PT`, `pt-BR`, `en-GB` (fallback), `es`, `fr`, `de`, `it`.
  `resolveLocale(navigator.languages)`: `pt-BR`→pt-BR, any other `pt-*`→pt-PT,
  `en-*`→en-GB, es/fr/de/it match, else en-GB. Override stored in
  `settings.locale` (`'auto' | Locale`). The pure definitions
  (`LOCALES`, `resolveLocale`, label/language maps, `normalizeLocaleSetting`)
  live in `packages/core/src/locales.ts`; `src/i18n/locales.ts` re-exports
  them and owns the mutable **active locale** tracker used by the UI.
- `src/i18n/translate.ts` exports `coreT`, the `Translate` adapter that binds
  core label lookups to i18next (used by `useStore`, Today, EditData and the
  Gemini wrapper).
- Catalogs: TS modules in `src/i18n/catalogs/` (313 keys each); en-GB is the
  source of truth and is statically imported; the other six are lazy chunks.
- i18next v26 registers resources only via `init({resources})` (no
  `addResourceBundle`), so `changeLocale` loads the catalog and **re-runs
  init** with all loaded catalogs, then `changeLanguage` (DECISIONS #31).
- `main.tsx` awaits `initI18n(loadSettings().locale)` before the first render;
  `<html lang>` follows the active locale; `units.ts` and `NumberInput` use
  the active locale's decimal separator (input still accepts comma or dot).
  `units.ts` delegates number formatting to core `formatNumber`.
- `npm run i18n:check -w @nutribio/web` (`apps/web/scripts/check_i18n.mjs`,
  esbuild-based) enforces key parity + interpolation placeholders across all
  7 catalogs; chained into `npm run build -w @nutribio/web`.

### Countries (`packages/core/src/countries.ts`)
`SUPPORTED_COUNTRIES = [PT, BR, ES, FR, DE, IT, NL, BE, IE, AT, LU, GB]`
(curated list, DECISIONS #26). `Profile.country` is required — collected in
onboarding step 1, editable in Dados, carried through every profile write;
old profiles are normalized (preselected from device region / app locale via
`defaultCountryFor(candidates, locale)` — the locale is explicit in core).
Names via `Intl.DisplayNames` in the active locale.
The country drives the prompt cuisine hints (now) and will drive Stripe
currency (item 3) and legal regime (item 5).

## 7. Live model listing (`apps/web/src/lib/models.ts`)

- `fetchAvailableModels(apiKey)` → `ai.models.list({config: {pageSize: 100}})`
  iterated with `for await` (paginated), then `filterModels`.
- `filterModels`: keeps `name.startsWith('models/')` + short name matches
  `gemini` (case-insensitive) + `supportedActions` includes
  `'generateContent'`; dedupes; sorts alphabetically; returns
  `{value, label}` (short name — what `generateContent` accepts).
- Used by Settings (lazy import, refetch on key change / "Atualizar" button);
  falls back to static `MODEL_OPTIONS` without a key or on error.

## 8. State management (`apps/web/src/hooks/useStore.tsx`)

React Context (`StoreProvider` + `useStore`). State: `profile`,
`biometrics`, `plan`, `settings` (+ `isGenerating`, `generationStage`,
`generationError`). Every state change is persisted to localStorage via
effects. Derived: `targets` (recomputed from profile + latest weight),
`inputsHash`, `planIsCurrent` (`plan.inputsHash === inputsHash`).

Actions: `saveProfile` (bumps `updatedAt`), `saveBioRecord`,
`removeBioRecord`, `saveSettings`, `setSelectedVariation(day, slot, index)`,
`toggleShoppingItem(key)` (bought marks for the shopping list, persisted per
plan hash), `generatePlan()` (async; returns boolean; lazy-loads the SDK;
stores the plan with its locale and shopping catalog), `dismissGenerationError`,
`resetAll` (clears localStorage but **keeps the language preference** — a
device setting, not personal data). The inputs hash includes the **active
locale** (language change → stale plan).

## 9. Screens & flows

### App shell (`App.tsx`)
- Gate order: `Welcome → Onboarding → (Settings overlay) → Shell`.
- `!welcomeDone` → `<Welcome/>` (DECISIONS #33). The flag is a local state
  initialized from `!!profile` and **not persisted**: the landing screen shows
  while there is no profile, and comes back naturally after "Apagar todos os
  dados" (reset → reload → no profile).
- `!onboardingDone` → `<Onboarding/>` (flag initialized from `!!profile`;
  onboarding owns its confirm dialog — see DECISIONS #7). Onboarding's step 1
  "Voltar" calls `onBack` → `setWelcomeDone(false)`.
- `settingsOpen` → `<Settings/>` overlay.
- Otherwise the active tab renders inside `div.min-h-dvh.md:pl-64` with
  `<Sidebar/>` (desktop) and `<TabBar/>` (mobile).
- `newMeasurementSignal` counter: Progress' "Registrar medição" increments it
  and switches to the Dados tab, where EditData clears the bio form.
- `<GenerationFeedback/>` renders in every branch (including welcome,
  onboarding and settings): global loading overlay + result toast for plan
  generation.

### Welcome (`screens/Welcome.tsx`)
- In-app landing screen (not SEO-indexable — navigation is state-based), shown
  on first use only; pure presentation (no writes, no API calls).
- Header: brand + compact language `<select>` (`auto` + the 7
  `LOCALE_LABELS`); changing it does `saveSettings({locale})` +
  `changeLocale(locale)`, so the copy switches immediately and the choice
  survives reload/reset (same behavior as Settings).
- Hero: value proposition + "Começar" CTA (both hero and bottom CTA call
  `onStart`) + right-hand "your week at a glance" card (4 stats) on `md+`.
- "Como funciona": 3 numbered cards (data → local calculations → AI plan).
- "O que tens": 4 feature cards (Today, workout meals, progress, shopping).
- Privacy summary (data stays on device, key never leaves it, name not sent to
  Gemini) + health disclaimer ("não é aconselhamento médico"). The full legal
  documents/link and the pricing teaser arrive with items 5 and 3; the
  "Já tenho conta" CTA arrives with the auth phase (Wave 6).
- Illustrations are inline SVG icons from `components/icons.tsx` (no images,
  no new dependencies). Responsive per DECISIONS #8.

### Onboarding (`screens/Onboarding.tsx`) — 3 steps
1. **Dados básicos**: name, sex (chips), age/height/initial weight (number
   inputs), goal (chips), **country (select, preselected from the device)**,
   **supplements (two checkboxes: whey protein, creatine — DECISIONS #32)**,
   exercise toggle (frequency/intensity/type + workout time `<input
   type="time">` when active), and the optional Gemini API key field (password
   + show/hide; saved to `settings` on commit). Footer: "Voltar" (only when
   `onBack` is provided — returns to Welcome, discarding the form) +
   "Continuar" (requires `basicValid`).
2. **Dados da balança** (optional): 11 bioimpedance fields; "Saltar este
   passo (opcional)" or "Continuar".
3. **Preferências da dieta**: two textareas (`excludedFoods`,
   `observations`); "Voltar" / "Concluir" / skip.
- Finish → `saveProfile` + `saveBioRecord` (only if any bio field filled) →
   `ConfirmDialog` "Gerar o plano agora?" → generate or "Mais tarde" →
   `onDone()`.

### Today (`screens/Today.tsx`)
- Greeting by hour + name; date; gear → Settings.
- Stale-plan banner ("Os teus dados mudaram") with "Gerar novo plano" button.
- No plan → empty state with "Gerar plano semanal" (error toast if no key).
- **Current meal**: matched by time window (`currentMealSlot`); big dish card
  with ingredients (grams) + macros chips; swipe (touch deltaX > 40) or
  `DishSwitcher` arrows/dots to change variation; notes box.
- Right column (desktop) / below (mobile): **"Hoje" macro bars** (kcal,
  protein, carbs, fat vs daily targets from the *selected* variations) and
  **"Próximas refeições"** list (slot, start time, dish preview).
- Desktop grid: current meal `xl:col-span-2` + right column.

### Plan (`screens/Plan.tsx`)
- Header: generatedAt; Gemini overview card (emerald).
- Day selector chips (Monday-first, default = today, marks "hoje").
- Grid: **Totais vs alvo** (MacroBars of the selected day) left; meal cards
  right (`md:grid-cols-2`), each with an inline variation picker (persisted
  via `setSelectedVariation`).
- "Outros dias" quick-preview list (2–3 columns on desktop).
- No plan → empty state with generate CTA.

### Shopping (`screens/Shopping.tsx`)
- Weekly shopping list aggregated from the plan (item 7, DECISIONS #27).
- Suggestion disclaimer (covers all variations; buy only what you'll cook).
- Grouped by supermarket section (8 categories, translated), per-item
  "bought" checkbox + "hide bought" toggle, expandable "used in" list
  (day · meal · dish · grams), Copy (plain text) and Share (Web Share API
  with copy fallback).
- Empty states: no plan → generate CTA; plan without `shoppingItems` (old
  cached plan) → prompt to regenerate (still confirm-gated, DECISIONS #6).
- Desktop: multi-column grid; mobile: stacked.

### Progress (`screens/Progress.tsx`)
- Metric chips: Peso, Gordura corporal, IMC, Músculo, Água, Proteína.
- `<2 points` → empty-state card ("Ainda sem dados"/"Precisas de mais
  medições") with "Registrar medição" CTA; else Chart.js line chart + "última
  medição" value.
- Right column: latest-measurement chips. Below: history list (date + key
  values). Desktop: chart 2/3 + chips 1/3; history 2 columns.

### EditData / "Dados" (`screens/EditData.tsx`)
- **Resumo dos cálculos** (live): both BMRs, TDEE, goal calorie range,
  protein/carbs/fat/saturated — recomputed from the form on every change.
- **Perfil**: name, sex, age, height, initial weight, country (select),
  supplements (two checkboxes); all must be carried through on every
  profile write.
- **Objetivo e exercício**: goal chips + exercise toggle/frequency/intensity/
  type + workout time (time input; drives the pré/pós-treino badges).
- **Bioimpedância**: date + 11 fields (prefilled from latest); "Nova medição"
  (clears), "Usar última medição" (refills); below, the **history list** with
  edit (loads the record into the form) and delete (danger ConfirmDialog).
- Save → `saveProfile` (must carry `excludedFoods`/`observations` through!)
  + `saveBioRecord` if any bio field → ConfirmDialog "Gerar novo plano agora?"
  ("Sim, gerar plano" / "Só guardar").
- Desktop: summary full-width; Perfil + Objetivo side by side; bio fields in
  3 columns.

### Settings (`screens/Settings.tsx`)
- **Idioma**: language select (`auto` = device language, or one of the 7
  locales); switches immediately and persists to `settings.locale`.
- **Gemini**: API key (password + show/hide, saved per keystroke to
  localStorage), model `<select>` populated live from `models.ts` (see §7)
  with status line + "Atualizar" button, "(personalizado)" entry only if the
  saved model is not in the list.
- **Preferências da dieta**: the two textareas (excluded foods +
  observations), saved on change.
- **Aplicação**: install button (`useInstallPrompt`), HTTPS note.
- **Os teus dados**: export/import JSON backup, "Apagar todos os dados"
  (danger confirm → `resetAll` + reload).

## 10. Components

- `NumberInput` — draft-string decimal input (DECISIONS #9); comma or dot.
- `TextArea/TextInput/Select/ChipGroup/Field` — form primitives.
- `ConfirmDialog` — modal with `busy` state and danger variant.
- `MacroBar` — value/target progress bar (color-coded).
- `MealCard` + `MacroChips` — meal slot display; optional variation picker;
  optional `badge` prop ("Pré-treino"/"Pós-treino" chip, driven by
  `workoutBadgeFor`).
- `DishSwitcher` — arrows + dots + counter.
- `ChartBlock` — Chart.js line (registered once, offline-safe).
- `TabBar`/`Sidebar` — share the `TABS` config.
- `GenerationFeedback` — global generation feedback: loading overlay while
  `isGenerating` + success/error toast (with "Ver plano"/"Tentar de novo"
  actions). Rendered in App for every branch (tabs, onboarding, settings);
  the single channel for generation feedback (DECISIONS #19).
- `icons.tsx` — inline SVG icon set (stroke style).

## 11. PWA & responsive

- `vite-plugin-pwa` `registerType: 'autoUpdate'`, generateSW; precaches
  `**/*.{js,css,html,svg,png,woff2}`; `navigateFallback: 'index.html'`
  (relative, so it resolves inside the service-worker scope under any base).
- Manifest: standalone, portrait, pt-PT, theme `#059669`, background
  `#f6f8f7`, icons 192/512 + maskable (generated by
  `scripts/generate_icons.py`); `start_url`/`scope`/icon `src` are prefixed
  with the Vite `base` (see §12).
- `main.tsx` registers the SW (`virtual:pwa-register`, `immediate: true`).
- Install requires HTTPS (or localhost); the user tests on a phone through a
  `loca.lt` tunnel (`nbio.loca.lt`) — `server.allowedHosts` is restricted to
  that host on purpose (DECISIONS #14).
- Responsive breakpoints: mobile < 768px (TabBar, stacked); desktop `md+`
  (Sidebar + `max-w-6xl` grids) — see DECISIONS #8.

## 12. Deployment (GitHub Pages)

The site is deployed as a GitHub Pages **project site** at
`https://<user>.github.io/nutribio/` (base path `/nutribio/`).

- `vite.config.ts` sets `base = process.env.BASE_PATH || '/'` — local dev and
  root deployments keep working without flags; the CI workflow builds with
  `BASE_PATH=/nutribio/`.
- The PWA manifest follows the base (`start_url`, `scope`, icon `src` are
  prefixed with `base`). `index.html` links the manifest and icons with
  relative (`./`) URLs because Vite does not rewrite root-absolute `/` links
  to `public/` assets. `navigateFallback` is relative so it resolves inside
  the service-worker scope.
- `.github/workflows/deploy.yml` runs on push to `main` (and manually via
  `workflow_dispatch`): `npm ci` (root, whole monorepo) →
  `npm run build -w @nutribio/web` (with `BASE_PATH`) →
  `actions/upload-pages-artifact` (`apps/web/dist`) → `actions/deploy-pages`.
- GitHub Pages must be configured with Source = **GitHub Actions**.
- `public/.nojekyll` disables Jekyll processing (safety net for branch-based
  deploys).
- No `404.html` SPA fallback is needed: navigation is state-based (tabs), no
  client-side router, no deep links.
- The Gemini API key is never part of the deployment: it stays in
  `localStorage`, entered in Definições (DECISIONS #3).

## 13. Testing & verification

- `npm run build -w @nutribio/web` — i18n parity check + `tsc --noEmit` on
  `packages/core` (no DOM/Node libs) + strict TS on the web app + production
  build (output in `apps/web/dist/`); also check the chunk layout (the Gemini
  SDK, the prompt/schema/normalize code and the 6 lazy catalogs must stay out
  of the main bundle — the prompt lands in the lazy `gemini` chunk).
- `npm run typecheck -w @nutribio/core` — core-only type check.
- Pure-logic tests: bundle a scratch entry with
  `npx esbuild <file> --bundle --format=cjs --platform=node` and run with
  node (used previously for `normalizeWeek`, `computeTargets`, `filterModels`,
  `buildPrompt`). Use `--format=cjs` because `@google/genai` needs CJS. The
  scratch entry must live inside the repo (or next to a `node_modules`
  symlink) so package imports resolve.
- Golden-equivalence checks (used for the 4.2 extraction): snapshot the
  outputs of the pure functions before/after a refactor (targets, prompt text
  per locale, `inputsHash`, normalization, shopping aggregation, meal-time
  helpers) and diff them — a byte-identical result proves no behavior change.
- UI flows (verified historically with browser-harness CDP against the dev
  server): onboarding 3 steps + skip, confirm-dialog gating, calculations
  summary values, bioimpedance history add/edit/delete, model dropdown
  fallback (no key / invalid key), responsive layouts at 390×844 and
  1440×900, PWA manifest + SW registration in preview.
- The real Gemini generation path requires a valid API key (user-provided).

## 14. Known limitations & notes

- The plan is regenerated as a whole; there is no per-meal regeneration.
- Gemini output is validated but not nutritionally re-verified — the prompt
  instructs the model to respect targets, but calories/macros in dishes are
  approximate (the UI compares selected-day totals vs targets).
- `supportedActions` may be empty for some listed models; `filterModels`
  discards them (only `generateContent` models are usable anyway).
- Export/import is a raw JSON dump of all keys; versioned via
  `schemaVersion` for future migrations.
