# Nutribio — Devin Project Rules

## Mandatory: read the documentation BEFORE implementing

Before making ANY change (new feature, bug fix, refactor, configuration):

1. Read `AGENTS.md` — project entry point and summary of critical decisions.
2. Read `docs/DECISIONS.md` in full — it records decisions that must NOT be
   undone by future sessions.
3. Read the relevant sections of `docs/ARCHITECTURE.md` — understand the data
   model, storage schema, calculations, Gemini flow and screen structure
   before touching code.
4. Read `docs/roadmap/README.md` — improvement roadmap status — plus the
   item file for the phase you are working on (never work a phase without
   its checklist).

## Mandatory: document EVERY implementation or modification

After ANY change (feature, bug fix, refactor, config, dependency, doc change):

1. **Always** add a dated entry to `docs/CHANGELOG.md` describing what was
   implemented/modified (and why, briefly). Every change must leave a trace.
2. Update `docs/ARCHITECTURE.md` if architecture, data flow or behavior
   changed (keep it the source of truth for how the app works).
3. Append a new dated entry to `docs/DECISIONS.md` for EVERY new technical
   decision (do not silently overwrite existing entries).
4. Update the roadmap: tick the phase checklist in the item file, append a
   line to its Progress log, and refresh the status in
   `docs/roadmap/README.md`.

A task is not complete until its documentation is written.

## Hard constraints (never violate)

> The constraints below describe the app **as shipped today**. Decisions
> #21–#30 (2026-10-06, `docs/DECISIONS.md` + `docs/roadmap/`) approved the
> backend/payment era — those decisions take effect per roadmap phase, and
> the text below is updated when each phase lands. Do not implement a
> superseding change ahead of its roadmap phase.
>
> Since roadmap 4.3 (DECISIONS #36–#40) the database schema and the Supabase
> Auth configuration exist in `packages/db`, but **no user data reaches the
> server**: the web app keeps writing only to `localStorage` until the consent
> gate (5.3) and the data layer (4.6). Hosted-project commands (`db:push`,
> `config:push`) are owner-run only — never run them unattended.

- No backend, no database, no sync — all data stays in `localStorage`
  (namespace `nutribio.v1`), single-device by design.
- The Gemini API key is entered ONLY in Definições and stored in
  localStorage. Never bake it into the bundle, never read it from env vars in
  production, never log it.
- Plan regeneration is ALWAYS gated by the user's confirmation dialog; never
  call the Gemini API automatically (on load, on data change, etc.).
- Keep `server.allowedHosts` in `apps/web/vite.config.ts` restricted to the
  user's tunnel host (`nbio.loca.lt`) — do not widen it to `'*'`.
- Never drop `profile.excludedFoods` / `profile.observations` when writing a
  profile (all profile writes must carry them through).
- Mobile-first does NOT mean mobile-only: layouts must adapt — bottom tab bar
  + stacked on mobile; left sidebar + multi-column grids on desktop (`md+`).
- UI copy in Portuguese (PT-PT); code, identifiers, comments and docs in
  English. (Superseded by DECISIONS #25 from roadmap phase 1.1 onward: UI is
  localized to 7 locales; code/docs stay in English.)
