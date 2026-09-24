# Changelog — Nutribio

Every implementation or modification must add a dated entry here (newest
first). Related technical decisions live in [`DECISIONS.md`](./DECISIONS.md);
how the app works is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

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
