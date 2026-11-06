# 05 — Terms, privacy & consent (RGPD / LGPD / UK GDPR)

**Status:** ◐ In progress (2026-11-06 — 5.1 data inventory/RoPA/DPIA and 5.2
texts v1 + in-app reader done; **owner + lawyer review open**, blocks go-live)

> Not legal advice. The texts drafted here are engineering baselines and
> **must be reviewed by a lawyer** before real user data reaches the server.

## Goal

A Terms & Privacy acceptance flow (screen/pop-up) compliant with the EU GDPR
(RGPD), Brazil's LGPD and UK GDPR (GB is in the country list — Item 6),
based on the minimal data actually collected. No data sharing or selling.

## Data inventory (minimal set)

| Data | Purpose | Legal basis | Sensitivity |
|---|---|---|---|
| Email (account) | Auth, receipts (via Stripe/Link) | Contract | — |
| Name (optional, first name) | Greeting | Consent | — |
| Age, sex, height | Nutrition math | Contract + explicit consent (health) | Health-adjacent |
| Weight, body fat %, water %, BMR, visceral fat, BMI, muscle, protein %, bone mass, body age | Bioimpedance history | **Explicit consent (health data)** | **Special category (GDPR art. 9 / LGPD art. 11)** |
| Goal, exercise habits, excluded foods, observations | Diet generation | Contract + explicit consent | Health/religion-revealing (e.g. coeliac, "no pork") |
| Country (Item 6) | Cuisine, currency | Contract | — |
| Plans, dishes, selections, shopping checks | Core service | Contract | Derived health data |
| Billing data | Payment | Legal obligation (via MoR) | Processed by Stripe/Link |

### Minimization changes (code)
- **Stop sending the name to Gemini** (not needed for generation).
- Age only (no birth date). Name optional/first name.
- No IP storage beyond short-lived security logs.

## Processors (to disclose in the Privacy Policy)

- Supabase (DB + Auth, EU hosting) — processor.
- Nuxt API host (EU, chosen in Item 4) — processor.
- **Google Gemini API — paid tier MANDATORY** (the free tier allows Google
  to use prompts for training/human review; for EEA users paid terms apply
  regardless, but not automatically for Brazilian users).
