-- Rollback notes:
-- This migration introduces and alters multiple commerce tables, triggers, and RLS policies.
-- Rollback should be executed with a dedicated down migration that drops only the objects
-- introduced here in reverse dependency order after confirming production data retention needs.
-- Do not run destructive rollback steps directly in production without a verified backup.

-- =============================================
-- Commerce Tables + RLS Migration
-- =============================================

-- 1. Products table: add missing columns for storefront display
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_prime BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_limited_deal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS fulfillment_type TEXT DEFAULT 'seller';

-- If products table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  currency_code TEXT NOT NULL DEFAULT 'USD',
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  brand TEXT,
  category TEXT,
  subcategory TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_prime BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_limited_deal BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  original_price NUMERIC(12,2),
  delivery_days INTEGER DEFAULT 3,
  fulfillment_type TEXT DEFAULT 'seller',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seller_id, sku)
);

-- 2. Product prices table
CREATE TABLE IF NOT EXISTS public.product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, currency_code)
);

-- 3. Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'shipping',
  full_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state_region TEXT,
  postal_code TEXT,
  country_code TEXT NOT NULL DEFAULT 'IQ',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  currency_code TEXT NOT NULL DEFAULT 'USD',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Partial unique index for active carts
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_active ON public.carts(user_id) WHERE status = 'active';

-- 6. Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- 7. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  source_cart_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_state TEXT,
  payment_state_reason TEXT,
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  currency_code TEXT NOT NULL DEFAULT 'USD',
  subtotal_amount NUMERIC(12,2) DEFAULT 0,
  shipping_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  shipping_address_id UUID,
  billing_address_id UUID,
  region_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_ref TEXT,
  seller_id UUID REFERENCES public.sellers(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  line_total NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  provider_status TEXT,
  idempotency_key TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'initiated',
  valid_until TIMESTAMPTZ,
  status_callback_url TEXT,
  raw_provider_payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.sellers(id),
  carrier TEXT,
  service_level TEXT,
  tracking_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Inventory reservations table (used by checkout edge function)
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_ref TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Audit events table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_state JSONB DEFAULT '{}'::jsonb,
  after_state JSONB DEFAULT '{}'::jsonb,
  request_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Payment state log table (used by reconcile module)
CREATE TABLE IF NOT EXISTS public.payment_state_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  source TEXT,
  provider_status TEXT,
  valid_until TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Updated_at triggers for all new tables
-- =============================================
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_product_prices_updated_at BEFORE UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_inventory_reservations_updated_at BEFORE UPDATE ON public.inventory_reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS Policies
-- =============================================

-- PRODUCTS: public read, seller write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can view their own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can insert their own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can update their own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can delete their own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- PRODUCT_PRICES: public read, seller write
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product prices"
  ON public.product_prices FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their product prices"
  ON public.product_prices FOR INSERT
  TO authenticated
  WITH CHECK (product_id IN (SELECT p.id FROM public.products p JOIN public.sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid()));

CREATE POLICY "Sellers can update their product prices"
  ON public.product_prices FOR UPDATE
  TO authenticated
  USING (product_id IN (SELECT p.id FROM public.products p JOIN public.sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid()));

CREATE POLICY "Sellers can delete their product prices"
  ON public.product_prices FOR DELETE
  TO authenticated
  USING (product_id IN (SELECT p.id FROM public.products p JOIN public.sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid()));

-- INVENTORY: public read, seller write
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert inventory"
  ON public.inventory FOR INSERT
  TO authenticated
  WITH CHECK (product_id IN (SELECT p.id FROM public.products p JOIN public.sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid()));

CREATE POLICY "Sellers can update inventory"
  ON public.inventory FOR UPDATE
  TO authenticated
  USING (product_id IN (SELECT p.id FROM public.products p JOIN public.sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid()));

-- ADDRESSES: user owns
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CARTS: user owns
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own carts"
  ON public.carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carts"
  ON public.carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carts"
  ON public.carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own carts"
  ON public.carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CART_ITEMS: user owns via cart
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

-- ORDERS: user can read own, service role writes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ORDER_ITEMS: user can read via order
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- Sellers can view order items for their products
CREATE POLICY "Sellers can view their order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- PAYMENTS: user can read via order
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- SHIPMENTS: user can read via order
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- Sellers can view their shipments
CREATE POLICY "Sellers can view their shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- INVENTORY_RESERVATIONS: service role only (no client policies)
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

-- AUDIT_EVENTS: no client access
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- PAYMENT_STATE_LOG: no client access
ALTER TABLE public.payment_state_log ENABLE ROW LEVEL SECURITY;

-- Sellers can view orders for their items
CREATE POLICY "Sellers can view orders with their items"
  ON public.orders FOR SELECT
  TO authenticated
  USING (id IN (SELECT order_id FROM public.order_items WHERE seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())));

-- Index for faster product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON public.order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
