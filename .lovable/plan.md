

## Plan: Add Handmade & Artisan Badges

### Overview
Add two new badge types to the product card system:
- **Handmade** badge: shown on products flagged as handmade
- **Artisan** badge: shown on products from sellers/brands flagged as artisan

### 1. Database Migration
Add two new columns to the `products` table:
- `is_handmade boolean DEFAULT false`
- `is_artisan_brand boolean DEFAULT false`

### 2. TypeScript Types
Update `src/types/product.ts` — add `isHandmade?: boolean` and `isArtisanBrand?: boolean` to the `Product` interface.

### 3. i18n Strings
Add to both `src/i18n/en.ts` and `src/i18n/ckb.ts`:
- `"product.handmade": "Handmade"` / Kurdish equivalent
- `"product.artisan": "Artisan"` / Kurdish equivalent

### 4. ProductCard Component
Add two new badge overlays in `src/components/ProductCard.tsx`, positioned below the existing Best Seller / Limited Deal badges (stacked vertically). Style:
- **Handmade**: warm earthy tone (amber/brown) with a small hand/craft icon
- **Artisan**: rich purple/indigo tone with a palette/award icon

Both badges appear on the product image overlay, similar to the existing `isBestSeller` badge pattern.

### 5. Data Mapping
Update `src/hooks/useProducts.ts` (or wherever DB rows are mapped to `Product` objects) to include the new `is_handmade` and `is_artisan_brand` columns.

### Files to modify
- `products` table (migration)
- `src/types/product.ts`
- `src/i18n/en.ts`, `src/i18n/ckb.ts`
- `src/components/ProductCard.tsx`
- `src/hooks/useProducts.ts`
- `src/data/mockData.ts` (if products are sourced from mock data)

