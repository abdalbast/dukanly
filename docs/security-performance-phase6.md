# Security and Performance Hardening Baseline (Phase 6)

## Dependency vulnerability posture

Actions taken:
- Ran `npm audit fix` to reduce known issues.
- Confirmed no production dependency vulnerabilities via:
  - `npm audit --omit=dev`

Current state:
- Production deps: `0` vulnerabilities.
- Remaining dev-only vulnerabilities are tied to tooling upgrade paths (for example major Vite/esbuild jumps).

## Security headers strategy

Configured in `vite.config.ts` for `server` and `preview` responses:
- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`

Notes:
- CSP currently allows Google Fonts and websocket connections required for local development.
- Production hosting/CDN should mirror and tighten these headers as needed.

## Bundle/performance strategy

Implemented:
- Route-level lazy loading in `src/App.tsx` with `React.lazy` + `Suspense` fallback.
- Pagination guardrails for list endpoints:
  - `seller-products-list`
  - `seller-orders-list`
  - enforced `limit` max `100` and `offset` max `10000`

Expected impact:
- Smaller initial JS payload for first paint.
- Large route groups load on demand.

## Write API load-test baseline

Script:
- `scripts/loadtest-write-endpoints.mjs`

Run:

```sh
LOADTEST_BEARER_TOKEN=<token> npm run loadtest:writes
```

Optional tuning:
- `LOADTEST_ENDPOINT=checkout|orders|seller-products|seller-orders`
- `LOADTEST_CONCURRENCY=5`
- `LOADTEST_REQUESTS=50`
- `LOADTEST_BASE_URL=http://127.0.0.1:54321/functions/v1`

Output:
- success/failed counts
- avg latency
- p95 latency
- total duration
