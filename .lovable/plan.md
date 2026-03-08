

## Plan: Regenerate All Hero Slide Images Without People

**Problem**: Current hero slides feature people. The user wants no people in the generated images — only products, craftsmanship, and artisan goods.

**Action**: Regenerate all 4 hero slide images using `google/gemini-3-pro-image-preview` with prompts focused on Kurdish artisan **products and goods only** — no people. Each image will be 1920x800.

### Image prompts (no people, product-focused):

1. **Slide 1** (`public/hero/slide-1.jpg` + `src/assets/hero/slide-1.jpg`): A beautifully arranged display of handcrafted Kurdish ceramics, copper trays, and colorful kilim textiles on a wooden table in a warm marketplace setting. No people.

2. **Slide 2** (`src/assets/hero/slide-2.jpg`): A flat-lay arrangement of Kurdish handmade jewelry, embroidered fabrics, and artisan soaps on a rustic surface. E-commerce product photography style. No people.

3. **Slide 3** (`src/assets/hero/slide-3.webp`): An artisan workshop table with hand-painted pottery, weaving tools, and colorful thread spools. Warm natural lighting. No people.

4. **Slide 4** (`src/assets/hero/slide-4.jpg`): A curated collection of Kurdish crafts — brass lanterns, woven baskets, and embroidered cushions — styled in a modern e-commerce storefront setting. No people.

### Files affected
- `public/hero/slide-1.jpg` + `src/assets/hero/slide-1.jpg`
- `src/assets/hero/slide-2.jpg`
- `src/assets/hero/slide-3.webp`
- `src/assets/hero/slide-4.jpg`

No code changes needed.

