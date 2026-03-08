

## Plan: Fix Google Sign-In Post-Redirect

### Problem
After Google OAuth completes and redirects back to the app, the `SignInPage` stays visible because it never checks if the user became authenticated. The `AuthContext` picks up the session via `onAuthStateChange`, but the sign-in page has no logic to redirect on auth state change.

### Fix — `src/pages/auth/SignInPage.tsx`

Add a `useEffect` that watches the `user` from `useAuth()`. When `user` becomes non-null (e.g. after OAuth redirect sets the session), navigate to the redirect target.

```tsx
const { signIn, user } = useAuth();

useEffect(() => {
  if (user) {
    navigate(resolveRedirectTarget(), { replace: true });
  }
}, [user]);
```

This handles both:
- Post-Google-OAuth redirect (session set by `onAuthStateChange`)
- Any scenario where user lands on sign-in while already authenticated

### Files
- **Edit**: `src/pages/auth/SignInPage.tsx` — add `useEffect` + import, destructure `user` from `useAuth`

