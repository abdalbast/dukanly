

## Plan: Streamline Mobile Header

### What
Simplify the mobile header to show only the search bar and language selector on the main bar, move "Deliver to" into the sub-navigation where "All" currently sits, and remove redundant mobile buttons.

### Changes — `src/components/Header.tsx`

1. **Hide Logo on mobile**: Add `hidden md:flex` to the logo `<Link>` (line 64)
2. **Hide Account dropdown on mobile**: Already `hidden sm:flex` — no change needed
3. **Hide Orders button on mobile**: Already `hidden md:flex` — no change needed
4. **Hide Messages button on mobile**: Add `hidden md:flex` to the messages button wrapper (line 211-225)
5. **Hide Cart button on mobile**: Add `hidden md:flex` to the cart button (line 228-241)
6. **Remove the entire secondary mobile bar** (lines 246-280): The deliver-to, orders, and sign-in row — delete the whole `md:hidden` block
7. **Sub-navigation "All" button** (lines 285-297): On mobile, replace with a "Deliver to" button; on desktop keep "All" as-is. Render two elements:
   - Desktop: existing `<Menu> All` button with `hidden md:flex`
   - Mobile: a `<button>` showing MapPin + truncated delivery label with `md:hidden`, clicking opens `openAddressManager`

### Files
- **Edit**: `src/components/Header.tsx`

