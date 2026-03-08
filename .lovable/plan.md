

## Plan: Fix "All" Button on Mobile

### Problem
The "All" button in the sub-navigation bar toggles a mega menu that has `hidden md:block` — meaning it's invisible on mobile. Tapping the button does nothing visible.

### Solution
On mobile, instead of trying to show the desktop mega menu, open a **slide-out sheet/drawer** listing all categories. On desktop, keep the existing hover mega menu behavior.

### Changes

**`src/components/Header.tsx`**
- Import `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- Add a `isMobileCategoryOpen` state
- On mobile (`md:hidden`), the "All" button opens a Sheet (slide-from-left drawer) listing all categories as links
- On desktop (`hidden md:flex`), keep existing mega menu toggle behavior
- The Sheet will list all categories with icons/names, linking to `/category/{slug}`, plus links to Deals and Seller Central

**Files to edit**: `src/components/Header.tsx`

