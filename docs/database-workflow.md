# Database Migration and Seed Workflow

## Migration naming policy

Use timestamped, descriptive filenames:

- Format: `YYYYMMDDHHMMSS_<short_description>.sql`
- Example: `20260228054000_phase1_commerce_schema.sql`

Rules:
- One logical change set per migration.
- Forward-only migrations in git history.
- Every migration includes rollback notes in a header comment.

## Rollback notes policy

Each migration must document rollback steps at the top of the file:
- Objects to drop/revert in dependency-safe order.
- Data-impact caveats (for example, destructive drops).
- Any manual recovery steps if automatic reversal is unsafe.

## Current migration set

1. `20260228033213_49632a1c-d180-4a70-a892-4ac0062f10f8.sql`
2. `20260228035530_5efd6c95-1a5a-478c-a65a-53f469b3055e.sql`
3. `20260228054000_phase1_commerce_schema.sql`

## Local development flow

Apply migrations + seed from scratch:

```sh
supabase db reset
```

Apply new migrations to local DB only:

```sh
supabase migration up
```

Generate a new migration scaffold:

```sh
supabase migration new <short_description>
```

## Seed strategy

Seed file:
- `supabase/seed.sql`

Behavior:
- Idempotent upserts for a minimal seller + product + cart/order/payment/shipment dataset.
- Requires at least one `auth.users` row; otherwise exits with a notice and no data changes.

Recommended local parity routine:
1. Create/sign up a test user in local auth.
2. Run `supabase db reset`.
3. Validate seeded entities via SQL or Supabase Studio.

## Query-plan validation checklist (Phase 1 acceptance)

After migrations are applied locally, run `EXPLAIN ANALYZE` for key reads/writes:

- Seller product listing by `seller_id` + `status`.
- Active cart lookup by `user_id` + `status`.
- Order history by `user_id` + `placed_at`.
- Shipment lookup by `order_id` and `tracking_number`.
- Audit trail lookup by `entity_type` + `entity_id`.
