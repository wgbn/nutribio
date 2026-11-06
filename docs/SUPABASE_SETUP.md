# Supabase setup — owner guide (roadmap phase 4.3)

Owner actions for roadmap phase 4.3 (Supabase project, Auth, SMTP; Google
OAuth deferred). The code side lives in `packages/db` (schema, migrations,
`config.toml`, email templates) and is documented in
[`ARCHITECTURE.md`](./ARCHITECTURE.md) §15; the decisions are
[`DECISIONS.md`](./DECISIONS.md) #36–#42.

> **Environments (DECISIONS #38):** there is **one hosted project** and it is
> the production one, on the **Free plan**. Local development runs the
> Supabase CLI Docker stack — no second hosted project.
>
> **Auth scope (DECISIONS #42):** v1 signs in with **email + password + 6-digit
> OTP only**. Google OAuth (and any other SSO) is **deferred to the end of the
> project**; the provider block stays in `config.toml` disabled, ready to be
> switched on later.
>
> **Secrets never go into the repository or into a chat:** they live in
> `packages/db/.env` (gitignored) or the Supabase dashboard.

## Status (2026-11-06)

| Step | State |
|---|---|
| A1 project `nutribio` (`tsmcdeynuzdbnluqdbmw`, **eu-west-1**, Free) | ☑ |
| A2 asymmetric JWT keys (ES256) | ☑ |
| A3 `supabase login` + `db:link` | ☑ |
| A4 schema applied (`db push`), `nutribio_api` password set, API login verified | ☑ |
| A5 Auth config pushed (site URL, redirects, OTP 6/900 s, password policy, MFA) | ☑ (templates pending — see A5) |
| A6 Google OAuth | ☐ **deferred to the end** (DECISIONS #42) |
| A7 Domain + Brevo SMTP (also unlocks the localized templates) | ☐ go-live |
| A8 Supabase Pro upgrade | ☐ go-live |

---

## A1. Project ☑ (done)

Created as `nutribio` in **`eu-west-1` (Ireland, EU)** on the Free plan.
Either EU region is fine (`eu-central-1` Frankfurt or `eu-west-1`); this one is
`eu-west-1` and the connection strings below use it.

## A2. JWT signing keys ☑ (done)

Migrated to **asymmetric signing keys (ES256)**. The Nuxt API will verify
access tokens against
`https://tsmcdeynuzdbnluqdbmw.supabase.co/auth/v1/.well-known/jwks.json`
(DECISIONS #40), so no JWT secret is copied to the API host.

## A3. CLI login + link ☑ (done)

`supabase login` + `supabase link --project-ref tsmcdeynuzdbnluqdbmw`
(the link stores the ref in `packages/db/supabase/.temp/`, gitignored).

## A4. Schema ☑ (done)

- `npm run db:push -w @nutribio/db` applied both migrations
  (`initial_app_schema`, `api_role_and_grants`).
- The `nutribio_api` role password was generated and set
  (`alter role nutribio_api with password …`), and the API connection string
  was written to `packages/db/.env` as **`NUTRIBIO_API_DATABASE_URL`**
  (gitignored) — store it in the password manager:
  `postgresql://nutribio_api.<ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
- Verified in production: 9 tables in `app` with RLS on, no `anon`/
  `authenticated` grants, `nutribio_api` with `bypassrls` + CRUD, 0 policies,
  the API role logs in through the pooler and reads `app.profiles`.

**Connection note:** the direct host `db.<ref>.supabase.co` only resolves to
**IPv6** (no IPv4 on Free), so the API uses the **session pooler**
(`aws-0-eu-west-1.pooler.supabase.com:5432`, user `nutribio_api.<ref>`).
`DATABASE_URL` in `.env` keeps the direct URL for ad-hoc work on IPv6-capable
networks.

## A5. Auth configuration ☑ (done, templates pending)

`supabase config push` applied: **site URL** `https://wgbn.github.io/nutribio/`,
**redirect allow-list** (`…github.io/nutribio/`, `http://localhost:5173`,
`https://nbio.loca.lt`), **OTP length 6 / expiry 900 s**, `max_frequency 1s`,
**secure password change**, **min password 8 + letters and digits**, MFA flags
back to the Supabase defaults, storage vector disabled.

> **Free-tier limitation found:** the Management API rejects email-template
> changes while the project uses the default email provider —
> *"Email template modification is not available for free tier projects using
> the default email provider. Please upgrade your plan or configure a custom
> SMTP provider."*
>
> So the four localized templates (already generated in
> `packages/db/supabase/templates/`) are **applied at go-live**: after Brevo
> SMTP (A7) **or** the Pro plan (A8), run `npm run config:push -w @nutribio/db`
> again and the diff will only show the templates.
> `supabase config diff` today shows exactly that: the 4 template subjects.

## A6. Google OAuth ☐ deferred to the end (DECISIONS #42)

**Do nothing here for now.** v1 uses email + password + OTP only, and the
provider is `enabled = false` in `config.toml` (production matches). Revisit
this only when Google sign-in becomes a priority — the steps below are ready:

1. Google Cloud Console → create project `Nutribio`.
2. `Google Auth Platform → Branding`: app name `Nutribio`, support email,
   logo (optional).
3. `Audience`: **External**, publishing status **Testing**; add your own
   Google account under **Test users**.
4. `Data access`: scopes `openid`, `email`, `profile`.
5. `Clients → Create client → Web application`:
   - Authorized JavaScript origins: `https://wgbn.github.io`,
     `http://localhost:5173`.
   - Authorized redirect URIs:
     - production: `https://tsmcdeynuzdbnluqdbmw.supabase.co/auth/v1/callback`
     - local stack: `http://127.0.0.1:54321/auth/v1/callback`
6. Put the credentials in `packages/db/.env` (gitignored):
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, set `enabled = true` in the
   `[auth.external.google]` block, then run
   `npm run config:push -w @nutribio/db` (or paste the same values in
   Dashboard → Authentication → Providers → Google).
7. Local stack: restart it (`db:stop` + `db:start`) so the container picks up
   the credentials.

## A7. SMTP (Brevo) ☐ go-live

Required before real signups (deliverability) **and** to enable the localized
templates on the Free plan.

1. Buy a domain.
2. Brevo → authenticate the domain (SPF, DKIM, DMARC DNS records) → create an
   SMTP key.
3. Supabase dashboard → `Authentication → SMTP Settings`: host
   `smtp-relay.brevo.com`, port `587`, user + SMTP key, sender
   `no-reply@<domain>`, sender name `Nutribio`.
4. `npm run config:push -w @nutribio/db` (uncomment the `[auth.email.smtp]`
   block in `config.toml` first if you prefer managing it from the repo).

## A8. Free-plan caveats ☐ go-live

- The project **pauses after one week without activity** (restore from the
  dashboard) and has **no backups**.
- Email templates cannot be edited (A5) and auth email volume is limited.
- The **Pro plan is a go-live requirement** (launch checklist, roadmap 4.8).

---

## Local development stack

```bash
npm run db:start -w @nutribio/db    # Docker: Postgres 54322, API 54321, Studio 54323, Mailpit 54324
npm run db:reset -w @nutribio/db    # re-apply every migration from scratch
npm run db:status -w @nutribio/db   # URLs + local keys
npm run db:verify -w @nutribio/db   # RLS, grants, cascade, constraints, triggers
npm run email:verify -w @nutribio/db # signup per locale → localized OTP email in Mailpit
npm run db:stop -w @nutribio/db
```

- Studio: <http://127.0.0.1:54323> · Mailpit (emails): <http://127.0.0.1:54324>
- Local API: `http://127.0.0.1:54321` (auth at `/auth/v1`).

## Schema changes workflow

1. Edit `packages/db/src/schema/*.ts` (Drizzle is the single source of truth).
2. `npm run db:generate -w @nutribio/db` → new SQL in
   `packages/db/supabase/migrations`.
3. Manual SQL (roles, grants, triggers, FKs to `auth.users`):
   `npm run db:custom -- --name=<name> -w @nutribio/db`, then write the SQL.
4. `npm run db:reset -w @nutribio/db` locally; commit the SQL **and**
   `supabase/migrations/meta/*` (drizzle snapshots).
5. `npm run db:push -w @nutribio/db` against the hosted project (owner
   reviews the SQL first).
