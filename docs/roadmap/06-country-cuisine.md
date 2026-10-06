# 06 — Country-aware cuisine (onboarding + prompt)

**Status:** ☑ Done (2026-10-06)

## Goal

Ask, in onboarding, which country the person lives in (a curated list of the
main EU countries + United Kingdom + Brazil) and make the Gemini prompt
prioritize ingredients, foods and dishes typical of / commonly found in that
country, so shopping is easier.

## Research & findings (2026-10-06)

- `Profile.country` (ISO 3166-1 alpha-2), **required**, collected in
  **onboarding step 1** and editable in **Dados**; `loadProfile` normalizes
  old profiles (defaults derived as below). Every profile write carries it
  (same rule as DECISIONS #11 for the other fields).
- **Curated list** (single constant `SUPPORTED_COUNTRIES`, easy to edit):
  `BR, PT, ES, FR, DE, IT, NL, BE, IE, AT, LU, GB` — the main/most relevant
  EU countries (not all 27, per owner), UK included, Brazil obviously. LU
  included for its large Portuguese-speaking community. Final list
  confirmed by the owner.
- Country names via `Intl.DisplayNames` in the active locale (no translation
  keys needed); sorted alphabetically in the active locale.
- **Preselection**: device region if supported (`de-AT` → AT, `pt-BR` → BR);
  else derived from locale (pt-PT → PT, pt-BR → BR, en-GB → GB, es → ES,
  fr → FR, de → DE, it → IT).
- **Language ≠ country**: e.g. a Brazilian living in Portugal gets pt-BR UI
  + Portuguese supermarkets. Cuisine follows **country**, language follows
  **locale**. (This resolves the old i18n open question about "cuisine
  setting".)
- Prompt (implemented with Item 1 phase 1.4): "The user lives in {country}.
  Prioritize ingredients, foods and dishes that are typical of, or commonly
  found in supermarkets in, {country}, to make shopping easy. Use the local
  product names, written in {language}." Per-country cuisine hints
  (`COUNTRY_CUISINE_HINTS`) replace the PT-specific food lists in current
  rules 4–6 (e.g. pescada/dourada only for PT).
- `country` is part of the profile → already in `inputsHash` → changing it
  marks the plan stale (user-confirmed regeneration, DECISIONS #6).

## Cross-item impact

- **Item 3 (payments)**: currency from `profile.country` (BR → BRL, GB → GBP
  option, others EUR).
- **Item 5 (legal)**: LGPD for BR, UK GDPR for GB, GDPR for EU.
- **Item 4 (backend)**: `profiles.country` column; sent to the API.

## Decisions

- 2026-10-06 — `profile.country` (curated list) drives cuisine + currency +
  legal regime; cuisine follows country, language follows locale.
  (DECISIONS #26)

## Open questions

- [ ] Confirm the final country list (current: PT BR ES FR DE IT NL BE IE AT LU GB — tell the agent if you want changes).
- [ ] Flag emoji next to country names (pure UI, decide during 6.1).

## Phases

### 6.1 Types + storage + UI
- [x] `types.ts`: `Profile.country`; `loadProfile` normalization (derive
      default for old profiles).
- [x] `src/lib/countries.ts`: `SUPPORTED_COUNTRIES`, `defaultCountryFor(locale,
      navigator.languages)`, display names helper; unit tests.
- [x] Onboarding step 1: country select (preselected); Dados: editable field
      (must carry `country` through every profile write).
- [x] Translations in the 7 catalogs (labels only; country names via
      `Intl.DisplayNames`).

### 6.2 Prompt (with Item 1 phase 1.4)
- [x] Country block + `COUNTRY_CUISINE_HINTS` (per-country ingredient
      priorities) in the rewritten English prompt.
- [x] `country` verified as part of the inputs hash; changing country →
      stale banner.
- [x] Docs: ARCHITECTURE §4/§6/§9, DECISIONS #26.

## Verification

- Unit tests: preselection matrix, normalization of old profiles.
- Real generation (owner's key): dishes use country-typical ingredients,
  output in the active locale.
- browser-harness: onboarding country select, Dados edit, stale banner after
  country change.

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.

- 2026-10-06 — Implemented with the i18n wave: `Profile.country` + curated
  list + preselection, onboarding/Dados selects, prompt country block +
  per-country cuisine hints (English prompt), country carried in every
  profile write and in the inputs hash. Old profiles normalized (country
  from device). Docs updated (ARCHITECTURE §4/§6/§9, DECISIONS #26).
