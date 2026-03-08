
-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON public.conversations(seller_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- Unique constraint to prevent duplicate conversations
CREATE UNIQUE INDEX idx_conversations_unique ON public.conversations(buyer_id, seller_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX idx_conversations_unique_no_product ON public.conversations(buyer_id, seller_id) WHERE product_id IS NULL;

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS: buyers see own
CREATE POLICY "Buyers can view own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

-- Conversations RLS: sellers see own
CREATE POLICY "Sellers can view own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- Conversations RLS: buyers can create
CREATE POLICY "Buyers can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Messages RLS: participants can view
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (conversation_id IN (
  SELECT id FROM public.conversations
  WHERE buyer_id = auth.uid()
     OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
));

-- Messages RLS: participants can send
CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE buyer_id = auth.uid()
       OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  )
);

-- Messages RLS: recipients can mark as read
CREATE POLICY "Recipients can mark messages read"
ON public.messages FOR UPDATE
TO authenticated
USING (
  sender_id != auth.uid()
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE buyer_id = auth.uid()
       OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
