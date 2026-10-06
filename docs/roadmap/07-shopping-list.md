# 07 — Weekly shopping list ("Compras" tab)

**Status:** ☐ Not started

## Goal

Whenever a plan is generated, also produce a "Compras da semana" tab: a
**suggested** shopping list built from the ingredients of the plan's dishes,
to be used as a market list.

## Research & findings (2026-10-06)

- **Scope (owner decision)**: the list covers **all variations** of the week,
  with an explicit disclaimer: it is a **suggestion** — the user should buy
  according to the dishes they choose to make, not buy everything. Each item
  can expand to show **which dishes use it** (day · meal · dish).
- **Aggregation (owner decision)**: the LLM canonicalizes ingredients **in
  the same request** (no extra call) and the app sums locally:
  - Recipe names vary ("peito de frango grelhado", "frango desfiado") and
    weights are cooked ("arroz cozido 150 g") → the model returns, for each
    ingredient, a `shoppingKey` reference and `rawGrams` (raw/purchase-weight
    equivalent).
  - Top-level `shoppingItems: [{key, name, category, unitWeightGrams?,
    packageGrams?, packageLabel?}]` — canonical purchasable items, named in
    the user's language and typical of the user's **country** (Item 6).
  - `category` is a fixed enum translated in the UI: `produce`,
    `meat_fish`, `dairy_eggs`, `bakery_grains`, `pantry`, `frozen`, `drinks`,
    `other`.
- **Local deterministic aggregation** (`src/lib/shopping.ts`, later in
  `packages/core`): sum `rawGrams` (fallback `amountGrams`) per `shoppingKey`
  across all variations → total grams + **practical units** ("≈ 6 unidades"
  via `unitWeightGrams`, "≈ 2 embalagens de 500 g" via `packageGrams`, rounded
  up) + dish references. Ingredients without a valid `shoppingKey` fall into
  "other" by raw name (graceful degradation). `normalizeWeek` validates the
  new fields defensively.
- **Token budget**: response grows ~20–30%; `maxOutputTokens: 65536` already
  set — verify real responses stay within limits; trim descriptions if
  needed.
- **UI**: new tab **"Compras"** (TabBar: Hoje · Plano · Compras · Progresso ·
  Dados; Sidebar on desktop; new icon in `icons.tsx`). Sections grouped by
  category; desktop multi-column grid (DECISIONS #8). Features (owner
  decision): mark as **bought** (checkbox, stored by `planId + key`, reset on
  new plan; local now, server `shopping_checks` table in Item 4),
  **group by section**, **copy/share** (Web Share API with copy fallback),
  **practical units**, "hide bought items" option.
- Old cached plans without shopping data → empty state "Gera um novo plano
  para obter a lista de compras" (regeneration stays confirm-gated,
  DECISIONS #6).

## Decisions

- 2026-10-06 — List covers all variations + suggestion disclaimer; LLM
  canonicalization in the same request + local sum; features: bought marks,
  sections, share/copy, practical units. (DECISIONS #26/#25 era — entry #27)

## Open questions

- [ ] Optional "list only selected variations" toggle later (deferred).
- [ ] Web Share API availability on iOS PWA (test; copy fallback).
- [ ] Should `unitWeightGrams`/`packageGrams` be optional per item (yes —
      model may not know for produce).

## Phases

### 7.1 Types + schema + prompt
- [ ] `ShoppingItem` type; `Ingredient.shoppingKey` + `rawGrams`;
      `Plan.shoppingItems`.
- [ ] Gemini schema (`shoppingItems` array + ingredient fields) + prompt
      rules (canonical purchasable items, country-typical, raw weights).
- [ ] `normalizeWeek`/normalizer updates (defensive; "other" fallback).

### 7.2 Aggregation
- [ ] `src/lib/shopping.ts`: sum + practical units + dish references.
- [ ] Unit tests (esbuild scratch or vitest).

### 7.3 UI
- [ ] `src/screens/Shopping.tsx` + tab wiring (TabBar/Sidebar/icons).
- [ ] Suggestion disclaimer + expandable "used in" per item.
- [ ] Bought-check persistence (local, by `planId + key`).
- [ ] Copy/share (grouped plain text).
- [ ] Translations in the 7 catalogs.

### 7.4 Verify + docs
- [ ] Real generation check (owner's key): shopping keys/raw grams present,
      token size OK, output language correct.
- [ ] Docs: ARCHITECTURE (§4 types, §6 prompt/schema, §9 new tab),
      DECISIONS, CHANGELOG.

## Verification

- Unit tests for aggregation (duplicate keys, missing keys, unit rounding).
- browser-harness: tab renders grouped, check/copy/share, empty state for
  old plans, responsive at 390×844 and 1440×900.
- `npm run build` + `npm run i18n:check`.

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan.
