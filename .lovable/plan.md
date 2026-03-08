

# Dukanly Codebase Audit Report

## Critical Build Errors (Blocking)

### 1. Stripe npm import in Deno edge function
**File:** `supabase/functions/checkout/index.ts:9`
**Issue:** `import Stripe from "npm:stripe@18.5.0"` fails because no `deno.json` declares this dependency. The build error blocks all edge function deployment.
**Fix:** Add a `supabase/functions/deno.json` with `"imports": { "npm:stripe@18.5.0": "npm:stripe@18.5.0" }` or use `"nodeModulesDir": "auto"`.

### 2. Test files have overly strict i18n mock types
**Files:** `src/test/address-book.integration.test.tsx:34`, `src/test/commerce.integration.test.tsx:44`, `src/test/order-confirmation.integration.test.tsx:30`
**Issue:** The mock `t` function uses `keyof typeof en` as the parameter type. As translation keys grow, TypeScript infers a massive union literal type. The mock returns `string` which doesn't match.
**Fix:** Change the mock `t` parameter type to `string` instead of `keyof typeof en`, since the mock doesn't need strict key checking.

---

## Security Vulnerabilities

### 3. Role resolution from user metadata (privilege escalation risk)
**File:** `supabase/functions/_shared/auth.ts:11-21`
**Issue:** `resolveRole()` reads role from `user_metadata` which is user-editable via `supabase.auth.updateUser({ data: { role: "admin" } })`. A regular user can escalate to admin or seller by updating their own metadata.
**Fix:** Only read from `app_metadata` (server-controlled), or use a dedicated `user_roles` table with a `SECURITY DEFINER` function as recommended.

### 4. Cart and address data stored in localStorage without user scoping
**Files:** `src/contexts/CartContext.tsx`, `src/contexts/AddressBookContext.tsx`
**Issue:** All users on the same browser share cart and address data via a single localStorage key. If two people use the same device, addresses (including phone numbers and physical locations) leak between accounts. The address book also seeds fake addresses for unauthenticated users.
**Fix:** Scope storage keys to the authenticated user ID. Clear data on sign-out. For addresses, migrate to the existing `addresses` database table (already has RLS policies).

### 5. Addresses stored client-side but a server-side `addresses` table exists
**Files:** `src/contexts/AddressBookContext.tsx` vs database `addresses` table
**Issue:** The address book uses localStorage while a properly RLS-protected `addresses` table exists in the database. The client-side addresses are never persisted to the server, so they're lost on device change and not validated server-side.
**Fix:** Use the database `addresses` table as the source of truth.

### 6. No input sanitization on checkout phone number client-side
**File:** `src/pages/CheckoutPage.tsx:324-332`
**Issue:** The phone input is a plain `<input>` with no `maxLength`, no pattern restriction, and no sanitization beyond `normalizeIraqPhone`. A very long string could be submitted.
**Fix:** Add `maxLength={15}` and `pattern` attributes, plus validate length in the edge function.

---

## Dead Code and Unused Patterns

### 7. Mock data files still imported in production
**Files:** `src/data/sellerMockData.ts`, `src/data/mockData.ts`
**Issue:** `sellerMockData.ts` is imported by `SellerContext.tsx` and used for profile, settings, and analytics data even though real database queries exist for products and orders. The mock analytics data shows hardcoded USD values (e.g., `$28,459.87`) that conflict with the IQD-first strategy.
**Fix:** Replace mock data with database queries. For analytics, compute from `ledger_transactions` and `order_items` tables.

### 8. Unused `SellerAnalytics` page still routes but duplicates `SellerReports`
**File:** `src/App.tsx:226` and the `SellerAnalytics` page
**Issue:** Both `/seller/analytics` and `/seller/reports` exist with overlapping functionality. The sidebar was expanded to 11 items but `analytics` wasn't removed.
**Fix:** Remove the analytics route and page, or merge into reports.

### 9. Multiple placeholder routes point to `AboutPage`
**File:** `src/App.tsx:181-187`
**Issue:** Routes `/careers`, `/press`, `/investors`, `/affiliate`, `/advertise`, `/publish` all render `AboutPage` as a catch-all. Users clicking these expect distinct content.
**Fix:** Either create stub pages or redirect to a "Coming Soon" page.

---

## Bad Patterns and Code Quality

### 10. `SellOnDukanlyPage` and `Layout` cause React ref warnings
**Console logs:** `Function components cannot be given refs`
**Issue:** `SellOnDukanlyPage` is lazy-loaded and React tries to attach a ref. The `Layout` component also triggers this warning. This happens because `React.lazy` wraps the component and the parent passes a ref.
**Fix:** Either wrap components with `React.forwardRef` or ensure the lazy boundary doesn't try to forward refs.

### 11. CartContext duplicates localStorage writes in every method
**File:** `src/contexts/CartContext.tsx`
**Issue:** Every cart method (`addToCart`, `removeFromCart`, `updateQuantity`, etc.) manually writes to localStorage inside the `setItems` callback. There's already a `persistItems` helper that does this, but it's only used by `clearCart`.
**Fix:** Use a single `useEffect` that persists `items` to localStorage whenever they change, and remove all inline localStorage writes.

