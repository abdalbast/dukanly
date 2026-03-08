

## Plan: Add Artisan Community Section to Sell Page

### Overview
Inspired by Amazon Handmade's programme, add a new **"Dukanly Handmade" artisan community section** to the existing `/sell` page. This section highlights the unique value proposition for artisans and handmade creators, drawing from Amazon Handmade's key themes: artisan verification, customized products, global reach, dedicated artisan storefront, and community.

### New Sections to Add (in `SellOnDukanlyPage.tsx`)

Insert **two new sections** between the "Why Sell" and "How It Works" sections:

**1. Artisan Community Showcase** (warm amber gradient background)
- Left side: heading "Dukanly Handmade", tagline about the artisan community, and a CTA linking to `/handmade`
- Right side: 3 feature cards in a column:
  - **Artisan Verification** (Shield icon) — Each seller is verified to ensure authenticity of handcrafted goods
  - **Customised Products** (Palette icon) — Offer personalised, made-to-order items for customers
  - **Sell Across Kurdistan** (Globe icon) — Reach buyers in Erbil, Sulaymaniyah, Duhok and beyond

**2. Artisan Benefits Grid** (default background)
- 4-column icon grid highlighting:
  - **No Mass Production** — Only genuinely handmade, hand-modified or hand-assembled items
  - **Your Artisan Profile** — Dedicated storefront to share your craft story and brand
  - **Handmade Badge** — Products get a distinctive Handmade badge for buyer trust
  - **Community Support** — Join a community of Kurdish artisans and crafters

### Files to Modify

1. **`src/pages/SellOnDukanlyPage.tsx`**
   - Add imports: `Hand, Palette, Globe, Shield, Fingerprint, BadgeCheck, HeartHandshake`
   - Insert the two new sections after the "Why Sell" section (~line 120)
   - Use existing design patterns (`premium-card`, section spacing `py-14 md:py-20`)

2. **`src/i18n/en.ts`** — Add ~16 new keys:
   - `sell.handmade.sectionTag`, `sell.handmade.title`, `sell.handmade.subtitle`
   - `sell.handmade.artisanVerification`, `sell.handmade.artisanVerificationDesc`
   - `sell.handmade.customProducts`, `sell.handmade.customProductsDesc`
   - `sell.handmade.sellAcross`, `sell.handmade.sellAcrossDesc`
   - `sell.handmade.noMassProduction`, `sell.handmade.noMassProductionDesc`
   - `sell.handmade.artisanProfile`, `sell.handmade.artisanProfileDesc`
   - `sell.handmade.badge`, `sell.handmade.badgeDesc`
   - `sell.handmade.community`, `sell.handmade.communityDesc`
   - `sell.handmade.cta`

3. **`src/i18n/ckb.ts`** — Kurdish translations for all new keys

### Design
- Artisan section uses warm amber/brown gradient (`from-amber-800 via-amber-700 to-yellow-600`) consistent with the Handmade collection page and badge styling
- Feature cards use frosted-glass white/10 overlays on the gradient background
- Benefits grid uses standard `premium-card` styling on default background
- Follows the editorial spacing conventions (py-14 md:py-20)

