

## Plan: Refine Mobile Navigation & Product Cards

### Changes

**1. `src/index.css` — Mobile-optimized `.nav-item` and `.product-card`**
- Update `.nav-item` padding from `px-2 py-1` to `px-3 py-2` for 44px touch targets
- Update `.product-card` to use `p-2 sm:p-3` for tighter mobile density
- Add a `.nav-scroll-fade` utility class for the right-edge fade gradient on the category bar

**2. `src/components/Header.tsx` — Navigation improvements**
- Increase right actions icon gap from `gap-1` to `gap-2` (line 116)
- Increase sub-nav height from `h-10` to `h-11` (line 272) to accommodate larger touch targets
- Wrap the sub-nav container in a `relative` div and add a right-edge fade `::after` pseudo-element (via the new CSS class) to hint at horizontal scrollability
- Add a mobile-visible Sign In button in the secondary row (3-col grid when unauthenticated) so users can access auth without the desktop-only dropdown
- Change secondary row from `grid-cols-2` to `grid-cols-3` when no user, adding a Sign In pill

**3. `src/components/ProductCard.tsx` — Tighter mobile layout**
- Reduce card content top padding: `pt-2 sm:pt-3` (line 81)
- Reduce spacing between rating/price: `mt-1 sm:mt-1.5` / `mt-1.5 sm:mt-2`
- Increase Add to Cart button height on mobile: `h-10 sm:h-9` for better touch target
- Reduce button top spacing: `pt-2 sm:pt-3`

### Files
- **Edit**: `src/index.css`, `src/components/Header.tsx`, `src/components/ProductCard.tsx`

