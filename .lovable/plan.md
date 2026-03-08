

# Add Category Page Header Banner

## Approach
Replace the plain text heading with a full-width hero banner that uses the category's image as a background, with a dark gradient overlay and white text on top.

## Changes

**`src/pages/CategoryPage.tsx`**:
- Import `LazyImage` component
- After the breadcrumb section, add a hero banner div:
  - Full-width container with `relative h-48 md:h-64 overflow-hidden`
  - `LazyImage` as background using `object-cover w-full h-full absolute inset-0`
  - Dark gradient overlay (`bg-gradient-to-t from-black/70 to-black/30`)
  - Category name and product count positioned at bottom-left over the overlay
- Remove the existing plain `<h1>` and `<p>` heading block (lines 50-53) since it moves into the banner
- When no category image exists, fall back to a solid dark background

