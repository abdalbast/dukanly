
-- Fix infinite recursion between orders and order_items RLS policies
-- The seller policy on orders references order_items, which references orders back

-- Step 1: Create a SECURITY DEFINER function to check if a user is the seller for an order
CREATE OR REPLACE FUNCTION public.user_has_order_items_as_seller(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.sellers s ON oi.seller_id = s.id
    WHERE oi.order_id = p_order_id
      AND s.user_id = auth.uid()
  )
$$;

-- Step 2: Drop the recursive seller policy on orders
DROP POLICY IF EXISTS "Sellers can view orders with their items" ON public.orders;

-- Step 3: Create a non-recursive replacement using the SECURITY DEFINER function
CREATE POLICY "Sellers can view orders with their items"
ON public.orders
FOR SELECT
TO authenticated
USING (public.user_has_order_items_as_seller(id));

-- Step 4: Fix the seller policy on order_items to also use a non-recursive approach
DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;

CREATE POLICY "Sellers can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  seller_id IN (
    SELECT sellers.id FROM sellers WHERE sellers.user_id = auth.uid()
  )
);
