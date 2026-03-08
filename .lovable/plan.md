

## Fix: Search Button Accessible Name + Heading Order

Two accessibility audit failures to resolve with minimal changes.

### 1. Search button missing accessible name
**File:** `src/components/Header.tsx` (line 102-107)

The search `<Button>` contains only an icon (`<Search />`) with no text or `aria-label`. Add `aria-label="Search"` to the button.

### 2. Heading order: h3 without preceding h2
**File:** `src/pages/HomePage.tsx` (line 110-112)

The first category grid section jumps from `h1` (hero) straight to `h3` inside category cards. The fix: add a visually-hidden `h2` heading before the category grid (e.g., "Shop by Category") using `sr-only` class. This preserves the visual layout while giving screen readers proper heading hierarchy.

The second category grid (line ~170) already follows an `h2`, so no change needed there.

### Changes Summary
| File | Change |
|------|--------|
| `src/components/Header.tsx` | Add `aria-label="Search"` to submit button |
| `src/pages/HomePage.tsx` | Add `<h2 className="sr-only">` before first CategoryGrid |

