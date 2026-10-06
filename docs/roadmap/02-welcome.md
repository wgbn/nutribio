# 02 — Welcome / landing screen

**Status:** ☐ Not started

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
  public marketing page deferred. (DECISIONS #27)

## Open questions

- [ ] Public SEO landing page (separate static page) — deferred, decide after
  launch.
- [ ] Re-show Welcome on logout (recommended: yes).

## Phases

### 2.1 Screen + gate
- [ ] `src/screens/Welcome.tsx` (sections above, responsive, translated).
- [ ] `App.tsx` gate: show Welcome while no profile (and not authenticated,
      once auth exists).
- [ ] Language selector on Welcome.
- [ ] Translations in the 7 catalogs.

### 2.2 Polish + verification
- [ ] Layout verification at 390×844 and 1440×900 (browser-harness).
- [ ] Docs: ARCHITECTURE §9, DECISIONS entry.

## Verification

- `npm run build`; browser-harness; i18n parity (`npm run i18n:check`).

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.
