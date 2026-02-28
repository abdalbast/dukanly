# Architecture Baseline (Phase 0)

## Current system boundaries

Frontend runtime:
- Single-page React app with route-driven pages.
- Client-side state still owns most commerce flows.

Current persistence/auth integration:
- Supabase is used for auth session management in the client.
- Database-backed entities currently in active use are limited to `profiles` and `sellers`.
- Seller role check uses an RPC (`is_seller`) from the client.

Client-only commerce behavior today:
- Cart operations are local React state and not persisted server-side.
- Seller dashboard product/order/settings interactions are mostly mock/local state.
- Checkout/order lifecycle is not server-owned end-to-end.

## Target backend boundaries (phases 1-3)

Frontend responsibilities:
- UI rendering, input collection, and request orchestration.
- No direct ownership of critical business writes.

Backend responsibilities:
- Supabase/Postgres as source of truth for commerce entities.
- Row-level security (RLS) as authorization enforcement for table access.
- Edge Functions/backend endpoints for critical writes (checkout, orders, seller mutations, payment/shipping transitions).

Data/authorization direction:
- Authenticated identity from Supabase auth.
- Role and ownership checks enforced server-side via RLS + backend logic.
- Client submits validated payloads and consumes normalized error responses.

## Phase mapping

- Phase 1: Commerce data model, constraints, indexes, migrations discipline.
- Phase 2: Auth lifecycle completion and full authorization matrix via RLS.
- Phase 3: Move write paths into backend/Edge Functions with validation and idempotency.
