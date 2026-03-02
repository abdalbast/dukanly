
-- Drop the overly broad public seller policy that exposes user_id
DROP POLICY IF EXISTS "Public can view verified sellers" ON public.sellers;

-- Create a view that hides user_id for public consumption
CREATE OR REPLACE VIEW public.sellers_public AS
SELECT id, store_name, is_verified, created_at
FROM public.sellers
WHERE is_verified = true;

-- Grant access to the view
GRANT SELECT ON public.sellers_public TO anon, authenticated;

-- Create rate_limits table for persistent rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  route_key TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (route_key, client_ip, window_start)
);

-- Enable RLS but only allow service role access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create a function to check and increment rate limits atomically
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_route_key TEXT,
  p_client_ip TEXT,
  p_window_ms INTEGER DEFAULT 60000,
  p_max_requests INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_window_start := now() - (p_window_ms || ' milliseconds')::interval;

  -- Clean old entries for this key
  DELETE FROM public.rate_limits
  WHERE route_key = p_route_key
    AND client_ip = p_client_ip
    AND window_start < v_window_start;

  -- Upsert current window
  INSERT INTO public.rate_limits (route_key, client_ip, request_count, window_start)
  VALUES (p_route_key, p_client_ip, 1, now())
  ON CONFLICT (route_key, client_ip, window_start)
  DO UPDATE SET request_count = public.rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  IF v_count IS NULL THEN
    v_count := 1;
  END IF;

  RETURN v_count > p_max_requests;
END;
$$;

-- Create index for cleanup performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON public.rate_limits (route_key, client_ip, window_start);
