# Dukanly Production Readiness PRD / Audit

Date: 2026-03-06
Scope: Frontend SPA, Supabase Edge Functions, migrations, Playwright coverage, runtime behavior, code quality, and security posture.

## Executive Summary

Status: Not production-ready.

Current readiness estimate: 30/100.

The app shell loads and most routes render, but the core commerce path is still not safe to launch. The biggest blockers are:

1. server-side authorization trusts user-controlled metadata for role checks
2. checkout idempotency is not safe across instances/retries
3. checkout pricing still trusts client-supplied values
4. rate limiting is implemented incorrectly and will not throttle in practice
5. order persistence is incomplete (`order_items` are never written)

There are also multiple medium-severity product issues: seller write flows are still backend scaffolds, and the current CSP/header setup is both weak and unlikely to apply to the actual production deployment. The earlier frontend-only issues around cart persistence, order confirmation spoofing, account route protection, generic merchandising routes, and a set of dead UI branches have been reduced in this pass.

## What I Ran

### Automated checks

| Check | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Pass with warnings | 11 `react-refresh/only-export-components` warnings. |
| `npm test` | Pass | 8 files, 24 tests passed. |
| `npm run build` | Pass | Production build completed successfully. |
| `npm run check:bundle` | Pass | Entry and total JS within current budget. |
| `npm run check:migrations` | Fail | Migration `20260302220104_576f0eb2-11b8-4cf8-ab6a-970c4c798325.sql` is missing rollback notes. |
| `npm run prelaunch:gate` | Fail | Fails immediately because `check:migrations` fails. |
| `npm run test:e2e` | Partial | 3 smoke tests passed, 2 payment scenarios skipped. |
| `npm run prelaunch:smoke` | Fail | Missing `PRELAUNCH_BASE_URL`. |
| `npm audit --audit-level=moderate` | Pass threshold, but not clean | 3 low vulnerabilities via `jsdom -> http-proxy-agent -> @tootallnate/once`. |

### Browser validation

I ran a Playwright browser sweep across the main public and protected routes and manually exercised the cart/checkout flow.

Observed runtime behavior from the original audit sweep:

- Home, product, auth, help, privacy, terms, returns, shipping, and seller redirect routes render without hard JS errors.
- Browser console produced autofill warnings on auth forms because email/password fields did not declare `autocomplete`.
- Adding an item to cart worked, and `/cart` showed the item, but navigating to `/checkout` rendered the empty-cart state.
- `/order-confirmation` rendered a success screen even when reached directly without a confirmed order.
- `/deals`, `/bestsellers`, and `/trending` all render the same generic search page.

### Frontend sync status

The following audit items have been addressed in the current frontend pass and are no longer open at their original severity:

- Cart state now persists in local storage, which removes the immediate `/cart` -> `/checkout` state-loss failure for the SPA flow.
- `/order-confirmation` no longer renders a synthetic success page for direct visits without a verified order context.
- `/card`, `/points`, and `/reload` are now wrapped in `RequireAuth`.
- `AccountPage` now renders signed-in user identity instead of hard-coded placeholder data.
- Auth forms now declare `autocomplete` values.
- Orders search/time filters and currency rendering are now wired.
- Category subroutes now apply the `:subcategory` filter.
- Search results now implement the `newest` sort branch and actually use the mobile filters state.
- `/deals`, `/bestsellers`, and `/trending` now render distinct storefront modes instead of the same generic all-products view.
- Checkout address creation now updates local UI state instead of only closing the dialog.
- Buyer-facing launch surfaces now default to Kurdistan-first localization: Sorani browser detection, IQD-first formatting, Erbil/Kurdistan default delivery context, governorate-aware checkout addresses, and FIB/COD-first payment copy.
- Seller product and order write actions now fail closed in the frontend with explicit "not available yet" messaging instead of implying durable success.

The following frontend concerns remain open because they depend on backend behavior, missing persistence, or product decisions:

