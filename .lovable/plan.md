

## Plan: Add Unread Message Count Badge to Header

### Changes

**1. New hook: `src/hooks/useUnreadMessages.ts`**
- Query `messages` table: count where `is_read = false` AND `sender_id != auth.uid()`, joined via `conversations` where user is buyer or seller
- Subscribe to realtime `INSERT` on `messages` table to refresh count
- Return `unreadCount` number; return 0 if not logged in

**2. Edit: `src/components/Header.tsx`**
- Import `MessageCircle` from lucide-react and `useUnreadMessages`
- Insert a messages button between Orders (line ~202) and Cart (line ~204), same styling pattern
- Show red badge with count when `unreadCount > 0` (reuse `cart-badge` CSS class)
- Click navigates to `/messages`
- Only render when `user` is truthy

**3. Edit: `src/i18n/en.ts`** — add `"header.messages": "Messages"`

**4. Edit: `src/i18n/ckb.ts`** — add `"header.messages": "نامەکان"`

### Files
- **New**: `src/hooks/useUnreadMessages.ts`
- **Edit**: `src/components/Header.tsx`, `src/i18n/en.ts`, `src/i18n/ckb.ts`

