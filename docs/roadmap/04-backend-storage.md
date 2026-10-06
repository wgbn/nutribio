# 04 — Backend & storage (Nuxt API + Supabase)

**Status:** ☐ Not started

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

## Open questions

- [ ] Drizzle vs supabase-js server client (debate at 4.3).
- [ ] VPS vs Railway/Fly/Render (4.8).
- [ ] Web Push notifications for finished generations (later).
- [ ] Rate limits & quotas per endpoint.
- [ ] Multi-device conflicts (last-write-wins is fine for v1?).

## Phases

- 4.1 Monorepo conversion (move app to `apps/web`, workspaces, CI workflow
      paths, docs paths) — no behavior change.
- 4.2 Extract `packages/core` (pure logic + tests).
- 4.3 Supabase project (EU) + migrations + RLS + Auth providers/OTP email
      templates (7 languages) + SMTP.
- 4.4 Nuxt API skeleton: JWT middleware, CORS, error codes, health; CRUD for
      profile/bio/history; account export/delete (with Item 5).
- 4.5 Web auth UI: login/signup/OTP/recovery/Google; session; App gate
      `Welcome → Auth → Consent → Onboarding → Shell`.
- 4.6 Web data layer: `useStore` on the API + `nutribio.v2` cache/sync
      markers; remove client-side Gemini.
- 4.7 Background generation worker + polling + feedback changes.
- 4.8 Deploy API (Docker on chosen host, HTTPS domain, env secrets, CI) +
      update `AGENTS.md` / `.devin/global_rules.md` hard constraints (the
      "no backend" text becomes effective here).
- 4.9 Hardening & end-to-end verification.

## Verification

- Integration tests against a Supabase dev project (CRUD, auth, RLS).
- Worker crash/restart recovery (stale `running` jobs re-claimed).
- Offline: airplane-mode read of cached plan; sync after a new generation.
- Chunk layout: no Gemini SDK in the web bundle after 4.6.
- End-to-end: signup → consent → onboarding → generation → close app →
  reopen → plan ready.

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.
