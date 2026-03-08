

## Production Readiness Audit: Mock UI and Placeholder Findings

After a thorough review of the entire codebase, here is a summary of where mock/placeholder UI still exists and what is already production-ready.

### Already Production-Ready (backed by database)
- **Products** -- fetched from Supabase via `useProducts`, `useProductById`, `useSearchProducts`, `useProductsByCategory`
- **Orders** -- fetched from Supabase via `useOrders` hook
- **Cart** -- persisted to `localStorage` (appropriate for guest carts)
- **Checkout** -- real flow via `submitCheckout` edge function with FIB, COD, Stripe payment methods
- **Seller dashboard** -- Overview, Products, Orders, Inventory, Shipping, Payments, Performance, Reports, Support, Settings all query Supabase
- **Auth** -- real Supabase auth (sign in, sign up, forgot/reset password, email verification)
- **Address book** -- persisted via `AddressBookContext`
- **Cookie consent** -- localStorage-backed, GDPR banner in place

### Issues Found

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `src/pages/ListsPage.tsx` | **Wishlists are entirely mock** -- `mockLists` hardcoded array, state only in React `useState`, nothing persisted to DB. Lists are lost on refresh. | **High** |
| 2 | `src/data/mockData.ts` | **Categories are hardcoded** -- static array of 8 categories with local images. Used by `HomePage.tsx` and `CategoryPage.tsx`. Not a DB table. | **Medium** -- acceptable if categories rarely change, but worth noting. |
| 3 | `src/pages/seller/SellerPerformance.tsx:54-55` | **`lateShipmentRate` and `returnRate` are hardcoded `"0.0"` placeholders** | **Medium** |
| 4 | `src/pages/AboutPage.tsx:40-45` | **Vanity stats are hardcoded** -- "10M+ customers", "500K+ sellers", "50M+ products", "190+ countries" are fake numbers | **Medium** |
| 5 | `src/pages/seller/SellerShipping.tsx:28-35` | **Shipping rates (REGIONS array) are hardcoded** -- not persisted or configurable per seller | **Low** -- acceptable as platform defaults |
| 6 | `src/pages/seller/SellerSupport.tsx:136-150` | **Help Centre Quick Links are non-functional** -- cards are not links, they go nowhere | **Low** |
| 7 | `src/pages/seller/SellerPayments.tsx:155` | **"Next Payout" date is calculated client-side** as `Date.now() + 7 days` -- not from a real payout schedule | **Low** |
| 8 | Multiple routes in `App.tsx` | **/careers, /press, /investors, /affiliate, /advertise, /publish** all render `AboutPage` as a placeholder | **Low** -- acceptable as landing stubs |

### Recommended Priority Actions

**Must fix before production:**

1. **Wishlists (ListsPage.tsx)** -- Either:
   - (a) Create a `wishlists` and `wishlist_items` table in the database and wire up CRUD, or
   - (b) Remove the feature from navigation if it won't be ready for launch

2. **Remove fake About page stats** -- Replace "10M+", "500K+", etc. with real numbers or remove the section entirely

**Should fix:**

3. **Seller Performance placeholders** -- Compute `lateShipmentRate` and `returnRate` from actual shipment/return data
4. **Seller Support quick links** -- Either link to real help articles or remove the cards
5. **Next Payout hardcoded date** -- Show "Coming soon" or calculate from actual payout schedule

**Acceptable for launch:**

6. **Hardcoded categories** -- Fine if category structure is stable; can migrate to DB later
7. **Hardcoded shipping regions** -- Reasonable as platform-level defaults
8. **Stub pages** (/careers, /press, etc.) -- Standard practice for early-stage marketplaces

### Implementation Plan

The highest-impact fix is the **wishlists feature**. This requires:
- A database migration to create `wishlists` and `wishlist_items` tables with RLS policies
- A hook (`useWishlists`) to replace the mock state
- Updating `ListsPage.tsx` to use the hook

The **About page stats** fix is a simple text edit -- replace fake numbers with honest ones or remove the stats section.

The seller performance metrics fix requires computing rates from existing `shipments` and `return_requests` tables.

Shall I proceed with fixing these issues? I'd recommend starting with the wishlists database table and the About page stats cleanup.

