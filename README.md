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