- Arabic localization is still not implemented, so Kurdistan users who prefer Arabic are still forced into either Sorani Kurdish or English.
- Seller product and order persistence are still not implemented server-side, so the frontend can only disable those actions rather than complete them.
- End-to-end coverage is still smoke-only for checkout/payment scenarios.

## Prioritized Findings

### PRD-001 Critical: Role checks trust user-controlled metadata

Evidence:

- `supabase/functions/_shared/auth.ts:11-20`
- `supabase/functions/payment-support/index.ts:23-25`
- `supabase/functions/seller-products/index.ts:7-18`
- `supabase/functions/seller-orders/index.ts:7-18`

Details:

- `resolveRole()` accepts `user.user_metadata.role` as authoritative.
- In Supabase, `user_metadata` is user-controlled. A client can update it without backend approval.
- Any Edge Function guarded by `requireRole()` can therefore be reached by a user who self-assigns `seller` or `admin`.

Impact:

- Privilege escalation to seller/admin behavior.
- The highest-risk path is `payment-support`, which exposes order/payment/event details intended for admins only.

Required fix:

- Remove `user_metadata` from authorization decisions.
- Use only server-controlled claims (`app_metadata`) or DB-backed role membership.
- For seller routes, prefer checking an owned seller record instead of a mutable role string.

### PRD-002 Critical: Checkout idempotency is broken across instances and can create duplicate orders

Evidence:

- `supabase/functions/_shared/idempotency.ts:8-9`
- `supabase/functions/_shared/write-handler.ts:33-52`
- `supabase/functions/checkout/index.ts:177-218`
- `supabase/functions/checkout/index.ts:244-258`

Details:

- Shared idempotency cache is a process-local `Map`.
- On a retry that lands on a different instance or after a restart, the request is executed again.
- Checkout inserts the `orders` row before it checks for an existing payment by idempotency key.
- The payment reuse logic does not prevent the second order insert, and reservations are then written against the second order.

Impact:

- Duplicate orders and duplicate inventory reservations.
- Reused payment rows can become detached from the order that was just created.
- This is a launch-blocking correctness issue for any flaky client/network scenario.

Required fix:

- Persist idempotency at the order boundary in the database.
- Add a unique idempotency column on `orders` (or a dedicated request ledger) and resolve duplicates before any side effects.
- Wrap order/payment/reservation writes in one transactional boundary.

### PRD-003 Critical: Checkout still trusts client-supplied pricing

Evidence:

- `supabase/functions/checkout/index.ts:44-70`
- `supabase/functions/checkout/index.ts:149-155`
- `supabase/functions/checkout/index.ts:244-248`

Details:

- The server only checks that a price row exists for UUID products.
- It does not recompute authoritative prices from `product_prices`.
- `serverItemTotal` is derived from client-provided `unitPrice`.
- Non-UUID `productRef` values bypass even the currency-price existence check.

Impact:

- A modified client can understate item prices and total charges.
- Inventory can be reserved for products whose canonical prices were never validated.

Required fix:

- Resolve every line item server-side from a canonical product/price source.
- Reject unknown product refs.
- Ignore client `unitPrice` for billing decisions.

### PRD-004 High: Rate limiting will not accumulate requests and is effectively disabled

Evidence:

- `supabase/migrations/20260302220104_576f0eb2-11b8-4cf8-ab6a-970c4c798325.sql:42-55`
- `supabase/functions/_shared/rate-limit.ts:22-37`

Details:

- The primary key for `public.rate_limits` includes `window_start`.
- `check_rate_limit()` inserts `window_start = now()` for every request.
- Because `now()` is different on each call, the `ON CONFLICT` path almost never fires.
- `request_count` therefore stays at `1` per row instead of incrementing inside a fixed bucket.

Impact:

- `payment-status`, `fib-callback`, and all `handleWrite()` routes are not meaningfully rate limited.

Required fix:

- Bucket `window_start` to a deterministic interval boundary instead of raw `now()`.
- Add tests that prove repeated requests trip the limiter.

### PRD-005 High: Checkout does not write `order_items` and is not transactionally consistent

