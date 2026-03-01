-- Rollback notes:
-- 1) Drop indexes introduced in this migration:
--    idx_orders_payment_state_placed, idx_orders_region_payment_state,
--    idx_payments_provider_payment_unique, idx_payments_provider_status_reconciled.
-- 2) Drop helper function public.is_terminal_payment_state(text) if unused elsewhere.
-- 3) Drop added columns from public.orders and public.payments.
-- 4) Revert defaults for added columns if needed before dropping.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('fib', 'cod')),
  ADD COLUMN IF NOT EXISTS payment_state TEXT NOT NULL DEFAULT 'cod_pending'
    CHECK (payment_state IN (
      'payment_pending',
      'payment_authorised',
      'payment_failed',
      'payment_expired',
      'payment_cancelled',
      'cod_pending',
      'paid'
    )),
  ADD COLUMN IF NOT EXISTS payment_state_reason TEXT,
  ADD COLUMN IF NOT EXISTS region_code TEXT NOT NULL DEFAULT 'KRD';

UPDATE public.orders
SET payment_method = CASE
    WHEN payment_method IS DISTINCT FROM 'fib' AND payment_status IN ('paid', 'authorized') THEN 'fib'
    ELSE 'cod'
  END,
  payment_state = CASE
    WHEN payment_status = 'paid' THEN 'paid'
    WHEN payment_status = 'authorized' THEN 'payment_authorised'
    WHEN payment_status = 'failed' THEN 'payment_failed'
    ELSE 'cod_pending'
  END
WHERE payment_method IS NULL
   OR payment_state IS NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider_status TEXT,
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decline_reason TEXT,
  ADD COLUMN IF NOT EXISTS status_callback_url TEXT,
  ADD COLUMN IF NOT EXISTS raw_provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_reconciled_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_payment_unique
  ON public.payments (provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_state_placed
  ON public.orders (payment_state, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_region_payment_state
  ON public.orders (region_code, payment_state, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_provider_status_reconciled
  ON public.payments (provider, provider_status, last_reconciled_at DESC);

CREATE OR REPLACE FUNCTION public.is_terminal_payment_state(state TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT state IN ('paid', 'payment_failed', 'payment_expired', 'payment_cancelled');
$$;
