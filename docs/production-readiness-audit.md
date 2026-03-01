# Dukanly Production Readiness Audit

Date: 2026-03-01  
Scope: Frontend app, Supabase Edge Functions, DB migrations, quality gates, and release scripts.

## Overall verdict

**Status: Not production-ready yet.**  
Estimated readiness: **45/100**.

The project has a solid base (auth, build pipeline, payment state machine, checkout write path), but large parts of commerce are still mock/local-state and several core backend write/read surfaces are still contract scaffolds.

## Gate and runtime status

| Check | Result | Notes |
|---|---|---|
| `npm run lint` | Pass (warnings) | 11 `react-refresh/only-export-components` warnings, 0 errors. |
| `npm test` | **Fail** | `vitest.config.ts` imports `@vitejs/plugin-react-swc`, package not installed. |
| `npm run build` | Pass | Build succeeds; main chunk still large warning from Vite. |
| `npm run check:bundle` | Pass | Entry and total JS within configured budget. |
| `npm run check:migrations` | Pass | Migration naming/rollback checks pass. |
| `npm run test:e2e` | Partial | 3 smoke tests pass, 2 payment tests skipped. |
| `npm run prelaunch:gate` | **Fail** | Missing required payment env vars (`FIB_*`, `COD_*`). |
| `npm audit --audit-level=moderate` | Pass | 0 vulnerabilities found. |

## What is implemented and close to production

- Supabase auth lifecycle is wired in UI (`sign in`, `sign up`, `forgot/reset`, `verify email`).
- Protected routes are enforced on the client (`RequireAuth`).
- Checkout Edge Function performs real writes: creates order + payment + inventory reservations, and supports COD/FIB split.
- Payment lifecycle has real reconciliation flow:
  - FIB callback endpoint
  - Payment status polling endpoint
  - DB-backed payment transition function and event logging
- Basic observability exists:
  - Correlation IDs
  - Unhandled error capture
  - Optional Sentry
- CI workflows exist for lint/test/build/e2e + preview checks.

## Major gaps: UI-only or mock-backed functionality

### Customer-facing flows

- Storefront/catalog/search/category/product pages are mock-data driven (`mockProducts`), not DB/API-backed.
- Cart is in-memory React state only; no persistence, no server cart model usage.
- Orders page is hardcoded (`mockOrders`) and not connected to checkout-created orders.
- Lists/wishlist are local state (`mockLists`) only.
- Account page displays static user info (`John Doe`) and static sections.
- Multiple account/help/footer routes map to generic placeholder pages rather than dedicated functionality.

### Checkout UX gaps

- Address management is UI-only:
  - Addresses state is read-only mock (`const [addresses] = useState(...)`).
  - “Save Address” closes dialog but does not add/persist address.
- Promo code, gift message, and delivery instructions have UI but are not fully integrated into persisted backend order data.
- Order confirmation can render fallback synthetic order numbers even without a real order payload.

### Seller flows

- Seller dashboard state (products/orders/settings/analytics) is initialized from mock data.
- Product create/update call write endpoint, but local IDs/state are synthetic and not re-read from DB.
- Product delete is local-only (no backend delete call).
- Seller analytics and settings are mock/local-state only.
- Seller list read endpoints exist server-side but are not used by frontend.

## Backend/API implementation gaps

- `orders`, `seller-products`, `seller-orders`, `seller-products-list`, and `seller-orders-list` still return scaffold contract responses (`next: "connect to ..."`), not full persistence/read models.
- Commerce RLS is incomplete:
  - RLS/policies exist for `profiles` and `sellers`.
  - Core commerce tables (`orders`, `order_items`, `payments`, `carts`, etc.) do not yet have full policy matrix in migrations.
- Checkout integrity gaps:
  - Price trust is still largely client-driven (no authoritative server-side price recomputation from product tables).
  - Non-UUID product refs bypass product existence/price checks.
  - Shipping/tax are inserted as `0` in orders despite UI calculations.
  - No `order_items` write in checkout path yet.
  - Multi-step writes are not wrapped in a single transaction boundary.

## Reliability and release risks

- Test gate blocker: unit tests cannot run in current state due Vitest config/package mismatch.
- Payment E2E tests are skipped scenario placeholders, so critical paid/COD end-to-end paths are not continuously verified.
- Idempotency and rate limiting are in-memory maps in Edge runtime; this is weak for horizontally scaled/serverless production behavior.
- Prelaunch gate currently fails without full FIB/COD env wiring.

## Launch blockers (must fix before production)

1. Fix test infrastructure (`vitest.config.ts` plugin mismatch) so CI/unit tests run.
2. Replace mock storefront/cart/orders/lists/account data paths with DB/API-backed flows.
3. Complete backend persistence for orders and seller write/read surfaces (remove scaffold `next` responses).
4. Implement and test full RLS policy matrix for commerce tables.
5. Harden checkout integrity:
   - server-side canonical price validation
   - real product/inventory checks
   - `order_items` writes
   - transactional consistency
6. Convert payment E2E tests from skipped scenarios to executable CI coverage.
7. Move idempotency/rate-limit controls to shared persistent infrastructure (not per-instance memory only).

## Key evidence references

- `vitest` mismatch:
  - `vitest.config.ts:2`
  - `scripts/check-react-refresh-compat.mjs:15-24`
- Mock/storefront usage:
  - `src/pages/HomePage.tsx:5`
  - `src/pages/ProductDetailPage.tsx:10`
  - `src/pages/CategoryPage.tsx:5`
  - `src/pages/SearchResultsPage.tsx:9`
- Local cart/orders/lists/account:
  - `src/contexts/CartContext.tsx:21`
  - `src/pages/OrdersPage.tsx:13`
  - `src/pages/ListsPage.tsx:16`
  - `src/pages/AccountPage.tsx:29`
- Checkout UI-only address + partial payload usage:
  - `src/pages/CheckoutPage.tsx:125`
  - `src/pages/CheckoutPage.tsx:327-331`
- Seller mock/local-state:
  - `src/contexts/SellerContext.tsx:53-56`
  - `src/contexts/SellerContext.tsx:145-147`
  - `src/pages/seller/AddProduct.tsx:113-114`
- Scaffolded backend contracts:
  - `supabase/functions/orders/index.ts:14`
  - `supabase/functions/seller-products/index.ts:17`
  - `supabase/functions/seller-orders/index.ts:17`
  - `supabase/functions/seller-products-list/index.ts:31`
  - `supabase/functions/seller-orders-list/index.ts:31`
- Checkout data integrity concerns:
  - `supabase/functions/checkout/index.ts:43-68`
  - `supabase/functions/checkout/index.ts:146-151`
  - `supabase/functions/checkout/index.ts:184-189`
  - `supabase/functions/checkout/index.ts:224-230`
- RLS coverage:
  - `supabase/migrations/20260228033213_49632a1c-d180-4a70-a892-4ac0062f10f8.sql`
  - `supabase/migrations/20260228035530_5efd6c95-1a5a-478c-a65a-53f469b3055e.sql`
- In-memory controls:
  - `supabase/functions/_shared/rate-limit.ts:10`
  - `supabase/functions/_shared/idempotency.ts:9`
- Skipped payment E2E:
  - `tests/e2e/payments-fib.spec.ts:4`
  - `tests/e2e/payments-cod.spec.ts:4`
