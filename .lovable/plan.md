

# Full Website Audit — Dukanly Marketplace

## A. Critical Issues

### 1. Security: Seller banking/tax data publicly readable
The `sellers` table has a policy "Allow view access to verified sellers" that exposes `phone`, `tax_id`, `bank_account_last4`, `bank_name`, `payout_schedule`, `health_score`, and `support_email` to **anyone** (including anonymous users). The `sellers_public` view already exists with only safe fields. **Fix**: Remove the "Allow view access to verified sellers" policy from the `sellers` table; route all public lookups through `sellers_public`.

### 2. Security: Internal inventory metrics publicly readable
The `inventory` table's "Anyone can view inventory" policy exposes `reorder_point` and `reserved_quantity` to unauthenticated users. **Fix**: Restrict SELECT to expose only `quantity_on_hand` publicly, or limit full access to authenticated product-owning sellers.

### 3. RLS: 4 tables with RLS enabled but no policies
`audit_events`, `inventory_reservations`, `payment_state_log`, and `rate_limits` have RLS enabled but zero policies. These are server-only tables accessed via service role, so this is intentional — but should be documented. No action needed unless client-side access is expected.

### 4. Address RLS policies are RESTRICTIVE
All `addresses` table policies use `Permissive: No` (RESTRICTIVE). In PostgreSQL, RESTRICTIVE policies require **all** to pass AND **at least one PERMISSIVE** policy must also exist. If no PERMISSIVE policy exists, all access is denied. This could silently block all address CRUD for authenticated users. **Fix**: Convert address policies from RESTRICTIVE to PERMISSIVE (`USING (auth.uid() = user_id)`).

---

## B. Important Issues

### 5. `SellerPayments` and `SellerSupport` bypass SellerContext
These pages query `ledger_transactions` and `support_cases` directly via Supabase without using `sellerId` from `useSeller()`. `SellerPayments` doesn't use `useSeller()` at all — it relies on RLS alone. If the user isn't authenticated or the seller session is stale, queries will silently return empty arrays. **Fix**: Use `sellerId` from `useSeller()` to explicitly filter queries.

### 6. `SellerReturns` imports `useSeller` but doesn't use `sellerId`
The component imports `useSeller` but doesn't destructure `sellerId` for its return_requests query — it relies on RLS. Same silent-fail risk as above.

### 7. Checkout uses hardcoded `cartId: "active-cart"`
The checkout payload sends `cartId: "active-cart"` instead of a real cart ID from the `carts` table. This works because the cart is client-side (localStorage), but the checkout edge function likely ignores this field and rebuilds from line items. Still, this is misleading and could cause issues if server-side cart validation is added later.

### 8. `convertToIQD` is an identity function
`convertToIQD(amount)` just returns `Math.round(amount)` — prices are already stored in IQD. Multiple pages still call it (CartPage, CheckoutPage, SellerReturns). While not a bug, it's confusing indirection. **Fix**: Remove `convertToIQD` calls where prices are already IQD, or rename to `roundIQD`.

---

## C. Minor / Optional Issues

### 9. Hardcoded `conversionRate: 3.2` in analytics
`useSellerAnalytics` returns a hardcoded 3.2% conversion rate regardless of actual data. This is misleading on the dashboard.

### 10. `lowStockThreshold: 20` hardcoded in `useSellerProducts`
The mapper always sets `lowStockThreshold: 20` — this should be configurable per product or from seller settings.

### 11. Guest address book uses seeded fake data
Guest users see "Ahmed Karim" and "Shilan Omer" as pre-populated addresses. This is confusing — guests should start with an empty address book.

### 12. `SellerLayout` doesn't use `RequireAuth`
The seller layout has its own auth check (`if (!user) return <Navigate to="/auth/signin" />`), duplicating `RequireAuth` logic. Works but inconsistent.

---

## D. Refactoring Plan

### Database migrations needed:
1. **Drop** the "Allow view access to verified sellers" policy from the `sellers` table
2. **Replace** RESTRICTIVE `addresses` policies with PERMISSIVE equivalents
3. **Tighten** the `inventory` SELECT policy to only expose `quantity_on_hand` to anonymous/unauthenticated users

### Code changes needed:
1. **SellerPayments.tsx**: Add `sellerId` from `useSeller()` and use `.eq("seller_id", sellerId)` in the ledger query
2. **SellerSupport.tsx**: Same — add explicit `seller_id` filtering  
3. **SellerReturns.tsx**: Same — add explicit `seller_id` filtering
4. **Remove `convertToIQD`**: Replace all call sites with direct `Math.round()` or remove the call entirely (prices are already IQD integers)
5. **Remove seeded guest addresses**: Start guests with an empty address book
6. **`useSellerAnalytics`**: Replace hardcoded `conversionRate: 3.2` with `0` or remove the field

### No changes needed:
- The SellerContext decomposition into hooks is clean and working
- The AddressBookContext DB migration is correctly implemented with field mapping
- The `DbProduct` type unification is properly shared
- Auth flow (sign in, sign up, forgot password, reset password, verify email) is complete
- Cart persistence, checkout flow, payment integration (FIB, COD, Stripe) are correctly wired
- Route protection with `RequireAuth` is consistently applied to buyer-side protected routes
- Observability (Sentry, structured logging) is properly initialized
- Edge functions are correctly invoked with idempotency keys and retry logic

---

## E. Production Readiness Summary

| Area | Status | Notes |
|------|--------|-------|
| Authentication | Pass | Email/password + Google OAuth, email verification |
| Route protection | Pass | `RequireAuth` on all buyer protected routes |
| Cart & Checkout | Pass | LocalStorage persistence, 3 payment methods |
| Product catalog | Pass | DB-backed with real-time queries |
| Seller dashboard | Pass (with fixes) | Needs explicit `sellerId` filtering on 3 pages |
| Address book | Pass (with fix) | RESTRICTIVE RLS policies need conversion |
| Security | **Fail** | Seller sensitive data publicly exposed |
| Observability | Pass | Sentry + structured logging |
| i18n | Pass | English + Kurdish (Sorani) |
| Error handling | Pass | Toast notifications, loading states |

**Verdict**: Two security fixes (seller data exposure, inventory metrics) must be resolved before production. The RESTRICTIVE address RLS policies should be verified and likely converted. Three seller pages need explicit `sellerId` filtering for defense-in-depth.

