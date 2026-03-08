

## Plan: Add Sign Out Button to Account Page

Add a "Sign Out" button at the bottom of the account page, below the recent orders section.

### Changes — `src/pages/AccountPage.tsx`

1. Import `LogOut` icon from lucide-react and `useNavigate` from react-router-dom
2. Destructure `signOut` from `useAuth()` (line 14)
3. Add a sign-out button after the recent orders `</section>` (after line 121):
   - Full-width outlined button with `LogOut` icon
   - On click: call `signOut()` then navigate to `/`
   - Styled with destructive/muted styling to distinguish from other actions

### Files
- **Edit**: `src/pages/AccountPage.tsx`

