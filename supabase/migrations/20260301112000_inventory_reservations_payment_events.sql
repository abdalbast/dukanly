-- Rollback notes:
-- 1) Drop indexes and triggers introduced in this migration.
-- 2) Drop function public.apply_payment_transition(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB, TEXT).
-- 3) Drop tables public.payment_events and public.inventory_reservations.

CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_ref TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  state TEXT NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved', 'released', 'committed')),
  released_reason TEXT,
  released_at TIMESTAMPTZ,
  committed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_reservations_product_reference_check
    CHECK (product_id IS NOT NULL OR product_ref IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_state
  ON public.inventory_reservations (order_id, state, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_state
  ON public.inventory_reservations (product_id, state)
  WHERE product_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_inventory_reservations_updated_at'
  ) THEN
    CREATE TRIGGER update_inventory_reservations_updated_at
    BEFORE UPDATE ON public.inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('checkout', 'callback', 'poll', 'manual')),
  provider_status TEXT,
  payment_state TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_dedup_unique UNIQUE (payment_id, source, payload_hash)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order_created
  ON public.payment_events (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_created
  ON public.payment_events (payment_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.apply_payment_transition(
  p_payment_id UUID,
  p_next_payment_state TEXT,
  p_source TEXT,
  p_provider_status TEXT DEFAULT NULL,
  p_decline_reason TEXT DEFAULT NULL,
  p_valid_until TIMESTAMPTZ DEFAULT NULL,
  p_paid_at TIMESTAMPTZ DEFAULT NULL,
  p_raw_payload JSONB DEFAULT '{}'::jsonb,
  p_payload_hash TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  payment_state TEXT,
  changed BOOLEAN,
  terminal BOOLEAN
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_current_state TEXT;
  v_next_state TEXT;
  v_is_terminal BOOLEAN;
  v_changed BOOLEAN := false;
  v_order_payment_status TEXT;
  v_payment_row_status TEXT;
BEGIN
  v_next_state := p_next_payment_state;

  IF v_next_state NOT IN (
    'payment_pending',
    'payment_authorised',
    'payment_failed',
    'payment_expired',
    'payment_cancelled',
    'cod_pending',
    'paid'
  ) THEN
    RAISE EXCEPTION 'Unsupported payment state: %', v_next_state;
  END IF;

  SELECT p.order_id
  INTO v_order_id
  FROM public.payments p
  WHERE p.id = p_payment_id
  FOR UPDATE;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  SELECT o.payment_state
  INTO v_current_state
  FROM public.orders o
  WHERE o.id = v_order_id
  FOR UPDATE;

  IF v_current_state IS NULL THEN
    RAISE EXCEPTION 'Order not found for payment: %', p_payment_id;
  END IF;

  v_is_terminal := public.is_terminal_payment_state(v_current_state);

  IF NOT v_is_terminal AND v_current_state <> v_next_state THEN
    v_order_payment_status := CASE
      WHEN v_next_state = 'paid' THEN 'paid'
      WHEN v_next_state = 'payment_authorised' THEN 'authorized'
      WHEN v_next_state IN ('payment_failed', 'payment_expired', 'payment_cancelled') THEN 'failed'
      ELSE 'pending'
    END;

    UPDATE public.orders
    SET payment_state = v_next_state,
        payment_state_reason = p_decline_reason,
        payment_status = v_order_payment_status,
        updated_at = now()
    WHERE id = v_order_id;

    IF v_next_state = 'paid' THEN
      UPDATE public.inventory_reservations
      SET state = 'committed',
          committed_at = now(),
          updated_at = now()
      WHERE order_id = v_order_id
        AND state = 'reserved';
    ELSIF v_next_state IN ('payment_failed', 'payment_expired', 'payment_cancelled') THEN
      UPDATE public.inventory_reservations
      SET state = 'released',
          released_reason = COALESCE(p_decline_reason, v_next_state),
          released_at = now(),
          updated_at = now()
      WHERE order_id = v_order_id
        AND state = 'reserved';
    END IF;

    v_changed := true;
  END IF;

  v_payment_row_status := CASE
    WHEN v_next_state = 'paid' THEN 'captured'
    WHEN v_next_state = 'payment_authorised' THEN 'authorized'
    WHEN v_next_state IN ('payment_failed', 'payment_expired', 'payment_cancelled') THEN 'failed'
    ELSE 'initiated'
  END;

  UPDATE public.payments
  SET provider_status = COALESCE(p_provider_status, provider_status),
      decline_reason = COALESCE(p_decline_reason, decline_reason),
      valid_until = COALESCE(p_valid_until, valid_until),
      paid_at = COALESCE(p_paid_at, paid_at),
      raw_provider_payload = COALESCE(p_raw_payload, raw_provider_payload, '{}'::jsonb),
      last_reconciled_at = now(),
      status = v_payment_row_status,
      processed_at = CASE
        WHEN v_next_state = 'paid' THEN COALESCE(p_paid_at, now())
        ELSE processed_at
      END,
      updated_at = now()
  WHERE id = p_payment_id;

  IF p_payload_hash IS NOT NULL THEN
    INSERT INTO public.payment_events (
      payment_id,
      order_id,
      source,
      provider_status,
      payment_state,
      payload_hash,
      raw_payload
    )
    VALUES (
      p_payment_id,
      v_order_id,
      p_source,
      p_provider_status,
      COALESCE((SELECT payment_state FROM public.orders WHERE id = v_order_id), v_current_state),
      p_payload_hash,
      COALESCE(p_raw_payload, '{}'::jsonb)
    )
    ON CONFLICT (payment_id, source, payload_hash) DO NOTHING;
  END IF;

  RETURN QUERY
  SELECT
    v_order_id,
    o.payment_state,
    v_changed,
    public.is_terminal_payment_state(o.payment_state)
  FROM public.orders o
  WHERE o.id = v_order_id;
END;
$$;
