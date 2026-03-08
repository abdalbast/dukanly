
-- Create wishlists table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Wish List',
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Wishlists RLS (PERMISSIVE per project standards)
CREATE POLICY "Users can view own wishlists" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlists" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlists" ON public.wishlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlists" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items RLS
CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items FOR SELECT USING (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items FOR INSERT WITH CHECK (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items FOR DELETE USING (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);

-- Updated_at trigger for wishlists
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
