

## GDPR Compliance: Cookie Consent Banner + Footer Badge

### What needs to happen

1. **Cookie Consent Banner** -- A bottom-of-screen banner that appears on first visit, asking users to accept or manage cookies. Consent state stored in `localStorage`. This is the core GDPR requirement.

2. **GDPR Compliance Badge in Footer** -- A small shield/badge in the bottom footer area showing "GDPR Compliant" with a link to the privacy policy.

3. **Cookie Settings Page/Link** -- A "Cookie Settings" link in the footer so users can change their consent at any time (GDPR right to withdraw consent).

### Files to create/modify

| File | Action |
|------|--------|
| `src/components/CookieConsentBanner.tsx` | **Create** -- Banner component with Accept All / Manage / Reject buttons, persists to localStorage |
| `src/components/Footer.tsx` | **Modify** -- Add GDPR badge (Shield icon + "GDPR Compliant" text) and "Cookie Settings" link in bottom footer |
| `src/components/Layout.tsx` | **Modify** -- Render `CookieConsentBanner` |
| `src/i18n/en.ts` | **Modify** -- Add translation keys for cookie banner text, GDPR badge, cookie settings |
| `src/i18n/ckb.ts` | **Modify** -- Add Kurdish translations for the same keys |

### Cookie Consent Banner behavior
- Shows fixed at bottom of viewport on first visit
- Three options: "Accept All", "Reject Non-Essential", "Cookie Settings" (links to /privacy)
- On accept/reject, saves preference to `localStorage` key `dukanly_cookie_consent`
- Does not show again once user has made a choice
- Small, non-intrusive design matching existing dark primary theme

### Footer GDPR Badge
- Lucide `ShieldCheck` icon + "GDPR Compliant" text
- Placed in the bottom footer bar alongside existing links
- Links to `/privacy` page