Evidence:

- `supabase/functions/checkout/index.ts:177-258`
- `src/hooks/useOrders.ts:30-49`
- `src/contexts/SellerContext.tsx:164-191`

Details:

- Checkout writes `orders`, `payments`, and `inventory_reservations`.
- It never inserts `order_items`.
- Customer order history and seller order views both depend on `order_items`.
- The write sequence is also non-transactional, so partial failures can leave orphaned records.

Impact:

- Real checkouts can produce orders that do not show line items in buyer or seller surfaces.
- Partial failure leaves inconsistent data that is hard to reconcile.

Required fix:

- Write `order_items` as part of checkout.
- Move the order, order item, payment, and reservation work into one atomic DB transaction or RPC.

### PRD-006 Medium: Seller write flows are still scaffolds, but the frontend now fails closed instead of faking success

Evidence:

- `supabase/functions/seller-products/index.ts:11-18`
- `supabase/functions/seller-orders/index.ts:11-18`
- `supabase/functions/seller-products-list/index.ts:26-32`
- `src/lib/writeApi.ts`
- `src/pages/seller/AddProduct.tsx`
- `src/pages/seller/SellerProducts.tsx`
- `src/pages/seller/SellerOrders.tsx`
- `src/contexts/SellerContext.tsx`

Details:

- Seller product/order Edge Functions only echo accepted requests with `"next": ...`.
- The frontend now detects these placeholder responses and converts them into feature-not-ready failures.
- Seller product create/update/archive/delete and seller order status/fulfillment actions now show explicit unavailable messaging instead of claiming success.

Impact:

- The false-success UX is reduced.
- Seller management remains incomplete because real persistence and transitions still do not exist.

Required fix:

- Keep these flows disabled or explicitly unavailable until the functions persist data.
- Replace the backend scaffolds with real persistence and read-model refreshes.

### PRD-007 Resolved on frontend: Cart state no longer depends only on volatile in-memory state

Evidence:

- `src/contexts/CartContext.tsx`
- `src/test/cart-context.test.tsx`

Original runtime evidence:

- During browser testing, an item added to cart was visible on `/cart`, but `/checkout` rendered the empty-cart state.

Current state:

- Cart state is now hydrated from and persisted to local storage.
- This removes the immediate SPA reload/direct-navigation loss that was observed during testing.
- This is still a client-side cart only. It is not yet durable across devices or signed-in sessions, and it has no server reconciliation model.

Impact:

- The original checkout breakage is reduced.
- Remaining risk is limited to client-side storage constraints and lack of shared cart persistence.

Status:

- Frontend mitigation shipped.
- Backend/shared-cart work is still optional future product work, not part of this pass.

### PRD-008 Resolved on frontend: `/order-confirmation` no longer renders a fake success state

Evidence:

- `src/pages/OrderConfirmationPage.tsx`
- `src/test/order-confirmation.integration.test.tsx`

Original issue:

- When no order was present in router state, the page fabricated an order number and defaulted payment state for return URLs.

Current state:

- Direct visits without an order now render an explicit "Order Not Found" state.
- Stripe return flows attempt verification before rendering success content.
- Pending or failed verification now render non-success states instead of a synthetic success screen.

Impact:

- The misleading success-path behavior is removed from the frontend.

Status:

- Frontend fix shipped.
- Final correctness still depends on the backend payment/order APIs returning authoritative state.

### PRD-009 Medium: Header/CSP posture is weak and likely not applied in real production hosting

Evidence:

- `vite.config.ts:13-18`
- `vite.config.ts:41-53`

Details:

- Current CSP allows both `'unsafe-inline'` and `'unsafe-eval'`.
- The headers are attached only to Vite `server` and `preview`.
- There is no deployment config in the repo (`vercel.json`, `_headers`, `netlify.toml`, custom server) that would apply these headers to a static production deployment.

Impact:

- The stated security posture is weaker than it appears.
- Production may ship with no CSP/header enforcement at all, depending on hosting.

Required fix:

