

## Refine Homepage — Apple-Inspired Premium Polish

### Problems to Fix
1. **Carousel image overlap** — `scale-105` on images causes visible bleed at edges during transitions
2. **Typography hierarchy** is flat — section headers all look the same weight/size
3. **Spacing** is uniform and lacks the generous whitespace Apple uses
4. **CTA layout** feels generic — needs more breathing room and visual hierarchy
5. **Carousel images** are low-res category photos repurposed as hero banners

### Changes

#### 1. `src/pages/HomePage.tsx` — Major refinements

**Carousel fix:** Remove `scale-105` from carousel images (causes the overlap bug). Add `will-change-transform` for smoother transitions.

**Hero upgrade:**
- Increase height: `h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]`
- Larger, bolder title: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` with tighter leading
- Add a subtle tagline pill/chip above the title (frosted glass style)
- CTA pair: primary CTA + secondary ghost CTA side by side
- Swap to high-res Unsplash images via URL for carousel backgrounds

**Section spacing:**
- Increase section padding: `py-20 md:py-28` (Apple-level whitespace)
- Larger section headers: bump to `text-3xl md:text-4xl`
- Add more space between header text and grid content

**Value propositions:** Redesign as centered cards with larger icons instead of horizontal left-aligned rows

**Category cards:** Increase aspect ratio to `aspect-[3/4]` for more visual impact, larger text overlay

**Bottom CTA band:** Make it taller, add gradient background, bigger typography

#### 2. `src/index.css` — Typography & component refinements

- Update `.section-header` to `text-3xl font-extrabold`
- Update `.section-subheader` to `text-lg` with more bottom margin
- Add a `.tagline-pill` class for the frosted glass chip
- Refine `.btn-cta` with slightly larger padding and shadow

#### 3. High-res carousel images

Replace the local category images with high-quality Unsplash URLs for hero slides:
- Slide 1: Premium lifestyle/marketplace shot
- Slide 2: Fashion editorial
- Slide 3: Tech/electronics
- Slide 4: Business/entrepreneurship

These are loaded via URL so no asset files needed. The existing local images remain as fallbacks for category cards.

### Files to Edit
1. **`src/pages/HomePage.tsx`** — Carousel overlap fix, hero sizing, typography, spacing, high-res images, CTA layout, value prop redesign
2. **`src/index.css`** — Section header sizing, new utility classes, CTA refinements

