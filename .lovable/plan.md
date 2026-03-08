

## Plan: Improve Mobile Responsiveness

### Issues Identified

1. **Messages pages (buyer + seller)** use a fixed `w-80` sidebar + chat side-by-side layout that breaks on mobile. On small screens, users should see either the conversation list OR the chat window, not both.

2. **Header messages icon** is `hidden md:flex` — invisible on mobile. Should be visible alongside the cart icon.

3. **ChatWindow header** needs a back button on mobile to return to the conversation list.

### Changes

**1. `src/pages/MessagesPage.tsx`**
- On mobile (`md:` breakpoint), show conversation list when no chat is active, show chat window when a chat is selected
- Add a back button callback that clears `activeConvo` to return to the list
- Keep the side-by-side layout on `md+` screens

**2. `src/pages/seller/SellerMessages.tsx`**
- Same responsive pattern as MessagesPage

**3. `src/components/chat/ChatWindow.tsx`**
- Add optional `onBack` prop
- When provided, render a back arrow button in the chat header (visible on mobile only)

**4. `src/components/Header.tsx`**
- Change messages button from `hidden md:flex` to `flex` so it appears on all screen sizes
- Keep it compact (icon-only) on mobile

### Files
- **Edit**: `MessagesPage.tsx`, `SellerMessages.tsx`, `ChatWindow.tsx`, `Header.tsx`

