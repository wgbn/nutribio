# Data inventory — roadmap item 5, phase 5.1

Single record of every data point the product handles. It is the basis for the
Privacy Policy, the RoPA (`ropa.md`), the DPIA-lite (`dpia-lite.md`) and the
consent gate (phase 5.3).

**Legend**

- **Today** — the shipped app (roadmap up to 4.4): `localStorage` under
  `nutribio.v1`, single device, no server.
- **Target** — the backend era once phases 4.6–4.8 land: Supabase Postgres in
  the `app` schema (EU, `eu-west-1`), written only by the Nuxt API.
- **Gemini** — whether the value is part of the prompt sent to Google Gemini.
- Sensitivity follows GDPR art. 9 / LGPD art. 11 (special category).

## 1. Account (`auth.users`, target only)

| Data | Purpose | Legal basis | Sensitivity | Today | Target | Gemini |
|---|---|---|---|---|---|---|
| Email address | Sign-in, email confirmation and recovery, receipts | Contract (GDPR 6(1)(b)) | Personal | — (no accounts) | Supabase Auth (`auth.users.email`) | No |
| Password (hashed by Supabase) | Sign-in | Contract | Secret | — | Supabase Auth | No |
| Email-confirmed flag, last sign-in | Security, anti-abuse before the free generation | Legitimate interest (6(1)(f)) | Personal | — | Supabase Auth | No |
| Locale (`user_metadata.locale`) | Language of the transactional emails | Contract | Personal (weak) | — | Supabase Auth metadata | No |
| Session tokens (JWT, refresh) | Authenticated API calls | Contract | Secret | — | Browser storage + JWKS verification | No |

## 2. Profile (`Profile` in `@nutribio/core`, `app.profiles`)

