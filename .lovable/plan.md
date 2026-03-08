

## Plan: Regenerate Hero Slide 1 Image

**Problem**: Slide 1 currently shows luxury perfume bottles instead of Kurdish artisan creators and business owners.

**Action**: Generate a new image using `google/gemini-3-pro-image-preview` depicting Kurdish artisan creators — e.g., a craftsperson in a vibrant workshop or marketplace surrounded by handmade goods (pottery, textiles, copperwork). Save it to **both** locations:

1. `src/assets/hero/slide-1.jpg` — source asset
2. `public/hero/slide-1.jpg` — served for LCP preload

Both files must be updated to avoid the previous sync issue.

