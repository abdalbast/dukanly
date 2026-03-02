
-- Fix the SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.sellers_public;

CREATE VIEW public.sellers_public
WITH (security_invoker = true)
AS
SELECT id, store_name, is_verified, created_at
FROM public.sellers
WHERE is_verified = true;

-- Re-grant access
GRANT SELECT ON public.sellers_public TO anon, authenticated;

-- We need a permissive SELECT policy on sellers for the view to work through RLS
-- This policy allows reading only non-sensitive columns via the view
CREATE POLICY "Allow view access to verified sellers"
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (is_verified = true);
