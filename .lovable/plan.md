

# Seller Hub: Full Phase 1 + Phase 2 Implementation Plan

## Current State

The seller dashboard has 5 pages (Overview, Products, Orders, Analytics, Settings) with a basic sidebar. Products and orders are backed by real database tables. Analytics uses mock data. Settings saves to local state only. No financial ledger, returns, shipping management, performance tracking, reports, or support cases exist.

## Implementation Strategy

This is a large scope. We will implement it in 6 sequential batches, each self-contained and deployable.

---

## Batch 1: Database Foundation

Create the new tables needed for all subsequent work.

**New tables:**

- `ledger_transactions` -- financial event log (order_sale, commission_fee, shipping_charge, refund, adjustment, payout_transfer, etc.). Columns: id, seller_id, order_id, type, amount, currency_code, description, balance_after, created_at. RLS: sellers see own rows.
- `return_requests` -- buyer-initiated returns. Columns: id, order_id, order_item_id, seller_id, buyer_user_id, reason, evidence_urls, status (pending/approved/rejected/disputed/completed), refund_amount, admin_notes, created_at, updated_at. RLS: sellers see own, buyers see own.
- `refunds` -- tracks refund issuance. Columns: id, return_request_id, order_id, seller_id, amount, currency_code, status, processed_at, created_at. RLS: sellers see own.
- `policy_issues` -- account health issues. Columns: id, seller_id, severity (warning/critical), category, title, description, fix_instructions, status (open/acknowledged/resolved/appealed), created_at, resolved_at. RLS: sellers see own.
- `appeals` -- seller appeals on policy issues. Columns: id, policy_issue_id, seller_id, message, attachments, status (submitted/under_review/accepted/rejected), admin_response, created_at, updated_at. RLS: sellers see own.
- `support_cases` -- seller support tickets. Columns: id, seller_id, subject, description, category, status (open/in_progress/resolved/closed), attachments, created_at, updated_at. RLS: sellers see own.
- `seller_notifications` -- in-app notifications. Columns: id, seller_id, type, title, message, link, is_read, created_at. RLS: sellers see own.
- `seller_onboarding_steps` -- tracks onboarding completion. Columns: id, seller_id, step_key, completed, completed_at, created_at. RLS: sellers see own.
- `fee_rules` -- marketplace fee configuration. Columns: id, category, fee_type (commission/listing/processing), percentage, flat_amount, currency_code, active, created_at. RLS: public read.

Also add columns to `sellers`: `business_type`, `tax_id`, `phone`, `support_email`, `bank_name`, `bank_account_last4`, `payout_schedule`, `onboarding_complete`, `health_score`.

---

## Batch 2: Sidebar + Page Shells + Onboarding

**Expand sidebar** from 5 to 11 items: Home, Orders, Products, Inventory, Shipping, Returns, Payments, Performance, Reports, Support, Settings.

**Create page shell files** (each with title, description, and placeholder content):
- `src/pages/seller/SellerInventory.tsx`
- `src/pages/seller/SellerShipping.tsx`
- `src/pages/seller/SellerReturns.tsx`
- `src/pages/seller/SellerPayments.tsx`
- `src/pages/seller/SellerPerformance.tsx`
- `src/pages/seller/SellerReports.tsx`
- `src/pages/seller/SellerSupport.tsx`

**Add routes** in `App.tsx` for all new pages under `/seller`.

**Onboarding flow**: Replace the current "Become a Seller" button in `SellerLayout.tsx` with a multi-step onboarding wizard:
1. Business details (name, type, tax ID)
2. Bank/payout details
3. Store profile (logo, description)
4. Shipping & returns defaults
5. Accept seller agreement
6. Go-live checklist with completion indicators

Track progress via `seller_onboarding_steps` table. Block access to full dashboard until onboarding is complete.

---

## Batch 3: Financial Ledger + Payments Page

**Payments page** (`SellerPayments.tsx`) with two views:

- **Statement view**: Payout summary showing available balance, pending, reserved, on hold. Next payout date. Settlement period summaries.
- **Transaction view**: Filterable ledger table showing every money movement (order sale, commission fee, refund, adjustment, payout transfer). Filter by order ID, date range, type. CSV export button.

