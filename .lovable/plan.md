

## Plan: Refine Product Cards for Mobile

### Problems
- Price display with discount badge + "Limited time deal" text + original price overflows on narrow mobile cards
- Star rating row with count can overflow horizontally
- Delivery badge text can wrap awkwardly
- Card inner padding is tight at `p-2` on mobile

### Changes

**`src/components/ProductCard.tsx`**
1. Title: reduce to `text-xs sm:text-sm` for mobile to prevent overflow
2. Star rating: hide the text count on mobile — pass `showCount` only on `sm+` (use a responsive approach: render two StarRating instances with `hidden`/`block` classes, or simply drop the count on small cards)
3. Delivery badge: truncate with `truncate` class so it never wraps outside the card
4. Add `overflow-hidden` to the card's text content container
5. Button height: reduce to `h-9 sm:h-10` and text to `text-xs sm:text-sm`

**`src/components/PriceDisplay.tsx`**
1. On `md` size: reduce mobile price text from `text-lg` to `text-base sm:text-lg`
2. Hide "Limited time deal" label on small screens: add `hidden sm:inline` to the label span
3. Original price (strikethrough): reduce to `text-xs sm:text-sm` and use `whitespace-nowrap` to prevent wrapping
4. Wrap the price row with `flex-wrap` so if it still overflows, it wraps gracefully instead of breaking out

### Files
- **Edit**: `src/components/ProductCard.tsx`
- **Edit**: `src/components/PriceDisplay.tsx`

