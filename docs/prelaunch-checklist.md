# Phase 7 Pre-Launch Checklist

## Release readiness gate

Date:
Owner:
Release tag/commit:

Automated baseline gate:

```sh
npm run prelaunch:gate
```

Optional strict gate (deployed smoke + E2E + load-test threshold assertions):

```sh
PRELAUNCH_BASE_URL=<url> \
PLAYWRIGHT_BASE_URL=<url> \
LOADTEST_RESULT_FILE=<path-to-loadtest-json> \
npm run prelaunch:gate -- --with-e2e --with-loadtest-assert --with-audit
```

## 1) Security review

- [ ] Review auth and authorization matrix against implemented routes and Edge Function contracts.
- [ ] Confirm `npm audit` is clean (`npm audit`).
- [ ] Confirm no secrets are committed (`git grep -n "VITE_SUPABASE_PUBLISHABLE_KEY\|SUPABASE_SERVICE_ROLE_KEY"`).

## 2) Migration dry-run

- [ ] Run migration/seed verification in isolated environment:
  - `npm run check:migrations`
  - `supabase db reset`
- [ ] Validate schema and seed outputs.

## 3) Production env and deploy config

- [ ] Validate required env keys exist in Lovable Cloud:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SENTRY_DSN` (if used)
- [ ] Confirm values are not rotated/changed from managed source unless planned by owner.

## 4) Post-deploy smoke tests

- [ ] Run smoke suite against deployed URL:
  - `PLAYWRIGHT_BASE_URL=<deployment-url> npm run test:e2e`
- [ ] Verify health endpoint:
  - `<deployment-url>/healthz.json`

## 5) Rollback plan and ownership

- [ ] Document rollback trigger thresholds.
- [ ] Define rollback command path (revert deploy / redeploy previous artifact).
- [ ] Assign on-call owner and backup during release window.

## Sign-off

- [ ] Engineering owner sign-off
- [ ] Product owner sign-off
- [ ] Operations owner sign-off
