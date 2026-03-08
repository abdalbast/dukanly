

## Customizing Google OAuth App Name

The app name shown on Google's "Choose an account" screen (e.g., "Continue to **Dukanly**") is **not controllable via code**. It's set in the **Google Cloud Console** under the OAuth consent screen configuration.

Lovable Cloud's managed Google OAuth uses default/shared credentials, so the consent screen won't display "Dukanly" as the app name.

### What's needed

To show "Dukanly" on the Google sign-in popup, you need to **use your own Google OAuth credentials**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Go to **OAuth consent screen** → set **App name** to "Dukanly"
4. Add authorized domains (e.g., `lovable.app` and any custom domains)
5. Go to **Credentials** → Create **OAuth Client ID** (Web application)
6. Add the redirect URL from Lovable Cloud's Authentication Settings for Google
7. Copy the **Client ID** and **Client Secret** into Lovable Cloud's Authentication Settings (Sign In Methods → Google)

### Code change — `src/pages/auth/SignInPage.tsx`

Add `prompt: "select_account"` to force the account picker screen every time:

```tsx
const result = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: window.location.origin,
  extraParams: {
    prompt: "select_account",
  },
});
```

### Summary
- **Configuration** (user action): Set up own Google OAuth credentials with app name "Dukanly"
- **Code**: Add `prompt: "select_account"` extra param

