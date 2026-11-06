# DPIA-lite — health data and AI-generated plans

Lightweight data-protection impact assessment (GDPR art. 35; LGPD art. 38).
The product processes special-category health data (bioimpedance readings,
diet restrictions, nutrition goals), so an assessment is required even though
the scale is small.

## 1. Description of the processing

- **What**: an account, a short profile, bioimpedance history, generated weekly
  meal plans, shopping checks and consent records (`data-inventory.md`).
- **Who**: adults (18+) who sign up voluntarily.
- **How**: the PWA collects the data; the Nuxt API stores it in Supabase (EU);
  Google Gemini generates the plan from a prompt built server-side.
- **Why**: the core service — a weekly meal plan adjusted to the user's body
  data, goal, country and restrictions.
- **Scale**: single-product consumer app; no profiling for advertising, no
  automated decisions with legal effects, no sale of data.

## 2. Necessity and proportionality

| Question | Answer |
|---|---|
| Is each field needed? | Demographics feed the BMR/TDEE formulas; bioimpedance feeds progress and the prompt; restrictions are the only way to honour exclusions. The name is **optional** and never sent to Gemini. |
| Can less be collected? | Age is collected instead of a birth date; no phone, address, ID or photos; no analytics; no advertising identifiers. |
| Is it proportionate? | Yes for a paid/freemium nutrition tool, provided the consent gate (5.3) and the texts reviewed by counsel are in place. |
| Retention | Until account deletion; inactive-account retention `[RETENTION_PERIOD]` (open). |

## 3. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation | Residual |
|---|---|---|---|---|---|
| R1 | Unauthorized access to health data in the database | Low | High | Private `app` schema (not exposed by the Data API), RLS on every table with no client policies, API-only access through a dedicated role, secrets outside the repo | Low |
| R2 | Health data leaves to a third party (Gemini) beyond what is needed | Medium | High | Prompt sends only what the plan needs; the name is not sent; **paid tier mandatory** so prompts are not used for training/review; no prompt logging | Low-Medium |
| R3 | Gemini key exposed (today: `localStorage`) | Medium | Medium | Today the key is the user's own and stays on their device; from 4.6 it becomes a server secret and the field disappears from the web app | Low after 4.6 |
| R4 | Free-text fields (`excludedFoods`, `observations`) contain unintended personal data | Medium | Medium | Length caps (1000/2000), verbatim use limited to the prompt, never logged, user can edit/delete | Low-Medium |
| R5 | International transfer to the AI provider (US) | High (by design) | Medium | Paid-tier terms, SCCs/DPF to be confirmed by counsel; alternative EU-only generation is out of scope | Medium — counsel |
| R6 | Breach notification failure | Low | High | Documented procedure in the Terms/Privacy; owner contact; Supabase and API host logs; breach playbook to be written before go-live | Medium |
| R7 | Inactive accounts kept forever | Medium | Medium | Retention job in 5.5 with `[RETENTION_PERIOD]` | Medium until 5.5 |
| R8 | Account deletion incomplete | Low | High | Admin API deletion cascades every `app` row (verified by integration tests) | Low |
| R9 | Consent not provable | Medium | Medium | `consents` table with document, version, locale and timestamps; blocking re-consent modal on version bump (5.3) | Low |
| R10 | AI output unsafe for a health condition (e.g. allergy missed) | Medium | High | Excluded foods are mandatory in the prompt (rule 11); the health disclaimer states the app is not medical advice; the shopping list is a suggestion | Medium — disclosed |

## 4. Data-subject rights

Access/portability (`GET /api/account/export`), erasure (`DELETE /api/account`
+ cascade), rectification (Dados), withdrawal of consent (Settings → Privacy,
5.4) and complaint (`[COMPLAINT_AUTHORITY]`). The consent text explains that
withdrawing the health-data consent ends the service, because the plan cannot
be generated without it.

## 5. Consultation

- **Owner**: must fill `[CONTROLLER_NAME]`, `[CONTROLLER_ADDRESS]`,
  `[CONTACT_EMAIL]` and `[RETENTION_PERIOD]`.
- **Lawyer**: review of the texts and of R5/R6 before go-live.
- **Supervisory authority**: prior consultation is not expected (no large-scale
  systematic monitoring, no innovative high-risk use beyond the AI generation
  already disclosed), but counsel must confirm.

## 6. Outcome

Processing may proceed **only after**:

1. the texts of phase 5.2 are reviewed (owner + lawyer);
2. the consent gate of phase 5.3 ships (explicit, separate, unticked);
3. the Gemini paid tier is active;
4. the retention job (5.5) and the breach playbook exist;
5. the placeholders above are replaced.

Sign-off: `[OWNER]` · `[LAWYER]` · date: `[DATE]`.
