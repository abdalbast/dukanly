
-- Rollback notes:
-- 1) Drop trigger `update_sellers_updated_at` on `public.sellers`.
-- 2) Drop function `public.is_seller`.
-- 3) Drop policies on `public.sellers`.
-- 4) Drop table `public.sellers`.

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  store_name TEXT NOT NULL DEFAULT 'My Store',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Users can view their own seller profile
CREATE POLICY "Users can view own seller profile"
ON public.sellers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own seller profile (become a seller)
CREATE POLICY "Users can create own seller profile"
ON public.sellers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own seller profile
CREATE POLICY "Users can update own seller profile"
ON public.sellers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Public can view verified sellers (for product pages etc)
CREATE POLICY "Public can view verified sellers"
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (is_verified = true);

-- Trigger for updated_at
CREATE TRIGGER update_sellers_updated_at
BEFORE UPDATE ON public.sellers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Server-side function to check if current user is a seller
CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sellers
    WHERE user_id = auth.uid()
  )
$$;
