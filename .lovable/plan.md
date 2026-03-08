

## Plan: Fix Bottom Nav Routing

### Problems
1. **Categories tab** → links to `/category` which has no matching route (only `/category/:slug` exists) → 404
2. **Account tab** (unauthenticated) → links to `/auth/sign-in` but the route is `/auth/signin` → 404

### Changes — `src/components/MobileBottomNav.tsx`

1. Change Categories path from `/category` to a valid destination. Two options:
   - Link to a dedicated categories listing page (doesn't exist yet)
   - Link to `/` and scroll to categories section

   **Recommended**: Add a new `/category` route in `App.tsx` that renders a simple categories index page, OR reuse an existing page. Since `CategoryPage` already exists and handles `/category/:slug`, the simplest fix is to add a bare `/category` route in `App.tsx` pointing to a categories index. For now, we can create a lightweight `CategoriesIndexPage` or just route `/category` to `CategoryPage` with no slug (if it handles that gracefully). Let me check `CategoryPage` to decide.

   **Simplest approach**: Add a route `<Route path="/category" element={<CategoryPage />} />` in App.tsx — the CategoryPage can handle no slug by showing all categories.

2. Change Account auth redirect from `/auth/sign-in` to `/auth/signin`

### Files
- **Edit**: `src/components/MobileBottomNav.tsx` — fix auth redirect path
- **Edit**: `src/App.tsx` — add `/category` route (if CategoryPage doesn't already handle missing slug gracefully)

Let me verify CategoryPage handles no slug before finalizing.

Actually, looking at the routes: `/category/:slug` requires a slug param. We should add a bare `/category` route. The simplest is to point it to `CategoryPage` and let it handle the missing slug by showing a categories overview.

### Final changes

**`src/components/MobileBottomNav.tsx`** (line 11):
- Change `"/auth/sign-in"` → `"/auth/signin"`

**`src/App.tsx`** (after line 101):
- Add `<Route path="/category" element={<CategoryPage />} />`

