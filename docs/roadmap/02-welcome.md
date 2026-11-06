# 02 — Welcome / landing screen

**Status:** ☑ Done (2026-11-06) — local-only version; auth CTAs in Wave 6

## Goal

An introductory screen shown before onboarding (and, later, before login) that
explains the app's purpose and how it works, like an in-app landing page.

## Research & findings (2026-10-06)

- The app has **no router** (state-based navigation), so the Welcome screen is
  a new **gate** in `App.tsx`: `Welcome → (later: Auth → Consent) →
  Onboarding → Shell`. Must preserve DECISIONS #7 (onboarding stays mounted
  through its confirm dialog — only the gate before it changes).
- This is an **in-app** landing (inside the SPA, not SEO-indexable). A public
  static marketing page is a possible future item (see Open questions).
- Content sections:
  - Hero: value proposition (weekly meal plans from bioimpedance data).
  - "How it works": 1. your data/scale → 2. local scientific calculations →
    3. AI weekly plan with 3 variations per meal, local-cuisine ingredients
    (Item 6) and a shopping list (Item 7).
  - Features: Today screen, pre/post-workout meals, progress charts, shopping
    list.
  - Privacy summary (link to full documents — Item 5).
  - "Not medical advice" disclaimer.
  - Pricing teaser (added in Item 3).
  - Language selector (Item 1).
  - CTAs: "Começar" (start onboarding) / "Já tenho conta" (login — wired in
    Item 4 phase 4.5).
- Responsive per DECISIONS #8: stacked on mobile; 2-column hero + feature
  grid on desktop (`md+`). Illustrations: **inline SVG only** (no image
  dependencies), Tailwind, fully translated in the 7 locales.

## Decisions

- 2026-10-06 — Welcome is an in-app gate (no router, no new dependency);
  public marketing page deferred.
- 2026-11-06 — Implemented as **first use only**, via a local non-persisted
  `welcomeDone` flag in `App.tsx` initialized from `!!profile` (DECISIONS #33).
  Not reachable from Settings; comes back after "Delete all data".
- 2026-11-06 — "Já tenho conta" is **hidden until Wave 6** (auth); no disabled
  placeholder button. Pricing teaser (Item 3) and legal links (Item 5) also
  deferred — the privacy summary is a short local-only statement.
- 2026-11-06 — Language selector writes `settings.locale` + `changeLocale`
  (same behavior as Settings), so it works before any profile exists.
- 2026-11-06 — Onboarding step 1 gains a "Voltar" button back to Welcome
  (optional `onBack` prop; the unsaved form is discarded).

## Open questions

- [x] Re-show Welcome on logout? → Not applicable yet (no accounts). Decided
      again with the auth phase (4.5).
- [ ] Public SEO landing page (separate static page) — deferred, decide after
  launch.

## Phases

### 2.1 Screen + gate
- [x] `src/screens/Welcome.tsx` (sections above, responsive, translated).
- [x] `App.tsx` gate: show Welcome while no profile (and not authenticated,
      once auth exists).
- [x] Language selector on Welcome.
- [x] Translations in the 7 catalogs (`welcome.*`, 32 keys).

### 2.2 Polish + verification
- [x] Layout verification at 390×844 and 1440×900 (browser-harness).
- [x] Docs: ARCHITECTURE §9, DECISIONS entry (#33).

### 2.3 Deferred to later waves
- [ ] "Já tenho conta" CTA + login (Wave 6, item 4.5).
- [ ] Pricing teaser (Item 3).
- [ ] Links to the legal documents (Item 5, phase 5.2).

## Verification

- `npm run build`; browser-harness; i18n parity (`npm run i18n:check`).
- Done 2026-11-06: build + parity green (313 keys × 7); browser flows —
  Welcome on first load, live language switch persisting across reload,
  "Começar" → onboarding, "Voltar" → Welcome, onboarding dialog intact,
  reload with profile → shell, reset → Welcome in the kept language, no
  Gemini request; layouts at 390×844 and 1440×900 (pt-PT, de).

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.
- 2026-11-06 — Phases 2.1–2.2 implemented (DECISIONS #33): Welcome screen
  (hero, week-at-a-glance card, 3-step "how it works", 4 feature cards,
  privacy summary, health disclaimer, language selector, hero + bottom CTAs),
  `App.tsx` gate (`Welcome → Onboarding → Shell`, first use only), onboarding
  "Voltar" to Welcome, 32 new i18n keys × 7 locales, docs updated. Deferred:
  auth CTA, pricing teaser, legal links (see 2.3).
