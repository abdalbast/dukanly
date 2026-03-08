

# Full-Stack Production Audit & Upgrade Plan

## Findings

### 1. Dead Code
- **`NavLink.tsx`** — imported nowhere in the app, entirely unused
- **`src/components/ui/use-toast.ts`** — re-exports from `@/hooks/use-toast`, a redundant shim file
- **`isAppleLoading` state in `SignInPage.tsx`** — Apple sign-in likely non-functional without proper Apple OAuth config; dead weight
- **`convertToIQD()`** in `currency.ts` — marked `@deprecated`, just `Math.round()`, yet called ~15 times across the app
- **Duplicate Google Font import** in `index.css` (lines 1-2) — same `Inter` font imported twice

### 2. Weak UX
- **No loading skeletons on HomePage** — when `isLoading` is true, product sections simply don't render; user sees empty space with no feedback
- **"Loading..." plaintext** on ProductDetailPage (line 31) and OrdersPage (line 86) — no skeleton, no spinner, feels broken
- **Route fallback** (`RouteFallback` in `App.tsx`) shows plain "Loading..." text — needs a branded skeleton/spinner
- **CategoryPage shows no loading state** at all — blank grid while data loads
- **SearchResultsPage** has no loading indicator
- **Empty state on CartPage** uses emoji `🛒` — not premium
- **Empty states across** OrderConfirmation, Checkout use raw emoji (📦, ⏳, ⚠️) — should use proper icons

### 3. Inconsistent Spacing
- HomePage sections alternate between `py-6`, `py-8`, and `pb-12` inconsistently
- Category grid sections lack section headers
- CartPage cart item actions use `text-border` as separator color which doesn't map to a visible token

### 4. Poor Mobile Behaviour
- **Mega menu** (Header.tsx line 280-325) uses `grid-cols-5` with no mobile adaptation; `onMouseLeave` doesn't work on touch
- **ProductDetailPage buy box** (lg:col-span-3) stacks below the fold on mobile with no sticky CTA — user must scroll past entire description to buy
- **CheckoutPage order summary** sidebar is below the fold on mobile — no sticky mobile CTA bar
- **CartPage** quantity stepper buttons have tiny touch targets (`p-1.5`)

### 5. Bad Component Patterns
- **Cart items in CartPage** use raw `<img>` tags (lines 83, 139) instead of `LazyImage` — inconsistent with the rest of the app
- **HeaderPreviewPanels** also uses raw `<img>` tags (lines 177, 275)
- **OrdersPage** uses raw `<img>` (line 117)
- **Footer** shows `marketplace` as the brand name (line 75-76) instead of `Dukanly` — branding mismatch
- **PriceDisplay** has hardcoded English strings: "% off" and "Limited time deal" (lines 36-39) — not localized
- **SearchResultsPage** has hardcoded English strings: "Today's Deals", "Best Sellers", "Trending Now", "Brand:", "Seller:" (lines 59-71)
- **AccountPage** has hardcoded English `"item"/"items"` (line 109)

### 6. Missing Error States
- **useProducts / useProductById** — no error handling in the consuming pages; if the query fails, the page just shows empty content forever
- **CategoryPage** — no empty state when category has zero products
- **SearchResultsPage** — no error boundary for failed search queries
- **LazyImage** — no error/broken image fallback (if image URL 404s, shows blank space forever)

### 7. Database / State Management Issues
- **Cart stored in localStorage only** — not synced to the DB `carts`/`cart_items` tables. If user logs in on another device, cart is lost
- **`useProducts` fetches ALL active products** with no pagination — will break at scale (1000 row limit)

### 8. Security Observations
- **`resolveRedirectTarget` in SignInPage** validates `startsWith("/")` which is good, but doesn't block `//evil.com` (protocol-relative URLs)
- **`SellerLayout` route** is not wrapped in `RequireAuth` — anyone can navigate to `/seller` without authentication

### 9. Generic / Non-Premium UI
- Plain text loading states feel like a prototype
- Emoji-based empty states (🛒, 📦) feel unfinished
- Footer brand name mismatch ("marketplace" vs "Dukanly")

---

## Implementation Plan

### Task 1: Remove dead code & fix branding
- Delete `src/components/NavLink.tsx`
- Delete `src/components/ui/use-toast.ts` (verify no imports first)
- Remove duplicate Inter font import in `index.css`
- Fix Footer brand from "marketplace" to "Dukanly"

### Task 2: Add loading skeletons
- Create a reusable `ProductCardSkeleton` component (card with pulsing placeholder for image, title, rating, price)
- Add `ProductGridSkeleton` (grid of N skeleton cards)
- Replace all "Loading..." plaintext with skeleton grids:
  - `HomePage` — show skeleton grids in each section while `isLoading`
  - `ProductDetailPage` — show skeleton layout (image + info + buy box)
  - `OrdersPage` — show skeleton order cards
  - `CategoryPage` — show skeleton grid
  - `SearchResultsPage` — show skeleton grid
  - `RouteFallback` in `App.tsx` — show centered spinner or logo pulse

### Task 3: Replace emoji empty states with proper icons
- Replace 🛒 in CartPage/CheckoutPage with `ShoppingCart` icon in a styled circle
- Replace 📦 in OrderConfirmation with `Package` icon
- Replace ⏳/⚠️ in OrderConfirmation with `Loader2`/`AlertTriangle` icons
- Style consistently: icon in a 80px circle with subtle background tint

### Task 4: Fix broken image fallback in LazyImage
- Add `onError` handler that shows a placeholder image (`/placeholder.svg`)
- Prevent infinite pulse on broken images

### Task 5: Replace remaining raw `<img>` with LazyImage
- CartPage (2 instances)
- HeaderPreviewPanels (2 instances)
- OrdersPage (1 instance)
- CheckoutPage order summary (1 instance)

### Task 6: Localize hardcoded strings
- PriceDisplay: `"% off"` → `t("product.percentOff")`, `"Limited time deal"` → `t("product.limitedTimeDeal")`
- SearchResultsPage: `pageTitle` strings → use `t()` keys
- AccountPage: `"item"/"items"` → `t("common.item")/t("common.items")`

### Task 7: Mobile UX improvements
- Add sticky bottom CTA bar on ProductDetailPage for mobile (`lg:hidden` fixed bottom bar with price + "Add to Cart")
- Add sticky bottom CTA bar on CheckoutPage for mobile (total + "Place Order")
- Increase touch targets on CartPage quantity buttons (`p-2.5` minimum)
- Close mega menu on mobile tap outside (add overlay backdrop)

### Task 8: Fix security issues
- Wrap `/seller` route in `RequireAuth`
- Fix `resolveRedirectTarget` to block `//` protocol-relative URLs
- Delete unused `isAppleLoading`/Apple sign-in if Apple OAuth isn't configured

### Task 9: Consistent spacing & polish
- Standardize HomePage section spacing to `py-8` throughout
- Add section headers ("Shop by Category") above category grids
- Remove `text-border` separator hack in CartPage, use proper `border-r border-border` dividers

### Task 10: Add error states
- Add error fallback UI to product pages (retry button)
- Add empty state to CategoryPage when zero products match
- Add `LazyImage` broken image fallback

---

## Scope & Approach

This is a large audit. Implementation will proceed task-by-task, prioritizing the most impactful user-facing issues first (loading states, mobile UX, branding) then code quality (dead code, consistency, security).

No database migrations are needed. All changes are frontend-only.

