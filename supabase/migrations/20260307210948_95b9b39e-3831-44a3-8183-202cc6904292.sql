
-- Update all products to use IQD as native currency with converted prices
-- Exchange rate: 1 USD = 1300 IQD
UPDATE public.products
SET currency_code = 'IQD',
    base_price = ROUND(base_price * 1300),
    original_price = CASE WHEN original_price IS NOT NULL THEN ROUND(original_price * 1300) ELSE NULL END,
    updated_at = now()
WHERE currency_code = 'USD';
