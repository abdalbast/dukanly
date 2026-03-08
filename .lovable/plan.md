

## Diagnosis

The session replay clearly shows the error: **"Social sign-in is not configured in this environment."**

This happens because the `@lovable.dev/cloud-auth-js` module fails to import (line 36-38 of `src/integrations/lovable/index.ts`), causing `getLovableAuth()` to return `null`. The code is correct — the issue is that Google OAuth hasn't been enabled in the Lovable Cloud authentication settings.

## Fix

This is a **configuration issue**, not a code issue. Google OAuth needs to be enabled via Lovable Cloud's authentication settings. No code changes are needed.

**Action required**: Open the Lovable Cloud dashboard and enable Google as a sign-in provider under Authentication Settings → Sign In Methods → Google. Lovable Cloud provides managed Google OAuth credentials by default, so no additional setup (client ID/secret) is needed.

