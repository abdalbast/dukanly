# Observability and Ops Baseline

## Scope

This repo currently exposes frontend observability baselines that do not require backend deployment changes.

Implemented:
- Structured browser logs with a request/session correlation ID.
- Global capture for unhandled errors and promise rejections.
- Optional remote error sink via `VITE_SENTRY_DSN`.
- Static health endpoint at `/healthz.json`.

## Correlation IDs

Module: `src/lib/observability.ts`

- A correlation ID is generated at app startup.
- Every log event includes:
  - `level`
  - `message`
  - `timestamp`
  - `correlationId`
  - optional structured `context`

## Error tracking

`initObservability()` installs listeners for:
- `window.error`
- `window.unhandledrejection`

When `VITE_SENTRY_DSN` is not configured:
- errors are logged locally only.

When `VITE_SENTRY_DSN` is configured:
- errors are sent to the configured endpoint with correlation metadata.

## Health/readiness surface

`public/healthz.json` is served as a lightweight health endpoint for static deploys.

- URL: `/healthz.json`
- Intended use: smoke checks in CDN/hosting monitors.

## Incident response notes (baseline)

1. Capture the correlation ID from browser console logs.
2. Reproduce the request path and timestamp window.
3. Match the same correlation ID in remote error sink (if configured).
4. Record remediation notes in PR/issue and add regression tests for any logic changes.

## Follow-up work

- Replace placeholder remote error transport with official Sentry SDK integration.
- Add backend correlation propagation once server/Edge APIs are in place.
- Add alert thresholds once centralized telemetry pipeline is selected.
