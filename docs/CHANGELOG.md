# Changelog — Nutribio

Every implementation or modification must add a dated entry here (newest
first). Related technical decisions live in [`DECISIONS.md`](./DECISIONS.md);
how the app works is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 2026-11-06 — Legal texts, in-app reader and data inventory (roadmap item 5, phases 5.1–5.2, Wave 6)

The app now ships its legal documents: a data inventory/RoPA/DPIA baseline
(5.1) and the four v1 texts — Terms of Use, Privacy Policy, health-data
consent and health disclaimer — in the 7 locales, rendered in-app and linked
from Welcome and Settings (5.2). **Owner + lawyer review is still open** and
blocks go-live (DECISIONS #29/#47).

- **5.1 `docs/legal/`** (new): `README.md` (status, placeholders, open items),
  `data-inventory.md` (every field: purpose, legal basis, sensitivity, local vs
  server storage, sent-to-Gemini, retention), `ropa.md` (processing activities
  for account, profile, bioimpedance, generation, shopping, consents, billing,
  logs, email) and `dpia-lite.md` (risks R1–R10 with mitigations and residual
  risk). The inventory confirmed the minimization state and recorded three
  open items: no 18+ gate yet (5.3), plaintext Gemini key in localStorage
  (until 4.6) and the Welcome "data stays on device" copy (until 4.6).
- **Name optional (5.1, DECISIONS #46)**: `Onboarding` and `EditData` no longer
  require `Profile.name`; the labels read "(optional)" in all 7 catalogs. The
  API already accepted an empty name (`z.string().max(60)`, DB default `''`).
- **Versions in core (5.2)**: `packages/core/src/legal.ts` exports
  `LEGAL_DOCUMENT_VERSIONS` (`terms`/`privacy`/`health_data`/
  `health_disclaimer` = `v1`), `CONSENT_DOCUMENT_IDS`/`_VERSIONS`/`_SOURCES`
  (mapping to the `app.consents` values) and `LEGAL_TEXTS_APPROVED = false`.
  `packages/db` now derives `CONSENT_DOCUMENT_VALUES` from that constant
  (single source with the DB CHECK).
- **Texts (5.2)**: `apps/web/src/legal/` — typed blocks
  (`heading|paragraph|list|note`), one module per locale (en-GB source +
  pt-PT, pt-BR, es, fr, de, it), **all lazy-loaded** with an en-GB fallback.
  v1 describes the target service (account, EU database, server-side
  generation); controller/contact/retention are visible placeholders.
- **Reader (5.2)**: `components/LegalDocumentView.tsx` (title, version,
  last-updated date, "pending legal review" note, back button) opened through
  a `legalDoc` branch in `App.tsx`, so it overlays Welcome, Onboarding,
  Settings and the shell and returns to the previous screen. Links: the
  Welcome privacy card (Terms, Privacy, Health disclaimer) and a new "Legal
  documents" section in Settings (all four).
- **i18n**: new `legal.*` namespace (7 keys + 4 document labels) and
  `settings.legalSection`/`legalNote` — 325 keys × 7, parity green.
  `scripts/check_i18n.mjs` now also bundles the legal modules and verifies
  document ids, block structure (types and list lengths), versions vs core and
  placeholder parity across locales.
- **Verified**: `npm run build -w @nutribio/web` (i18n + legal checks, strict
  TS, build); `typecheck` for `@nutribio/core`, `@nutribio/db` and
  `@nutribio/api` green. Bundle: entry 537.19 → 541.60 kB (+4.41 kB, +1.06 kB
  gzip); the legal texts are 7 separate lazy chunks (14.76–17.75 kB, en-GB
  included) and the Gemini SDK chunk is unchanged (394.07 kB), so no legal
  text or SDK code is in the first load. Browser (dev server): Welcome links
  open the reader in the active language (pt-PT), switching to de then opening
  shows the German text, back returns to Welcome, Settings section opens and
  returns, onboarding and Dados save **without a name** (profile `name: ''`,
  greeting without comma), no horizontal overflow at 390×844 or 1440×900, and
  no request to Gemini/Supabase/API.
- **Pending**: owner + lawyer review (checkpoint 5.2), replacement of the
  `[...]` placeholders, Stripe Checkout links (Wave 7), consent gate (5.3).

## 2026-11-06 — Nuxt API skeleton: auth, CRUD, export & account deletion (roadmap item 4, phase 4.4, Wave 6)

The backend now has its API. New workspace **`apps/api` (`@nutribio/api`)** — a
Nuxt server (no pages, no Vue app) that owns the `app` schema: JWT verification
through JWKS, CORS allow-list, code-based errors, health, profile/bio/history
CRUD and account export/deletion. **The shipped web app is unchanged**: it still
writes only to `localStorage`; nothing calls the API until phase 4.6 and it is
not deployed until 4.8 (DECISIONS #43–#45).

- **Workspace**: `apps/api` with `nuxt` 4.6.4 (server-only, Nitro preset
  `node-server`), `jose` 6.2.14 (JWKS verification), `zod` 4.6.7 (validation),
  `@nutribio/core` + `@nutribio/db` consumed as TypeScript source (inlined into
  the Nitro bundle via `nitro.externals.inline`). Scripts:
  `dev` (port 3001), `build`, `preview`, `typecheck`, `test:integration`.
  Nuxt 4.6.4 is 4 days old at the time of writing — taken deliberately because
  it is a **security release** (8 Nuxt + 3 Nitro advisories); everything else
  follows the "≥ 7 days old" rule.
- **Auth (DECISIONS #40)**: `Authorization: Bearer` verified with `jose`
  against `<project>/auth/v1/.well-known/jwks.json` (`algorithms: ['ES256']`,
  `issuer`, `audience: 'authenticated'`, `role` + `sub` checks). Every failure
  is a `401 unauthorized`; a valid token whose account was deleted becomes
  `401 accountNotFound` (foreign-key violation, not a 500).
- **Error contract**: `{error: {code, issues?}}` with codes
  (`unauthorized`, `accountNotFound`, `validationFailed`, `notFound`,
  `profileNotFound`, `bioRecordNotFound`, `conflict`, `payloadTooLarge`,
  `upstreamFailed`, `internal`) — never translated strings (core pattern #35).
  Routes are wrapped by `apiHandler`, so the contract is produced in one place;
  Postgres SQLSTATEs are mapped explicitly.
- **Middleware**: CORS allow-list from `NUXT_CORS_ORIGINS` (unknown origins get
  no headers; preflight `204` with the allowed methods/headers and
  `content-disposition` exposed for the export download), a 16 KB request-body
  ceiling, and a "server only" guard that answers non-`/api` paths with the JSON
  404 contract (unknown `/api/*` paths too).
- **Endpoints**: `GET /api/health` (public, `select 1`, 503 when the DB is
  down); `GET /api/account`; `DELETE /api/account` (`{confirm: true}` →
  Supabase Admin API → cascade of every `app` row); `GET /api/account/export`
  (JSON attachment, `formatVersion: 1`, profile + history + bio + plans (empty
  until 4.7) + consents); `GET/PUT /api/profile`; `GET /api/profile/history`;
  `GET /api/bio`; `PUT/DELETE /api/bio/:date`.
- **Semantics kept from the local app**: `PUT /api/profile` requires the whole
  profile (`excludedFoods`, `observations`, `country`, `supplements`,
  `exercise.workoutTime` always carried — #11/#18/#26/#32) and snapshots the
  **previous** state into `profile_history` inside the same transaction, only
  when a field actually changed; bio writes replace the whole measurement of
  that date (dedupe by date, #10) and `latest` falls back to the newest record.
- **Validation** (zod) mirrors the database CHECKs: 18+, height 100–250,
  weight 30–400, the enum lists come from `@nutribio/db` (single source with
  the core unions), free-text limits 60/1000/2000, `HH:MM` workout time, real
  calendar dates that are not in the future, strict objects (unknown keys
  rejected).
- **Local ES256 signing key** (the local stack used to sign HS256 with an empty
  JWKS): `signing_keys_path = "./signing_keys.json"` in
  `packages/db/supabase/config.toml`, generated by
  `npm run auth:signing-key -w @nutribio/db` and **gitignored**
  (`packages/db/supabase/.gitignore`). Verified that `supabase config diff`
  against production still shows only the 4 deferred email-template subjects —
  the signing key is a local-only setting and does not become drift.
- **Tests**: new Vitest integration suite (`npm run test:integration -w
  @nutribio/api`) — builds the API, boots the built Nitro server on a free port
  and drives it with **real ES256 access tokens** from users created through
  the local Admin API. 4 files / 34 tests: health, 404s, CORS (allowed,
  unknown, preflight), token paths (missing, malformed, foreign key, wrong
  audience, tampered, valid), 16 KB limit, profile CRUD + validation + history
  (snapshot only on change, limit), bio dedupe/latest/validation/delete,
  account summary, export shape, per-user isolation, deletion (`{confirm:true}`
  required, rows cascaded, Admin API 404, old token → `accountNotFound`).
- **Verified**: `typecheck` and `build` green; the built server boots and
  answers `/api/health`; the suite passes twice in a row (no leftovers);
  `npm run build -w @nutribio/web` unchanged (main 394.07 kB, same chunks);
  `npm run db:verify` + `db:check` + `typecheck -w @nutribio/db` still green.
- **Not included** (by design): deploy/host (4.8), web auth UI (4.5), web data
  layer (4.6), generation worker (4.7), consent guard and consent endpoints
  (5.3), rate limiting (4.9). The Nuxt/Vite toolchain carries known
  moderate/high advisories inherited from the ecosystem (`vite` 7.3.6 is also
  used by the web app) — no production deployment happens in this phase; revisit
  at 4.8.

## 2026-11-06 — Roadmap bookkeeping: phase 4.3 closed, carry-overs to go-live

- Phase 4.3 is marked ☑ (code + local verification + production project,
  migrations, API role and Auth settings). Three items are explicitly
  **carried to go-live (4.8)** and do not block the phase: pushing the 4
  localized email templates (needs Brevo SMTP or Pro, DECISIONS #41), Brevo
  SMTP itself, and the Google OAuth client (deferred, DECISIONS #42).
- Item 4 status now reads **3/9 phases** (4.1–4.3 done; 4.4–4.9 pending) in
  `docs/roadmap/04-backend-storage.md` and the roadmap README status table.
  Wave 6 is therefore **not** complete: it also contains Item 5 phases
  5.1–5.5 and Item 4 phases 4.4–4.9.

## 2026-11-06 — Auth scope: email + password only, Google OAuth deferred (roadmap 4.3/4.5)

The owner decided to finish the app with traditional email/password login and
add SSO at the end (DECISIONS #42).

- `[auth.external.google]` is now `enabled = false` in
  `packages/db/supabase/config.toml` (the block, its `env()` credential
  references and the `skip_nonce_check` setting stay, so enabling it later is
  a flag flip + `config push`). Production already had the provider disabled,
  so `supabase config diff` is now clean except the 4 deferred email templates.
- Docs updated: DECISIONS #42 (+ #24 cross-reference), ARCHITECTURE §15.5/§15.7
  and the stack table, `SUPABASE_SETUP.md` (A6 marked deferred with the steps
  kept for later), roadmap 04 (4.5 scope, decisions, owner checklist, progress
  log), roadmap README (Google dependency is not a launch blocker),
  roadmap 02 (Welcome CTA = email login) and roadmap 05 (Google is only a
  processor once SSO exists).
- No code change: the auth UI (4.5) will ship without a "continue with Google"
  button.

## 2026-11-06 — Supabase production project provisioned (roadmap 4.3, owner steps)

The hosted project now exists and the schema + Auth settings are live. Only the
Google OAuth client and the go-live items (domain, Brevo SMTP, Pro) remain
(DECISIONS #41; guide in `docs/SUPABASE_SETUP.md`).

- Project **`nutribio`** (`tsmcdeynuzdbnluqdbmw`, **`eu-west-1`**, Free plan),
  asymmetric **ES256** JWT keys, CLI logged in and linked.
- `db push` applied both migrations to production; verified remotely: 9 `app`
  tables with RLS on, no `anon`/`authenticated` grants, `nutribio_api` with
  `bypassrls` + CRUD, 0 policies, 2 rows in the migration history.
- **`nutribio_api` password** generated and set; the connection URL lives only
  in `packages/db/.env` as `NUTRIBIO_API_DATABASE_URL` (gitignored) and the
  role was proven able to log in through the **session pooler**
  (`aws-0-eu-west-1.pooler.supabase.com`) — the direct host is IPv6-only.
- `config push` (two stages, DECISIONS #41): site URL `…github.io/nutribio/`,
  redirect allow-list, OTP 6/900 s, `max_frequency 1s`, secure password change,
  min password 8 + letters/digits, MFA back to the Supabase defaults, storage
  vector off.
- **Free-plan blocker found:** the Management API rejects email-template
  changes while the default email provider is in use. The 4 localized templates
  stay in `config.toml`/`supabase/templates/` and are pushed at go-live (Brevo
  SMTP or Pro). `supabase config diff` currently shows exactly the 4 template
  subjects + the 3 Google fields — the documented pending state.
- `[remotes.production]` now carries the real project ref; `.env.example`
  documents the pooler/IPv6 constraint. Docs: `SUPABASE_SETUP.md` rewritten
  with the status table and the remaining steps, ARCHITECTURE §15.5–§15.7,
  DECISIONS #38 (region) and #41.

## 2026-11-06 — Supabase database + Auth layer (roadmap item 4, phase 4.3, Wave 6)

The backend era gets its database: schema, roles, RLS and the Auth
configuration now exist in a new `packages/db` workspace. **The shipped app is
unchanged** — it still writes only to `localStorage`; no user data reaches the
server until the consent gate (5.3) and the data layer (4.6). Decisions
#36–#40.

- New workspace **`packages/db` (`@nutribio/db`)** — Drizzle schema (single
  source of truth) + Supabase CLI config, consumed only by the future API.
  Pinned: `drizzle-orm` 0.45.4, `drizzle-kit` 0.31.11, `postgres` 4.0.0,
  `supabase` CLI 2.122.0.
- **Schema** (`app` schema, 9 tables): `profiles`, `profile_history`,
  `bio_records`, `plans`, `dishes`, `plan_shopping_items`, `plan_selections`,
  `shopping_checks`, `consents`. Enum-like columns are `text` + CHECK
  constraints mirroring the `@nutribio/core` unions; jsonb columns are typed
  with the core interfaces. Job-queue invariants as partial unique indexes
  (one `is_current` plan, one `queued|running` job per user).
- **Migrations**: `drizzle-kit generate` writes SQL into
  `supabase/migrations` (`prefix: 'supabase'`); the **Supabase CLI applies
  it** (`db reset` locally, `db push` on the hosted project). A custom
  migration adds the `nutribio_api` role (login + bypassrls, no password in
  the repo), the five `auth.users` cascading FKs, the `updated_at` triggers
  and the grant/revoke set. If a project cannot grant `BYPASSRLS`, the same
  migration falls back to `api_all` policies for that role (verified locally
  by forcing the fallback).
- **Security model**: `app` is not exposed by the Data API
  (`auto_expose_new_tables = false`), RLS enabled on every table with no
  policies, `anon`/`authenticated` hold no privileges, the API role owns all
  access.
- **Auth config** (`supabase/config.toml`): local site URL + GitHub
  Pages/loca.lt redirects, email confirmations, 6-digit OTP (15 min), 8-char
  password policy with letters+digits, Google provider via `env()`, and a
  `[remotes.production]` block for the hosted project.
- **Localized transactional emails** (DECISIONS #39): copy for 7 locales in
  `email/strings.mjs`, `npm run email:build` generates the four Go templates
  in `supabase/templates/` (confirmation, recovery, email change,
  reauthentication) which branch on `{{ .Data.locale }}` with en-GB fallback.
- `.gitignore` now ignores `.env`/`.env.*` (keeping `.env.example`) — the
  previous rules did not protect environment files.
- Docs: `docs/SUPABASE_SETUP.md` (owner guide: project, JWT keys, CLI link,
  schema push, Auth, Google OAuth, Brevo SMTP, Free-plan caveats),
  ARCHITECTURE §15 (+ §2/§3/§13), DECISIONS #36–#40, roadmap item 4 + README.
- **Verified** (local stack): `db:start`/`db:reset` apply both migrations;
  `drizzle-kit check` + `typecheck -w @nutribio/db` green;
  `npm run db:verify` (RLS on all 9 tables, no client privileges,
  `nutribio_api` CRUD + bypassrls, unique bio date, one current plan, one
  active job, 18+/goal CHECKs, `updated_at` trigger, cascade on user
  deletion); `npm run email:verify` (7/7 locales: correct body + subject +
  6-digit OTP in Mailpit, `verify` returns a session, `recover` localized from
  stored metadata); `GET /rest/v1/profiles` → `PGRST205` (schema not
  exposed); `npm run build -w @nutribio/web` unchanged (same bundle sizes).
- **Pending (owner):** create the hosted project, link the CLI, `db:push`,
  set the `nutribio_api` password, `config:push` (after replacing the project
  ref placeholder) and the Google OAuth client — see
  `docs/SUPABASE_SETUP.md`. Brevo SMTP and the Pro upgrade wait for a domain /
  go-live.

## 2026-11-06 — `packages/core`: shared pure logic extracted (roadmap item 4, phase 4.2)

The domain logic the future Nuxt API must reuse (targets, prompt, schema,
normalization, shopping math) now lives in a shared package instead of the web
app. **Zero behavior change** (DECISIONS #35).

- New workspace **`packages/core` (`@nutribio/core`)** — source-only
  (`exports: "./src/index.ts"`, no build step, `sideEffects: false`), **no
  runtime dependencies** and **no DOM/Node globals** (`lib: ES2022`,
  `types: []`, checked by the web build). Modules: `types`, `locales`,
  `countries`, `format`, `mealTimes`, `calculations`, `plan`, `shopping`,
  `hash`, `errors`, `prompt`, `schema`, `normalize`, `translate` + barrel.
- **Moved out of `apps/web/src/lib`**: `calculations`, `countries`,
  `mealTimes`, `plan`, `shopping`, `hash`, `errors`, and the pure half of
  `gemini.ts` (`COUNTRY_CUISINE_HINTS` + `buildPrompt` → `prompt.ts`,
  `PLAN_SCHEMA`/`SHOPPING_CATEGORIES` → `schema.ts`, `normalizeWeek`/
  `normalizeShoppingItems`/`extractJson` → `normalize.ts` +
  `parsePlanResponse`). Domain types moved to core; `apps/web/src/types.ts`
  keeps only `Settings` + `TabId`.
- **No hidden state**: the locale is an explicit parameter
  (`buildPrompt({locale})`, `formatNumber(…, intlLocale)`,
  `defaultCountryFor(candidates, locale)`) and label lookups take an injected
  `Translate` (`computeTargets(input, t)`, `mealLabel`, `emptyMealSlot`,
  `normalizeWeek`, `startsInLabel`); the new `apps/web/src/i18n/translate.ts`
  exports `coreT` (i18next adapter). The mutable active-locale tracker stays in
  the web app.
- **Errors as codes**: `PlanParseError` (`emptyResponse`, `unparseable`,
  `badResponse`, `emptyPlan`); `apps/web/src/lib/gemini.ts` (now just the SDK
  call + retry) maps them to the same `errors.*` messages as before.
- Root `tsconfig.base.json` shared by `apps/web` and `packages/core`;
  `apps/web`'s `build` runs `tsc --noEmit -p ../../packages/core` before its
  own type-check; `npm run typecheck -w @nutribio/core` added. The removed
  duplicate `WEEK_ORDER` (mealTimes) leaves a single definition in `plan.ts`.
- `describeError` is now imported statically from core in Settings (the lazy
  `errors-*.js` chunk is gone).
- **Verified with golden snapshots** (esbuild scratch scripts, before/after):
  byte-identical JSON for prompts (3 profiles × 4 locales), `computeTargets`
  (4 fixtures), `planInputsHash` (cached plans do **not** go stale),
  `normalizeWeek`/`normalizeShoppingItems` (incl. malformed input), the
  shopping list + quantity labels, `workoutMealIds` for all 1440 minutes,
  `resolveLocale`/`defaultCountryFor` matrices, number formatting per locale
  and every error path; `parsePlanResponse` re-checked on plain/fenced/prose/
  garbage/empty payloads. Build green (i18n parity, core + web strict TS);
  chunk layout unchanged (prompt/schema stay in the lazy `gemini` chunk, SDK
  in its own lazy chunk, 6 catalogs lazy). Browser (existing profile + plan):
  no stale banner (hash unchanged), Today/Plano/Compras/Progresso/Dados
  render, Settings shows the static model fallback, language switch to de
  works and persists, "Sim, gerar plano" without a key shows the localized
  "Sem chave da API Gemini" toast, layouts fine at 390×844 and 1440×900.

## 2026-11-06 — Monorepo conversion (roadmap item 4, phase 4.1, Wave 5)

Repository restructured into an npm-workspaces monorepo so the backend era
(`packages/core`, then `apps/api`) can be added without further moves. **No
application behavior changed** (DECISIONS #34).

- The whole app moved to **`apps/web/`** with `git mv` (history preserved):
  `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`,
  `scripts/` (`generate_icons.py`, `check_i18n.mjs`) and `.env.example`.
  `apps/web/package.json` is now `@nutribio/web` and holds the scripts and the
  full dependency set (same version ranges).
- Root `package.json` declares **only** `workspaces: ["apps/*",
  "packages/*"]` — no app scripts. Commands are per workspace:
  `npm run dev|build|preview|i18n:check|icons -w @nutribio/web`.
- Single root `package-lock.json` (`npm install` at the root; `@nutribio/web`
  is symlinked into `node_modules`).
- CI (`.github/workflows/deploy.yml`): `npm ci` at the root →
  `npm run build -w @nutribio/web` (`BASE_PATH=/nutribio/`) →
  `actions/upload-pages-artifact` with `apps/web/dist`. Same GitHub Pages
  project site.
- Docs updated for the new layout: `AGENTS.md` (commands + quick map),
  `.devin/global_rules.md` (`apps/web/vite.config.ts`), `docs/ARCHITECTURE.md`
  §3/§12/§13.
- Verified: `npm install` + `npm run build -w @nutribio/web` green (i18n
  parity 313 keys × 7, strict TS, build in `apps/web/dist`); bundle parity
  against the pre-move baseline (identical chunk list and sizes — main
  394.07 kB, SDK chunk 536.79 kB, gemini chunk 16.06 kB, 6 lazy catalog
  chunks; only the CSS is ~50 bytes smaller because Tailwind content
  detection no longer scans repo-root markdown: two unused utilities
  `.table`/`.rounded` are gone); `BASE_PATH=/nutribio/` build produces
  `start_url: /nutribio/`; dev server from the workspace boots on :5173 and
  the Welcome screen renders.

## 2026-11-06 — Welcome / landing screen (roadmap item 2, Wave 4)

First-use landing screen shown before the onboarding wizard: what the app does,
how it works, what you get, and how data is handled (DECISIONS #33).

- **New screen** `src/screens/Welcome.tsx` (pure presentation — no writes, no
  API calls): hero (badge + title + value proposition + "Começar" CTA) with a
  "your week at a glance" card (7 days / 5 meals / 3 variations / shopping
  list) on `md+`; "Como funciona" (3 numbered cards: data → local
  calculations → AI plan); "O que tens" (4 feature cards: Today, workout
  meals, progress, shopping); privacy summary (data stays on the device, the
  Gemini key never leaves it, the name is not sent) and health disclaimer.
  Inline SVG only (new `ShieldIcon`, `GlobeIcon`, `AlertIcon` in
  `components/icons.tsx`), no new dependencies, responsive per DECISIONS #8.
- **Language selector** in the Welcome header (`auto` + 7 locales): persists
  `settings.locale` and switches immediately (same path as Settings), so the
  copy and the choice survive reload and "Delete all data" (reset keeps the
  language).
- **Gate** in `App.tsx`: `Welcome → Onboarding → Shell`, via a local
  non-persisted `welcomeDone` initialized from `!!profile` — Welcome appears
  while there is no profile and again after a full reset. DECISIONS #7 is
  untouched (onboarding still owns the "generate now?" dialog).
- **Onboarding** step 1 footer is now "Voltar | Continuar"; "Voltar" (optional
  `onBack` prop, wired from App) returns to Welcome and discards the unsaved
  form.
- **i18n**: new `welcome.*` namespace (32 keys) in all 7 catalogs — en-GB
  source, pt-PT, pt-BR (você-form adaptation), es/fr/de/it (agent
  translations, pending native review like the rest). Catalogs now hold 313
  keys each; `npm run i18n:check` green.
- Deliberately **not** included yet: "Já tenho conta" CTA (Wave 6 auth),
  pricing teaser (item 3), legal document links (item 5).
- Verified: `npm run build` (i18n parity + strict TS + build, lazy catalogs
  and Gemini SDK still out of the main bundle); browser test — Welcome on
  first load, live language switch (pt-PT → de) persisting across reload,
  "Começar" → onboarding, "Voltar" → Welcome, full onboarding still showing
  the "Gerar o plano agora?" dialog, reload with a profile goes straight to
  the shell, "Apagar todos os dados" → Welcome back in the previously chosen
  language, no request to the Gemini API; layouts checked at 390×844 and
  1440×900 (pt-PT and de).

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
