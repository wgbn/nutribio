# Changelog — Nutribio

Every implementation or modification must add a dated entry here (newest
first). Related technical decisions live in [`DECISIONS.md`](./DECISIONS.md);
how the app works is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 2026-10-07 — Optional supplements (whey protein, creatine)

- `Profile.supplements = { wheyProtein, creatine }` (both default off; old
  profiles normalized in `loadProfile`). Two checkboxes added to onboarding
  step 1 ("Dados básicos") and to the Dados profile form, via a new reusable
  `Checkbox` primitive in `Field.tsx`. Every profile write carries
  `supplements` through (same rule as `country`/`excludedFoods`/
  `observations`).
- Gemini prompt: new `## Supplements` section + mandatory rule 14 — opted-in
  supplements are included with precise grams per serving (whey e.g.
  post-workout; creatine monohydrate 3–5 g/day); when both are off the model
  is explicitly instructed to use whole foods only (no whey/creatine).
- Toggling supplements changes the profile → new inputs hash → stale plan
  banner → user-confirmed regeneration (DECISIONS #6/#32).
- i18n: 4 new keys (`data.supplements*`) in all 7 catalogs, parity green.
- Verified: build + i18n:check; prompt unit test for the 4 combinations
  (none/whey/creatine/both + rule 14); browser test — Dados shows the two
  unchecked checkboxes (existing profile normalized to off).

## 2026-10-06 — Fix: shopping list missing after regenerating from any screen

Reported by the user: generating a new plan from the Today screen produced no
shopping list (only the button inside the Compras tab seemed to work).

- **Root cause**: `PLAN_SCHEMA.required` was only `['week']`, so `shoppingItems`
  was optional and Gemini could return a plan without the catalog — while the
  Compras tab hid the list entirely (`empty` state) instead of falling back.
  All generation buttons already called the SAME store action
  (`useStore().generatePlan()`); there were no two different actions.
- **Fix 1**: `shoppingItems` is now **required** in the Gemini JSON schema —
  structured output must include the catalog on every generation, from any
  screen.
- **Fix 2**: the Compras tab no longer shows a misleading "generate a new
  plan" empty state when the catalog is missing/empty: it renders the
  degraded list (ingredients fall back to an "other" group in
  `buildShoppingList`) with an informational banner (`shopping.basicNote`,
  replaced the unused `shopping.empty.*` keys in all 7 catalogs).
- **Fix 3**: unified all plain "generate plan" CTAs into a shared
  `GeneratePlanButton` component (Today stale banner + empty state, Plan
  empty state, Shopping no-plan state) — identical action, busy state and
  disabled handling; removed Today's redundant local `generatingNow` state.
  Onboarding/EditData keep their confirm-dialog flow (same action).
- Verified: `npm run build` + `i18n:check`; browser test — Compras tab now
  renders the aggregated list (40 items, grouped by section) instead of an
  empty state; Today/Plan/Shopping use the shared CTA.

## 2026-10-06 — Weekly shopping list ("Compras" tab, roadmap item 7)

- **Gemini schema/prompt**: the plan response now includes a top-level
  `shoppingItems` catalog (canonical purchasable items: `key`, `name`,
  `category` among 8 supermarket sections, optional `unitWeightGrams` /
  `packageGrams` / `packageLabel`) and each dish ingredient gains
  `shoppingKey` (reference into the catalog) + `rawGrams` (raw/purchase
  weight equivalent of cooked amounts). Prompt rules 12–13 enforce
  canonicalization, country-typical product names and raw-weight
  conversion; schema descriptions are in English with output in the user's
  language (rules are part of the English prompt from item 1.4).
- **Normalization**: `normalizeShoppingItems` (defensive: dedupe by key,
  unknown categories → `other`) and ingredient fields carried through
  `normalizeDish`; `generateWeeklyPlan` returns `shoppingItems`.
- **Aggregation** (`src/lib/shopping.ts`, deterministic, unit-tested):
  `buildShoppingList` sums `rawGrams` (fallback `amountGrams`) per canonical
  item across ALL variations, sorts by category then name, computes
  practical quantity labels ("≈ 2 × 500 g", "≈ 6", "≈ 1,1 kg", "≈ 120 g")
  and keeps the list of dishes (day · meal · dish · grams) using each item.
  Ingredients without a `shoppingKey` fall into an "other" group (graceful).
- **UI**: new "Compras" tab (5th tab in TabBar/Sidebar, new `CartIcon`),
  grouped by supermarket section (translated labels), suggestion disclaimer
  ("includes all variations — buy only what you'll cook"), per-item bought
  checkbox (persisted per plan hash under `nutribio.v1.shoppingChecks`,
  reset when a new plan is generated), "hide bought" toggle, expandable
  "used in" dish list, Copy (plain text grouped list) and Share (Web Share
  API with copy fallback). Old cached plans without shopping data show an
  empty state prompting a (user-confirmed) regeneration.
- New i18n keys in all 7 catalogs (`nav.shopping`, `shopping.*`, 26 keys;
  parity check stays green).
- Verified: `npm run build` + `i18n:check`; aggregation unit tests
  (duplicate keys summed, rawGrams used, package/unit/grams labels, "other"
  fallback); browser test of the new tab and empty state.

## 2026-10-06 — Multi-language support + country-aware cuisine (roadmap items 1 & 6)

The app now supports 7 locales and asks for the user's country, which steers
the Gemini prompt to country-typical ingredients. UI language follows the
app locale; cuisine follows the country (e.g. a Brazilian in Portugal gets a
pt-BR interface with Portuguese supermarket products).

- **i18n infrastructure** (`src/i18n/`): `locales.ts` (locale list,
  `resolveLocale` with pt-*→pt-PT / pt-BR→pt-BR / en-*→en-GB rules and en-GB
  fallback, active-locale tracking), `index.ts` (i18next runtime; en-GB
  statically imported as the guaranteed fallback, other catalogs lazy-loaded
  per locale — each is its own ~10 kB chunk, out of the main bundle).
  `Settings.locale: 'auto' | Locale` (normalized for old settings; kept on
  reset). Language selector in Definições switches immediately (re-init of
  i18next with the newly loaded catalog — i18next v26 has no post-init
  resource registration). `<html lang>` set dynamically. `npm run
  i18n:check` (scripts/check_i18n.mjs) enforces key parity + interpolation
  placeholders across all 7 catalogs and is chained into `npm run build`.
- **Catalogs** (252 keys each): en-GB (source), pt-PT (previous copy), pt-BR
  (real adaptation: você-form, "Café da manhã", "Configurações", "tela de
  início"…), es/fr/de/it (agent translations, pending native review).
- **String extraction**: all screens/components/domain labels are now i18n
  keys (`GOAL_LABEL_KEYS` etc. in `calculations.ts`, `MEAL_LABEL_KEYS`,
  `WEEKDAY_KEY`, badge kind `'pre'|'post'` in `mealTimes.ts`). `units.ts`
  formats with the active locale; `NumberInput` displays the locale's decimal
  separator while still accepting comma and dot. Generator errors and
  generation stages are i18n keys (`errors.*`, `generation.stage.*`).
- **Gemini prompt rewritten in English** (instructions + JSON-schema
  descriptions) with a mandatory **output-language block** (all
  human-readable content in the user's locale) and a **country-of-residence
  block** (`COUNTRY_CUISINE_HINTS` per country, replacing the PT-specific food
  rules). `Plan.locale` stored on generated plans; the locale is part of the
  plan inputs hash → changing the language marks the plan stale
  (regeneration stays user-confirmed, DECISIONS #6/#25).
- **Country (roadmap item 6)**: `Profile.country` (curated list
  `BR, PT, ES, FR, DE, IT, NL, BE, IE, AT, LU, GB` in `src/lib/countries.ts`),
  required in onboarding step 1 and editable in Dados; old profiles are
  normalized (preselected from device region/locale). Names via
  `Intl.DisplayNames`, sorted per active locale. Country drives cuisine
  (now) and later Stripe currency + legal regime (items 3/5).
- **Minimization (roadmap item 5.1, first code change)**: the profile **name
  is no longer sent to the Gemini prompt** (not needed to build a plan).
- Verified: `npm run build` (+ i18n parity check) passes; browser test —
  device pt-PT auto-detection, live switch pt→en→de→fr→auto without reload,
  saved preference survives reload, country select (12 options) in Dados,
  chunk layout (7 lazy catalog chunks + SDK out of main bundle).
- Note: existing cached plans become stale by design (new hash inputs:
  locale + country) — the "data changed" banner appears once and the user
  confirms a regeneration.

## 2026-10-06 — Improvement roadmap: tracking system + decision entries (#21–#30)

- Created `docs/roadmap/` — the tracking system for the 2026-10 improvements
  (approved plan): `README.md` (status table, execution waves, blocking
  non-code dependencies) plus one file per item with goal, research
  findings, decisions, open questions, phase checklists, verification and
  a progress log:
  `01-i18n`, `02-welcome`, `03-payments`, `04-backend-storage`,
  `05-legal-consent`, `06-country-cuisine`, `07-shopping-list`.
- `docs/DECISIONS.md`: appended #21–#30 recording the approved direction —
  backend era (monorepo + Nuxt API + Supabase EU; supersedes #1/#3/#13),
  freemium model (1 free generation, monthly subscription), auth (Google +
  email/password + OTP, 18+), i18n (7 locales, react-i18next, custom
  resolver; supersedes #15), profile country (cuisine/currency/legal
  regime), weekly shopping list (LLM canonicalization + local sum),
  offline cache model (`nutribio.v2` sync marker), consent framework
  (explicit health-data consent, no analytics, Gemini paid tier) and
  payments research (one Stripe PT account for EUR + BRL; Stripe Managed
  Payments preferred; accountant/lawyer reviews are blocking steps).
- `AGENTS.md` + `.devin/global_rules.md`: the mandatory workflows now
  include reading/updating the roadmap; hard constraints carry a note that
  they describe the shipped app and are superseded per roadmap phase.
- No application code changed in this entry.

## 2026-09-24 — Gemini key in onboarding + real API errors surfaced

- Onboarding step 1 ("Dados básicos") now includes the "Chave da API Gemini"
  field (password + show/hide, optional, hint pointing to
  aistudio.google.com/apikey). It is saved to `settings` before the
  "Gerar plano agora?" dialog, so the first generation can succeed right away.
- New `src/lib/errors.ts` with `describeError(err)`: extracts a readable
  message from the SDK's errors, including the API JSON body
  (`{error:{code,status,message}}` → "400 INVALID_ARGUMENT: API key not
  valid…").
- `generateWeeklyPlan` no longer hides the cause: the toast now shows
  "A geração do plano falhou: {real error}" instead of the generic message.
- Settings model-list flow: the status line shows the real error message
  (red, wrapped) instead of a boolean flag; if the API returns an empty
  compatible list it falls back to the static list with a note.

## 2026-09-23 — IDE lint config + onboarding cleanup

- Added `.vscode/settings.json` with `css.lint.unknownAtRules: "ignore"` —
  silences the false-positive "Unknown at rule @theme" warning (Tailwind v4
  at-rule, valid and processed by the build).
- Removed leftover blank lines in Onboarding after the error-block cleanup.

## 2026-09-23 — Global generation feedback (loading overlay + result toast)

- New `GenerationFeedback` component (rendered in App for every branch,
  including onboarding/settings): a full-screen overlay (spinner + stage text
  + hint) while `isGenerating`, and a toast when generation finishes.
- Success toast "Plano gerado com sucesso!" (with "Ver plano" action that
  switches to the Plan tab); error toast with the message + "Tentar de novo"
  action; auto-dismiss after 6 s; toast slide-in animation in `index.css`.
- Removed the now-duplicated per-screen generation feedback: Today's inline
  error box, EditData's generation notices and `generating` state, and
  Onboarding's inline `error` state/display. Generation feedback now has a
  single global channel.

## 2026-09-23 — Workout time + dynamic pré/pós-treino badges

- `Exercise` gained `workoutTime` ("HH:MM"), collected in onboarding (time
  input shown when exercise = "Sim") and editable in Dados; normalized for old
  profiles in `loadProfile`.
- New helpers in `mealTimes.ts`: `parseTimeToMinutes`, `workoutMealIds`
  (preId = meal window containing the workout time / last meal before it;
  postId = next meal / first meal of the day), `workoutBadgeFor`.
- The afternoon snack was renamed from "Lanche / pós-treino" to
  "Lanche da tarde" (mealTimes, mealLabel, Gemini rule 2).
- Badges "Pré-treino"/"Pós-treino" rendered on MealCard (Plan) and Today
  (current meal + upcoming meals), driven by the store's derived
  `workoutMeals`.
- Gemini prompt: new "## Treino" block (time + pre-workout meal: reinforce
  moderate-digestion carbs + protein; post-workout meal: reinforce protein +
  carbs for recovery) when active + time set. Meal split unchanged.

## 2026-09-23 — GitHub Pages deployment

- `vite.config.ts`: `base = process.env.BASE_PATH || '/'` (local dev/root
  deployments keep `/`; CI builds with `BASE_PATH=/nutribio/`); PWA manifest
  `start_url`/`scope`/icon `src` and `navigateFallback` are now base-aware so
  the app works from the GitHub Pages subpath.
- `index.html`: manifest + icon links switched to relative (`./`) URLs (Vite
  does not rewrite root-absolute `/` links to `public/` assets).
- Added `.github/workflows/deploy.yml` (GitHub Actions): `npm ci` → build →
  `actions/deploy-pages` on push to `main` (Pages source must be "GitHub
  Actions").
- Added `public/.nojekyll` to disable Jekyll processing.
- Repo note: `main` is the source branch; the stray local `github-pages`
  branch is not used by this deployment.

## 2026-09-23 — Documentation system + Devin project rules

- Created `docs/ARCHITECTURE.md` (full technical deep-dive) and
  `docs/DECISIONS.md` (ADR-style decision log, 17 entries).
- Expanded `AGENTS.md` with a mandatory pre-implementation reading workflow
  and a mandatory post-implementation documentation workflow.
- Added `.devin/global_rules.md` (always-on Devin rule): read docs before
  implementing; document every change in the CHANGELOG, update ARCHITECTURE
  when behavior changes, log every new technical decision in DECISIONS.
- Created this file as the mandatory change log.

## 2026-09-23 — Live Gemini model dropdown (Settings)

- New `src/lib/models.ts`: `filterModels` (Gemini + `generateContent` only,
  dedupe, sorted) and `fetchAvailableModels` via `ai.models.list()`.
- Settings now loads the model list live when a key exists (lazy SDK import,
  refresh button, loading/error states) and falls back to the static
  `MODEL_OPTIONS` list without a key or on error; "(personalizado)" entry only
  when the saved model is absent from the list.

## 2026-09-23 — Diet preferences: excluded foods + general observations

- `Profile` gained `excludedFoods` and `observations` (normalized in
  `loadProfile` for pre-existing profiles).
- Onboarding gained a 3rd step ("Preferências da dieta") with two textareas.
- Definições gained an editable "Preferências da dieta" section.
- `EditData` now preserves both fields on every profile save (data-loss guard).
- Gemini prompt gains a "Restrições e preferências do utilizador" section
  (verbatim, only when non-empty) + mandatory rule 11.

## 2026-09-22 — Responsive layout (mobile-first ≠ mobile-only)

- Desktop (`md+`): left `Sidebar` navigation; mobile: bottom `TabBar`.
- Screens widened to `max-w-6xl` with multi-column grids (Today 2/3+1/3, Plan
  totals sidebar + 2-col meals, Dados 2-col forms, Progresso chart + chips,
  Settings 2-col).
- `TabBar`/`Sidebar` share a single `TABS` config.

## 2026-09-22 — Bioimpedance history UX (Dados screen)

- History list under the bioimpedance form with edit (loads record into form)
  and delete (danger confirm dialog) actions.
- "Nova medição" (clears form) and "Usar última medição" (refills) buttons.
- Progress' "Registrar medição" CTA signals `EditData` (`newMeasurementSignal`)
  to open with an empty form; `removeBioRecord` added to the store.

## 2026-09-22 — Decimal input fix

- `NumberInput` keeps a local draft string while typing so separators
  ("," or ".") are not swallowed; display syncs from the committed value on
  blur. Rejects invalid characters; supports multiple decimals.

## 2026-09-22 — Initial application (v0.1)

- Scaffold: React 19 + Vite 7 + TypeScript (strict) + Tailwind CSS v4 +
  `@google/genai` + chart.js/react-chartjs-2 + `vite-plugin-pwa`.
- Core: onboarding wizard (2 steps then), deterministic nutrition math
  (Mifflin-St Jeor + Harris-Benedict, TDEE, goal ranges, macros, meal split),
  Gemini weekly-plan generation with structured JSON output + validation +
  retry, plan cache keyed by inputs hash, confirm-gated regeneration.
- Screens: Today (meal of the moment + variations), Plan (week view), Progress
  (charts + history), EditData (forms + live calc summary), Settings
  (API key, model, install, export/import, reset).
- PWA: manifest + service worker (generateSW), icons via
  `scripts/generate_icons.py` (Python PIL).
