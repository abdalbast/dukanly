# Rollback Runbook

## Trigger conditions

Initiate rollback when one or more conditions hold for 10+ minutes:
- Checkout/order write failure rate >= 5%
- Unhandled client errors >= 10 events / 5 minutes
- P95 write latency > 3s after release stabilization period

## Immediate actions

1. Freeze further deploys/merges to release branch.
2. Confirm incident scope (frontend only vs. API/Edge functions).
3. Notify on-call and release channel.

## Rollback procedure

1. Redeploy previous known-good commit/artifact.
2. Verify critical paths:
   - `/healthz.json`
   - sign in
   - checkout page load
   - seller dashboard access
3. Re-run smoke tests:
   - `PLAYWRIGHT_BASE_URL=<rollback-url> npm run test:e2e`

## Post-rollback

1. Open incident issue with timeline.
2. Attach logs/errors with correlation IDs.
3. Add regression test or guardrail before re-attempting release.
