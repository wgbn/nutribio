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
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| AI | `@google/genai` ^2.x (lazy-loaded) |
| Charts | chart.js + react-chartjs-2 |
| PWA | `vite-plugin-pwa` (generateSW, autoUpdate) |
| Icons (PNG) | Python + PIL script (`scripts/generate_icons.py`) |
| Deployment | GitHub Pages project site (`/nutribio/`) via GitHub Actions |
| UI language | pt-PT · Code language: English |

## 3. Project structure

```
nutribio/
├── AGENTS.md                    # agent entry point + critical decisions
├── docs/
│   ├── ARCHITECTURE.md          # this file
│   └── DECISIONS.md             # decision log (ADR-style)
├── index.html                   # viewport-fit=cover, manifest, apple meta
├── vite.config.ts               # react + tailwind + VitePWA + base + allowedHosts
├── .github/workflows/deploy.yml # build + deploy to GitHub Pages (push to main)
├── package.json / tsconfig.json
├── public/icons/                # icon-192/512.png, maskable-512.png
├── scripts/generate_icons.py    # PWA icon generator (PIL)
└── src/
    ├── main.tsx                 # React root + SW registration + schema check
    ├── App.tsx                  # onboarding gate, tab/sidebar routing, settings overlay
    ├── index.css                # Tailwind v4 theme + global styles
    ├── types.ts                 # all domain types
    ├── lib/
    │   ├── calculations.ts      # BMR/TDEE/targets/meal split + labels
    │   ├── storage.ts           # localStorage keys, defaults, bio merge/remove
    │   ├── gemini.ts            # prompt builder + generateWeeklyPlan + normalizeWeek
    │   ├── models.ts            # live model listing (ai.models.list)
    │   ├── plan.ts              # assemblePlan, SLOT_ORDER/WEEK_ORDER, totals
    │   ├── mealTimes.ts         # 5 meal slots, time windows, next-meal helpers
    │   ├── hash.ts              # FNV-1a
    │   └── units.ts             # pt-PT number/date formatting
    ├── hooks/
    │   ├── useStore.tsx         # global store + persistence + generatePlan
    │   └── useInstallPrompt.ts  # beforeinstallprompt + standalone detection
    ├── components/
    │   ├── TabBar.tsx           # mobile bottom nav (TABS shared with Sidebar)
    │   ├── Sidebar.tsx          # desktop nav (md+)
    │   ├── Field.tsx            # Field, TextInput, NumberInput, TextArea, Select, ChipGroup
    │   ├── ConfirmDialog.tsx    # modal dialog (primary/danger, busy state)
    │   ├── ChartBlock.tsx       # Chart.js line chart wrapper
    │   ├── DishSwitcher.tsx     # variation arrows + dots
    │   ├── MacroBar.tsx         # progress bar vs target
    │   ├── MealCard.tsx         # meal slot card + MacroChips + variation picker
    │   └── icons.tsx            # inline SVG icon set (no icon dep)
    └── screens/
        ├── Onboarding.tsx       # 3-step wizard
        ├── Today.tsx            # "Hoje" — meal of the moment
        ├── Plan.tsx             # weekly view
        ├── Progress.tsx         # charts + history
        ├── EditData.tsx         # "Dados" — all forms + calc summary
        └── Settings.tsx         # "Definições" overlay
```

## 4. Data model & storage

Storage keys (see `src/lib/storage.ts`): `nutribio.v1.profile`,
`nutribio.v1.biometrics`, `nutribio.v1.plan`, `nutribio.v1.settings`,
`nutribio.v1.schemaVersion` (currently 1).

