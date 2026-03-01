-- Rollback notes:
-- 1) Drop trigger update_product_prices_updated_at on public.product_prices.
-- 2) Drop table public.product_prices (will remove dual-currency price records).

CREATE TABLE IF NOT EXISTS public.product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  currency_code CHAR(3) NOT NULL CHECK (currency_code IN ('USD', 'IQD')),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  compare_at_price NUMERIC(12,2) CHECK (compare_at_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_prices_product_currency_unique UNIQUE (product_id, currency_code)
);

CREATE INDEX IF NOT EXISTS idx_product_prices_currency_price
  ON public.product_prices (currency_code, unit_price);

CREATE INDEX IF NOT EXISTS idx_product_prices_product
  ON public.product_prices (product_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_product_prices_updated_at'
  ) THEN
    CREATE TRIGGER update_product_prices_updated_at
    BEFORE UPDATE ON public.product_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

INSERT INTO public.product_prices (product_id, currency_code, unit_price)
SELECT p.id, 'USD', p.base_price
FROM public.products p
ON CONFLICT (product_id, currency_code) DO UPDATE
SET unit_price = EXCLUDED.unit_price,
    updated_at = now();

INSERT INTO public.product_prices (product_id, currency_code, unit_price)
SELECT p.id, 'IQD', ROUND((p.base_price * 1300)::numeric, 2)
FROM public.products p
ON CONFLICT (product_id, currency_code) DO UPDATE
SET unit_price = EXCLUDED.unit_price,
    updated_at = now();
