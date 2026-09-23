# Decision Log — Nutribio

This is the **authoritative record of important decisions**. Future agents must
read this file before making changes and must NOT silently undo any decision
here. When a new significant decision is made, append it with a date.

Format: `#N. Date — Title` followed by context, decision, and consequences.

---

#1. 2026-09-22 — 100% frontend, no backend, data stays on-device
**Context:** The user asked for a PWA with no backend, fed by a bioimpedance
scale, with per-user data that never needs to move between devices.
**Decision:** No server, no database, no accounts, no sync. Everything is
stored in `localStorage` under the `nutribio.v1` namespace
(`profile`, `biometrics`, `plan`, `settings`, `schemaVersion`).
**Consequences:** Data is single-device by design. Any future "sync" feature
would contradict this and must be discussed with the user first.

#2. 2026-09-22 — Stack chosen by the agent (user delegates code to AI agents)
**Context:** The user explicitly said they will never touch the code, so the
agent picks the stack it is strongest with.
**Decision:** React 19 + Vite 7 + TypeScript (strict) + Tailwind CSS v4 +
`@google/genai` + chart.js/react-chartjs-2 + `vite-plugin-pwa`.
**Consequences:** Future agents should stay within this stack unless the user
asks otherwise. Pin `@google/genai` to `^2.x` (do not jump to 3.x without
checking the changelog; 2.x keeps `generateContent` stable).

#3. 2026-09-22 — Gemini API key: Settings screen → localStorage ONLY
**Context:** The user asked how the key would be provided and was told that an
env-var (`VITE_GEMINI_API_KEY`) is embedded in the production JS bundle and
extractable by anyone. The user then explicitly chose the in-app field.
**Decision:** The key is entered in Definições and stored in
`localStorage` (`nutribio.v1.settings.geminiApiKey`). It is never baked into
the bundle, never read from env in production, and never logged.
`.env.example` exists only as a documentation note.
**Consequences:** Per-device key entry (consistent with the single-device
design). Never "improve" this by moving the key to an env var or a proxy —
that changes the security model the user approved.

