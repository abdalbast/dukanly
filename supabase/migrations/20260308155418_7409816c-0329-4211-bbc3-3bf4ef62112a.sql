CREATE TABLE public.artisan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text NOT NULL,
  craft_category text NOT NULL,
  craft_description text NOT NULL,
  production_method text NOT NULL DEFAULT 'handmade',
  years_experience integer NOT NULL DEFAULT 0,
  website_url text,
  social_media_url text,
  sample_images jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.artisan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.artisan_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.artisan_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON public.artisan_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER set_artisan_applications_updated_at
  BEFORE UPDATE ON public.artisan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();