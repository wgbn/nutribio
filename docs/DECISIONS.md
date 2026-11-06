# Decision Log — Nutribio

This is the **authoritative record of important decisions**. Future agents must
read this file before making changes and must NOT silently undo any decision
here. When a new significant decision is made, append it with a date.

Format: `#N. Date — Title` followed by context, decision, and consequences.

---

#1. 2026-09-22 — 100% frontend, no backend, data stays on-device
**Context:** The user asked for a PWA with no backend, fed by a bioimpedance
scale, with per-user data that never needs to move between devices.
**Decision:** No server, no database, no accounts, no sync. Everything is
stored in `localStorage` under the `nutribio.v1` namespace
(`profile`, `biometrics`, `plan`, `settings`, `schemaVersion`).
**Consequences:** Data is single-device by design. Any future "sync" feature
would contradict this and must be discussed with the user first.

#2. 2026-09-22 — Stack chosen by the agent (user delegates code to AI agents)
**Context:** The user explicitly said they will never touch the code, so the
agent picks the stack it is strongest with.
**Decision:** React 19 + Vite 7 + TypeScript (strict) + Tailwind CSS v4 +
`@google/genai` + chart.js/react-chartjs-2 + `vite-plugin-pwa`.
**Consequences:** Future agents should stay within this stack unless the user
asks otherwise. Pin `@google/genai` to `^2.x` (do not jump to 3.x without
checking the changelog; 2.x keeps `generateContent` stable).

#3. 2026-09-22 — Gemini API key: Settings screen → localStorage ONLY
**Context:** The user asked how the key would be provided and was told that an
env-var (`VITE_GEMINI_API_KEY`) is embedded in the production JS bundle and
extractable by anyone. The user then explicitly chose the in-app field.
**Decision:** The key is entered in Definições and stored in
`localStorage` (`nutribio.v1.settings.geminiApiKey`). It is never baked into
the bundle, never read from env in production, and never logged.
`.env.example` exists only as a documentation note.
**Consequences:** Per-device key entry (consistent with the single-device
design). Never "improve" this by moving the key to an env var or a proxy —
that changes the security model the user approved.

