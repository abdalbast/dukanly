

## Plan: Improve Checkout Page Mobile Responsiveness

### Issues Found

1. **Inputs too small for touch** — Phone and delivery instructions inputs use `h-10` (40px), below the recommended 44px touch target. No `text-base` on mobile (causes iOS zoom on focus).
2. **Order summary sidebar** is below the fold on mobile with no sticky CTA — users must scroll past all sections to find the "Place Order" button.
3. **Radio card labels** have small `p-3` padding, making touch targets tight on mobile.
4. **Delivery coverage badge** can collide with the section title on narrow screens.
5. **CheckoutPaymentPage** bottom buttons stack poorly on very small screens.

### Changes

**1. `src/pages/CheckoutPage.tsx`**
- Add a **sticky bottom CTA bar on mobile** (visible below `lg:` breakpoint) showing order total + "Place Order" button, so users never lose access to it while scrolling
- Increase input heights to `h-12` on mobile (`h-12 md:h-10`) and add `text-base` to prevent iOS zoom
- Increase radio label padding: `p-4 md:p-3` for better touch targets
- Make delivery coverage badge wrap below title on small screens using `flex-wrap`
- Add `pb-20` to the main content area on mobile to account for the sticky CTA bar

**2. `src/pages/CheckoutPaymentPage.tsx`**
- Make bottom action buttons full-width stacked on mobile: `flex-col sm:flex-row`
- Increase button sizes on mobile

### Files
- **Edit**: `src/pages/CheckoutPage.tsx`
- **Edit**: `src/pages/CheckoutPaymentPage.tsx`

