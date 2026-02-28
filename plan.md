# Dukanly Delivery Plan

## Progress Snapshot

- Current phase: **Phase 3 (API hardening and validation)**
- Overall progress: **6 / 8 phases in progress/completed**
- Constraint in effect: **Do not rotate Supabase keys or change env var values (Lovable Cloud managed)**

## Sync Policy

- This file is updated immediately after each implemented task/phase change.
- Each update adjusts:
  - phase status
  - checklist checkboxes
  - acceptance criteria checkboxes
  - priority action status

## Status Legend

- `Not Started`
- `In Progress`
- `Completed`
- `Deferred (Constraint)`

---

## Phase 0: Stabilise and baseline

**Status:** In Progress  
**Objective:** Freeze current behavior and establish reliable gates before major backend work.

### Checklist

- [x] Add `.env.example` and env docs for local + Lovable Cloud.
- [x] Standardize one package manager and lockfile policy (`npm` + `package-lock.json`).
- [x] Make lint, test, and build pass in local gate.
- [x] Create baseline architecture doc: current client-only scope and target backend boundaries.
- [x] Stop tracking `.env` in git.
- [ ] Remove tracked `.env` from git history and rotate exposed Supabase publishable key. **Deferred (Constraint: Lovable Cloud manages auth/env; no key/env changes).**

### Dependencies / Order

1. Secret hygiene
2. Tooling and quality gates
3. Documentation

### Verification / Acceptance

- [x] CI-equivalent local run succeeds: lint, test, build.
- [x] No `.env` file tracked by git in current tree.
- [x] Team can bootstrap from docs without tribal knowledge.

---

## Phase 1: Data model and migrations

**Status:** In Progress  
**Objective:** Define production-grade relational model and migration discipline.

### Checklist

- [x] Design tables for products, inventory, carts, orders, order_items, payments, shipments, addresses, audit_events.
- [x] Add FK constraints, unique constraints, and critical indexes.
- [x] Add seller FK to auth users (`sellers.user_id -> auth.users.id`).
- [x] Add migration naming/version policy and rollback notes per migration.
- [x] Add seed strategy for local/dev parity.

### Dependencies / Order

1. Domain model approval
2. Migrations + indexes
3. Seed and rollback docs

### Verification / Acceptance

- [ ] Fresh DB bootstrap succeeds from migrations only.
- [ ] Referential integrity prevents orphaned rows.
- [ ] Query plans validated for key reads/writes.

---

## Phase 2: Auth and authorisation

**Status:** In Progress  
**Objective:** Enforce identity and permissions server-side for every protected action.

### Checklist

- [x] Implement forgot/reset password flow and email verification UX.
- [x] Add authenticated route guards for account/order/seller pages.
- [ ] Expand RLS policies for all new tables.
- [ ] Create role model (buyer/seller/admin) with policy matrix.
- [ ] Add policy tests for read/write denial and allow paths.

### Dependencies / Order

1. Data model from Phase 1
2. Auth UX/API alignment
3. RLS + tests

### Verification / Acceptance

- [ ] Unauthorized access blocked at DB/API layer.
- [ ] Auth lifecycle (signup, verify, sign-in, reset) works end-to-end.
- [ ] Policy tests pass for ownership and role constraints.

---

## Phase 3: API hardening and validation

**Status:** In Progress  
**Objective:** Move business logic out of client into server-controlled interfaces.

### Checklist

- [x] Create backend endpoints/Edge Functions for checkout, order creation, seller product/order management. (contract scaffolds added in `supabase/functions/*`)
- [x] Add schema validation for all request payloads. (Zod validation in shared middleware)
- [x] Add idempotency keys for order/payment writes. (required `idempotency-key` header + replay cache scaffold)
- [x] Standardize error model and HTTP status mapping. (shared `{ data, error }` envelope + typed errors)
- [x] Add anti-abuse controls (rate limits/captcha where needed). (baseline in-memory per-route/IP limiter)

### Dependencies / Order

1. Auth/RLS baseline
2. API implementation
3. Validation/idempotency/abuse controls

### Verification / Acceptance

- [ ] No critical write path remains client-only. (pending DB write wiring from client to Edge Functions)
- [ ] Replayed requests do not duplicate orders/payments.
- [ ] Invalid payloads are rejected consistently.