- Move production headers to real deployment infrastructure.
- Remove `'unsafe-eval'` and minimize `'unsafe-inline'` where possible.

### PRD-010 Medium: Missing env vars silently fall back to a hard-coded Supabase project

Evidence:

- `vite.config.ts:21-39`

Details:

- If `VITE_SUPABASE_*` values are missing, the build injects hard-coded defaults.
- This prevents a clean fail-fast configuration error and can silently point a deployment at the wrong backend.

Impact:

- Environment drift and accidental cross-environment data access.

Required fix:

- Remove build-time fallbacks for runtime environment selection.
- Fail builds when required production env vars are absent.

### PRD-011 Resolved on frontend: Route behavior is no longer generic or incorrectly protected

Evidence:

- `src/App.tsx`
- `src/pages/SearchResultsPage.tsx`
- `src/pages/CategoryPage.tsx`
- `src/pages/AccountPage.tsx`

Details:

- This pass fixed the account-route protection issue and removed static identity placeholders from `AccountPage`.
- This pass also wired category subroutes so `:subcategory` now affects filtering.
- `/deals`, `/bestsellers`, and `/trending` still reuse `SearchResultsPage`, but they now apply distinct storefront modes instead of rendering the same generic result set.

Impact:

- The misleading generic-route behavior is removed from the frontend.

Status:

- Frontend mitigation shipped.
- Dedicated standalone merchandising pages are optional product work, not a correctness blocker.

### PRD-012 Low: Auth and list/order UIs contain incomplete logic and dead code

Evidence:

- `src/pages/auth/SignInPage.tsx`
- `src/pages/auth/SignUpPage.tsx`
- `src/pages/auth/ForgotPasswordPage.tsx`
- `src/pages/auth/ResetPasswordPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/SearchResultsPage.tsx`
- `src/pages/CheckoutPage.tsx`
- `supabase/migrations/20260302220104_576f0eb2-11b8-4cf8-ab6a-970c4c798325.sql:1-2`
- `scripts/check-migrations.mjs:57-58`

Details:

- Auth inputs now declare `autocomplete`, removing the browser autofill warnings found during testing.
- Orders page search/time filters are now wired, and totals now render using the order currency.
- Search page now implements the `newest` sort branch, uses the mobile filter panel state, and powers distinct merchandising route modes.
- Checkout address creation now updates local UI state and selects the newly created address.
- Migration quality gates are failing because a recent SQL file has no rollback notes header.

Impact:

- The frontend dead-code/incomplete-logic portion of this finding is materially reduced.
- The migration gate failure remains open and blocks `prelaunch:gate`.

## E2E Coverage Gaps

Evidence:

- `tests/e2e/smoke.spec.ts:3-20`
- `tests/e2e/payments-fib.spec.ts:3-14`
- `tests/e2e/payments-cod.spec.ts:3-13`

Current state:

- Only three smoke tests execute.
- Both payment scenarios are permanently skipped and exist only as checklists.

Required fix:

- Add runnable buyer checkout coverage for:
  - add to cart -> checkout -> COD submit
  - add to cart -> checkout -> FIB session creation
  - direct-route guards for account/orders/lists
  - order confirmation validation

## Release Blockers

These should be treated as must-fix before launch:

1. Remove user-metadata-based role trust.
2. Rework checkout idempotency and add a DB-backed transactional write path.
3. Recompute prices server-side and reject unknown product refs.
4. Fix rate limiting so it actually counts requests.
5. Persist `order_items` and reconcile buyer/seller read models against real checkout output.
6. Replace seller/order scaffolds with real persistence.
7. Fix migration gating so `prelaunch:gate` can pass.

## Recommended Fix Order

1. Secure authorization and checkout integrity first: PRD-001, PRD-002, PRD-003, PRD-004.
2. Repair core commerce data consistency: PRD-005.
3. Replace the remaining seller scaffolds with real persistence: PRD-006.
4. Tighten deployment/runtime posture: PRD-009 and PRD-010.
5. Expand E2E coverage and clean the remaining low-priority issues.
