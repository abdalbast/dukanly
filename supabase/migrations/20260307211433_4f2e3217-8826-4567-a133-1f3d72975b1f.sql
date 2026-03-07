
CREATE OR REPLACE FUNCTION public.apply_payment_transition(
  p_payment_id uuid,
  p_next_payment_state text,
  p_source text,
  p_provider_status text DEFAULT NULL,
  p_decline_reason text DEFAULT NULL,
  p_valid_until timestamptz DEFAULT NULL,
  p_paid_at timestamptz DEFAULT NULL,
  p_raw_payload jsonb DEFAULT '{}'::jsonb,
  p_payload_hash text DEFAULT NULL
)
RETURNS TABLE(order_id uuid, payment_state text, changed boolean, terminal boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_payment RECORD;
  v_order RECORD;
  v_old_state text;
  v_changed boolean := false;
  v_terminal boolean := false;
BEGIN
  -- Get payment
  SELECT p.id, p.order_id INTO v_payment
  FROM public.payments p WHERE p.id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  -- Get current order state
  SELECT o.id, o.payment_state INTO v_order
  FROM public.orders o WHERE o.id = v_payment.order_id;

  v_old_state := v_order.payment_state;

  -- Update payment row
  UPDATE public.payments
  SET provider_status = COALESCE(p_provider_status, provider_status),
      valid_until = COALESCE(p_valid_until, valid_until),
      processed_at = COALESCE(p_paid_at, processed_at),
      updated_at = now()
  WHERE id = p_payment_id;

  -- Update order payment state if changed
  IF v_old_state IS DISTINCT FROM p_next_payment_state THEN
    UPDATE public.orders
    SET payment_state = p_next_payment_state,
        payment_state_reason = p_decline_reason,
        payment_status = CASE
          WHEN p_next_payment_state = 'paid' THEN 'paid'
          WHEN p_next_payment_state IN ('declined', 'expired', 'refunded') THEN 'failed'
          ELSE payment_status
        END,
        updated_at = now()
    WHERE id = v_payment.order_id;
    v_changed := true;
  END IF;

  v_terminal := p_next_payment_state IN ('paid', 'declined', 'expired', 'refunded', 'cod_confirmed');

  -- Log the transition
  INSERT INTO public.payment_state_log (payment_id, from_state, to_state, source, provider_status, raw_payload, valid_until)
  VALUES (p_payment_id, v_old_state, p_next_payment_state, p_source, p_provider_status, p_raw_payload, p_valid_until);

  RETURN QUERY SELECT v_payment.order_id, p_next_payment_state, v_changed, v_terminal;
END;
$$;