#4. 2026-09-22 — Nutrition math is local and deterministic; Gemini is creative-only
**Context:** The user asked for classic BMR formulas (Harris-Benedict,
Mifflin-St Jeor) and correct distribution math, plus Gemini for dish
inference.
**Decision:** `src/lib/calculations.ts` computes BMR (both formulas + average),
TDEE (activity factor from exercise frequency/intensity), goal calorie range,
protein/fat/carbs targets and per-meal split. The Gemini prompt receives these
computed targets and must NOT recalculate them; Gemini only creates dishes,
gram portions and the weekly plan.
**Consequences:** The plan is reproducible/offline-checkable; Gemini output
drift in math is prevented by instruction (rule "usa estes valores, não
recalculas").

#5. 2026-09-22 — Goal model and macro rules
**Context:** Four goals were requested: keep mass, gain mass, lose fat,
lose weight.
**Decision:** `Goal = 'maintain' | 'lose_fat' | 'lose_weight' | 'gain_mass'`
with fixed multipliers: maintain 0.95/1.0/1.05, lose_fat 0.80/0.84/0.90,
lose_weight 0.75/0.78/0.84, gain_mass 1.05/1.12/1.20 (×TDEE, min/target/max).
Protein: 1.8 / 2.0 / 2.2 / 2.0 g/kg. Fat 27% of kcal; saturated fat cap
20 g/day. Carbs = remainder. Meal split: 20/10/30/15/25%
(breakfast/morning snack/lunch/afternoon snack/dinner).
**Consequences:** These constants are the single source of truth for targets;
change them in `calculations.ts` only, and consider that existing cached plans
keep old targets until regenerated.

#6. 2026-09-22 — Plan caching by inputs hash; regeneration always confirmed
**Context:** The user demanded no repeated Gemini calls when nothing changed,
and a confirmation pop-up before regenerating.
**Decision:** `plan.inputsHash` = FNV-1a over `{profile, latestBiometrics}`.
On load, if the hash matches, no API call. Any data change (including
excluded foods/observations) invalidates the hash → the "Os teus dados
mudaram" banner appears, but the API is only called after the user confirms
in a dialog.
**Consequences:** No automatic API calls, ever. Keep it that way.

#7. 2026-09-22 — Onboarding stays mounted until the user finishes
**Context:** The wizard must show a "Gerar plano agora?" dialog after saving,
but saving the profile would unmount the wizard and lose the dialog.
**Decision:** `App.tsx` gates on a local `onboardingDone` flag (initialized
from `!!profile`), not on `profile` existence, so `Onboarding` stays mounted
through its own confirm dialog and calls `onDone()` only at the very end.
**Consequences:** If you touch App gating, keep this behavior — otherwise the
first-run dialog breaks.

#8. 2026-09-22 — Mobile-first ≠ mobile-only (responsive layout)
**Context:** The user corrected an earlier implementation that constrained
everything to phone width: "if it opens on desktop it must adapt to desktop".
**Decision:** Mobile (<768px): bottom `TabBar` + stacked sections. Desktop
(`md+`): hidden TabBar, left `Sidebar` (brand + nav + Definições), wider
containers (`max-w-6xl`) with multi-column grids (Today 2/3+1/3, Plan totals
sidebar + 2-col meals, Dados 2-col forms, Progresso chart 2/3 + chips 1/3,
Settings 2-col).
**Consequences:** Any new screen must be responsive with the same pattern.

#9. 2026-09-22 — Number inputs keep a local draft while typing
**Context:** Users could not type decimals: "78," was normalized to "78" on
the first keystroke, swallowing the separator.
**Decision:** `NumberInput` keeps a local string draft while focused; it
commits the parsed number on each valid keystroke and syncs the display from
the committed value on blur. Accepts comma or dot (pt-PT), rejects invalid
characters.
**Consequences:** Do not revert to value round-tripping per keystroke.

#10. 2026-09-22 — Bioimpedance history: merge/delete by date
**Context:** Users were confused about how to log new measurements.
**Decision:** Saving a bioimpedance record with a date that already exists
replaces that date (dedupe); otherwise it appends to history. Records can be
loaded into the form ("Editar") and deleted (with a danger confirm dialog).
The Progress screen CTA signals `EditData` (via `newMeasurementSignal`) to
start with an empty form.
**Consequences:** The "Dados" screen shows the history list with edit/delete
buttons; keep the dedupe-by-date semantics.

#11. 2026-09-22 — Excluded foods + general observations (diet preferences)
**Context:** The user asked for two free-text fields — "alimentos a excluir"
and "observações gerais" (e.g. nutritionist instructions) — collected at
onboarding, editable in Settings, and always included in the generation prompt.
**Decision:** Stored on `Profile` (`excludedFoods`, `observations`); collected
in onboarding step 3; editable in Definições; injected **verbatim** into the
Gemini prompt (section "Restrições e preferências do utilizador" + rule 11).
Other profile writes (EditData) must pass these fields through — losing them
is a bug. `loadProfile` normalizes old profiles missing the fields to `''`.
**Consequences:** Changing these fields changes the inputs hash → plan goes
stale → user confirms regeneration. Never strip them from `saveProfile` calls.

#12. 2026-09-22 — Lazy-load the Gemini SDK
**Context:** `@google/genai` + protobuf is ~400 kB; the app shell should stay
small.
**Decision:** `useStore.generatePlan` and `Settings`' model list both use
dynamic `import()`; Rollup puts the SDK in a shared lazy chunk outside the
main bundle.
**Consequences:** Keep SDK-heavy features behind dynamic imports; verify chunk
layout after changes (`npm run build` output).

#13. 2026-09-23 — Live model dropdown with static fallback
**Context:** The user asked for the model dropdown to always list the newest
Gemini models without deploying.
**Decision:** `src/lib/models.ts` lists models via `ai.models.list()`
(paginated async iteration), filtered to Gemini models supporting
`generateContent` (excludes imagen/veo/embeddings/tuned), deduped and sorted.
Settings fetches on open (and via an "Atualizar" button); without a key or on
error it falls back to the static `MODEL_OPTIONS` list with a status message.
A "(personalizado)" option appears only when the saved model is not in the
list.
**Consequences:** No redeploys needed when Google ships new models; the static
list remains the offline fallback — keep it updated opportunistically.

#14. 2026-09-23 — Dev server host restriction (user's tunnel)
**Context:** The user tests on a phone via a `loca.lt` tunnel
(`nbio.loca.lt`) and edited `vite.config.ts` themselves.
**Decision:** `server.allowedHosts: ['nbio.loca.lt']` (was `'*'`). Do NOT
widen this back to `'*'` — the user narrowed it deliberately.
**Consequences:** Requests with other Host headers get rejected by Vite; if a
new tunnel host is needed, ask the user or add the specific host.

#15. 2026-09-22 — Language conventions
**Decision:** UI copy in Portuguese (PT-PT); code, identifiers, comments and
docs in English. Dates/numbers formatted pt-PT (comma decimals). Meal/day
labels in PT.
**Consequences:** Follow both; never translate code identifiers.

#16. 2026-09-22 — PWA specifics
**Decision:** `vite-plugin-pwa` (generateSW, autoUpdate), manifest
`display: standalone`, `orientation: portrait`, icons 192/512 + maskable
generated by `scripts/generate_icons.py` (Python PIL — no npm image deps).
Install requires HTTPS or localhost.
**Consequences:** Regenerate icons with `npm run icons` if the branding
changes; keep the Python script (no sharp/other deps).

#17. 2026-09-22 — Plan week display order
**Decision:** Gemini emits days `monday..sunday` (schema enum); the UI displays
Monday-first (`WEEK_ORDER` in `src/lib/plan.ts`) to match the PT convention.
"Hoje" maps the current weekday to the matching `DayPlan`.
**Consequences:** Keep the enum and display order in sync when touching
`plan.ts`/`mealTimes.ts`.

#18. 2026-09-23 — Workout time + dynamic pre/post-workout meal badges
**Context:** The "pre-workout" meal was hardcoded to the afternoon snack
("Lanche / pós-treino"). The user trains in the morning and wants the
pre-workout meal to be breakfast — it can be ANY meal of the day, like a badge
on an existing meal.
**Decision:** `Exercise` gains `workoutTime?: string` ("HH:MM", collected in
onboarding and editable in Dados). `mealTimes.ts` derives `workoutMealIds()`:
`preId` = the meal slot whose window contains the workout time (or the last
one ending before it for night workouts; null if none), `postId` = the next
meal slot (or the first meal of the day when training before breakfast; null
if none). These are rendered as "Pré-treino"/"Pós-treino" badges on the
existing meal cards (Today/Plan) and passed to the Gemini prompt in a
"## Treino" block. The afternoon snack was renamed to "Lanche da tarde".
The meal split (20/10/30/15/25) is unchanged — the "reinforcement" of pre/post
meals is instruction to Gemini, not a local calculation.
**Consequences:** The badge moves with the workout time (no hardcoded slot);
changing the time invalidates the plan hash (regeneration stays user-confirmed);
cached plans keep the old label/badges until regenerated (natural, since the
hash changes).

#19. 2026-09-23 — Single global channel for generation feedback
**Context:** The user had no visual feedback while a plan was being generated
and no confirmation when it finished.
**Decision:** A `GenerationFeedback` component (rendered in App for every
branch) provides the ONLY generation feedback: a full-screen loading overlay
while `isGenerating` (spinner + stage text) and a toast when generation ends —
success ("Plano gerado com sucesso!" + "Ver plano" action) or error (message +
"Tentar de novo"). The per-screen inline generation feedback (Today's error
box, EditData/Onboarding error text) was removed to avoid duplication; the
store still exposes `isGenerating`/`generationStage`/`generationError` for
screen-level logic.
**Consequences:** One source of truth for generation state UX; any new
generation trigger automatically gets overlay + toast; do not reintroduce
per-screen generation error UI.

#18. 2026-09-23 — GitHub Pages deployment (project site, GitHub Actions)
**Context:** The user wants the code hosted on their GitHub repo with GitHub
Pages serving the built site at `https://<user>.github.io/nutribio/`.
**Decision:** Deploy as a project site (base path `/nutribio/`).
`vite.config.ts` uses `base = process.env.BASE_PATH || '/'` — the CI workflow
builds with `BASE_PATH=/nutribio/`, local dev/root deployments keep `/`. The
PWA manifest (`start_url`/`scope`/icons) is prefixed with `base`,
`index.html` references public assets relatively (`./`), and
`navigateFallback` is relative. `.github/workflows/deploy.yml` builds and
deploys on push to `main` via `actions/deploy-pages` (Pages source must be
"GitHub Actions"). `public/.nojekyll` guards against Jekyll processing.
**Consequences:** Live URL is `https://<user>.github.io/nutribio/`; if the
repo is renamed, update `BASE_PATH` in the workflow. No client-side router
means no `404.html` fallback is needed. The Gemini key security model is
unchanged (never in the bundle or repo — see #3).
