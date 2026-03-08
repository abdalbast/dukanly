

## Plan: Show "Shop by Category" Grid on `/category`

When visiting `/category` without a slug, the page currently shows a generic product listing with no category context. It should instead show a **"Shop by Category"** grid displaying all 8 category cards — similar to the homepage section but showing all categories.

### Changes — `src/pages/CategoryPage.tsx`

When `slug` is undefined, render a categories index view instead of the product listing:

1. **Early return for no-slug case**: Before the current return, check `if (!slug)` and render a dedicated layout:
   - Breadcrumb: Home → Categories
   - Hero banner with gradient background and title "Shop by Category"
   - Grid of all 8 category cards (reuse the same card style from HomePage: image with gradient overlay, category name, "Shop Now" link)
   - Grid: `grid-cols-2 md:grid-cols-4 gap-5`

2. The existing slug-based category page remains unchanged.

### Files
- **Edit**: `src/pages/CategoryPage.tsx` — add categories index view when no slug

