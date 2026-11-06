# Record of processing activities (RoPA)

GDPR art. 30 / UK GDPR art. 30 / LGPD art. 37. Baseline written from the code
and from `data-inventory.md`; the controller identity and contact are
placeholders until the owner provides them.

| Field | Value |
|---|---|
| Controller | `[CONTROLLER_NAME]`, `[CONTROLLER_ADDRESS]` |
| Contact | `[CONTACT_EMAIL]` |
| DPO | Not required (no large-scale systematic monitoring; contact via `[CONTACT_EMAIL]`) |
| Representative in the EU | The controller is established in the EU (Portugal) |
| Last review | 2026-11-06 (engineering baseline) |

## Processing activities

### A. Account creation and authentication

| Item | Detail |
|---|---|
| Purpose | Create and secure the account; confirm the email; recover the password |
| Data subjects | Registered users (18+) |
| Data | Email, hashed password, confirmation state, locale metadata, session tokens |
| Legal basis | Contract — GDPR 6(1)(b) / LGPD 7(V) |
| Recipients | Supabase (processor), Brevo (SMTP processor, once configured) |
| Transfers | None outside the EU (Supabase `eu-west-1`; Brevo EU) |
| Retention | Until account deletion |
| Security | Supabase Auth, ES256 JWTs verified through JWKS, 6-digit OTP, 15-minute expiry, password policy |

### B. Profile and nutrition targets

| Item | Detail |
|---|---|
| Purpose | Compute BMR/TDEE, calorie range and macros deterministically |
| Data subjects | Registered users |
| Data | Sex, age, height, initial weight, goal, exercise habits, supplements, country, optional name |
| Legal basis | Contract — 6(1)(b); explicit consent for the health-adjacent fields — 9(2)(a) / LGPD 11(I) |
| Recipients | Supabase (processor) |
| Transfers | None |
| Retention | Until account deletion; previous states kept in `profile_history` for the user's own history |
| Security | API-only access (private `app` schema, RLS without client policies), zod validation, whole-profile writes |

### C. Bioimpedance measurements

| Item | Detail |
|---|---|
| Purpose | Track progress and supply the latest measurement to the plan |
| Data subjects | Registered users |
| Data | Date and up to 11 scale metrics (weight, body fat, water, BMR, visceral fat, BMI, muscle, protein, bone mass, body age, ideal weight) |
| Legal basis | **Explicit consent** — GDPR 9(2)(a) / LGPD 11(I) (special-category health data) |
| Recipients | Supabase (processor); Google Gemini (processor) — latest record only, inside the prompt |
| Transfers | Google (US) under the paid-tier terms; SCCs/DPF to be confirmed by counsel |
| Retention | Until account deletion |
| Security | Same as B; Gemini paid tier so prompts are not used for model training |

### D. Weekly meal-plan generation

| Item | Detail |
|---|---|
| Purpose | Produce the weekly plan (dishes, gram portions, shopping catalogue) |
| Data subjects | Registered users |
| Data | Prompt content: sex, age, height, current weight, goal, exercise, supplements, latest bioimpedance, excluded foods, observations, country, output language. **Not sent:** name, email, account id |
| Legal basis | Contract — 6(1)(b); explicit consent for the health data inside the prompt — 9(2)(a) |
| Recipients | Google Gemini (processor) |
| Transfers | Google (US); SCCs/DPF to be confirmed by counsel |
| Retention | Prompt content is not stored by us beyond the plan itself; Google retention follows the paid API terms |
| Security | Server-side API key (from 4.7), validated output, no prompt logging |

### E. Shopping list and plan selections

| Item | Detail |
|---|---|
| Purpose | Show the weekly shopping list and remember the chosen dish variation |
| Data subjects | Registered users |
| Data | Canonical shopping items, bought marks, selected variation per meal |
| Legal basis | Contract — 6(1)(b) |
| Recipients | Supabase (processor) |
| Transfers | None |
| Retention | Until the plan or the account is deleted |
| Security | Same as B |

### F. Consent records

| Item | Detail |
|---|---|
| Purpose | Prove which text and version the user accepted, and when |
| Data subjects | Registered users |
| Data | Document id, version, locale, granted/withdrawn timestamps |
| Legal basis | Legal obligation — accountability, GDPR 7(1) / LGPD 8 |
| Recipients | Supabase (processor) |
| Transfers | None |
| Retention | Until account deletion (the record itself is the proof) |
| Security | Same as B |

### G. Payments and billing (Wave 7, item 3)

| Item | Detail |
|---|---|
| Purpose | Charge the monthly subscription, issue invoices, handle refunds |
| Data subjects | Subscribers |
| Data | Stripe customer id, subscription status, period end, invoices |
| Legal basis | Contract — 6(1)(b); legal obligation for tax records — 6(1)(c) |
| Recipients | Stripe / Link (merchant of record) |
| Transfers | Per the merchant-of-record terms |
| Retention | Statutory accounting period |
| Security | No card data touches our servers |

### H. Security and abuse prevention

| Item | Detail |
|---|---|
| Purpose | Protect the service (rate limits, invalid tokens, errors) |
| Data subjects | Users and visitors |
| Data | Route, HTTP status, error code, timestamps (no bodies, tokens, emails or health data) |
| Legal basis | Legitimate interest — 6(1)(f) |
| Recipients | API host (processor) |
| Transfers | None |
| Retention | Short-lived (days) |
| Security | Log scrubbing is enforced in code (DECISIONS #44) |

### I. Transactional email

| Item | Detail |
|---|---|
| Purpose | OTP for signup/recovery/email change/reauthentication |
| Data subjects | Registered users |
| Data | Email address, locale, OTP token |
| Legal basis | Contract — 6(1)(b) |
| Recipients | Brevo (processor), Supabase Auth |
| Transfers | None (EU provider) |
| Retention | Provider retention; OTP valid 15 minutes |
| Security | 6-digit OTP, expiry, rate limits |

## Systems and security measures (summary)

- Supabase Postgres in `eu-west-1`, private `app` schema not exposed by the
  Data API, RLS enabled on every table with no client policies, API role with
  `BYPASSRLS` and a password kept outside the repository.
- Nuxt API: JWKS (ES256) token verification, CORS allow-list, 16 KB body
  ceiling, code-based errors, no PII in logs.
- Secrets only in server environments; the repository ignores `.env*`.
- TLS everywhere (GitHub Pages, Supabase, API host, Gemini).

## Review

| Date | Change |
|---|---|
| 2026-11-06 | Baseline created (roadmap 5.1). Owner identity, contact and retention placeholders pending. |
