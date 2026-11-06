# Legal & privacy documentation — roadmap item 5

> **Not legal advice.** Everything in this folder and in the in-app texts is an
> **engineering baseline** written from the code that actually exists. It must
> be reviewed by a lawyer before real user data reaches a deployed server
> (DECISIONS #29). The owner + lawyer checkpoint is phase 5.2 and is still open.

## Contents

| File | Purpose | Phase |
|---|---|---|
| [`data-inventory.md`](data-inventory.md) | Every data point the product collects: purpose, legal basis, sensitivity, where it lives today, where it will live, whether it is sent to Gemini, retention | 5.1 |
| [`ropa.md`](ropa.md) | Record of processing activities (GDPR art. 30 / LGPD art. 37) | 5.1 |
| [`dpia-lite.md`](dpia-lite.md) | Lightweight data-protection impact assessment for the health data (GDPR art. 35) | 5.1 |
| `../DECISIONS.md` | Formal decisions (#29, #46, #47) | — |

The **texts shown in the app** do not live here: their single source is
`apps/web/src/legal/` (typed blocks, one module per locale, versioned). This
folder is the reasoning behind them.

## Status (2026-11-06)

| Item | State |
|---|---|
| 5.1 data inventory | ☑ written (`data-inventory.md`) |
| 5.1 RoPA + DPIA-lite | ☑ written |
| 5.1 code minimization (name not sent to Gemini) | ☑ done 2026-10-06 |
| 5.1 name field made optional | ☑ done 2026-11-06 (DECISIONS #46) |
| 5.2 texts v1 (4 documents × 7 locales) | ☑ written, placeholders pending |
| 5.2 rendered in-app + linked from Welcome/Settings | ☑ done |
| 5.2 **owner + lawyer review** | ☐ **open — blocks go-live** |
| 5.2 link from Stripe Checkout | ☐ Wave 7 (item 3) |

## Documents shipped in v1

| Document id | Shown as | Consent? |
|---|---|---|
| `terms` | Terms of Use | Yes, together with `privacy` (`terms_privacy`) |
| `privacy` | Privacy Policy | Yes, together with `terms` |
| `health_data` | Health-data consent | Yes, explicit and separate |
| `health_disclaimer` | Health disclaimer | No (informational) |

The versions live in `packages/core/src/legal.ts`
(`LEGAL_DOCUMENT_VERSIONS`) and are shared with the API so the `consents`
rows of phase 5.3 record the exact text the user accepted.

## Placeholders that must be filled before go-live

The v1 texts deliberately show these markers instead of invented data:

- `[CONTROLLER_NAME]` — legal name of the data controller (owner).
- `[CONTROLLER_ADDRESS]` — controller address / establishment.
- `[CONTACT_EMAIL]` — public contact for privacy and data-subject requests.
- `[RETENTION_PERIOD]` — retention for inactive accounts (open question in
  roadmap item 5).
- `[COMPLAINT_AUTHORITY]` — supervisory authority per jurisdiction (the text
  names the CNPD for Portugal, the AEPD for Spain, etc., and this marker is
  only used where a single authority cannot be named).

The go-live checklist must confirm that none remain — this command must
return nothing:

```bash
grep -rn -e '\[CONTROLLER_NAME\]' -e '\[CONTROLLER_ADDRESS\]' \
  -e '\[CONTACT_EMAIL\]' -e '\[RETENTION_PERIOD\]' \
  -e '\[TRANSFER_NOTE\]' -e '\[COMPLAINT_AUTHORITY\]' apps/web/src/legal/
```

## Open items found while writing 5.1 (not fixed here)

| Item | Consequence | Where |
|---|---|---|
| The onboarding/Dados form accepted any `age > 0`; there is no 18+ gate | The texts state 18+; the gate must land before signup (5.3) | roadmap 5.3 |
| `settings.geminiApiKey` is stored in plaintext `localStorage` until 4.6 | The texts describe the target (server-side key); today the key is on the device | roadmap 4.6 |
| The Welcome privacy card still says "data stays on this device" | True today, not true after 4.6; the copy must be rewritten with the data layer | roadmap 4.6 |
| `plan.profileSnapshot` keeps a full profile copy (including the name) in `localStorage` | Covered by the inventory; deleted by "Delete all data" and by the reset on logout in 4.6 | — |
| The profile name is required in the API schema only by length (`max 60`) | No change needed: empty names are valid | — |

## Data-protection principles applied

- **Minimization**: the name is optional and never sent to Gemini; age only
  (no birth date); no analytics, no advertising identifiers.
- **Purpose limitation**: data is used to compute targets and generate plans,
  plus auth and billing — nothing else.
- **Storage limitation**: account deletion cascades every `app` row; the
  inactive-account retention is an open question.
- **Integrity & confidentiality**: Supabase EU, private `app` schema not
  exposed by the Data API, RLS with no client policies, API role with
  `BYPASSRLS`, JWKS-verified tokens, 16 KB body ceiling, no PII in logs.
- **Accountability**: consents stored with document, version, locale and
  timestamp (5.3); this folder is the processing record.