- Google OAuth (**only if/when SSO is enabled** — deferred, DECISIONS #42);
  email/SMTP provider; Stripe/Link (independent controller /
  merchant of record for payments).
- No partners for sharing or selling data (owner statement) — the policy must
  state this and the sub-processor list must be kept public.

## Legal bases

Contract (account/service) · explicit consent (health data) · legal
obligation (tax records — via MoR) · legitimate interest (security).

## Other compliance notes

- **No cookie banner** if only strictly-necessary storage (auth session +
  cache) and **no analytics** — recorded as a decision; adding analytics
  later requires a consent banner.
- International transfers (US providers → SCCs/DPF; LGPD art. 33 for Brazil)
  — to be confirmed by counsel.
- Controller identity + contact email in the Privacy Policy (owner must
  provide a public contact).
- DPIA-lite (health data), record of processing activities (RoPA),
  retention policy (delete on account deletion; inactive accounts),
  breach-notification procedure.
- 18+ self-declaration at signup (owner decision 2026-10-06).
- Health disclaimer: not medical advice; not for pregnancy, eating disorders
  or chronic disease without professional supervision.
- Withdrawal rights: EU 14-day (digital content), Brazil CDC art. 49 (7 days)
  — Terms + checkout (Item 3).
- The shopping list (Item 7) is a **suggestion** — no liability for allergens
  in branded products (note in Terms).

## Decisions

- 2026-10-06 — Explicit, separate, unticked consent for health data; 18+;
  no analytics → no cookie banner. (DECISIONS #29)
- 2026-10-06 — Gemini paid tier mandatory before go-live. (DECISIONS #29)
- 2026-11-06 — Profile name is optional (minimization). (DECISIONS #46)
- 2026-11-06 — Legal texts v1: typed blocks in the web app, versions in
  `@nutribio/core`, target-service scope, visible placeholders for owner data,
  reader reachable from Welcome/Settings. (DECISIONS #47)

## Open questions

- [ ] Public contact email for the controller.
- [ ] Retention for inactive accounts (e.g., delete after N months).
- [ ] Lawyer confirmation on international transfers (SCCs/DPF/LGPD art. 33).
- [ ] Final review of all 7 language versions by a lawyer.
- [ ] Replace the visible placeholders (`[CONTROLLER_NAME]`,
      `[CONTROLLER_ADDRESS]`, `[CONTACT_EMAIL]`, `[RETENTION_PERIOD]`,
      `[TRANSFER_NOTE]`, `[COMPLAINT_AUTHORITY]`) before go-live — see
      `docs/legal/README.md`.
- [ ] 18+ gate in onboarding (prerequisite of 5.3; the texts already state 18+).
- [ ] Rewrite the Welcome "data stays on this device" copy with the data layer
      (4.6) — the texts describe the target service.

## Phases

### 5.1 Data inventory + minimization
- [x] `docs/legal/` — data inventory, RoPA, DPIA-lite (2026-11-06:
      `data-inventory.md`, `ropa.md`, `dpia-lite.md`, `README.md`).
- [x] Code: remove `name` from the Gemini prompt. (Done 2026-10-06 with the prompt rewrite — the name is no longer sent to Gemini.)
- [x] Code: `Profile.name` optional (onboarding + Dados no longer require it;
      labels say "(optional)" in the 7 catalogs). DECISIONS #46.

### 5.2 Texts
- [x] Terms of Use, Privacy Policy, health-data consent text, health
      disclaimer — `en-GB` source + 6 translations, versioned (`v1`)
      (`apps/web/src/legal/`, versions in `packages/core/src/legal.ts`).
- [x] Rendered in-app (typed blocks, no Markdown) + linked from
      Welcome/Settings.
- [ ] Linked from Stripe Checkout → Wave 7 (item 3).
- [ ] **Checkpoint: owner + lawyer review.**

### 5.3 Consent gate
- [ ] At signup, before any data is sent to the server: separate unticked
      checkboxes — (a) Terms + Privacy; (b) explicit health-data consent;
      (c) 18+.
- [ ] `consents` table (document, version, locale, timestamp); blocking
      re-consent modal when a version changes.

### 5.4 Data-subject rights (UI + API)
- [ ] Definições → "Privacidade": view documents, export my data (JSON),
      delete account (cascade + Stripe customer handling), withdraw consent,
      contact.
- [x] API side (roadmap 4.4, 2026-11-06): `GET /api/account/export` (full JSON,
      `formatVersion: 1`) and `DELETE /api/account` (`{confirm:true}` → Admin
      API → cascade of every `app` row). The Settings UI and the Stripe
      customer handling arrive with this phase.

### 5.5 Retention & processors
- [ ] Retention job + sub-processor list page + Gemini paid-tier
      verification.

## Verification

- Signup impossible without the three consents; consents recorded with
  version + timestamp.
- Export produces complete JSON; deletion removes all rows (test with RLS
  bypass).
- Re-consent modal appears when a version bumps.

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan (data inventory
  drafted).

- 2026-10-06 — First code change landed with the prompt rewrite (item 1.4):
  the profile name is no longer sent to the Gemini prompt (data
  minimization). Remaining 5.1 work: docs/legal inventory, RoPA, DPIA-lite.

- 2026-11-06 — API groundwork for 5.4 landed with roadmap 4.4: data export
  (`GET /api/account/export`) and account deletion (`DELETE /api/account`,
  Admin API + cascade). The Settings UI, the Stripe customer handling and the
  consent guard (5.3) are still pending.

- 2026-11-06 — Phases 5.1 and 5.2 (Wave 6). **5.1**: `docs/legal/` created
  (data inventory per field with legal basis/sensitivity/Gemini exposure,
  RoPA, DPIA-lite with risks R1–R10, README with the go-live checklist);
  `Profile.name` made optional (DECISIONS #46) and the inventory recorded the
  remaining gaps (18+ gate, plaintext key until 4.6, Welcome copy until 4.6).
  **5.2**: four documents (Terms, Privacy, health-data consent, health
  disclaimer) as typed blocks in 7 locales (`apps/web/src/legal/`, all lazy),
  versions in `packages/core/src/legal.ts` (DECISIONS #47), reader
  `LegalDocumentView` overlaying any screen, links from the Welcome privacy
  card and a new "Legal documents" section in Settings, `i18n:check` extended
  with legal structure parity. Verified: build + core/db/api typechecks,
  browser flows (pt-PT/de, back navigation, name-less onboarding and Dados,
  390×844 / 1440×900), no Gemini/API requests; entry bundle +4.41 kB
  (+1.06 kB gzip), legal texts in lazy chunks. **Checkpoint owner + lawyer
  review remains open** — it blocks go-live, as do the visible placeholders.
