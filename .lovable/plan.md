

## Plan: Migrate Product & Order Data to Database with RLS

### Current State
- Database tables already exist: `products`, `orders`, `order_items`, `payments`, `inventory`, `carts`, `cart_items`, `addresses`, `shipments`, `audit_events` (from phase 1 commerce schema migration)
- **No RLS is enabled** on any commerce table -- this is a critical security gap
- Frontend pages (HomePage, CategoryPage, SearchResultsPage, ProductDetailPage, CartPage, ListsPage, OrderConfirmationPage, OrdersPage) all import from `src/data/mockData.ts` 
- Seller dashboard (SellerContext) imports from `src/data/sellerMockData.ts`
- The `products` table has columns: `id`, `seller_id`, `sku`, `title`, `description`, `status`, `currency_code`, `base_price`, `metadata` -- but lacks fields the frontend needs: `brand`, `category`, `subcategory`, `images`, `rating`, `review_count`, `is_prime`, `is_best_seller`, `is_limited_deal`

### What Needs to Happen

#### 1. Database Migration: Add missing product columns + enable RLS on all commerce tables

Add columns to `products` table to support the full product catalog display:
- `brand TEXT`
- `category TEXT`  
- `subcategory TEXT`
- `images JSONB DEFAULT '[]'`
- `rating NUMERIC(2,1) DEFAULT 0`
- `review_count INTEGER DEFAULT 0`
- `is_prime BOOLEAN DEFAULT false`
- `is_best_seller BOOLEAN DEFAULT false`
- `is_limited_deal BOOLEAN DEFAULT false`
- `stock INTEGER DEFAULT 0` (denormalized for quick reads)
- `original_price NUMERIC(12,2)` (compare-at price)
- `delivery_days INTEGER DEFAULT 3`
- `fulfillment_type TEXT DEFAULT 'seller'`

Enable RLS and create policies on all commerce tables:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| products | Anyone (public catalog) | Seller owns | Seller owns | Seller owns |
| orders | User owns | Service role only (edge fn) | Service role only | None |
| order_items | User owns (via order) | Service role only | Service role only | None |
| payments | User owns (via order) | Service role only | Service role only | None |
| addresses | User owns | User owns | User owns | User owns |
| carts | User owns | User owns | User owns | User owns |
| cart_items | User owns (via cart) | User owns (via cart) | User owns (via cart) | User owns (via cart) |
| inventory | Public read | Seller owns | Seller owns | None |
| shipments | User owns (via order) | Service role only | Service role only | None |
| audit_events | None (backend only) | Service role only | None | None |

#### 2. Seed product catalog data

Insert the 12 mock products into the `products` table. Since there are no real sellers yet, create a system/marketplace seller record first, then insert products under it.

#### 3. Create data-fetching hooks

Create React hooks that query the database instead of importing mock data:
- `src/hooks/useProducts.ts` -- fetches products with React Query, exposes `products`, `getProductById`, `getProductsByCategory`, `searchProducts`
- `src/hooks/useOrders.ts` -- fetches the authenticated user's orders from the `orders` + `order_items` tables

#### 4. Update consumer pages to use database hooks

Replace all `mockProducts` / `mockData` imports across:
- `HomePage.tsx` -- use `useProducts` hook
- `CategoryPage.tsx` -- use `useProducts` with category filter  
- `SearchResultsPage.tsx` -- use `useProducts` with search query
- `ProductDetailPage.tsx` -- use `useProducts.getProductById`
- `CartPage.tsx` -- suggested products from `useProducts`
- `OrderConfirmationPage.tsx` -- suggested products from `useProducts`
- `ListsPage.tsx` -- product lookup from `useProducts`
- `OrdersPage.tsx` -- use `useOrders` hook for real order data

#### 5. Update SellerContext to fetch from database

Replace mock data initialization in `SellerContext.tsx`:
- Fetch seller's products from `products` table filtered by `seller_id`
- Fetch seller's orders from `orders`/`order_items` joined where `order_items.seller_id` matches
- Map database rows to the existing `SellerProduct` and `SellerOrder` TypeScript interfaces

#### 6. Keep categories client-side

Categories are a static taxonomy and will remain as a client-side constant (no database table needed at this stage).

### Technical Details

**Product query shape** -- The `products` table will be queried with the new columns and joined with `sellers` to get `sellerName`. The result will be mapped to the existing `ProductWithOffer` interface so all existing components (ProductCard, PriceDisplay, etc.) continue working without changes.

**RLS for orders/payments** -- These tables use service-role writes (edge functions) but need user-facing SELECT policies so buyers can view their own orders. The policies will use `auth.uid() = user_id` for orders and subquery joins for order_items/payments.

**Seller product RLS** -- Uses the existing `is_seller()` security definer function to verify seller status, combined with `seller_id` ownership checks.

**Data seeding approach** -- A migration will insert a marketplace seller and the 12 seed products. This keeps the storefront functional immediately after migration.

