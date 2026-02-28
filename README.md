# Dukanly

Dukanly is a React + TypeScript commerce frontend built with Vite, shadcn-ui, and Supabase.

## Development setup

Prerequisites:
- Node.js 20+
- npm 10+

Install dependencies:

```sh
npm ci
```

## Environment variables

Create a local env file from the template:

```sh
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SENTRY_DSN` (optional)

Note:
- Supabase auth and environment values are managed by Lovable Cloud.
- Do not rotate or modify key values as part of this repository workflow.

## Run locally

```sh
npm run dev
```

## Quality gates

Run the full local gate:

```sh
npm run check
```

Equivalent commands:

```sh
npm run lint
npm test
npm run build
npm run check:migrations
npm run check:bundle
npm run test:e2e
npm run loadtest:writes
npm run prelaunch:smoke
```

Before first E2E run:

```sh
npx playwright install chromium
```

## Package manager policy

This repo is npm-standardized:
- Use npm commands only.
- Keep `package-lock.json` as the single lockfile.
- Do not add Bun/Yarn/pnpm lockfiles.

## Architecture baseline

See `docs/architecture-baseline.md` for current system boundaries and target backend boundaries used for phased implementation.

## Database workflow

See `docs/database-workflow.md` for migration naming policy, rollback note requirements, and local seed/reset flow.

## Observability

See `docs/observability.md` for structured logging, global error capture, and health endpoint guidance.

## API hardening baseline

See `docs/api-hardening-phase3.md` for Edge Function write-surface contracts, validation, idempotency, and rate-limit guardrails introduced for Phase 3.

## CI and Branch Protection

See `docs/branch-protection.md` for required CI checks and branch protection setup.

## Security and Performance

See `docs/security-performance-phase6.md` for dependency audit posture, CSP/header strategy, route-splitting baseline, and load-test workflow.

## Pre-Launch

See `docs/prelaunch-checklist.md` and `docs/rollback-runbook.md` for release gating, smoke validation, and rollback steps.
