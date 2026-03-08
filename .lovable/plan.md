

## Plan: Refine Hero Section for Mobile

### Changes to `src/pages/HomePage.tsx`

**1. Hero height** — Increase mobile from `h-[400px]` to `h-[440px]` for more breathing room

**2. Typography hierarchy**
- Title: `text-4xl` → `text-3xl` on mobile with `leading-[1.08]` for tighter, cleaner headline
- Subtitle: `text-base` → `text-sm` on mobile, constrain width with `max-w-xs sm:max-w-lg`
- Tagline pill: increase bottom margin `mb-5` → `mb-4 sm:mb-6`

**3. CTA layout**
- Stack CTAs vertically on mobile: `flex-col sm:flex-row`
- Primary CTA full-width on mobile: add `w-full sm:w-auto` and `justify-center`
- Secondary link: `w-full sm:w-auto text-center` on mobile
- Reduce bottom margin on subtitle: `mb-8` → `mb-6 sm:mb-10`

**4. Dot indicators** — Move dots slightly higher on mobile: `bottom-4 sm:bottom-6`

### Files
- **Edit**: `src/pages/HomePage.tsx` (lines 120-200)

