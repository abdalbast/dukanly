

## Plan: Apply Premium Design System Across All Pages

The homepage has been upgraded with an Apple-inspired aesthetic featuring Plus Jakarta Sans headings, generous spacing (`py-14 md:py-20`), `rounded-2xl` cards, colored icon backgrounds, and refined typography hierarchy. The rest of the app still uses the older, denser styling. This plan brings consistency across all pages.

### Design Tokens to Apply Everywhere

- **Section headings**: Plus Jakarta Sans font-family, `font-extrabold`, `tracking-tight`
- **Page top padding**: `py-10 md:py-14` minimum (currently most pages use `py-6` or `py-8`)
- **Cards**: `rounded-xl` or `rounded-2xl`, subtle hover lift (`hover:shadow-lg hover:-translate-y-1`)
- **Icon containers**: Colored backgrounds (`bg-primary/10`, `bg-success/10`, etc.) with `rounded-xl`
- **Section backgrounds**: Alternating `bg-secondary/40` bands for visual rhythm
- **Empty states**: Larger icons, more vertical padding, refined typography

### Pages to Update

**1. Header** -- Minimal changes; already uses the primary brand bar. Refine the sub-nav with slightly more letter-spacing and font-weight consistency.

**2. Footer** -- Add more vertical breathing room (`py-14`), use Plus Jakarta Sans on the logo, increase link spacing.

**3. ProductCard** -- Upgrade from `rounded-md` (`product-card` class) to `rounded-xl`, add smoother hover shadow transition, refine badge corners.

**4. ProductDetailPage** -- Increase container padding to `py-10`, upgrade card corners to `rounded-xl`, use Plus Jakarta Sans for the product title, add more spacing between sections.

**5. CategoryPage** -- Use Plus Jakarta Sans for the hero title, increase grid gap to `gap-5`, add `py-10` padding, upgrade filter chips.

**6. CartPage** -- Increase padding to `py-10`, upgrade card corners to `rounded-xl`, use Plus Jakarta Sans for the page title, refine the order summary card.

**7. CheckoutPage** -- Upgrade step badges, card corners to `rounded-xl`, increase padding, Plus Jakarta Sans on the title.

**8. AccountPage** -- Upgrade section cards to `rounded-xl` with hover lift, use Plus Jakarta Sans for titles, increase grid gap.

**9. OrdersPage** -- Plus Jakarta Sans title, `rounded-xl` order cards, increased padding.

**10. SearchResultsPage** -- Plus Jakarta Sans title, refined filter sidebar spacing.

**11. ListsPage** -- Plus Jakarta Sans title, `rounded-xl` cards, increased padding.

**12. Auth Pages (SignIn, SignUp)** -- Center card upgraded to `rounded-2xl`, Plus Jakarta Sans title, subtle shadow.

**13. Static Pages (About, Help, Privacy, Shipping, Returns, Terms, SellOnDukanly)** -- Plus Jakarta Sans headings, `rounded-xl` cards, increased padding, consistent icon treatment.

**14. OrderConfirmationPage** -- Plus Jakarta Sans heading, refined status cards.

**15. Global CSS** -- Update `.product-card` class from `rounded-md` to `rounded-xl`, update `.section-header` to include Plus Jakarta Sans, add a utility class for the heading font to avoid inline styles everywhere.

### Implementation Approach

1. **CSS first**: Add a `.font-display` utility in `index.css` for Plus Jakarta Sans to eliminate repetitive inline `style` attributes
2. **Update global component classes**: `.product-card`, `.section-header`, `.filter-chip` corner radius and spacing
3. **Update each page file**: Apply consistent padding, typography, and card styling
4. **Update ProductCard component**: Rounded corners, refined hover states
5. **Update Header/Footer**: Spacing and typography refinements

### Files to Edit (17 files)

- `src/index.css` -- Add `.font-display` utility, update component classes
- `src/components/ProductCard.tsx` -- Rounded corners, hover refinement
- `src/components/Header.tsx` -- Sub-nav spacing
- `src/components/Footer.tsx` -- Increased padding, typography
- `src/pages/ProductDetailPage.tsx`
- `src/pages/CategoryPage.tsx`
- `src/pages/CartPage.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/pages/AccountPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/SearchResultsPage.tsx`
- `src/pages/ListsPage.tsx`
- `src/pages/auth/SignInPage.tsx`
- `src/pages/auth/SignUpPage.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/HelpPage.tsx`
- `src/pages/ShippingPage.tsx`
- `src/pages/OrderConfirmationPage.tsx`
- `src/pages/SellOnDukanlyPage.tsx`
- `src/pages/HomePage.tsx` -- Remove inline font-family styles in favor of `.font-display`