---

## Phase 4: Observability and ops

**Status:** In Progress  
**Objective:** Make production diagnosable and operable.

### Checklist

- [ ] Add centralized error tracking (Sentry or equivalent). (scaffolding added; provider wiring pending)
- [x] Add structured logging with correlation IDs.
- [x] Add health/readiness endpoints for backend surfaces. (frontend `/healthz.json` added)
- [ ] Define alert thresholds and incident response runbooks. (baseline runbook doc added; thresholds pending)
- [ ] Add timeout/retry policy for external calls.

### Dependencies / Order

1. API endpoints exist
2. Instrumentation
3. Alerting + runbooks

### Verification / Acceptance

- [ ] Errors include request/user context.
- [ ] Alerting fires on synthetic failure tests.
- [ ] Team can trace one request across logs.

---

## Phase 5: Testing and CI/CD

**Status:** In Progress  
**Objective:** Enforce quality gates on every change and deployment.

### Checklist

- [x] Add GitHub Actions for lint/test/build/migration checks.
- [ ] Add integration tests for auth, RLS, checkout, seller flows. (auth + checkout + seller flows added; RLS policy tests pending)
- [ ] Add E2E smoke tests for critical user journeys.
- [ ] Add preview deployment checks for PRs (Lovable/GitHub integration policy).
- [ ] Enforce branch protection and required checks.

### Dependencies / Order

1. Stable APIs and flows
2. Test suite creation
3. CI enforcement

### Verification / Acceptance

- [ ] PR cannot merge with failing checks.
- [ ] Preview environment validates critical paths.
- [ ] Regression suite catches auth/order failures.

---

## Phase 6: Performance and security hardening

**Status:** Not Started  
**Objective:** Reduce exposure and improve runtime efficiency.

### Checklist

- [ ] Resolve `npm audit` high/moderate vulnerabilities via upgrades/pins.
- [ ] Add CSP/security headers strategy (at hosting edge or proxy).
- [ ] Reduce bundle size with route-level code splitting.
- [ ] Add pagination and query limits for list endpoints.
- [ ] Load test checkout/order APIs.

### Dependencies / Order

1. CI baseline in place
2. Dependency and security upgrades
3. Performance tuning

### Verification / Acceptance

- [ ] No untriaged high vulnerabilities in production dependencies.
- [ ] P95 latency and error budget targets met.
- [ ] Bundle/chunk budgets tracked and enforced.

---

## Phase 7: Pre-launch checklist and go live

**Status:** Not Started  
**Objective:** Execute controlled launch with rollback and monitoring.

### Checklist

- [ ] Final security review (authz matrix, secrets, dependency report).
- [ ] Run migration dry-run against staging clone.
- [ ] Validate production env vars and Lovable Cloud deployment config.
- [ ] Execute smoke tests post-deploy.
- [ ] Prepare rollback steps and on-call ownership.

### Dependencies / Order

1. All prior phases complete
2. Staging signoff
3. Controlled rollout

### Verification / Acceptance

- [ ] Launch checklist fully signed off.
- [ ] Monitoring healthy after release window.
- [ ] Rollback tested and documented.

---

## Priority Actions (Ordered)

1. [x] Decide and document a single package manager/lockfile standard.
2. [x] Keep `.env` out of git tracking for active branch.
3. [ ] Establish CI (lint, test, build, migration checks) and make it mandatory for merges.
4. [x] Design full commerce data model and implement migrations with FK/indexes.
5. [x] Implement backend endpoints/Edge Functions for all write operations (checkout, orders, seller ops). (phase-3 contract scaffolds added; DB transaction wiring pending)
6. [ ] Expand auth lifecycle (forgot/reset/email verification) and enforce server-side authorization via RLS.
7. [ ] Replace mock/local-state commerce flows with persisted DB-backed flows.
8. [ ] Add observability (error tracking, structured logs, health checks) and alerting. (structured logs + health check done; alerting/error provider completion pending)
9. [ ] Expand tests to integration/E2E for auth, RLS, and checkout critical paths. (auth + checkout + seller integration tests added; RLS and E2E pending)
10. [ ] Run staged pre-launch security/performance gate, then deploy with rollback-ready runbooks.
