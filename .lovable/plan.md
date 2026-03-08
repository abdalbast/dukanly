

## Plan: Split SellerContext, Migrate AddressBook to DB, Unify DbProduct

### A. Issues Found

**Critical**
- `AddressBookContext` uses localStorage — addresses lost on device switch or logout
- `DbProduct` interface duplicated in `SellerContext.tsx` and `useProducts.ts` with different fields (seller version missing `currency_code`, `rating`, `review_count`, `sellers` join, etc.)

**Important**
- `SellerContext` is a 438-line God context mixing profile, products, orders, settings, and analytics — every consumer re-renders on any change
- `SavedAddress` type has fields (`district`, `governorate`, `landmark`) that don't map to the DB `addresses` table columns (`line1`, `line2`, `state_region`)

**Optional**
- Hardcoded `conversionRate: 3.2` in analytics
- `lowStockThreshold: 20` hardcoded in product mapper

---

### B. Refactoring Plan

#### 1. Unify `DbProduct` into a shared type

- Create `src/types/db.ts` with a single `DbProduct` interface covering all columns from the `products` table plus the optional `sellers` join
- Both `useProducts.ts` and seller hooks will import from there
- The seller-side mapper (`mapDbToSellerProduct`) and storefront mapper (`mapDbToProduct`) stay separate since they map to different domain types — but share the same source interface

#### 2. Split SellerContext into focused hooks

Split into 5 files under `src/hooks/seller/`:

| Hook | Responsibilities |
|------|-----------------|
| `useSellerProfile.ts` | Seller status check, profile CRUD, `becomeSeller`, `sellerId` |
| `useSellerProducts.ts` | Fetch/add/update/delete products |
| `useSellerOrders.ts` | Fetch orders, update status/fulfillment |
| `useSellerSettings.ts` | Load/persist settings from `sellers` table |
| `useSellerAnalytics.ts` | Compute analytics from orders + products |

A thin `SellerContext` remains as a composition layer — it calls these hooks and exposes the same `useSeller()` API so **no consumer changes are needed**. This is pragmatic: avoids touching 15+ files while decomposing the logic.

#### 3. Migrate AddressBookContext to Supabase

**Field mapping** (SavedAddress → DB `addresses` table):

| SavedAddress | DB column |
|-------------|-----------|
| `name` | `full_name` |
| `phone` | `phone` |
| `street` + `district` | `line1` (combined) |
| `landmark` | `line2` |
| `city` | `city` |
| `governorate` | `state_region` |
| `postalCode` | `postal_code` |
| `countryCode` | `country_code` |
| `isDefault` | `is_default` |

Changes:
- On auth, fetch addresses from `addresses` table; fall back to seeded data for unauthenticated users (localStorage kept for guests only)
- `saveAddress` → upsert to DB for authenticated users
- `deleteAddress` → delete from DB
- `selectAddress` → update `is_default` in DB
- Keep the same `useAddressBook()` API so consumers (`Header`, `CheckoutPage`, `AddressBookManager`, `AddressBookDialog`) need zero changes

---

### C. File Changes Summary

**New files:**
- `src/types/db.ts` — shared `DbProduct` interface
- `src/hooks/seller/useSellerProfile.ts`
- `src/hooks/seller/useSellerProducts.ts`
- `src/hooks/seller/useSellerOrders.ts`
- `src/hooks/seller/useSellerSettings.ts`
- `src/hooks/seller/useSellerAnalytics.ts`

**Modified files:**
- `src/contexts/SellerContext.tsx` — slim composition of the 5 hooks
- `src/contexts/AddressBookContext.tsx` — DB-backed with guest fallback
- `src/hooks/useProducts.ts` — import `DbProduct` from `types/db`
- `src/types/address.ts` — no change needed (field mapping handled in context)

**No database migration needed** — the `addresses` table already exists with correct RLS policies for user-scoped CRUD.

