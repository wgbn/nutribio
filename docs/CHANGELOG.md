# Changelog — Nutribio

Every implementation or modification must add a dated entry here (newest
first). Related technical decisions live in [`DECISIONS.md`](./DECISIONS.md);
how the app works is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

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
