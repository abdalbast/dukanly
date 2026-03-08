

# Add Hover Zoom Effect on Product Detail Page Main Image

## Approach
Add a CSS-based hover zoom effect to the main product image on the detail page. When the user hovers over the image, it smoothly scales up (e.g., 1.5x) within its container using `overflow-hidden` to clip the zoomed area.

## Changes

**`src/pages/ProductDetailPage.tsx`** (line ~90):
- Add `group` class to the image wrapper div
- Add `group-hover:scale-150 transition-transform duration-500 ease-out cursor-zoom-in` to the `LazyImage` className
- The existing `overflow-hidden` on `LazyImage`'s wrapper div will clip the zoomed image naturally

This is a single-line edit — just updating the classes on the existing `LazyImage` component.

