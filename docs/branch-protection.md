# Branch Protection Baseline

## Goal

Make Phase 5 CI checks mandatory before merge.

## Required checks

Configure branch protection for `main` (or your release branch) with these required status checks:
- `Lint Test Build`
- `E2E Smoke`
- `Verify PR Preview Deployment`

## Recommended rules

- Require pull request before merging.
- Require at least 1 approval.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merge.
- Restrict force-pushes and branch deletion.

## GitHub UI path

1. Repository `Settings`
2. `Branches`
3. Add or edit branch protection rule
4. Enable required status checks and select the checks above

## Optional CLI (GitHub CLI + admin permission)

```sh
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/<owner>/<repo>/branches/main/protection \
  -f required_pull_request_reviews.dismiss_stale_reviews=true \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f enforce_admins=true \
  -f required_status_checks.strict=true \
  -F required_status_checks.contexts[]='Lint Test Build' \
  -F required_status_checks.contexts[]='E2E Smoke' \
  -F required_status_checks.contexts[]='Verify PR Preview Deployment' \
  -f restrictions=
```

Note:
- GitHub branch protection for private repositories may require a paid GitHub plan. If API calls return HTTP 403 with a plan-upgrade message, enforce this rule once plan requirements are met.
