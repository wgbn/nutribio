# 04 — Backend & storage (Nuxt API + Supabase)

**Status:** ◐ In progress — **3 of 9 phases done** (2026-11-06: 4.1 monorepo,
4.2 `packages/core`, 4.3 Supabase live in production). 4.4–4.9 pending;
template push + SMTP carried to go-live (4.8).

**Note:** this item **supersedes DECISIONS #1** (100% frontend, no backend).
The decision was taken explicitly by the owner on 2026-10-06 (DECISIONS #22).

## Goal

Add a database layer with simple login, storage of the minimal profile data,
generated dishes/diets and progress-change history — plans stop living
exclusively on the device. Gemini generation moves to the server as a
background job; the Gemini API key becomes server-side only (supersedes
DECISIONS #3 and #13).

## Research & findings (2026-10-06)

### Architecture
- **Monorepo** (npm workspaces):
  - `apps/web` — current Vite PWA (unchanged deploy: GitHub Pages).
  - `apps/api` — Nuxt (Nitro) with `server/api` routes.
  - `packages/core` — shared pure logic: types, `calculations`, `mealTimes`,
    `hash`, plan schema, prompt builder, `normalizeWeek`, shopping
    aggregation (Item 7), `SUPPORTED_COUNTRIES` (Item 6). Used by web (UI,
    live calc summary, stale banner) and api (authoritative targets +
    prompt).
- **Supabase (Postgres + Auth), EU region (e.g. Frankfurt)**. The Nuxt API
  verifies the Supabase JWT and owns ALL data access. Web uses `supabase-js`
  **only for auth** (Google OAuth, email/password, 6-digit email OTP for
  signup confirmation + password recovery — works well in an installed PWA).
- **RLS enabled on every table with no client policies** (defense in depth:
  only the API's server role reads/writes).
- **DB access from Nuxt**: Drizzle ORM + SQL migrations in repo
  (recommended — typed, versioned) vs supabase-js server client — **to be
  debated at the start of phase 4.3**.
- **Hosting**: long-running Node server (VPS-like: Railway / Fly / Render /
  VPS) because generation takes 1–3 min (65k output tokens) and must survive
  the user closing the app.
- Owner explicitly rejected Supabase/Firebase **Edge Functions**; the backend
  is the Nuxt project. Details to be debated before implementation.

### Schema draft
- `profiles` (1:1 user; today's Profile fields + `locale` + `country`;
  `excludedFoods`/`observations` always carried — DECISIONS #11).
- `profile_history` (snapshot per change — "histórico de alteração de dados").
- `bio_records` (unique `user_id,date` — dedupe semantics of DECISIONS #10).
- `plans` (status `queued|running|succeeded|failed`, `inputs_hash`, `locale`,
  `country`, `model`, targets/snapshots jsonb, overview, `error_code`,
  timestamps, `is_current`).
- `dishes` (plan_id, day, slot, variation_index, name, description,
  ingredients jsonb incl. `shoppingKey`/`rawGrams`, macros, notes).
- `plan_shopping_items`, `plan_selections`, `shopping_checks` (Item 7).
- `consents` (Item 5), `entitlements`, `stripe_events` (Item 3).

### Generation job
- `POST /api/plans/generate` — called **only after the user's confirm
  dialog** (DECISIONS #6 preserved, now server-enforced) → checks
  entitlement + no running job → computes targets server-side from DB data →
  inserts `queued` → `202 {planId}`.
- Nitro worker plugin claims jobs (`FOR UPDATE SKIP LOCKED`), calls Gemini
  with the **server key**, validates (`normalizeWeek` + shopping), writes
  dishes, marks `succeeded`/`failed`; stale-job recovery on restart.
- Web polls `GET /api/plans/current/meta` while a job runs and on app open.
  `GenerationFeedback` becomes non-blocking ("podes fechar a app") — still
  the single feedback channel (DECISIONS #19). Optional Web Push later.

### Local cache sync (offline reads)
- New namespace `nutribio.v2` (cache only, scoped by user id, cleared on
  logout): `{planId, planUpdatedAt, syncedAt, plan, profile, biometrics,
  shoppingChecks}`.
- On open: render cache instantly → fetch meta → refetch the full plan only
  if `planId`/`updatedAt` differ (the **sync marker** the owner asked for).
- Variation selections & shopping checks: optimistic local update +
  write-through with a small retry queue. Other writes require network
  (clear offline message).

### What the web app loses
- Gemini key field, model dropdown, `src/lib/models.ts`, `@google/genai`
  dependency, raw localStorage export/import (replaced by server export,
  Item 5).

### Security
- CORS allowlist (GitHub Pages origin, localhost, `nbio.loca.lt`); zod
  validation; free-text length limits (prompt-injection surface); rate
  limiting; never log PII/health data/secrets; secrets only in server env.
- `vite.config.ts` `server.allowedHosts` unchanged (DECISIONS #14).
- Supabase free tier pauses projects and has no backups → Pro plan for
  production.

## Decisions

- 2026-10-06 — Backend era approved: monorepo, Nuxt API, Supabase EU,
  server-side key, background generation (supersedes #1, #3, #13).
  (DECISIONS #22)
- 2026-10-06 — Login: Google + email/password + email OTP (signup
  confirmation & recovery); 18+. (DECISIONS #24)
- 2026-10-06 — Offline model: DB source of truth + `nutribio.v2` cache with
  sync marker. (DECISIONS #28)
- 2026-11-06 — Wave 6 starts with 4.3 (before the legal texts); no user data
  reaches the server until 5.3/4.6. (DECISIONS #36)
- 2026-11-06 — DB layer: Drizzle schema as source, drizzle-kit → Supabase CLI
  migrations, private `app` schema, `nutribio_api` role, RLS without policies.
  (DECISIONS #37)
- 2026-11-06 — One hosted project (production) on the Free plan + local Docker
  stack for development; Pro before go-live. (DECISIONS #38)
- 2026-11-06 — Auth emails localized via `user_metadata.locale`; Brevo SMTP
  deferred until a domain exists. (DECISIONS #39)
- 2026-11-06 — API verifies access tokens through JWKS (ES256 asymmetric
  keys). (DECISIONS #40)
- 2026-11-06 — **Auth v1 without SSO:** email + password + OTP only; Google
  OAuth (and any other provider) deferred to the end of the project, provider
  disabled in `config.toml`/production. (DECISIONS #42)

## Open questions

- [x] Drizzle vs supabase-js server client → **Drizzle** (DECISIONS #37).
- [ ] VPS vs Railway/Fly/Render (4.8).
- [ ] Web Push notifications for finished generations (later).
- [ ] Rate limits & quotas per endpoint.
- [ ] Multi-device conflicts (last-write-wins is fine for v1?).
- [ ] Import the existing `nutribio.v1` local data into the new account when
      the user signs up (one-off migration in 4.6)? Recommended: yes, offer it
      once, then clear the local namespace.
- [ ] Server-side `Translate` for the prompt labels (4.7): core does not ship
      catalogs, so the API needs an implementation for the domain labels
      (meal/goal/sex/frequency/…) used in the prompt. Options: ship the label
      subset of the catalogs in core, or have the API import the web catalogs.
- [ ] Where the `@google/genai` dependency lives once the API generates plans
      (4.6/4.7): core stays dependency-free, so the SDK call moves to `apps/api`.
- [ ] Localized notification emails (`password_changed`, `email_changed`):
      still Supabase defaults (English). Decide with 5.2/5.3.

## Phases

### 4.1 Monorepo conversion (no behavior change)
- [x] Root `package.json` = npm workspaces only (`apps/*`, `packages/*`),
      single root lockfile (DECISIONS #34).
- [x] `apps/web` (`@nutribio/web`): `src/`, `public/`, `index.html`,
      `vite.config.ts`, `tsconfig.json`, `scripts/`, `.env.example` moved with
      `git mv`; scripts + dependencies in the workspace package.
- [x] Per-workspace commands (`npm run … -w @nutribio/web`); docs updated
      (`AGENTS.md`, `.devin/global_rules.md`, `docs/ARCHITECTURE.md`).
- [x] CI workflow paths: root `npm ci` → `npm run build -w @nutribio/web` →
      upload `apps/web/dist`.
- [x] Verified: bundle parity vs baseline (identical chunks/sizes), CSS ~50 B
      smaller (Tailwind no longer scans repo-root markdown), `BASE_PATH` build,
      dev server smoke.

### 4.2 Extract `packages/core` (pure logic + tests)
- [x] `packages/core` (`@nutribio/core`): source-only exports, **no runtime
      dependencies**, `tsconfig` without DOM/Node libs (DECISIONS #35).
- [x] Move: domain types, pure locale definitions, countries, calculations,
      mealTimes, plan, shopping, hash, `describeError`, `formatNumber`,
      prompt builder, JSON schema, normalizers.
- [x] Remove hidden state: injected `Translate` + explicit `locale`; parse
      errors become codes.
- [x] Web keeps: `storage`, `models`, `units`, i18n runtime + catalogs,
      active-locale tracker and the `@google/genai` call.
- [x] Golden-equivalence check (esbuild scratch): byte-identical prompt in
      4 locales, identical `inputsHash`, targets, normalization, shopping.
- [x] Docs: ARCHITECTURE §3.1, DECISIONS #35, CHANGELOG.

### 4.3 Supabase project (EU) + migrations + RLS + Auth providers/OTP email
      templates (7 languages) + SMTP — ☑ 2026-11-06
      (template push + SMTP carried to go-live; Google/SSO deferred, #42)
- [x] `packages/db` workspace: Drizzle schema (`app` schema, 9 tables),
      `drizzle.config.ts` writing to `supabase/migrations`
      (`prefix: 'supabase'`), `createDb()` factory for the API.
- [x] Initial migration (tables, checks, indexes, RLS enabled) + custom
      `api_role_and_grants` migration (role `nutribio_api`, `auth.users` FKs
      with cascade, `updated_at` triggers, grants/revokes).
- [x] `supabase/config.toml`: local stack, Auth settings (site URL, redirects,
      confirmations, OTP 6/900 s, password policy, rate limit), Google
      provider via `env()`, `[remotes.production]` block.
- [x] OTP email templates in 7 languages generated from one strings file
      (`email:build`), branching on `user_metadata.locale` with en-GB
      fallback.
- [x] Local verification suites: `db:verify` (RLS/grants/cascade/constraints/
      triggers) and `email:verify` (7 localized OTP emails + verify + recover).
- [x] `.gitignore` protects `.env*`; `packages/db/.env.example` documents the
      variables.
- [x] Owner guide `docs/SUPABASE_SETUP.md` (project, JWT keys, CLI link,
      `db:push`, API role password, Auth config, Brevo SMTP, Free-plan caveats,
      Google OAuth — deferred, DECISIONS #42).
- [x] **Owner:** create the hosted project (`nutribio`, eu-west-1, Free) and
      migrate to asymmetric JWT keys, `supabase login` + `db:link`.
- [x] **Owner:** `db:push` (both migrations applied + verified remotely), the
      `nutribio_api` password set and its pooler login tested, real project ref
      in `[remotes.production]`, `config:push` of the Free-plan-safe Auth
      settings (site URL, redirects, OTP 6/900 s, password policy, MFA).
- [ ] **Carried to go-live (4.8), not part of 4.3 completion:** Google OAuth
      client (redirect URIs prod + local), credentials in `packages/db/.env`,
      `enabled = true` and `config:push` — DECISIONS #42. Not a launch
      dependency.
- [ ] **Carried to go-live (4.8), not part of 4.3 completion:** Brevo SMTP with
      an authenticated domain — also the only way to push the 4 localized
      templates on the Free plan (DECISIONS #41); Pro plan.
### 4.4 Nuxt API skeleton: JWT middleware, CORS, error codes, health; CRUD for
      profile/bio/history; account export/delete (with Item 5).
### 4.5 Web auth UI: signup/login/OTP/recovery (email + password); session;
      App gate `Welcome → Auth → Consent → Onboarding → Shell`
      (Google/SSO deferred to the end, DECISIONS #42).
### 4.6 Web data layer: `useStore` on the API + `nutribio.v2` cache/sync
      markers; remove client-side Gemini.
### 4.7 Background generation worker + polling + feedback changes.
### 4.8 Deploy API (Docker on chosen host, HTTPS domain, env secrets, CI) +
      update `AGENTS.md` / `.devin/global_rules.md` hard constraints (the
      "no backend" text becomes effective here).
### 4.9 Hardening & end-to-end verification.

## Verification

- Integration tests against a Supabase dev project (CRUD, auth, RLS).
- Worker crash/restart recovery (stale `running` jobs re-claimed).
- Offline: airplane-mode read of cached plan; sync after a new generation.
- Chunk layout: no Gemini SDK in the web bundle after 4.6.
- End-to-end: signup → consent → onboarding → generation → close app →
  reopen → plan ready.
- 4.3 (done locally): `npm run db:verify` + `npm run email:verify`
  (`packages/db/supabase/tests/`).

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.
- 2026-11-06 — Phase 4.1 (Wave 5): monorepo conversion (npm workspaces,
  `apps/web` = `@nutribio/web`, root package.json = workspaces only, single
  lockfile, CI builds `-w @nutribio/web` and uploads `apps/web/dist`, docs
  paths updated). Zero behavior change — verified by bundle parity against the
  pre-move baseline plus a dev-server smoke test. DECISIONS #34.
- 2026-11-06 — Phase 4.2 (Wave 5): `packages/core` (`@nutribio/core`) created
  with the pure logic (types, pure locales, countries, calculations,
  mealTimes, plan, shopping, hash, errors, format, prompt, schema,
  normalize), source-only, no runtime deps, no DOM/Node libs, injected
  `Translate` + explicit locale, parse errors as codes. Golden snapshots
  before/after the move are byte-identical (prompt per locale, inputs hash,
  targets, normalization, shopping); build + browser checks green.
  DECISIONS #35. Wave 5 complete.
- 2026-11-06 — Phase 4.3 (Wave 6, code side): `packages/db` (`@nutribio/db`)
  with the Drizzle schema for the private `app` schema (profiles,
  profile_history, bio_records, plans, dishes, plan_shopping_items,
  plan_selections, shopping_checks, consents), drizzle-kit → Supabase CLI
  migration workflow, `api_role_and_grants` custom migration (role, auth FKs,
  triggers, grants), `supabase/config.toml` (local + Auth + Google +
  `remotes.production`) and 7-locale OTP email templates generated from one
  strings file. Verified on the local Docker stack: migrations apply from
  scratch, RLS/grants/cascade/constraints/triggers checks pass, 7/7 localized
  emails (body + subject + 6-digit OTP) via Mailpit, `verify` returns a
  session, `recover` localized, REST cannot reach `app`, web bundle unchanged.
  DECISIONS #36–#40. Remaining: the owner actions (hosted project, link,
  push, API role password, Google OAuth) in `docs/SUPABASE_SETUP.md`.
- 2026-11-06 — Phase 4.3 (owner steps): hosted project `nutribio`
  (`tsmcdeynuzdbnluqdbmw`, eu-west-1, Free) created with ES256 keys, CLI
  linked, both migrations pushed and verified remotely, `nutribio_api`
  password set (stored in `packages/db/.env`, pooler login tested) and the
  Free-plan-safe Auth settings pushed. Found a Free-tier limitation: email
  templates cannot be modified with the default email provider, so the 4
  localized templates are pushed at go-live (Brevo SMTP or Pro). Google OAuth
  deferred to the end (DECISIONS #42). DECISIONS #41. **Phase 4.3 closed**
  (template push + SMTP + Google are carried to 4.8 / post-launch).