### 12. SellerContext has `products` in `updateProduct` dependency array
**File:** `src/contexts/SellerContext.tsx:348`
**Issue:** `updateProduct` depends on `[products]`, which means a new function reference is created on every product state change. This can cause unnecessary re-renders of all consumers.
**Fix:** Use a ref for accessing current products inside the callback, or use the functional `setProducts` updater pattern.

### 13. Hardcoded USD currency code in seller product writes
**File:** `src/contexts/SellerContext.tsx:299,334`
**Issue:** `currencyCode: "USD"` is hardcoded when calling `upsertSellerProduct`, contradicting the IQD-first localization.
**Fix:** Change to `"IQD"` or use a site-wide currency constant.

### 14. `deleteProduct` throws an error instead of working
**File:** `src/contexts/SellerContext.tsx:351-353`
**Issue:** `deleteProduct` always throws `"Seller product publishing is not available yet."` -- it's a stub that will confuse users who try to delete products.
**Fix:** Implement the delete via Supabase, or hide the delete button in the UI until it works.

### 15. Seller `becomeSeller()` doesn't refetch seller ID
**File:** `src/contexts/SellerContext.tsx:411-425`
**Issue:** After inserting into `sellers`, `setIsSeller(true)` is called but `sellerId` is never updated. The dashboard will render but can't fetch products/orders because `sellerId` is still null.
**Fix:** After insert, query back the seller row to get the ID and call `setSellerId()`.

---

## Logic Issues

### 16. Checkout passes `"active-cart"` as cartId, not a real UUID
**File:** `src/pages/CheckoutPage.tsx:196`
**Issue:** `cartId: "active-cart"` is a string literal. The edge function checks `isUuid(payload.cartId)` and sets `source_cart_id` to null if it fails. This means orders are never linked to database carts.
**Fix:** Either use the actual cart ID from the `carts` table (if the cart is server-side) or remove the field entirely.

### 17. Seller orders show "Customer" as customer name for all orders
**File:** `src/contexts/SellerContext.tsx:253`
**Issue:** `customerName: "Customer"` is hardcoded because the orders query doesn't join to profiles. Sellers can't identify who placed orders.
**Fix:** Join `orders` to `profiles` on `user_id` to get `display_name`.

### 18. Price comparison in checkout allows overpayment
**File:** `supabase/functions/checkout/index.ts:149-155`
**Issue:** The validation only checks if `clientTotal < serverItemTotal`. It doesn't check if the client total is unreasonably higher (e.g., manipulation to inflate a seller payout). There's also no validation that `shippingAmount` is a valid delivery option price.
**Fix:** Add an upper-bound check and validate shipping amount against allowed delivery options.

### 19. COD risk check scans ALL payments, not filtered by phone
**File:** `supabase/functions/checkout/index.ts:87-101`
**Issue:** The query fetches all COD payments from the last 24 hours, then filters by phone in JavaScript. With scale, this becomes expensive. Also, the phone is stored inside `raw_provider_payload` JSONB, making the filter unreliable.
**Fix:** Add a `customer_phone` column to `payments` or use a Postgres JSONB query.

---

## Missing Functionality

### 20. New seller pages use only mock/static data
**Files:** `SellerInventory.tsx`, `SellerShipping.tsx`, `SellerReturns.tsx`, `SellerPayments.tsx`, `SellerPerformance.tsx`, `SellerReports.tsx`, `SellerSupport.tsx`
**Issue:** All 7 new seller pages render static placeholder data. The database tables (`ledger_transactions`, `return_requests`, `support_cases`, etc.) exist but no queries connect them to the UI.
**Fix:** Wire each page to its corresponding database table via Supabase queries.

### 21. No onboarding wizard implemented
**File:** `src/components/seller/SellerLayout.tsx:26-48`
**Issue:** The plan called for a multi-step onboarding wizard using `seller_onboarding_steps`, but the current implementation is still the simple "Become a Seller" button with no verification steps.
**Fix:** Implement the onboarding flow as planned.

### 22. SellerLayout header has hardcoded English strings
**File:** `src/components/seller/SellerLayout.tsx:33,35,39,43,59,63-65`
**Issue:** "Start Selling", "Become a Seller", "Seller Central", "Need help?", "Seller Support" are not using the `t()` translation function.
**Fix:** Add i18n keys and use `useLanguage()`.

---

## Summary Priority Table

| Priority | Issue | Type |
|----------|-------|------|
| P0 | #1 Stripe Deno import | Build blocker |
| P0 | #2 Test type errors | Build blocker |
| P0 | #3 Role escalation via user_metadata | Security |
| P1 | #4 Shared localStorage between users | Security/Privacy |
| P1 | #5 Addresses not using database table | Data integrity |
| P1 | #15 becomeSeller doesn't set sellerId | Logic bug |
| P1 | #13 Hardcoded USD in seller writes | Localization bug |
| P2 | #7 Mock data in production | Dead code |
| P2 | #11 Duplicated localStorage writes | Code quality |
| P2 | #16 Fake cartId in checkout | Logic |
| P2 | #17 Hardcoded customer name | UX |
| P2 | #19 COD risk full-table scan | Performance |
| P2 | #20 New seller pages use static data | Incomplete |
| P3 | #8 Duplicate analytics/reports | Dead code |
| P3 | #9 Placeholder routes | UX |
| P3 | #10 React ref warnings | Console noise |
| P3 | #22 Hardcoded English in seller layout | i18n |

