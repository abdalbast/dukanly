

## Plan: Buyer-Seller Chat Messaging

### Overview
Add real-time in-app messaging between buyers and sellers. Buyers initiate conversations from product pages; sellers manage messages from a new "Messages" section in the Seller Hub.

### Database (1 migration)

**Table: `conversations`**
- `id` uuid PK, `buyer_id` uuid NOT NULL, `seller_id` uuid NOT NULL (references sellers.id), `product_id` uuid (optional, links to product context), `created_at`, `updated_at`
- RLS: buyers see own conversations (`buyer_id = auth.uid()`), sellers see their conversations (`seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())`)

**Table: `messages`**
- `id` uuid PK, `conversation_id` uuid NOT NULL, `sender_id` uuid NOT NULL, `content` text NOT NULL, `is_read` boolean DEFAULT false, `created_at`
- RLS: users can SELECT/INSERT on messages where they belong to the conversation (via join to `conversations`)
- Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;`

### Frontend Components

1. **`src/components/chat/ChatWindow.tsx`** — Reusable chat UI with message list, input box, real-time subscription via Supabase channel on `messages` table. Shows sender name, timestamps, read status.

2. **`src/components/chat/ConversationList.tsx`** — List of conversations with last message preview, unread count badge. Used on both buyer and seller sides.

3. **`src/components/chat/ChatButton.tsx`** — "Message Seller" button shown on `ProductDetailPage.tsx`. Creates/opens a conversation with the product's seller.

### Pages & Routes

4. **`src/pages/MessagesPage.tsx`** — Buyer-facing messages page showing conversation list + active chat. Route: `/messages` (protected by RequireAuth).

5. **`src/pages/seller/SellerMessages.tsx`** — Seller-facing messages page within SellerLayout. Route: `/seller/messages`.

### Integration Points

- **`src/pages/ProductDetailPage.tsx`** — Add "Message Seller" button near the seller info section
- **`src/components/seller/SellerSidebar.tsx`** — Add "Messages" nav item with `MessageCircle` icon, positioned after Orders
- **`src/App.tsx`** — Add `/messages` and `/seller/messages` routes
- **`src/i18n/en.ts`** and **`src/i18n/ckb.ts`** — Add ~15 translation keys (messages, chat, send, typeMessage, noConversations, etc.)

### Real-time

Subscribe to `postgres_changes` on the `messages` table filtered by `conversation_id` to get instant message delivery without polling.

### Files Summary
- **New**: `conversations` + `messages` tables (migration), `ChatWindow.tsx`, `ConversationList.tsx`, `ChatButton.tsx`, `MessagesPage.tsx`, `SellerMessages.tsx`
- **Modified**: `ProductDetailPage.tsx`, `SellerSidebar.tsx`, `App.tsx`, `en.ts`, `ckb.ts`

