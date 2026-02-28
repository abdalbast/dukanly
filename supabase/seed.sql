-- Phase 1 local/dev seed strategy:
-- - Idempotent inserts for one seller and a minimal commerce flow.
-- - Requires at least one auth user; otherwise this seed exits with a notice.

DO $$
DECLARE
  seed_user_id UUID;
  seed_seller_id UUID;
  shipping_address_id UUID;
  billing_address_id UUID;
  cart_id UUID;
  product_phone_id UUID;
  product_headphones_id UUID;
  seed_order_id UUID;
BEGIN
  SELECT id INTO seed_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  IF seed_user_id IS NULL THEN
    RAISE NOTICE 'Skipping seed: no auth.users rows found. Create a local user first, then run seed.';
    RETURN;
  END IF;

  INSERT INTO public.sellers (user_id, store_name, is_verified)
  VALUES (seed_user_id, 'Seed Demo Store', true)
  ON CONFLICT (user_id) DO UPDATE
    SET store_name = EXCLUDED.store_name,
        is_verified = EXCLUDED.is_verified
  RETURNING id INTO seed_seller_id;

  IF seed_seller_id IS NULL THEN
    SELECT id INTO seed_seller_id FROM public.sellers WHERE user_id = seed_user_id;
  END IF;

  INSERT INTO public.addresses (user_id, kind, full_name, line1, city, state_region, postal_code, country_code, phone, is_default)
  SELECT seed_user_id, 'shipping', 'Seed User', '100 Market Street', 'San Francisco', 'CA', '94105', 'US', '+1-555-0100', true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE user_id = seed_user_id AND kind = 'shipping'
  );

  INSERT INTO public.addresses (user_id, kind, full_name, line1, city, state_region, postal_code, country_code, phone, is_default)
  SELECT seed_user_id, 'billing', 'Seed User', '100 Market Street', 'San Francisco', 'CA', '94105', 'US', '+1-555-0100', true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE user_id = seed_user_id AND kind = 'billing'
  );

  SELECT id INTO shipping_address_id
  FROM public.addresses
  WHERE user_id = seed_user_id AND kind = 'shipping'
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO billing_address_id
  FROM public.addresses
  WHERE user_id = seed_user_id AND kind = 'billing'
  ORDER BY created_at
  LIMIT 1;

  INSERT INTO public.products (seller_id, sku, title, description, status, currency_code, base_price, metadata)
  VALUES
    (seed_seller_id, 'SEED-PHONE-001', 'Seed Smartphone', 'Phase 1 seed product', 'active', 'USD', 699.00, '{"brand":"Dukanly","category":"electronics"}'::jsonb),
    (seed_seller_id, 'SEED-HEADPHONES-001', 'Seed Headphones', 'Phase 1 seed product', 'active', 'USD', 129.00, '{"brand":"Dukanly","category":"audio"}'::jsonb)
  ON CONFLICT (seller_id, sku) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        currency_code = EXCLUDED.currency_code,
        base_price = EXCLUDED.base_price,
        metadata = EXCLUDED.metadata,
        updated_at = now();

  SELECT id INTO product_phone_id
  FROM public.products
  WHERE seller_id = seed_seller_id AND sku = 'SEED-PHONE-001';

  SELECT id INTO product_headphones_id
  FROM public.products
  WHERE seller_id = seed_seller_id AND sku = 'SEED-HEADPHONES-001';

  INSERT INTO public.inventory (product_id, quantity_on_hand, reserved_quantity, reorder_point)
  VALUES
    (product_phone_id, 50, 2, 10),
    (product_headphones_id, 120, 5, 20)
  ON CONFLICT (product_id) DO UPDATE
    SET quantity_on_hand = EXCLUDED.quantity_on_hand,
        reserved_quantity = EXCLUDED.reserved_quantity,
        reorder_point = EXCLUDED.reorder_point,
        updated_at = now();

  INSERT INTO public.carts (user_id, status, currency_code, expires_at)
  VALUES (seed_user_id, 'active', 'USD', now() + interval '14 days')
  ON CONFLICT (user_id) WHERE status = 'active' DO UPDATE
    SET expires_at = EXCLUDED.expires_at,
        updated_at = now()
  RETURNING id INTO cart_id;

  IF cart_id IS NULL THEN
    SELECT id INTO cart_id
    FROM public.carts
    WHERE user_id = seed_user_id AND status = 'active'
    LIMIT 1;
  END IF;

  INSERT INTO public.cart_items (cart_id, product_id, quantity, unit_price)
  VALUES
    (cart_id, product_phone_id, 1, 699.00),
    (cart_id, product_headphones_id, 2, 129.00)
  ON CONFLICT (cart_id, product_id) DO UPDATE
    SET quantity = EXCLUDED.quantity,
        unit_price = EXCLUDED.unit_price,
        updated_at = now();

  INSERT INTO public.orders (
    order_number,
    user_id,
    source_cart_id,
    status,
    payment_status,
    fulfillment_status,
    currency_code,
    shipping_address_id,
    billing_address_id
  )
  VALUES (
    'SEED-ORDER-0001',
    seed_user_id,
    cart_id,
    'processing',
    'paid',
    'partial',
    'USD',
    shipping_address_id,
    billing_address_id
  )
  ON CONFLICT (order_number) DO UPDATE
    SET status = EXCLUDED.status,
        payment_status = EXCLUDED.payment_status,
        fulfillment_status = EXCLUDED.fulfillment_status,
        updated_at = now()
  RETURNING id INTO seed_order_id;

  IF seed_order_id IS NULL THEN
    SELECT id INTO seed_order_id FROM public.orders WHERE order_number = 'SEED-ORDER-0001';
  END IF;

  DELETE FROM public.order_items WHERE order_id = seed_order_id;

  INSERT INTO public.order_items (order_id, product_id, seller_id, quantity, unit_price, tax_amount, discount_amount, line_total)
  VALUES
    (seed_order_id, product_phone_id, seed_seller_id, 1, 699.00, 55.92, 0.00, 754.92),
    (seed_order_id, product_headphones_id, seed_seller_id, 1, 129.00, 10.32, 5.00, 134.32);

  INSERT INTO public.payments (order_id, provider, provider_payment_id, idempotency_key, amount, currency_code, status, processed_at)
  VALUES (
    seed_order_id,
    'seed-gateway',
    'seed-payment-0001',
    'seed-payment-idempotency-0001',
    889.24,
    'USD',
    'captured',
    now()
  )
  ON CONFLICT (idempotency_key) DO UPDATE
    SET amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        processed_at = EXCLUDED.processed_at,
        updated_at = now();

  INSERT INTO public.shipments (order_id, seller_id, carrier, service_level, tracking_number, status, shipped_at)
  VALUES (
    seed_order_id,
    seed_seller_id,
    'UPS',
    'Ground',
    'SEEDTRACK0001',
    'in_transit',
    now() - interval '1 day'
  )
  ON CONFLICT (tracking_number) DO UPDATE
    SET status = EXCLUDED.status,
        shipped_at = EXCLUDED.shipped_at,
        updated_at = now();

  INSERT INTO public.audit_events (
    actor_user_id,
    entity_type,
    entity_id,
    action,
    before_state,
    after_state,
    request_id,
    user_agent
  )
  VALUES (
    seed_user_id,
    'order',
    seed_order_id,
    'seed_upsert',
    '{}'::jsonb,
    jsonb_build_object('order_number', 'SEED-ORDER-0001', 'status', 'processing'),
    'seed-request-0001',
    'seed-script'
  );
END $$;
