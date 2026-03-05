
-- 1. Extend sellers table with new columns
ALTER TABLE public.sellers 
  ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS support_email text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_last4 text,
  ADD COLUMN IF NOT EXISTS payout_schedule text DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 100;

-- 2. Ledger transactions
CREATE TABLE public.ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id),
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'IQD',
  description text,
  balance_after numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own ledger" ON public.ledger_transactions
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 3. Return requests
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  order_item_id uuid REFERENCES public.order_items(id),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL,
  reason text NOT NULL,
  evidence_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  refund_amount numeric DEFAULT 0,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own returns" ON public.return_requests
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Buyers can view own returns" ON public.return_requests
  FOR SELECT TO authenticated
  USING (buyer_user_id = auth.uid());
CREATE POLICY "Buyers can create returns" ON public.return_requests
  FOR INSERT TO authenticated
  WITH CHECK (buyer_user_id = auth.uid());

-- 4. Refunds
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id uuid REFERENCES public.return_requests(id),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'IQD',
  status text NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own refunds" ON public.refunds
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 5. Policy issues (account health)
CREATE TABLE public.policy_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'warning',
  category text NOT NULL,
  title text NOT NULL,
  description text,
  fix_instructions text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.policy_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own issues" ON public.policy_issues
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 6. Appeals
CREATE TABLE public.appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_issue_id uuid NOT NULL REFERENCES public.policy_issues(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  message text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own appeals" ON public.appeals
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can create appeals" ON public.appeals
  FOR INSERT TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 7. Support cases
CREATE TABLE public.support_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own cases" ON public.support_cases
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can create cases" ON public.support_cases
  FOR INSERT TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update own cases" ON public.support_cases
  FOR UPDATE TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 8. Seller notifications
CREATE TABLE public.seller_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seller_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own notifications" ON public.seller_notifications
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update own notifications" ON public.seller_notifications
  FOR UPDATE TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- Enable realtime for seller_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_notifications;

-- 9. Seller onboarding steps
CREATE TABLE public.seller_onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seller_id, step_key)
);
ALTER TABLE public.seller_onboarding_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own onboarding" ON public.seller_onboarding_steps
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update own onboarding" ON public.seller_onboarding_steps
  FOR UPDATE TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can insert own onboarding" ON public.seller_onboarding_steps
  FOR INSERT TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 10. Fee rules (public read)
CREATE TABLE public.fee_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'default',
  fee_type text NOT NULL,
  percentage numeric DEFAULT 0,
  flat_amount numeric DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'IQD',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fee rules" ON public.fee_rules
  FOR SELECT USING (true);
