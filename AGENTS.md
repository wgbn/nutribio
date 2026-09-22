# Nutribio

PWA mobile-first (React 19 + Vite + TypeScript + Tailwind CSS v4) — planos
alimentares semanais gerados pelo Google Gemini a partir de dados de
bioimpedância. 100% frontend, sem backend; todo o estado fica em `localStorage`
(namespace `nutribio.v1`).

## Commands

- `npm install` — install dependencies
- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — type-check (`tsc --noEmit`) + production build to `dist/`
- `npm run preview` — serve the production build
- `npm run icons` — regenerate PWA icons (Python + PIL, `scripts/generate_icons.py`)

## Architecture notes

- `src/lib/calculations.ts` — deterministic BMR (Mifflin-St Jeor + Harris-Benedict),
  TDEE, calorie range per goal and macro targets. These are computed locally; the
  Gemini call receives the computed targets and produces the creative part (dishes,
  gram portions, weekly plan).
- `src/lib/gemini.ts` — single Gemini entry point (`@google/genai`, lazy-loaded via
  dynamic `import()` in `useStore` so the app shell stays small). Uses
  `responseMimeType: "application/json"` + `responseJsonSchema` for structured
  output; `normalizeWeek` validates/normalizes the response. Model is configurable
  in the app (Settings), default `gemini-2.5-flash`.
- Plan caching: `plan.inputsHash` is an FNV-1a hash of profile + latest biometrics.
  If the hash matches on load, no API call is made. Regeneration is always gated by
  a confirmation dialog.
- API key: stored only in `localStorage` via the Settings screen. Never bake it
  into the bundle; `.env.example` exists only as a local-dev note.
- Meal slots/time windows: `src/lib/mealTimes.ts` (5 slots, breakfast→dinner).
- Responsive layout: mobile-first with Tailwind breakpoints. Mobile = bottom
  tab bar (`TabBar`, hidden on `md+`) and stacked sections; desktop (`md+`) =
  left sidebar (`Sidebar`) + wider `max-w-6xl` containers with multi-column
  grids (Today 2/3+1/3, Plan totals sidebar + 2-col meals, Dados 2-col forms,
  Progresso chart 2/3 + chips 1/3, Settings 2-col).
- PWA: `vite-plugin-pwa` (generateSW) — manifest, precache, installable. Requires
  HTTPS (or localhost) to install on a phone.

## Verification

- `npm run build` must pass (strict TS).
- Flow tests were done with the browser-harness CDP against the dev server:
  onboarding wizard (step 2 skippable), confirm-dialog gating, calculations
  summary, charts from biometrics history, error path without API key.
- The real Gemini generation path needs a valid API key (user-provided).