#4. 2026-09-22 — Nutrition math is local and deterministic; Gemini is creative-only
**Context:** The user asked for classic BMR formulas (Harris-Benedict,
Mifflin-St Jeor) and correct distribution math, plus Gemini for dish
inference.
**Decision:** `src/lib/calculations.ts` computes BMR (both formulas + average),
TDEE (activity factor from exercise frequency/intensity), goal calorie range,
protein/fat/carbs targets and per-meal split. The Gemini prompt receives these
computed targets and must NOT recalculate them; Gemini only creates dishes,
gram portions and the weekly plan.
**Consequences:** The plan is reproducible/offline-checkable; Gemini output
drift in math is prevented by instruction (rule "usa estes valores, não
recalculas").

#5. 2026-09-22 — Goal model and macro rules
**Context:** Four goals were requested: keep mass, gain mass, lose fat,
lose weight.
**Decision:** `Goal = 'maintain' | 'lose_fat' | 'lose_weight' | 'gain_mass'`
with fixed multipliers: maintain 0.95/1.0/1.05, lose_fat 0.80/0.84/0.90,
lose_weight 0.75/0.78/0.84, gain_mass 1.05/1.12/1.20 (×TDEE, min/target/max).
Protein: 1.8 / 2.0 / 2.2 / 2.0 g/kg. Fat 27% of kcal; saturated fat cap
20 g/day. Carbs = remainder. Meal split: 20/10/30/15/25%
(breakfast/morning snack/lunch/afternoon snack/dinner).
**Consequences:** These constants are the single source of truth for targets;
change them in `calculations.ts` only, and consider that existing cached plans
keep old targets until regenerated.

#6. 2026-09-22 — Plan caching by inputs hash; regeneration always confirmed
**Context:** The user demanded no repeated Gemini calls when nothing changed,
and a confirmation pop-up before regenerating.
**Decision:** `plan.inputsHash` = FNV-1a over `{profile, latestBiometrics}`.
On load, if the hash matches, no API call. Any data change (including
excluded foods/observations) invalidates the hash → the "Os teus dados
mudaram" banner appears, but the API is only called after the user confirms
in a dialog.
**Consequences:** No automatic API calls, ever. Keep it that way.

#7. 2026-09-22 — Onboarding stays mounted until the user finishes
**Context:** The wizard must show a "Gerar plano agora?" dialog after saving,
but saving the profile would unmount the wizard and lose the dialog.
**Decision:** `App.tsx` gates on a local `onboardingDone` flag (initialized
from `!!profile`), not on `profile` existence, so `Onboarding` stays mounted
through its own confirm dialog and calls `onDone()` only at the very end.
**Consequences:** If you touch App gating, keep this behavior — otherwise the
first-run dialog breaks.

#8. 2026-09-22 — Mobile-first ≠ mobile-only (responsive layout)
**Context:** The user corrected an earlier implementation that constrained
everything to phone width: "if it opens on desktop it must adapt to desktop".
**Decision:** Mobile (<768px): bottom `TabBar` + stacked sections. Desktop
(`md+`): hidden TabBar, left `Sidebar` (brand + nav + Definições), wider
containers (`max-w-6xl`) with multi-column grids (Today 2/3+1/3, Plan totals
sidebar + 2-col meals, Dados 2-col forms, Progresso chart 2/3 + chips 1/3,
Settings 2-col).
**Consequences:** Any new screen must be responsive with the same pattern.

#9. 2026-09-22 — Number inputs keep a local draft while typing
**Context:** Users could not type decimals: "78," was normalized to "78" on
the first keystroke, swallowing the separator.
**Decision:** `NumberInput` keeps a local string draft while focused; it
commits the parsed number on each valid keystroke and syncs the display from
the committed value on blur. Accepts comma or dot (pt-PT), rejects invalid
characters.
**Consequences:** Do not revert to value round-tripping per keystroke.

#10. 2026-09-22 — Bioimpedance history: merge/delete by date
**Context:** Users were confused about how to log new measurements.
**Decision:** Saving a bioimpedance record with a date that already exists
replaces that date (dedupe); otherwise it appends to history. Records can be
loaded into the form ("Editar") and deleted (with a danger confirm dialog).
The Progress screen CTA signals `EditData` (via `newMeasurementSignal`) to
start with an empty form.
**Consequences:** The "Dados" screen shows the history list with edit/delete
buttons; keep the dedupe-by-date semantics.

#11. 2026-09-22 — Excluded foods + general observations (diet preferences)
**Context:** The user asked for two free-text fields — "alimentos a excluir"
and "observações gerais" (e.g. nutritionist instructions) — collected at
onboarding, editable in Settings, and always included in the generation prompt.
**Decision:** Stored on `Profile` (`excludedFoods`, `observations`); collected
in onboarding step 3; editable in Definições; injected **verbatim** into the
Gemini prompt (section "Restrições e preferências do utilizador" + rule 11).
Other profile writes (EditData) must pass these fields through — losing them
is a bug. `loadProfile` normalizes old profiles missing the fields to `''`.
**Consequences:** Changing these fields changes the inputs hash → plan goes
stale → user confirms regeneration. Never strip them from `saveProfile` calls.

#12. 2026-09-22 — Lazy-load the Gemini SDK
**Context:** `@google/genai` + protobuf is ~400 kB; the app shell should stay
small.
**Decision:** `useStore.generatePlan` and `Settings`' model list both use
dynamic `import()`; Rollup puts the SDK in a shared lazy chunk outside the
main bundle.
**Consequences:** Keep SDK-heavy features behind dynamic imports; verify chunk
layout after changes (`npm run build` output).

#13. 2026-09-23 — Live model dropdown with static fallback
**Context:** The user asked for the model dropdown to always list the newest
Gemini models without deploying.
**Decision:** `src/lib/models.ts` lists models via `ai.models.list()`
(paginated async iteration), filtered to Gemini models supporting
`generateContent` (excludes imagen/veo/embeddings/tuned), deduped and sorted.
Settings fetches on open (and via an "Atualizar" button); without a key or on
error it falls back to the static `MODEL_OPTIONS` list with a status message.
A "(personalizado)" option appears only when the saved model is not in the
list.
**Consequences:** No redeploys needed when Google ships new models; the static
list remains the offline fallback — keep it updated opportunistically.

#14. 2026-09-23 — Dev server host restriction (user's tunnel)
**Context:** The user tests on a phone via a `loca.lt` tunnel
(`nbio.loca.lt`) and edited `vite.config.ts` themselves.
**Decision:** `server.allowedHosts: ['nbio.loca.lt']` (was `'*'`). Do NOT
widen this back to `'*'` — the user narrowed it deliberately.
**Consequences:** Requests with other Host headers get rejected by Vite; if a
new tunnel host is needed, ask the user or add the specific host.

#15. 2026-09-22 — Language conventions
**Decision:** UI copy in Portuguese (PT-PT); code, identifiers, comments and
docs in English. Dates/numbers formatted pt-PT (comma decimals). Meal/day
labels in PT.
**Consequences:** Follow both; never translate code identifiers.

#16. 2026-09-22 — PWA specifics
**Decision:** `vite-plugin-pwa` (generateSW, autoUpdate), manifest
`display: standalone`, `orientation: portrait`, icons 192/512 + maskable
generated by `scripts/generate_icons.py` (Python PIL — no npm image deps).
Install requires HTTPS or localhost.
**Consequences:** Regenerate icons with `npm run icons` if the branding
changes; keep the Python script (no sharp/other deps).

#17. 2026-09-22 — Plan week display order
**Decision:** Gemini emits days `monday..sunday` (schema enum); the UI displays
Monday-first (`WEEK_ORDER` in `src/lib/plan.ts`) to match the PT convention.
"Hoje" maps the current weekday to the matching `DayPlan`.
**Consequences:** Keep the enum and display order in sync when touching
`plan.ts`/`mealTimes.ts`.

#18. 2026-09-23 — Workout time + dynamic pre/post-workout meal badges
**Context:** The "pre-workout" meal was hardcoded to the afternoon snack
("Lanche / pós-treino"). The user trains in the morning and wants the
pre-workout meal to be breakfast — it can be ANY meal of the day, like a badge
on an existing meal.
**Decision:** `Exercise` gains `workoutTime?: string` ("HH:MM", collected in
onboarding and editable in Dados). `mealTimes.ts` derives `workoutMealIds()`:
`preId` = the meal slot whose window contains the workout time (or the last
one ending before it for night workouts; null if none), `postId` = the next
meal slot (or the first meal of the day when training before breakfast; null
if none). These are rendered as "Pré-treino"/"Pós-treino" badges on the
existing meal cards (Today/Plan) and passed to the Gemini prompt in a
"## Treino" block. The afternoon snack was renamed to "Lanche da tarde".
The meal split (20/10/30/15/25) is unchanged — the "reinforcement" of pre/post
meals is instruction to Gemini, not a local calculation.
**Consequences:** The badge moves with the workout time (no hardcoded slot);
changing the time invalidates the plan hash (regeneration stays user-confirmed);
cached plans keep the old label/badges until regenerated (natural, since the
hash changes).

#19. 2026-09-23 — Single global channel for generation feedback
**Context:** The user had no visual feedback while a plan was being generated
and no confirmation when it finished.
**Decision:** A `GenerationFeedback` component (rendered in App for every
branch) provides the ONLY generation feedback: a full-screen loading overlay
while `isGenerating` (spinner + stage text) and a toast when generation ends —
success ("Plano gerado com sucesso!" + "Ver plano" action) or error (message +
"Tentar de novo"). The per-screen inline generation feedback (Today's error
box, EditData/Onboarding error text) was removed to avoid duplication; the
store still exposes `isGenerating`/`generationStage`/`generationError` for
screen-level logic.
**Consequences:** One source of truth for generation state UX; any new
generation trigger automatically gets overlay + toast; do not reintroduce
per-screen generation error UI.

#20. 2026-09-24 — Gemini key collected at onboarding; real API errors surfaced
**Context:** The onboarding never asked for the Gemini API key, so the first
generation always failed; after adding the key in Settings, both the model
list and generation failed with generic messages the user could not read on
mobile (no console).
**Decision:** The API key field was added to onboarding step 1 (optional,
saved to `settings` before the generation dialog). All Gemini error paths now
surface the real underlying message: `describeError()` (`src/lib/errors.ts`)
extracts readable text from the SDK's `Error.message` / API JSON body
(`{error:{code,status,message}}`), `generateWeeklyPlan` rethrows with the
detail, and the Settings model-list status line shows the actual error (and
falls back to the static list when the API returns nothing compatible).
**Consequences:** On-device diagnosis of API problems without a console; the
generic "Verifica a chave da API" message is gone from the error path. Do not
revert to swallowing API errors.

#18. 2026-09-23 — GitHub Pages deployment (project site, GitHub Actions)
**Context:** The user wants the code hosted on their GitHub repo with GitHub
Pages serving the built site at `https://<user>.github.io/nutribio/`.
**Decision:** Deploy as a project site (base path `/nutribio/`).
`vite.config.ts` uses `base = process.env.BASE_PATH || '/'` — the CI workflow
builds with `BASE_PATH=/nutribio/`, local dev/root deployments keep `/`. The
PWA manifest (`start_url`/`scope`/icons) is prefixed with `base`,
`index.html` references public assets relatively (`./`), and
`navigateFallback` is relative. `.github/workflows/deploy.yml` builds and
deploys on push to `main` via `actions/deploy-pages` (Pages source must be
"GitHub Actions"). `public/.nojekyll` guards against Jekyll processing.
**Consequences:** Live URL is `https://<user>.github.io/nutribio/`; if the
repo is renamed, update `BASE_PATH` in the workflow. No client-side router
means no `404.html` fallback is needed. The Gemini key security model is
unchanged (never in the bundle or repo — see #3).

> Note (2026-10-06): this log has two `#18` entries (workout time and GitHub
> Pages deployment). They are left as-is because other docs reference `#18`
> as the workout decision. New entries continue from **#21**.

---

#21. 2026-10-06 — Improvement roadmap with per-item tracking (docs/roadmap/)
**Context:** The owner wants full control over the 2026-10 improvements: what
is done, what is missing, and which decisions were taken.
**Decision:** `docs/roadmap/` holds `README.md` (status table, execution
order, blocking non-code dependencies) plus one file per item (goal, research,
decisions, open questions, phase checklists, progress log). Workflow: read
the item file before working; after progress, tick checklist, append to the
progress log, update the README status. Formal decisions are still appended
to this log; every change still gets a CHANGELOG entry.
**Consequences:** A task is only "done" when the roadmap file reflects it.
Do not work on a phase without checking its item file first.

#22. 2026-10-06 — Backend era: monorepo + Nuxt API + Supabase EU (supersedes #1, #3, #13)
**Context:** The owner approved adding accounts, a database and payments —
explicitly reversing the "100% frontend" principle, and wants a separate
Nuxt (Nitro) API project (not Supabase/Firebase Edge Functions), debated in
detail before implementation.
**Decision:** Convert the repo to a monorepo: `apps/web` (current Vite PWA,
still on GitHub Pages), `apps/api` (Nuxt server routes), `packages/core`
(shared pure logic). Supabase (EU region) provides Postgres + Auth (Google,
email/password, 6-digit email OTP for signup confirmation and recovery).
The Nuxt API verifies the Supabase JWT and owns all data access (RLS on,
no client policies). The Gemini key becomes a server-side env secret and
generation runs as a background job (queue via plans table, claimed with
`FOR UPDATE SKIP LOCKED`) so the user can close the app. Targets are
computed server-side. localStorage becomes a cache (`nutribio.v2`, per
user, with a `planId`/`updatedAt` sync marker) for fast/offline reads.
**Status:** Accepted — effective from phases 4.1–4.9 (roadmap
`04-backend-storage.md`). Until then, the app remains local-only and the
key stays in Settings (#3 still in force for the shipped app).
**Consequences:** The web app loses the key field, model dropdown and
`@google/genai` dependency in 4.6. Regeneration stays user-confirmed
(#6 preserved, now server-enforced). Long-running Node hosting is required
for the API.

#23. 2026-10-06 — Freemium: one free generation, then monthly subscription only
**Context:** The owner defined the business model and rejected an annual
plan.
**Decision:** Every user gets exactly one free plan generation (ever);
further generations require an active monthly subscription. Entitlement
checked atomically in the generation endpoint. Failed jobs do not consume
the free generation (pending final confirmation).
**Consequences:** Paywall UI after the free generation; fair-use limit for
subscribers still to be defined; abuse mitigation (verified email before
the free generation) to be enforced server-side.

#24. 2026-10-06 — Login methods and minimum age
**Context:** The owner specified the auth UX.
**Decision:** Google OAuth + email/password (signup confirmation and
password recovery via 6-digit email OTP, `verifyOtp`). Minimum age 18+
(self-declaration at signup) to avoid parental-consent flows for health
data under GDPR/LGPD.
**Consequences:** Supabase Auth email templates must be localized (7
languages); the signup flow includes the consent gate (see #29).

#25. 2026-10-06 — i18n: 7 locales, react-i18next, custom resolver (supersedes #15)
**Context:** The owner wants pt-BR, pt-PT and the most common European
languages, with device-language detection and English as fallback.
**Decision:** Locales: `pt-PT`, `pt-BR`, `en-GB` (fallback), `es`, `fr`,
`de`, `it`. Library: `i18next` + `react-i18next`, catalogs lazy-loaded per
locale, typed keys, `en-GB` as source. Custom `resolveLocale`:
`pt-BR`→pt-BR; any other `pt-*`→pt-PT; `en-*`→en-GB; `es/fr/de/it-*` match;
otherwise `en-GB`. Override in `settings.locale` (`'auto' | Locale`). Locale
enters the plan `inputsHash` (language change → stale plan → user-confirmed
regeneration). UI language follows locale; **cuisine follows country**
(see #26). Domain labels become translation keys.
**Consequences:** pt-BR is a real adaptation, not a copy; es/fr/de/it are
agent-translated pending native review; `npm run i18n:check` enforces key
parity. Generator errors become codes translated in the UI.

#26. 2026-10-06 — Profile country drives cuisine (and currency/legal regime)
**Context:** The owner wants plan ingredients to match the country the user
lives in, so shopping is easy.
**Decision:** `Profile.country` (ISO alpha-2, required) collected in
onboarding step 1, editable in Dados, carried through every profile write.
Curated list (not all 27): `BR, PT, ES, FR, DE, IT, NL, BE, IE, AT, LU, GB`
(final list owned by the user; single constant `SUPPORTED_COUNTRIES`). Names
via `Intl.DisplayNames` in the active locale; preselected from device region
or locale. The Gemini prompt prioritizes country-typical ingredients/dishes
with per-country hints. `country` is part of the profile → part of the
inputs hash → changing it marks the plan stale.
**Consequences:** Stripe currency derives from country (BR→BRL, GB→GBP
option, else EUR — see #30); legal regime derives from country (LGPD/UK
GDPR/GDPR — see #29).

#27. 2026-10-06 — Weekly shopping list: all variations, suggestion, LLM canonicalization + local sum
**Context:** The owner wants a "Compras da semana" tab with every plan.
**Decision:** The list covers all variations and is explicitly labelled a
**suggestion** (buy according to the dishes you choose to make; each item
shows which dishes use it). In the same Gemini request, each ingredient
gains `shoppingKey` + `rawGrams` (raw/purchase weight) and the response
includes canonical `shoppingItems` (key, name, category, unit/package
grams, country-typical). The app aggregates locally (deterministic sum,
practical units). Tab features: mark as bought, group by supermarket
section, copy/share (Web Share API), practical units.
**Consequences:** Response grows ~20–30% (token budget check needed);
`normalizeWeek` validates defensively; missing keys fall into "other". Old
cached plans show an empty state until regenerated.

#28. 2026-10-06 — Offline model: DB is source of truth, localStorage is a cache
**Context:** The owner wants offline reads of the plan with fast local usage,
but data stored server-side.
**Decision:** After Item 4, the DB is the source of truth. localStorage
(namespace `nutribio.v2`, per user, cleared on logout) caches plan,
profile, biometrics and shopping checks with a sync marker
(`planId` + `planUpdatedAt`): render cache instantly, fetch metadata,
refetch only when the server version differs. Variation selections and
shopping checks are optimistic with a small write-through retry queue;
other writes require network.
**Consequences:** The `nutribio.v1` export/import is replaced by server
export (GDPR, #29). Cache reset on new plan generation.

#29. 2026-10-06 — Consent & privacy framework (RGPD/LGPD/UK GDPR)
**Context:** The app collects bioimpedance and diet data — special-category
data under GDPR art. 9 / LGPD art. 11 — and sells to EU, BR and GB users.
**Decision:** Minimization: stop sending the name to Gemini; age only; no
birth date. Three separate unticked consents at signup: (a) Terms +
Privacy; (b) explicit health-data consent; (c) 18+. Consents stored with
document version, locale and timestamp; version bumps require re-consent.
No analytics → no cookie banner (adding analytics later requires a banner).
Gemini API **paid tier is mandatory** before go-live (free tier allows
training/human review). Data-subject rights in Settings: export, delete
account, withdraw consent. Texts (en-GB source + 6 translations) are
engineering baselines pending **lawyer review**.
**Consequences:** The lawyer review and the public controller contact are
blocking dependencies for the server go-live. RoPA + DPIA-lite live in
`docs/legal/`.

#30. 2026-10-06 — Payments: one Stripe PT account (EUR + BRL); Managed Payments preferred
**Context:** The owner has no company and asked whether one Stripe account
can charge EUR and BRL, and who handles fiscal invoices.
**Decision:** One Stripe account (Portugal) presents charges in EUR and BRL
(cards + Pix incl. recurring), settling in EUR. Freemium per #23. Preferred
route: **Stripe Managed Payments** (merchant of record — Stripe/Link sells
to the end customer, handles VAT in 80+ countries incl. all EU + GB,
customer invoices, fraud/disputes/support; +3.5% per transaction; Checkout/
Payment Links only; eligibility review required; product tax code e.g.
`txcd_10105001`). Manual `currency_options` prices for EUR/BRL (/GBP?).
Brazil is NOT in Managed Payments' tax coverage → accountant must confirm
the BR tax treatment; **Paddle** (MoR, Pix + Pix Automático) is the
fallback/comparison. Income must still be declared in Portugal (typically
sole trader / "atividade aberta" — no company needed); accountant consult
is blocking.
**Consequences:** No certified invoicing software (InvoiceXpress/Moloni)
needed if MoR is confirmed; consumer withdrawal rights (EU 14-day / BR
7-day) must appear in Terms + checkout. Currency derived from
`profile.country` (#26). Gemini paid tier before go-live (see #29).

#31. 2026-10-06 — i18next v26 resource registration pattern (lazy catalogs + re-init)
**Context:** i18next v26 (installed 2026-10-06) removed the
`addResourceBundle`/`hasResourceBundle` instance API; catalogs can only be
registered via `init({resources})`.
**Decision:** en-GB is statically imported (guaranteed fallback bundle); the
other six catalogs are lazy chunks tracked in a module-local
`loadedCatalogs` map. `initI18n` runs once at startup with the target locale
+ fallback; `changeLocale` loads the new catalog then re-runs
`i18next.use(initReactI18next).init({resources: <all loaded>})` on the same
instance, followed by `changeLanguage`. Verified working on v26 (no
re-init error; React bindings re-applied).
**Consequences:** Keep the module-local `loadedCatalogs` map as the source
of truth for what is registered (do not query the i18next resource store).
If i18next is upgraded to a major version, re-verify this pattern.

#32. 2026-10-07 — Optional supplements (whey protein, creatine) in the plan
**Context:** The owner asked for two checkboxes in onboarding ("Incluir
suplemento de whey protein" / "Incluir suplemento de creatina") so the
generated plan considers them.
**Decision:** `Profile.supplements = { wheyProtein: boolean, creatine:
boolean }`, collected in onboarding step 1 and editable in Dados (default:
both off — safe default; old profiles normalized). The Gemini prompt gains a
`## Supplements` section (+ mandatory rule 14): opted-in supplements are
included with precise grams per serving (whey e.g. post-workout; creatine
monohydrate 3–5 g/day); when both are off the model is explicitly told not
to include any supplements (whole foods only). Since `supplements` is part
of the Profile, toggling it changes the inputs hash → stale plan →
user-confirmed regeneration (DECISIONS #6).
**Consequences:** Every profile write must carry `supplements` through
(same rule as country/excludedFoods/observations). Supplement products are
whole-food-independent and only affect dish content when enabled.

#33. 2026-11-06 — Welcome screen: in-app gate before onboarding, first use only
**Context:** Roadmap item 2 (Wave 4) — an introductory screen that explains the
app before the wizard, like an in-app landing page. The app has no router, and
the auth CTAs ("I already have an account") only make sense once Item 4 phase
4.5 lands; the legal texts (Item 5) and the pricing teaser (Item 3) do not
exist yet.
**Decision:** `src/screens/Welcome.tsx` is a new gate in `App.tsx`
(`Welcome → Onboarding → Shell`). Visibility is a local, **non-persisted**
state `welcomeDone` initialized from `!!profile`: the screen shows while there
is no profile and reappears naturally after "Delete all data" (reset →
reload). It is not reachable from Settings. The language selector writes
`settings.locale` + `changeLocale` (same behavior as Settings), so the copy
switches live and survives reload/reset. Onboarding step 1 gains an optional
`onBack` (from App) that returns to Welcome and discards the unsaved form.
Content: hero + "get started" CTA (hero and bottom), 3-step "how it works",
4 feature cards, privacy summary (data on device, key never leaves it, name not
sent to Gemini) and a health disclaimer. No auth CTA, no pricing, no legal
links yet; illustrations are inline SVG (no images, no new deps); fully
translated in the 7 locales; responsive per #8. The screen performs no writes
and no API calls.
**Consequences:** DECISIONS #7 is untouched (onboarding still owns its
"generate now?" dialog and stays mounted until the user finishes). The auth
phase (4.5) adds the "I already have an account" CTA and the consent gate
(5.3) between Welcome and Onboarding; re-showing Welcome on logout is decided
then. The public SEO landing page remains deferred.

#34. 2026-11-06 — Monorepo conversion: npm workspaces, `apps/web` + per-workspace commands
**Context:** Roadmap 4.1 (Wave 5) — DECISIONS #22 approved a monorepo with
`apps/web`, `apps/api` and `packages/core`, but the repo was still a single
Vite project at the root.
**Decision:** The repo is now an **npm-workspaces monorepo** with a single
root `package-lock.json`. The whole app moved (git history preserved, `git
mv`) to `apps/web/` as `@nutribio/web` (its `package.json` holds the scripts
and dependencies; Vite root is `apps/web`, build output `apps/web/dist`). The
root `package.json` declares **only** `workspaces: ["apps/*", "packages/*"]` —
no app scripts — so every command is explicit about its target:
`npm run dev|build|preview|i18n:check|icons -w @nutribio/web`. CI
(`.github/workflows/deploy.yml`) runs `npm ci` at the root, then
`npm run build -w @nutribio/web` with `BASE_PATH=/nutribio/`, and uploads
`apps/web/dist`.
**Consequences:** Behavior is unchanged (same bundle, same `nutribio.v1`
localStorage data, same `inputsHash`); GitHub Pages keeps serving the same
project site. `packages/core` is added in 4.2 and `apps/api` in 4.4 without
further restructuring. Docs paths are now `apps/web/...` (ARCHITECTURE §3
states that the rest of the document is relative to `apps/web/`). Tailwind v4
content detection is now scoped to `apps/web`, so two utilities that were only
matched from repo-root markdown (`.table`, `.rounded`, both unused in the app)
disappeared from the CSS (~50 bytes smaller). The root `dist/` from the old
layout is a stale ignored artefact and can be deleted.

#35. 2026-11-06 — `packages/core`: source-only, dependency-free, state-free shared logic
**Context:** Roadmap 4.2 (Wave 5) — the future Nuxt API must compute the same
targets and build the same prompt as the web app. The pure logic lived in
`apps/web/src/lib` and depended on i18next (translating labels at call time),
on the web's module-level "active locale" and on the Gemini SDK.
**Decision:** `@nutribio/core` holds the shared pure logic: domain types,
pure locale definitions (`resolveLocale`, labels, language names,
`normalizeLocaleSetting`), countries, calculations, meal slots, plan helpers,
shopping aggregation, FNV-1a hash, `describeError`, `formatNumber`, the prompt
builder, the JSON schema and the response normalizers. Constraints:
- **No runtime dependencies** (no i18next, no `@google/genai`, no React) and
  **no DOM/Node globals** — `packages/core/tsconfig.json` sets
  `lib: ["ES2022"]` and `types: []`, and `apps/web`'s build type-checks core
  with that config.
- **No hidden state**: locale-dependent helpers take the locale explicitly
  (`buildPrompt({locale})`, `formatNumber(v, d, intlLocale)`,
  `defaultCountryFor(candidates, locale)`) and label lookups take an injected
  `Translate` (`computeTargets(input, t)`, `mealLabel(id, t)`,
  `emptyMealSlot(id, t)`, `normalizeWeek(raw, t)`, `startsInLabel(m, t)`). The
  mutable active-locale tracker stays in `apps/web/src/i18n/locales.ts`
  (module state would leak across requests on a server); the web adapter is
  `apps/web/src/i18n/translate.ts` (`coreT`).
- **Errors are codes**: `PlanParseError { code: 'emptyResponse' |
  'unparseable' | 'badResponse' | 'emptyPlan' }`; the web maps them to
  `errors.<code>` keys and rethrows `GeminiError`. This prepares the API error
  boundary.
- Consumed as **TypeScript source** (`exports: "." → "./src/index.ts"`, no
  build step, `sideEffects: false`); the `@google/genai` call, `storage`,
  `models`, `units` and the i18n runtime/catalogs stay in `apps/web`.
**Consequences:** Zero behavior change, proven by golden snapshots taken
before/after the extraction (identical prompt text in 4 locales, identical
`planInputsHash` for the same inputs — so cached plans do not go stale —
identical targets, normalization, shopping list, meal-time helpers, error
paths and formatting). The prompt/schema code stays in the lazy `gemini`
chunk (not in the main bundle). The API (4.7) will need a `Translate`
implementation for the domain labels used in the prompt — decided then
(core does not ship catalogs).

#36. 2026-11-06 — Wave 6 order changed: phase 4.3 (Supabase) before the legal texts
**Context:** The roadmap's Wave 6 starts with Item 5 phases 5.1–5.2 (data
inventory + legal texts) precisely because no real user data may reach a
server before those texts exist. The owner asked to start Wave 6 with Item 4.
**Decision:** Execute **4.3 (Supabase project + schema + Auth config) first**,
then 5.1–5.2 (legal texts), then 4.4 onwards. 4.3 only creates infrastructure
and an empty database: the web app keeps writing exclusively to `localStorage`
(`nutribio.v1`) and no user data is stored server-side until the consent gate
(5.3) and the data layer (4.6) land.
**Consequences:** DECISIONS #29 stays intact — real data reaching the server is
still gated by the legal texts, the lawyer review and the consent gate. The
roadmap README/`04-backend-storage.md` record the new order; the "no backend"
constraint in `AGENTS.md` still describes the shipped app until 4.8.

#37. 2026-11-06 — Database layer: Drizzle schema as source of truth, applied by the Supabase CLI, private `app` schema
**Context:** Roadmap 4.3 left the "Drizzle vs supabase-js server client"
question open. The API needs typed queries and real transactions (the worker
claims jobs with `FOR UPDATE SKIP LOCKED`), while the project needs
reproducible SQL migrations for RLS, grants, triggers and FKs to `auth.users`.
**Decision:** New workspace **`packages/db` (`@nutribio/db`)**:
- **Drizzle ORM (0.45.x) is the single schema definition.** `drizzle-kit
  generate` writes SQL into `supabase/migrations` (`migrations.prefix =
  'supabase'`, drizzle snapshot in `meta/`); the **Supabase CLI is the only
  tool that applies migrations** (`db reset` locally, `db push` on the hosted
  project). Drizzle stays on the 0.x stable line (1.0 beta changes the
  migration layout and breaks Supabase CLI compatibility).
- All tables live in the **private `app` schema**, which is *not* in the Data
  API exposed schemas (`public`/`graphql_public`) and
  `api.auto_expose_new_tables = false`.
- **RLS enabled on every table with no policies** (defense in depth), client
  roles (`anon`, `authenticated`) have **no privileges** on `app`, and the API
  connects as its own **`nutribio_api`** role (`login bypassrls noinherit`).
  Its password is set once per environment (`alter role … with password`),
  never stored in the repository. If a project does not allow granting
  `BYPASSRLS`, the migration falls back to per-table `api_all` policies for
  that role only (the API keeps working; tables added later would then need a
  policy — the migration emits a NOTICE when this path is taken).
- Enum-like columns are `text` + CHECK constraints (not pg enums) so adding a
  value is a normal migration; values mirror the `@nutribio/core` unions.
- **`auth.users` is not modelled in Drizzle**: `user_id` foreign keys
  (`on delete cascade`, account deletion = Item 5.4) are added in the custom
  `api_role_and_grants` migration, together with the role, grants and
  `updated_at` triggers.
- The package also exports `createDb(connectionString)` (postgres.js, `prepare:
  false`) for `apps/api`; `apps/web` never imports it.
**Consequences:** One schema language for the API and the migrations, and SQL
review stays possible (the generated files are committed). `drizzle-kit
generate` never inspects the live database, so the manual FKs/role/grants are
safe from drift; `drizzle-kit push` is not part of the workflow.

#38. 2026-11-06 — One hosted Supabase project (production) on the Free plan + local Docker stack
**Context:** The owner has no Supabase project yet and does not want two
hosted environments at this stage.
**Decision:** A single hosted project named `nutribio` is the **production**
project, created on the **Free plan**. It was created in **`eu-west-1`
(Ireland)** — the owner's choice among the EU regions; either `eu-central-1`
or `eu-west-1` is acceptable (data stays in the EU). Development uses the
**Supabase CLI local stack** (Docker: Postgres, Auth, Studio, Mailpit), so no
second hosted project exists. `supabase/config.toml` holds the local values
plus a `[remotes.production]` block (project ref + production Auth URLs) used
by `config push`.
**Consequences:** Free plan pauses after a week of inactivity, has no backups
and **cannot edit auth email templates** (see #41) — acceptable while there are
no real users, and the **Pro upgrade is a go-live requirement** (launch
checklist, 4.8). Because the only hosted project is production, every remote
command (`db push`, `config push`) is run and reviewed by the owner, never
automatically by an agent/CI.

#39. 2026-11-06 — Auth emails localized through `user_metadata.locale`; SMTP (Brevo) deferred until a domain exists
**Context:** DECISIONS #24 requires the signup/recovery OTP emails in 7
languages; the owner has no domain yet, so a custom SMTP sender cannot be
authenticated.
**Decision:** The four transactional templates (confirmation, recovery, email
change, reauthentication) are **generated from one strings file**
(`packages/db/email/strings.mjs`) by `npm run email:build`, and branch on
`{{ .Data.locale }}` — the `user_metadata.locale` the web app sends at
signup/OTP calls — with **en-GB fallback** (Google sign-ins have no locale
metadata). They are pushed with `supabase config push` (CLI ≥ 2.108 supports
template files). OTP: 6 digits, 15-minute expiry; passwords: min 8 chars with
letters and digits; email confirmation on. **SMTP provider chosen: Brevo (EU
company, EU data processing)**; until a domain exists, development uses the
local Mailpit and the hosted project keeps Supabase's built-in SMTP (team
members only).
**Consequences:** Real signups are impossible until the domain + Brevo SMTP +
deliverability are configured — a go-live blocker, not a development one. The
locale metadata must be sent by the web app from phase 4.5 onwards; templates
must be regenerated (`email:build`) whenever the copy changes.

#40. 2026-11-06 — Supabase access tokens verified through JWKS (asymmetric keys)
**Context:** The API must authenticate every request; a shared JWT secret on
the API host is a long-lived credential that can mint tokens.
**Decision:** The hosted project uses **asymmetric JWT signing keys (ES256)**;
the Nuxt API verifies access tokens against the public JWKS
(`/auth/v1/.well-known/jwks.json`) instead of sharing the JWT secret.
**Consequences:** Key rotation is transparent (the API caches the JWKS and
refetches on an unknown `kid`); the secret key stays server-side for admin
calls only (account deletion). Setup step in `docs/SUPABASE_SETUP.md` A2.

#41. 2026-11-06 — Production Supabase project provisioned; auth templates blocked on the Free plan
**Context:** Phase 4.3 owner steps were executed against the hosted project
`nutribio` (`tsmcdeynuzdbnluqdbmw`, `eu-west-1`, Free): ES256 keys, CLI login +
link, `db push`, `nutribio_api` password, `config push`. The push failed on the
email templates with *"Email template modification is not available for free
tier projects using the default email provider. Please upgrade your plan or
configure a custom SMTP provider."*
**Decision:**
- The schema is applied to production and verified there (9 `app` tables with
  RLS, no client grants, `nutribio_api` with `bypassrls`, 0 policies).
- The API role password is generated by the agent and stored **only** in
  `packages/db/.env` (gitignored) as `NUTRIBIO_API_DATABASE_URL`; the owner
  keeps it in the password manager. It connects through the **session pooler**
  (`aws-0-eu-west-1.pooler.supabase.com:5432`, user `nutribio_api.<ref>`)
  because the direct host `db.<ref>.supabase.co` is IPv6-only on Free.
- `config push` is applied in **two stages**: the Free-plan-safe Auth settings
  now (site URL, redirects, OTP 6/900 s, password policy, secure password
  change, MFA defaults), and the **localized templates later** — after Brevo
  SMTP (A7) or the Pro plan (A8) — with the same command.
- The Google provider stays `enabled = false` until the OAuth client exists;
  its credentials live in `packages/db/.env` (`env()` refs in `config.toml`).
**Consequences:** `supabase config diff` is expected to show exactly 4
template subjects + 3 Google fields until go-live — that is the documented
pending state, not drift. Templates must not be removed from `config.toml`
(they are the source of truth); the push is staged by temporarily excluding
them, never by deleting them from the repository.

#42. 2026-11-06 — Auth v1: email + password + OTP only; Google OAuth (and any SSO) deferred to the end
**Context:** DECISIONS #24 listed Google OAuth alongside email/password. The
owner wants the whole app finished first with traditional email/password login
and to add SSO later, when it is actually needed.
**Decision:** v1 authentication is **email + password + 6-digit email OTP**
(signup confirmation, recovery, reauthentication) on Supabase Auth. **No OAuth
provider is enabled**: `[auth.external.google]` stays in `config.toml` with
`enabled = false` (and its credentials as `env()` refs), production matches,
and `supabase config diff` is clean apart from the deferred email templates.
The web auth UI (4.5) therefore has no "continue with Google" button — the
Welcome "Já tenho conta" CTA leads to the email login, and signup goes
Welcome → Auth → Consent → Onboarding.
**Consequences:** DECISIONS #24 remains valid except the "Google now" part.
The Google Cloud project, consent screen and OAuth client are **not** launch
dependencies any more (they become a post-launch task: fill the two variables
in `packages/db/.env`, flip `enabled` to true, `config push`, add the button —
no schema or API change). Existing email accounts are unaffected when SSO
arrives; the same address can be linked to the provider then.

