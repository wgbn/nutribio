# Nutribio — Improvement Roadmap

This folder is the **tracking system** for the 2026-10 improvements. It gives
full control over what is done, what is missing, and which decisions were
taken. Companion docs: [`../DECISIONS.md`](../DECISIONS.md) (formal decision
log — roadmap decisions are also recorded there),
[`../ARCHITECTURE.md`](../ARCHITECTURE.md) (how the app works) and
[`../CHANGELOG.md`](../CHANGELOG.md) (per-change log).

## How to use this folder (mandatory workflow)

- **Before** working on any phase: read this README + the item file for the
  phase you will execute + `docs/DECISIONS.md` (never undo logged decisions).
- **After** finishing (or making progress on) a phase:
  1. Tick the checklist items in the item file (`☐` → `☑`).
  2. Append a line to the item file's **Progress log** (date — what was done —
     commit hash).
  3. Update the status table below.
  4. Log any new technical decision in `docs/DECISIONS.md` (append, never edit
     old entries) and link it from the item file.
  5. Add the usual entry to `docs/CHANGELOG.md`.
- Status legend: `☐` not started · `◐` in progress · `☑` done (date).

## Items

| # | Item | File | Status |
|---|---|---|---|
| 1 | Multi-language support (7 locales + LLM output language) | [01-i18n.md](01-i18n.md) | ◐ (2026-10-06 — code complete; native review of es/fr/de/it pending) |
| 2 | Welcome / landing screen | [02-welcome.md](02-welcome.md) | ☑ (2026-11-06 — local-only; auth CTA in Wave 6) |
| 3 | Payments (Stripe, freemium, EUR + BRL) | [03-payments.md](03-payments.md) | ☐ |
| 4 | Backend & storage (Nuxt API + Supabase) | [04-backend-storage.md](04-backend-storage.md) | ◐ (2026-11-06 — 3/9 phases: 4.1, 4.2, 4.3; 4.4–4.9 pending) |
| 5 | Terms, privacy & consent (RGPD/LGPD/UK GDPR) | [05-legal-consent.md](05-legal-consent.md) | ◐ (2026-10-06 — first minimization change done: name removed from the prompt) |
| 6 | Country-aware cuisine (onboarding + prompt) | [06-country-cuisine.md](06-country-cuisine.md) | ☑ (2026-10-06) |
| 7 | Weekly shopping list ("Compras" tab) | [07-shopping-list.md](07-shopping-list.md) | ☑ (2026-10-06) |

## Execution order (waves)

The order follows dependencies (later screens must be born translated;
legal texts must exist before real data reaches a server; payments need the
backend):

1. **Wave 1** — Item 1 phases 1.1–1.3 (i18n infrastructure + string extraction
   + catalogs).
2. **Wave 2** — Item 6 (country) + Item 1 phase 1.4 (multilingual prompt —
   one single prompt refactor: English instructions + output language +
   country cuisine hints).
3. **Wave 3** — Item 7 (shopping list: schema extension + local aggregation
   + tab).
4. **Wave 4** — Item 2 (Welcome screen, local-only first; auth CTAs wired in
   Wave 6) — ☑ done 2026-11-06.
5. **Wave 5** — Item 4 phases 4.1–4.2 (monorepo + `packages/core`) — ☑ done
   2026-11-06.
6. **Wave 6** — ◐ in progress: **Item 4 phase 4.3 done** (2026-11-06 — Supabase
   project + schema + Auth config; owner setup in
   [`../SUPABASE_SETUP.md`](../SUPABASE_SETUP.md)) — order changed by
   DECISIONS #36: 4.3 creates infrastructure only and stores no user data, so
   it can precede the legal texts. Remaining in this wave: Item 5 phases
   5.1–5.2 (data inventory + legal texts — must exist before real user data
   leaves the device), then Item 4 phases 4.4–4.9 (Nuxt API + auth + data
   layer + background generation) together with Item 5 phases 5.3–5.5
   (consent gate + data-subject rights).
7. **Wave 7** — Item 3 (Stripe payments; requires backend + auth + legal).
8. **Wave 8** — Launch hardening checklist (see §4 of the plan).

## Blocking non-code dependencies (owner actions)

| Dependency | Blocks | Status |
|---|---|---|
| Accountant consult (sole trader / "atividade aberta"; Brazil tax gap via MoR) | Item 3 (3.0) | ☐ |
| Lawyer review of Terms/Privacy/consent texts | Item 5 (5.2) → server go-live | ☐ |
| Stripe PT account + Managed Payments eligibility (or Paddle decision) | Item 3 (3.0) | ☐ |
| Gemini API paid tier (billing enabled) | Item 4 (4.7) + Item 5 (5.5) | ☐ |
| Supabase project (EU region) + plan decision | Item 4 (4.3) | ☑ (2026-11-06 — `nutribio`, `eu-west-1`, Free; schema + Auth config pushed) |
| Google OAuth client (Cloud Console) | deferred to the end (post-launch SSO) | ☐ (DECISIONS #42 — not a launch dependency) |
| Custom domain + authenticated SMTP sender (Brevo) | real signups / go-live (4.8); also unlocks the localized auth templates on Free | ☐ |
| Supabase Pro upgrade (no project pause, backups) | go-live (4.8) | ☐ |
| VPS/host decision for the Nuxt API | Item 4 (4.8) | ☐ |
| Native review of es/fr/de/it translations | Item 1 (1.3) polish | ☐ |

## Ad-hoc features & fixes (outside the 7 items)

Logged in `docs/CHANGELOG.md` and `docs/DECISIONS.md` (never silently
undone):

- 2026-10-07 — Optional supplements (whey protein, creatine) in the profile
  and the Gemini prompt (DECISIONS #32).
- 2026-10-06 — Fix: shopping catalog missing after regenerating from any
  screen (schema `required` + unified `GeneratePlanButton`).