**Ledger population**: Create an edge function `seller-ledger` that:
- Returns paginated ledger transactions for the authenticated seller
- Supports filters (date range, type, order_id)

For MVP, seed ledger entries when orders are created/fulfilled/refunded via existing checkout and order flows. Add ledger writes to the `checkout` and `seller-orders` edge functions.

---

## Batch 4: Inventory + Shipping + Catalogue-First Listing

**Inventory page** (`SellerInventory.tsx`):
- Stock by SKU with quantity on hand, reserved, available
- Low stock rules and alerts with configurable thresholds
- Stock adjustment dialog with reason codes (received, damaged, returned, correction)
- Reads from existing `inventory` table joined with `products`

**Shipping page** (`SellerShipping.tsx`):
- Shipment list from `shipments` table with status filters
- Tracking entry and validation per carrier format
- Shipping templates (rates by region: Erbil, Sulaymaniyah, Duhok, Baghdad)
- Handling time configuration
- Delivery promise calculator (based on region + handling time)

**Catalogue-first listing flow**: Update `AddProduct.tsx`:
- Step 1: Search existing catalogue by name/barcode/brand before creating new
- If match found, seller creates an offer (price, stock, condition)
- If no match, proceed to full product creation
- Add listing completeness score before publish
- Flag risk categories for review

---

## Batch 5: Returns + Performance/Health

**Returns page** (`SellerReturns.tsx`):
- Return request queue with status filters
- Return detail dialog showing reason, evidence, buyer info
- Actions: approve return, offer partial refund, dispute
- On approval: trigger refund record + ledger entry + inventory restock
- Time-boxed decision windows shown with countdown
- Full audit trail in return timeline

**Performance page** (`SellerPerformance.tsx`):
- Account health score (0-100) with status indicator (healthy/at risk/critical)
- Operational metrics cards: late shipment rate, cancellation rate, return rate
- Customer metrics: average rating, complaint count, response time
- Policy issues list with severity badges
- Fix path per issue with instructions
- Appeal submission with file attachments
- Enforcement ladder display (warnings -> limits -> suspension)

---

## Batch 6: Reports + Support + Home Dashboard Enhancement

**Reports page** (`SellerReports.tsx`):
- Sales report (date range, product breakdown)
- Inventory report (current stock, turnover)
- Returns report (rate by product, reasons)
- Financial export (CSV of ledger transactions)
- All reports filterable by date range with download buttons

**Support page** (`SellerSupport.tsx`):
- Create support case with category selector and attachment upload
- Case list with status tracking
- Case detail with message thread
- Help centre links and guided troubleshooting
- Marketplace announcements section

**Home dashboard enhancement** (`SellerOverview.tsx`):
- Add personalized task queue ("5 orders need shipping", "3 returns awaiting decision")
- Quick action buttons (Create listing, Fulfil order, Download report)
- Payment snapshot card (available balance, next payout)
- Compliance alert card (from policy_issues)
- Sales summary with today/week/month toggle

---

## Technical Details

### Database migration summary
- 9 new tables with RLS policies
- Column additions to `sellers` table
- Enable realtime on `seller_notifications`

### New edge functions
- `seller-ledger` -- read ledger transactions with filters
- `seller-returns` -- handle return request actions
- `seller-support` -- CRUD support cases

### New frontend files (~12 new files)
- 7 new page components
- 1 onboarding wizard component
- Types file updates for new entities
- SellerContext expansion for new data sources
- Updated sidebar and routing

### Existing file modifications
- `SellerSidebar.tsx` -- 11 nav items
- `SellerLayout.tsx` -- onboarding gate
- `SellerOverview.tsx` -- task queue + quick actions
- `App.tsx` -- new routes
- `src/types/seller.ts` -- new interfaces
- `src/contexts/SellerContext.tsx` -- new data fetching
- `AddProduct.tsx` -- catalogue-first flow
- `writeApi.ts` + `schemas.ts` -- new endpoints

### i18n
All new strings added to `en.ts` and `ckb.ts` for both English and Kurdish.

