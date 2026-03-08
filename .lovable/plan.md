

## Plan: Dedicated Handmade Collection Page

### Overview
Create a new `/handmade` route with a curated collection page showcasing all products where `is_handmade = true`. The page will feature a hero section with earthy/artisan branding, followed by a product grid.

### Files to create
1. **`src/pages/HandmadePage.tsx`** — New page component:
   - Full-width hero section with warm earthy gradient background, a `Hand` icon, title ("Handmade Collection"), and descriptive tagline about artisan craftsmanship from Kurdistan
   - Optional filter toggle for "Artisan brands only"
   - Product grid using the existing `ProductCard` component
   - Uses `useProducts()` hook, filtering client-side for `isHandmade === true`
   - Loading skeleton via `ProductGridSkeleton`
   - Empty state when no handmade products exist

### Files to modify
2. **`src/App.tsx`** — Add lazy import and route: `<Route path="/handmade" element={<HandmadePage />} />`

3. **`src/i18n/en.ts`** and **`src/i18n/ckb.ts`** — Add i18n keys:
   - `handmade.title`, `handmade.tagline`, `handmade.description`, `handmade.empty`

4. **`src/components/Footer.tsx`** (or Header navigation) — Add a link to `/handmade` so users can discover the page

### Design approach
- Hero: warm amber/brown gradient (consistent with the Handmade badge color scheme), large centered heading, subtitle about Kurdish artisan heritage
- Follows the same Layout wrapper pattern used by BrandPage and CategoryPage
- Responsive grid: 2 cols on mobile, 3 on md, 4 on lg

