# API Hardening Baseline (Phase 3)

## Scope

This baseline introduces Supabase Edge Function contracts for critical write paths without changing env values or rotating keys.

Implemented function surfaces:
- `checkout` (checkout submission contract)
- `orders` (order-creation contract)
- `seller-products` (seller product upsert contract)
- `seller-orders` (seller order status update contract)
- `seller-products-list` (seller products list contract with capped pagination)
- `seller-orders-list` (seller orders list contract with capped pagination)

## Shared guardrails

All write surfaces use shared middleware from `supabase/functions/_shared`:
- Authentication required via bearer token validation against Supabase Auth.
- Role checks for seller-only endpoints (`seller`/`admin`).
- Request schema validation with Zod and `422` responses for invalid payloads.
- `idempotency-key` required for write requests, with in-memory response replay cache.
- Basic in-memory per-IP rate limiting (`60` requests/minute per route).
- Standard response envelope:
  - success: `{ data, error: null }`
  - failure: `{ data: null, error: { code, message, details } }`

## Current behavior

Phase 3 endpoints currently return validated, accepted contract payloads and metadata.
Client write surfaces now invoke these endpoints for:
- checkout submission
- seller product create/update
- seller order status/fulfillment updates

Database transactions are intentionally deferred until:
1. full RLS/policy matrix completion (Phase 2), and
2. server-owned transaction flow implementation (remaining Phase 3).

## Local development

Serve a function locally:

```sh
supabase functions serve checkout --no-verify-jwt
```

Example call:

```sh
curl -i \
  -X POST http://127.0.0.1:54321/functions/v1/checkout \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <access-token>' \
  -H 'idempotency-key: 1234567890abcdef' \
  -d '{"cartId":"00000000-0000-0000-0000-000000000001","shippingAddressId":"00000000-0000-0000-0000-000000000002","paymentMethodId":"pm_demo","deliveryOption":"standard","currencyCode":"usd","clientTotal":109.99}'
```
