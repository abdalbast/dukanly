

## Mobile Responsiveness Audit & Fixes

After reviewing all pages, the premium design system is well-applied overall. Here are the specific mobile issues to fix:

### Issues Found

**1. Hero Carousel (HomePage)** — The hero text (`text-4xl`) and carousel height (`h-[420px]`) are slightly aggressive on small phones (< 375px). The tagline tracking `[0.2em]` is wide for narrow screens. Arrow buttons (`opacity-0 group-hover`) are invisible on touch devices since there's no hover.

**2. Mega Menu (Header)** — Uses `grid-cols-5` with no mobile breakpoint. On mobile the mega menu would render as a cramped 5-column grid. Needs to be full-width single-column or a drawer on mobile.

**3. Value Propositions (HomePage)** — `grid-cols-2` at mobile is fine, but the icon + text layout with `gap-4` can feel cramped on very small screens.

**4. Category Cards (HomePage)** — `aspect-[4/5]` on `grid-cols-2` produces tall cards that push content far down on mobile. The overlay text padding `p-5 pt-12` is generous but fine.

**5. Cart Page** — Cart item actions row (`flex-wrap gap-3`) with multiple action links and separators can overflow awkwardly on narrow screens.

**6. Product Detail** — The breadcrumb with `truncate max-w-xs` works, but the buy box stacks below product info on mobile which is correct. The mobile sticky CTA at bottom is good.

**7. Checkout Page** — The step number badges and manage addresses button layout (`flex justify-between`) can wrap poorly on very narrow screens.

**8. Footer** — `grid-cols-2` on mobile works but the `gap-10` is very large, pushing footer height.

### Fixes to Apply

1. **`src/pages/HomePage.tsx`** — Reduce hero height to `h-[320px]` on mobile, reduce title to `text-3xl` on smallest breakpoint, make carousel arrows always visible on mobile (opacity-100), reduce tagline tracking on mobile
2. **`src/components/Header.tsx`** — Add mobile breakpoint for mega menu: single column with scroll on `md:` below, or hide mega menu on mobile and use the sub-nav categories instead
3. **`src/pages/HomePage.tsx`** — Reduce value prop gap to `gap-3` on mobile
4. **`src/pages/CartPage.tsx`** — Stack cart item action buttons vertically on very small screens, hide separators on mobile
5. **`src/components/Footer.tsx`** — Reduce mobile gap from `gap-10` to `gap-6` on mobile
6. **`src/pages/CheckoutPage.tsx`** — Stack the section header and button vertically on mobile
7. **`src/pages/auth/SignInPage.tsx`** — Reduce horizontal padding on very small screens

### Files to Edit (6 files)

- `src/pages/HomePage.tsx` — Hero carousel mobile sizing, value prop gap, arrow visibility
- `src/components/Header.tsx` — Mega menu mobile layout
- `src/components/Footer.tsx` — Mobile gap reduction
- `src/pages/CartPage.tsx` — Cart item actions mobile layout
- `src/pages/CheckoutPage.tsx` — Section header stacking on mobile
- `src/pages/auth/SignInPage.tsx` — Minor padding adjustment

