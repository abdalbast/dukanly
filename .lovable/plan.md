

# Plan: Kurdistan-First Localisation, GPS Address, and Seller Landing Page

## Overview

Three major workstreams: (1) switch all currency display to IQD site-wide, (2) add GPS-based address detection to the address form, and (3) create a seller landing page adapted to Kurdistan before the seller auth/onboarding flow.

---

## 1. IQD-First Currency Display

Currently, prices are stored in USD in the database and converted to IQD only at checkout (`exchangeRateUsdToIqd = 1300`). The `PriceDisplay` component defaults to USD with a `$` symbol. Many seller pages hardcode `$` formatting.

**Changes:**

- **`PriceDisplay.tsx`**: Change default currency to `"IQD"`, update the symbol map to show `"IQD"` as the suffix (e.g., `1,300 IQD` instead of `$1.00`). Use `.toLocaleString()` for thousand separators. Remove fractional display for IQD (no decimals).
- **`ProductCard.tsx`**: Pass price converted to IQD (`price * 1300`) and `currency="IQD"` to `PriceDisplay`.
- **`CartPage.tsx`**: Display subtotals and item prices in IQD with proper formatting.
- **`CheckoutPage.tsx`**: Already partially uses IQD in the order summary -- extend to delivery option prices (convert `$4.99` etc. to IQD equivalents like `6,500 IQD`).
- **Seller pages** (`SellerOverview.tsx`, `SellerOrders.tsx`, `SellerProducts.tsx`, `SellerAnalytics.tsx`): Replace all `$${value.toFixed(2)}` patterns with IQD-formatted values.
- **`src/i18n/en.ts` and `ckb.ts`**: Update hardcoded strings referencing `$35` thresholds to IQD equivalents (e.g., `"On orders over 45,000 IQD"`).
- **`src/lib/currency.ts`** (new): Create a shared `formatIQD(amount: number)` utility that all components use, keeping the exchange rate constant in one place.

## 2. GPS Address Detection

Add a "Use My Location" button to the address form dialog in `CheckoutPage.tsx` and potentially `AccountPage.tsx`.

**Changes:**

- **`CheckoutPage.tsx`** (Add Address dialog): Add a `MapPin` + "Use My Location" button that calls the browser Geolocation API (`navigator.geolocation.getCurrentPosition`).
- On success, reverse-geocode the coordinates using a free service (Nominatim/OpenStreetMap reverse geocoding API, no API key needed) to populate city, state/governorate, and street fields.
- Pre-fill `country` as "Iraq" and show the detected coordinates for reference.
- Handle permission denied and error states gracefully with toast messages.
- Allow the user to edit the auto-filled fields before saving.
- **i18n**: Add translation keys for "Use My Location", "Detecting location...", "Location permission denied", etc. in both English and Kurdish.

## 3. Seller Landing Page (Pre-Auth)

Create a marketing/landing page at `/sell` (currently routes to `AboutPage`) inspired by Amazon's "Sell on Amazon" page, but adapted for Kurdistan.

**New file: `src/pages/SellOnDukanlyPage.tsx`**

Content sections adapted to Kurdistan infrastructure:

1. **Hero Section**: "Grow your business on Dukanly" -- hero with CTA "Start Selling" that routes to `/seller` (which handles auth/onboarding).
2. **Why Sell on Dukanly**: Three value props:
   - Reach millions of buyers across Kurdistan Region
   - Multiple payment options (FIB, COD, card) -- matching local expectations
   - Fast local delivery network in Erbil, Sulaymaniyah, Duhok
3. **How It Works**: 3-step process (Register -> List Products -> Start Earning)
4. **Pricing / Fee Structure**: Simple fee table (e.g., per-item selling fee, no monthly subscription for basic tier)
5. **Seller Success Stories**: Placeholder testimonial cards from Kurdish businesses
6. **FAQ Section**: Common questions about selling, payments, shipping in Kurdistan
7. **Final CTA**: "Ready to start selling?" with sign-up button

**Route update in `App.tsx`**: Change `/sell` from `AboutPage` to the new `SellOnDukanlyPage`.

**i18n**: Add all new translation keys for the seller landing page in both `en.ts` and `ckb.ts`.

---

## Technical Details

### Currency utility (`src/lib/currency.ts`)
```text
const EXCHANGE_RATE_USD_TO_IQD = 1300;

formatIQD(usdAmount) -> "45,500 IQD"
convertToIQD(usdAmount) -> number
```

### GPS reverse geocoding
Uses `https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json` -- free, no API key, respects usage policy with proper User-Agent header.

### Files to create
- `src/lib/currency.ts`
- `src/pages/SellOnDukanlyPage.tsx`

### Files to modify
- `src/components/PriceDisplay.tsx` -- IQD-first formatting
- `src/pages/CartPage.tsx` -- IQD prices
- `src/pages/CheckoutPage.tsx` -- IQD prices + GPS button
- `src/pages/seller/SellerOverview.tsx` -- IQD formatting
- `src/pages/seller/SellerOrders.tsx` -- IQD formatting
- `src/pages/seller/SellerProducts.tsx` -- IQD formatting
- `src/pages/seller/SellerAnalytics.tsx` -- IQD formatting
- `src/App.tsx` -- new route for `/sell`
- `src/i18n/en.ts` -- new keys + update USD references
- `src/i18n/ckb.ts` -- new keys + update USD references
- `src/pages/HomePage.tsx` -- update hero subtitle and value props to IQD

