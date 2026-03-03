

## Add Stripe Payment Method

### Overview
Integrate Stripe as a payment option alongside the existing FIB and COD methods, enabling card-based payments for the Dukanly marketplace.

### Steps

1. **Enable Stripe integration** — Use the Lovable Stripe tool to connect and configure Stripe credentials (secret key collection is handled automatically).

2. **Extend payment types** — Add `"stripe"` to the `PaymentMethod` union in both `src/types/payment.ts` and `supabase/functions/_shared/payments/types.ts`. Update the checkout Zod schema to accept `"stripe"`.

3. **Create a Stripe checkout edge function** — Build a `stripe-checkout` edge function that creates a Stripe Checkout Session (or Payment Intent) for the order amount, returning the session URL/client secret to the frontend.

4. **Update the checkout edge function** — When `paymentMethod === "stripe"`, call the Stripe API to create a payment session, store the Stripe payment ID in the `payments` table, and return the session details to the client.

5. **Add Stripe callback/webhook edge function** — Handle Stripe webhook events (`checkout.session.completed`, `payment_intent.succeeded/failed`) to update `payments` and `orders` tables, mirroring the existing FIB callback pattern.

6. **Update the frontend checkout flow** — Add a "Pay with Card" option in the checkout UI. On selection, redirect to Stripe Checkout (or render Stripe Elements). Handle success/failure redirects.

7. **Update the payment state machine** — Add Stripe status mappings (`succeeded` → `paid`, `requires_payment_method` → `payment_failed`, etc.) in the state machine, similar to the existing FIB mappings.

8. **Update payment status polling** — Extend the `payment-status` edge function to query Stripe for current payment status when the provider is `"stripe"`.

### Technical Details

- Stripe secret key will be stored as a backend secret (handled by the Stripe enablement tool)
- The `payments` table already supports multiple providers via the `provider` column — Stripe rows will use `provider = 'stripe'`
- Webhook signature verification using `STRIPE_WEBHOOK_SECRET` for security
- The existing payment state log (`payment_state_log`) will track Stripe transitions identically to FIB

### First Step
I need to enable the Stripe integration first, which will collect your Stripe secret key and unlock the Stripe-specific tools and knowledge.

