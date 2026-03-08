

## Plan: Add Apple Sign-In Button

### Changes — `src/pages/auth/SignInPage.tsx`

1. Add `isAppleLoading` state
2. Add `handleAppleSignIn` handler using `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })`
3. Add an Apple sign-in button below the Google button in the `space-y-2` div — outlined style with Apple logo SVG icon and "Continue with Apple" label

### Pre-requisite
- Enable Apple as a social auth provider (via configure tool) so the managed credentials are available

### Files
- **Edit**: `src/pages/auth/SignInPage.tsx`

