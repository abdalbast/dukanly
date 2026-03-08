

## Plan: Amazon-Style Hero Carousel

Replace the current single-image hero with a full-width auto-advancing image carousel matching Amazon.co.uk's pattern:

- **Full-bleed banner images** that cycle automatically (every 5-6 seconds)
- **Large left/right chevron arrows** on each side (tall, semi-transparent, like Amazon's)
- **Dot indicators** at the bottom center
- **Multiple promotional slides** with different text overlays and CTAs
- Uses the existing `embla-carousel-react` package (already installed)

### Structure

Each slide has: background image, gradient overlay, headline, subtitle, and CTA button. The carousel auto-plays and pauses on hover. Arrows are tall vertical strips on left/right edges (Amazon-style, not small circular buttons).

### Slides Content

Will create 3-4 slides using the existing hero banner image plus category images as backgrounds, each promoting different sections (deals, new arrivals, sell on Dukanly, Pelin brand).

### Files to Edit

1. **`src/pages/HomePage.tsx`** — Replace the static hero `<section>` with an Embla carousel containing multiple slides, auto-play logic, and Amazon-style tall edge arrows with chevrons
2. **`src/i18n/en.ts`** and **`src/i18n/ckb.ts`** — Add translation keys for each slide's headline/subtitle/CTA

### Technical Details

- Embla carousel with `loop: true` and a `useEffect` interval for auto-advance
- Tall arrow buttons (~full height, 48px wide, semi-transparent black bg) on left/right edges
- Bottom-center dot indicators showing active slide
- Pause auto-play on hover, resume on mouse leave
- Each slide keeps the same gradient overlay + text layout pattern but with different content

