# 03 — Payments (Stripe, freemium, EUR + BRL)

**Status:** ☐ Not started (blocked by owner actions — see 3.0)

## Goal

Monetize via Stripe: freemium (exactly **1 free plan generation per user,
ever**; afterwards a **monthly subscription** — no annual option), charging in
**EUR and BRL** (optionally GBP for UK users).

## Research & findings (2026-10-06)

### One account or one per currency?
- **One Stripe account (Portugal) is enough for EUR + BRL.** A PT account can
  present charges in BRL (cards) and supports **Pix** (one-time + recurring),
  settling in **EUR** (BRL is converted; FX fee applies; no BRL payout
  without a Brazilian entity — not needed).
- Pricing via **one Price object with `currency_options`** (EUR base + manual
  BRL amount, optionally GBP) or Stripe Adaptive Pricing (auto-conversion).
  Manual `currency_options` keeps stable prices in both currencies
  (recommended; overrides Adaptive Pricing for those currencies).

### Invoicing (owner has no company)
- **Standard Stripe does NOT issue AT-certified Portuguese invoices**
  (ATCUD, QR code, SAF-T): the seller must issue them via certified software
  (InvoiceXpress, Moloni, TOConline) and handle VAT/OSS.
- **Recommended: Stripe Managed Payments (Merchant of Record)** — available
  to PT businesses; Stripe ("Sold through Link, LLC") becomes the seller to
  the end customer: calculates/collects/remits VAT in 80+ countries (all EU +
  GB), issues customer invoices/receipts, handles fraud, disputes and
  transaction-level support. Cost: **+3.5% per successful transaction** on
  top of standard fees. Works only with Checkout / Payment Links (fine) and
  requires an **eligibility review**; product must be a fully automated
  digital product (tax code e.g. `txcd_10105001` AIaaS personal use).
  Supports Pix including recurring payments.
- **Gap: Brazil is NOT in Managed Payments' tax-coverage list** → for BR
  customers the indirect-tax compliance stays with the seller. Validate with
  an accountant. Alternative MoR to compare: **Paddle** (supports Pix/Pix
  Automático, BRL).
- Even with a MoR the income must be declared in Portugal — typically as a
  sole trader ("atividade aberta" / trabalhador independente, **no company
  needed**). Accountant consult is a blocking non-code step.

### Consumer law
- EU: 14-day withdrawal right for digital content — needs explicit consent to
  immediate performance + acknowledgement of losing the right (Terms +
  checkout).
- Brazil: CDC art. 49 — 7-day regret right for online purchases.

## Decisions

- 2026-10-06 — Freemium: 1 free generation per user (ever), then monthly
  subscription only; no annual. (DECISIONS #23)
- 2026-10-06 — Stripe account country Portugal; one account for EUR + BRL.
  (DECISIONS #30)
- 2026-10-06 — Preference for Stripe Managed Payments (MoR) over standard
  Stripe + certified invoicing software; pending eligibility review and
  accountant validation; Paddle as fallback. (DECISIONS #30)

## Open questions

- [ ] Price points (EUR / BRL, optionally GBP for GB).
- [ ] Subscriber fair-use limit (e.g., N generations/day) to control Gemini
      costs.
- [ ] What a cancelled subscriber keeps (recommended: last plan, read-only).
- [ ] Does a **failed** generation consume the free one? (Recommended: no.)
- [ ] Stripe Managed Payments eligibility result; Stripe MP vs Paddle final
      decision.
- [ ] Verified email required before the free generation (anti-abuse) —
      recommended, ties into Item 4.

## Phases

### 3.0 Owner actions (non-code, blocking)
- [ ] Accountant consult (sole trader / Brazil tax gap via MoR).
- [ ] Open activity at Finanças (if recommended by accountant).
- [ ] Create Stripe PT account (individual/sole trader).
- [ ] Apply for Managed Payments; decide Stripe MP vs Paddle.
- [ ] Record the decision in DECISIONS + this file.

### 3.1 Stripe catalog
- [ ] Product "Nutribio Premium"; monthly Price with `currency_options`
      (EUR + BRL [+ GBP]), tax code, payment methods (cards, Apple/Google
      Pay, Pix, MB WAY if eligible).
- [ ] Customer Portal / Link order management; Checkout terms URLs (Item 5).

### 3.2 API endpoints
- [ ] `entitlements` table (`free_generation_used_at`, `subscription_status`,
      `current_period_end`, `stripe_customer_id`).
- [ ] `POST /api/billing/checkout` — subscription Checkout Session; currency
      from **profile.country** (BR → BRL, GB → GBP if enabled, else EUR);
      `client_reference_id` = user id.
- [ ] `POST /api/billing/portal` — billing portal session.
- [ ] `POST /api/webhooks/stripe` — signature verification, idempotent via
      `stripe_events` table; handle `checkout.session.completed`,
      `customer.subscription.*`, `invoice.paid` / `payment_failed`.

### 3.3 Freemium enforcement
- [ ] Enforced inside the generation endpoint, atomically in a DB
      transaction (free unused OR subscription active).
- [ ] Fair-use limit for subscribers.

### 3.4 Web UI
- [ ] Paywall dialog shown instead of generation when not entitled.
- [ ] Pricing section on Welcome.
- [ ] Definições → "Subscrição" (status, manage, cancel).
- [ ] Return URL handling (`?checkout=success|cancel`, state-based).

### 3.5 End-to-end test
- [ ] Stripe test mode E2E with Stripe CLI webhook forwarding.
- [ ] Docs: ARCHITECTURE (new §), DECISIONS, CHANGELOG.

## Verification

- Webhook handler unit tests (signature, idempotency, event matrix).
- Paywall appears after the free generation is used.
- Subscription reactivation/cancellation reflected in entitlements.

## Progress log

- 2026-10-06 — Item created from the approved roadmap plan (Stripe/BRL/Pix/MoR
  research recorded).
