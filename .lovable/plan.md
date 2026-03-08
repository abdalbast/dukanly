

# Add Category Images & Lazy Loading with Blur Placeholders

## 1. Category Images

The homepage displays 8 category cards (lines 82-92 and 151-163 in `HomePage.tsx`) currently showing a `📦` emoji placeholder. Categories have an optional `icon` field but no `image` field.

### Changes:
- **`src/types/product.ts`**: Add `image?: string` to `Category` interface
- **`src/data/mockData.ts`**: Add Unsplash image URLs to each of the 8 categories:
  - Electronics → circuit board / gadgets photo
  - Fashion → clothing / fashion photo
  - Home & Kitchen → kitchen / interior photo
  - Sports & Outdoors → sports equipment photo
  - Beauty & Personal Care → skincare / beauty photo
  - Toys & Games → toys / LEGO photo
  - Books → bookshelf photo
  - Grocery → fresh produce photo
- **`src/pages/HomePage.tsx`**: Replace the `📦` emoji `<div>` blocks with `<img>` tags using `cat.image`

## 2. Lazy Loading + Blur Placeholder

Create a reusable `<LazyImage>` component that wraps all product and category images with:
- Native `loading="lazy"` attribute for deferred loading
- A blurred low-quality placeholder (CSS `bg-muted animate-pulse`) shown until the image loads
- Smooth fade-in transition on load via opacity transition

### Changes:
- **New `src/components/LazyImage.tsx`**: Reusable component using `useState` + `onLoad` to toggle from skeleton placeholder to loaded image with a CSS fade-in
- **`src/components/ProductCard.tsx`**: Replace both `<img>` tags (default + horizontal variants) with `<LazyImage>`
- **`src/pages/HomePage.tsx`**: Use `<LazyImage>` for category card images
- **`src/pages/ProductDetailPage.tsx`**: Use `<LazyImage>` for the main product image and thumbnails

### LazyImage API:
```tsx
<LazyImage
  src={url}
  alt={text}
  className="w-full aspect-square object-contain"
/>
```

Internally renders a wrapper `<div>` with `bg-muted animate-pulse` that stops pulsing once loaded, and an `<img loading="lazy">` that fades in from `opacity-0` to `opacity-100` via a CSS transition.

