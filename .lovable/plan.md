

## Plan: Add Mobile Bottom Tab Bar

### What
A fixed bottom navigation bar visible only on mobile (`md:hidden`) with four tabs: Home, Categories, Cart (with badge), and Account.

### Changes

**New file: `src/components/MobileBottomNav.tsx`**
- Fixed bottom bar with `z-50`, white background, top border, safe-area padding (`pb-safe`)
- Four equal-width tabs using `useLocation` to highlight the active route
- Icons: `Home`, `Grid2x2` (categories), `ShoppingCart`, `User` from lucide-react
- Cart tab shows item count badge via `useCart().itemCount`
- Account tab links to `/account` (or `/auth/sign-in` if not authenticated via `useAuth`)
- Categories tab opens the category sheet or links to a category page
- Labels under each icon in `text-[10px]`
- Active tab gets primary color, inactive gets muted

**Edit: `src/components/Layout.tsx`**
- Import and render `<MobileBottomNav />` after `<CookieConsentBanner />`
- Add `pb-16 md:pb-0` to main content area to prevent content from being hidden behind the tab bar

### Files
- **Create**: `src/components/MobileBottomNav.tsx`
- **Edit**: `src/components/Layout.tsx`