### Profile (`src/types.ts`)
```ts
interface Profile {
  name: string;
  sex: 'male' | 'female';
  age: number;
  height: number;        // cm
  initialWeight: number; // kg
  goal: 'maintain' | 'lose_fat' | 'lose_weight' | 'gain_mass';
  exercise: {
    active: boolean;
    frequency: 'none' | '1_2' | '3_4' | '5_6' | '7';   // sessions/week
    intensity: 'low' | 'moderate' | 'high';
    type: 'cardio' | 'strength' | 'mixed' | 'other';
    workoutTime?: string;  // "HH:MM" (24h); empty when not set/inactive
  };
  excludedFoods: string;   // free text, empty = none
  observations: string;    // free text (nutritionist instructions)
  updatedAt: number;
}
```
`loadProfile()` normalizes profiles saved before
`excludedFoods`/`observations`/`workoutTime` existed (fills `''`). Any code
that writes a profile must carry `excludedFoods`/`observations` through (see
DECISIONS #11) and set `workoutTime` (see DECISIONS #18).

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
  inputsHash: string;            // FNV-1a of {profile, latest} — cache key
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
interface Settings { geminiApiKey: string; model: string; }
```
Defaults: `model = 'gemini-2.5-flash'`; `MODEL_OPTIONS` (static fallback):
`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3-flash-preview`,
`gemini-3-pro-preview`.

## 5. Calculations (`src/lib/calculations.ts`)

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

Labels used in the UI live here too (`GOAL_LABELS`, `SEX_LABELS`,
`FREQUENCY_LABELS`, `INTENSITY_LABELS`, `EXERCISE_TYPE_LABELS`).

## 6. Gemini integration (`src/lib/gemini.ts`)

### Flow (`useStore.generatePlan` → lazy `import('../lib/gemini')`)
1. Guard: profile + targets exist.
2. Compute `inputsHash` (FNV-1a over `{profile, biometrics.latest}`).
3. `generateWeeklyPlan({apiKey, model, profile, bio, targets, weightKg})`:
   - builds the prompt (`buildPrompt`, exported for testing);
   - calls `ai.models.generateContent` with
     `responseMimeType: 'application/json'` + `responseJsonSchema` (structured
     output), `temperature: 0.7`, `maxOutputTokens: 65536`;
   - up to **2 attempts**;
   - `extractJson` handles plain JSON / fenced code blocks / first `{…}` span;
   - `normalizeWeek` validates and maps the response into `DayPlan[]`
     (drops unknown days/slots, keeps max 4 variations, fills missing slots
     with empty variations, throws `GeminiError` if nothing usable).
4. `assemblePlan(...)` builds and stores the `Plan` with `generatedAt`,
   `inputsHash`, snapshots, targets and the Gemini `overview`.

### Prompt structure (PT-PT)
`Perfil do utilizador` → `Dados de bioimpedância (última medição)` →
`Cálculos (já feitos — usa estes valores, não recalculas)` →
`Distribuição calórica por refeição` → **`## Treino`** (only when the user is
active and has a workout time: the time + "Refeição pré-treino: {label} —
reforça hidratos de digestão moderada e proteína" + "Refeição pós-treino:
{label} — reforça proteína e hidratos para recuperação") →
**`Restrições e preferências do utilizador`** (only when non-empty: excluded
foods — "NUNCA incluir estes alimentos em nenhum prato"; observations —
"considera estas indicações") → `Regras obrigatórias` (11 rules, incl. rule
11: respect exclusions and observations) → "Devolve APENAS o JSON no schema
indicado."

### Workout time & pre/post-workout meals (`src/lib/mealTimes.ts`)
- `parseTimeToMinutes("HH:MM") → number | null`.
- `workoutMealIds(minutes) → { preId, postId }`: `preId` = the meal slot whose
  window contains the workout time; if the time falls outside all windows
  (night), the last slot that ended before it; null if none. `postId` = the
  next slot after `preId`; if `preId` is null (workout before breakfast), the
  first meal of the day; null if there is no next slot.
- `workoutBadgeFor(mealId, workoutMeals) → 'Pré-treino' | 'Pós-treino' | null`.
- The store derives `workoutMeals` from `profile.exercise` (only when active +
  valid time). MealCard/Today/Plan render the badges; the prompt receives the
  same derivation. Changing the time invalidates the plan hash (DECISIONS #18).

### JSON schema (`PLAN_SCHEMA`)
Top level `{ overview?: string, week: DayPlan[] }`; each day `{ day, meals }`;
each meal `{ slot, variations: 3× Dish }`; dish `{ name, description?,
ingredients[{item, amountGrams, unit?}], macros{kcal,protein,carbs,fat},
notes? }`. `normalizeWeek` accepts 3–4 variations defensively.

### Errors
`GeminiError` for: missing key, empty response, unparseable JSON, empty plan,
repeated failures. The store surfaces `generationError` to the UI. Real API
errors are NOT swallowed: `describeError()` (`src/lib/errors.ts`) extracts a
readable message from the SDK's errors (including the embedded API JSON body,
e.g. "400 INVALID_ARGUMENT: API key not valid"), and `generateWeeklyPlan`
rethrows `GeminiError('A geração do plano falhou: ' + detail)` so the global
toast shows the cause. The Settings model-list status line shows the real
error too, and falls back to the static list when the API returns nothing
compatible (DECISIONS #20).

## 7. Live model listing (`src/lib/models.ts`)

- `fetchAvailableModels(apiKey)` → `ai.models.list({config: {pageSize: 100}})`
  iterated with `for await` (paginated), then `filterModels`.
- `filterModels`: keeps `name.startsWith('models/')` + short name matches
  `gemini` (case-insensitive) + `supportedActions` includes
  `'generateContent'`; dedupes; sorts alphabetically; returns
  `{value, label}` (short name — what `generateContent` accepts).
- Used by Settings (lazy import, refetch on key change / "Atualizar" button);
  falls back to static `MODEL_OPTIONS` without a key or on error.

## 8. State management (`src/hooks/useStore.tsx`)

React Context (`StoreProvider` + `useStore`). State: `profile`,
`biometrics`, `plan`, `settings` (+ `isGenerating`, `generationStage`,
`generationError`). Every state change is persisted to localStorage via
effects. Derived: `targets` (recomputed from profile + latest weight),
`inputsHash`, `planIsCurrent` (`plan.inputsHash === inputsHash`).

Actions: `saveProfile` (bumps `updatedAt`), `saveBioRecord`,
`removeBioRecord`, `saveSettings`, `setSelectedVariation(day, slot, index)`,
`generatePlan()` (async; returns boolean; lazy-loads the SDK),
`dismissGenerationError`, `resetAll` (clears localStorage).

## 9. Screens & flows

### App shell (`App.tsx`)
- `!onboardingDone` → `<Onboarding/>` (flag initialized from `!!profile`;
  onboarding owns its confirm dialog — see DECISIONS #7).
- `settingsOpen` → `<Settings/>` overlay.
- Otherwise the active tab renders inside `div.min-h-dvh.md:pl-64` with
  `<Sidebar/>` (desktop) and `<TabBar/>` (mobile).
- `newMeasurementSignal` counter: Progress' "Registrar medição" increments it
  and switches to the Dados tab, where EditData clears the bio form.
- `<GenerationFeedback/>` renders in every branch (including onboarding and
  settings): global loading overlay + result toast for plan generation.

### Onboarding (`screens/Onboarding.tsx`) — 3 steps
1. **Dados básicos**: name, sex (chips), age/height/initial weight (number
   inputs), goal (chips), exercise toggle (frequency/intensity/type + workout
   time `<input type="time">` when active), and the optional Gemini API key
   field (password + show/hide; saved to `settings` on commit). "Continuar"
   requires `basicValid`.
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
- **Perfil**: name, sex, age, height, initial weight.
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
  `workflow_dispatch`): `npm ci` → `npm run build` (with `BASE_PATH`) →
  `actions/upload-pages-artifact` (`dist`) → `actions/deploy-pages`.
- GitHub Pages must be configured with Source = **GitHub Actions**.
- `public/.nojekyll` disables Jekyll processing (safety net for branch-based
  deploys).
- No `404.html` SPA fallback is needed: navigation is state-based (tabs), no
  client-side router, no deep links.
- The Gemini API key is never part of the deployment: it stays in
  `localStorage`, entered in Definições (DECISIONS #3).

## 13. Testing & verification

- `npm run build` — strict TS + production build; also check the chunk layout
  (the Gemini SDK must stay out of the main bundle).
- Pure-logic tests: bundle a scratch entry with
  `npx esbuild <file> --bundle --format=cjs --platform=node` and run with
  node (used previously for `normalizeWeek`, `computeTargets`, `filterModels`,
  `buildPrompt`). Use `--format=cjs` because `@google/genai` needs CJS.
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