| Field | Purpose | Legal basis | Sensitivity | Gemini | Notes |
|---|---|---|---|---|---|
| `name` (optional) | Greeting on the Today screen | Consent / contract | Personal | **No** | Optional since 2026-11-06 (DECISIONS #46). Never sent to Gemini. |
| `sex` | BMR formula (Mifflin-St Jeor / Harris-Benedict) | Contract | Health-adjacent | Yes | — |
| `age` (years, no birth date) | BMR formula | Contract | Health-adjacent | Yes | 18+ self-declaration (5.3). |
| `height` (cm) | BMR formula, BMI | Contract | Health-adjacent | Yes | — |
| `initialWeight` (kg) | Fallback weight before the first measurement | Contract | Health-adjacent | Yes (as current weight) | — |
| `goal` | Calorie range and macro split | Contract + explicit consent | Health | Yes | — |
| `country` | Cuisine hints, currency, legal regime | Contract | Personal | Yes (English country name) | DECISIONS #26. |
| `exercise.active`, `frequency`, `intensity`, `type` | Activity factor (TDEE) | Contract | Health | Yes | — |
| `exercise.workoutTime` (`HH:MM`) | Pre/post-workout meal badges and prompt block | Contract | Health (routine) | Yes, when exercise is active | DECISIONS #18. |
| `supplements.wheyProtein`, `supplements.creatine` | Whether the plan may include supplements | Contract | Health | Yes | DECISIONS #32. |
| `excludedFoods` (free text, ≤ 1000) | Never include these foods | Explicit consent | **Special category** (may reveal religion, allergies, coeliac disease) | Yes, when non-empty | DECISIONS #11. |
| `observations` (free text, ≤ 2000) | Nutritionist instructions | Explicit consent | **Special category** | Yes, when non-empty | DECISIONS #11. |
| `updatedAt` | Change tracking | Contract | Personal (weak) | No | — |

## 3. Bioimpedance (`BioRecord`, `app.bio_records`)

| Field | Purpose | Legal basis | Sensitivity | Gemini |
|---|---|---|---|---|
| `date` | History key (one record per date) | Explicit consent | **Special category** | Yes (the latest record) |
| `weight` (kg) | Current weight for BMR/TDEE and protein target | Explicit consent | **Special category** | Yes |
| `bodyFat` (%) | Progress tracking; prompt context | Explicit consent | **Special category** | Yes |
| `water` (%) | Progress tracking; prompt context | Explicit consent | **Special category** | Yes |
| `bmr` (scale) | Context only (the app computes its own BMR) | Explicit consent | **Special category** | Yes |
| `visceralFat` | Progress tracking | Explicit consent | **Special category** | Yes |
| `bmi` | Progress tracking | Explicit consent | **Special category** | Yes |
| `muscle` (kg) | Progress tracking | Explicit consent | **Special category** | Yes |
| `protein` (%) | Progress tracking | Explicit consent | **Special category** | Yes |
| `boneMass` (kg) | Progress tracking | Explicit consent | **Special category** | Yes |
| `bodyAge` | Progress tracking | Explicit consent | **Special category** | Yes |
| `idealWeight` (kg) | Progress tracking | Explicit consent | **Special category** | Yes |

All metrics are optional; the API stores omitted metrics as `null`.

## 4. Generated plans (`Plan`, `app.plans` + `app.dishes` + shopping tables)

| Data | Purpose | Legal basis | Sensitivity | Origin |
|---|---|---|---|---|
| `generatedAt`, `inputsHash`, `locale`, `model` | Cache validity, stale detection, job metadata | Contract | Personal (weak) | Computed |
| `profileSnapshot`, `biometricsSnapshot` | Reproducibility of the plan as generated | Contract + explicit consent | **Special category** (copy of §2/§3) | Copy |
| `targets` (BMR, TDEE, kcal range, macros, meal split) | Display and prompt | Contract | Health-adjacent | Computed locally / server-side |
| `week` (7 days × 5 meals × 3 variations: dish name, description, ingredients with grams, macros, notes) | The core service | Contract | Derived health data | Gemini output, validated |
| `overview` | Plan summary | Contract | Derived health data | Gemini output |
| `shoppingItems` (canonical products, categories, package sizes) | Shopping list | Contract | Personal (diet) | Gemini output, validated |
| `plan_selections` (chosen variation per day/slot) | User preference | Contract | Personal (diet) | User action |
| `shopping_checks` (bought item keys) | Shopping list state | Contract | Personal (diet) | User action |
| Generation job fields (`status`, `error_code`, `attempts`, timestamps) | Background worker, retries | Contract | Personal (weak) | Computed |

Plans are per-user, `is_current` marks the active one; older plans are kept as
history.

## 5. Device settings (never leave the device)

| Key | Purpose | Legal basis | Gemini | Notes |
|---|---|---|---|---|
| `settings.geminiApiKey` | Authenticate the Gemini call | Contract | Sent to Google as the API credential | Plaintext `localStorage` **today**; removed from the web app in 4.6 (key becomes a server secret, DECISIONS #22). Never sent to our servers. |
| `settings.model` | Chosen Gemini model | Contract | No | Removed from the web app in 4.6. |
| `settings.locale` (`'auto' \| Locale`) | UI language | Contract | The resolved locale is sent in the prompt (output language) | Kept on reset (device preference). |
| `nutribio.v1.schemaVersion` | Local data migration marker | — | No | — |
| `nutribio.v1.shoppingChecks` | Bought marks per plan hash | Contract | No | Becomes `app.shopping_checks`. |

## 6. Consent records (`app.consents`, phase 5.3)

| Data | Purpose | Legal basis | Sensitivity |
|---|---|---|---|
| `document` (`terms_privacy` / `health_data` / `age_18`) | Which consent | Legal obligation — accountability (GDPR 7(1) / LGPD 8) | Personal |
| `version` | Which text was accepted (`v1`…) | Accountability | Personal |
| `locale` | Language shown at the time | Accountability | Personal |
| `grantedAt`, `withdrawnAt` | Validity window | Accountability | Personal |

## 7. Operational data

| Data | Purpose | Legal basis | Retention |
|---|---|---|---|
| API access logs (route + status + error code only) | Security and debugging | Legitimate interest | Short-lived; **no bodies, tokens, emails or health data** (DECISIONS #44) |
| Stripe billing data (customer id, subscription status, invoices) | Payments (Wave 7) | Legal obligation (tax) + contract | Statutory period; handled by the merchant of record |
| Transactional emails (OTP, recovery) | Auth | Contract | Provider retention (Brevo, once configured) |

No analytics, no advertising identifiers, no cookies beyond strictly necessary
storage → **no cookie banner** (DECISIONS #29).

## 8. Recipients / processors

| Recipient | Role | Data | Location |
|---|---|---|---|
| Supabase | Processor (DB + Auth) | Everything in §1–§6 | EU (`eu-west-1`, Ireland) |
| Nuxt API host (TBD, 4.8) | Processor | Proxies §2–§4 to the DB; holds server secrets | EU (to be confirmed) |
| Google (Gemini API) | Processor | §2 (except the name) + §3 + targets | Paid tier required before go-live so prompts are not used for training |
| Brevo | Processor (SMTP) | Email address + locale | EU |
| Stripe / Link | Merchant of record (Wave 7) | Billing data | EU/US under the MoR terms |
| Google OAuth | **Not used** (SSO deferred, DECISIONS #42) | — | — |

No data is sold or shared with third parties for their own purposes.

## 9. Data-subject rights and how they are served

| Right | Today (local app) | Target |
|---|---|---|
| Access / portability | Settings → Export (raw JSON) | `GET /api/account/export` (`formatVersion: 1`) |
| Erasure | Settings → Delete all data | `DELETE /api/account` → Admin API → cascade |
| Withdrawal of consent | Delete all data | Settings → Privacy (5.4) + `consents.withdrawnAt` |
| Rectification | Dados screen | `PUT /api/profile`, `PUT /api/bio/:date` |
| Objection / restriction | Not applicable (contract/consent only) | Same, via support contact |
| Complaint | `[COMPLAINT_AUTHORITY]` | Same |

## 10. Retention

| Data | Retention |
|---|---|
| Account, profile, bio, plans, consents | Until account deletion (cascade) |
| Inactive accounts | `[RETENTION_PERIOD]` (open question, roadmap 5.5) |
| API logs | Short-lived (days), no PII |
| Billing records | Statutory period, via the merchant of record |
| Local device data | Until "Delete all data" or the cache reset on logout (4.6) |
