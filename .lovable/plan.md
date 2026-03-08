

## Refine Brand Pages & Add Homepage Brand Showcase

### Overview
Create a dedicated `BrandPage` component for Pelin Products and Azhin Art with premium, Apple-inspired aesthetics. Replace the current generic `SearchResultsPage` for brand routes. Add a "Featured Brands" section on the homepage.

### 1. New file: `src/pages/BrandPage.tsx`

A dedicated brand page with:
- **Hero banner** — full-width with brand logo/image, frosted glass overlay, brand name, and tagline
- **Brand story section** — description paragraph + standout features displayed as centered icon cards (similar to homepage value props)
- **Product grid** — all brand products with sort/filter controls

Brand data will be hardcoded in a `BRAND_DATA` map keyed by slug:

**Pelin Products:**
- Description: Handcrafted natural skincare and soap products from Kurdistan, made with locally sourced botanicals
- Features: 100% Natural Ingredients, Handcrafted with Care, Locally Sourced, Eco-Friendly Packaging
- Hero image: use one of the existing Pelin assets (`src/assets/pelin/0T7A0070.webp`)

**Azhin Art:**
- Description: Contemporary Kurdish art and handmade crafts celebrating cultural heritage through modern design
- Features: Handmade Originals, Cultural Heritage, Premium Materials, Limited Editions
- Hero image: generate a new asset

### 2. New file: `src/assets/brands/azhin-art-hero.jpg`
Generate a premium hero image for Azhin Art brand (artisan crafts/art aesthetic).

### 3. Edit: `src/App.tsx`
- Add lazy import for `BrandPage`
- Replace the `/brand/:brand` route to use `BrandPage` instead of `SearchResultsPage`

### 4. Edit: `src/pages/HomePage.tsx`
Replace the existing "Featured Brand" (Pelin-only) section with a **"Featured Brands"** section showcasing both brands:
- Two side-by-side cards (responsive: stacked on mobile)
- Each card: brand hero image background, brand name, short tagline, "Explore Brand" CTA link
- Premium styling: rounded-2xl, hover-lift, gradient overlay on images

### Files
1. **`src/pages/BrandPage.tsx`** — new dedicated brand page
2. **`src/assets/brands/azhin-art-hero.jpg`** — generated hero image
3. **`src/App.tsx`** — swap route to new BrandPage
4. **`src/pages/HomePage.tsx`** — replace Featured Brand section with dual-brand showcase

