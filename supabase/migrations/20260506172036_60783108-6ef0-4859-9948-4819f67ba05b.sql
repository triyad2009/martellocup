
-- Sponsors enhancements
ALTER TABLE public.sponsors 
  ADD COLUMN IF NOT EXISTS description_bn text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric;

-- Replace public read policy to only show approved sponsors
DROP POLICY IF EXISTS "sponsors public read" ON public.sponsors;
CREATE POLICY "sponsors public read approved" ON public.sponsors
  FOR SELECT USING (status = 'approved' OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

-- Allow public to submit pending sponsor applications
CREATE POLICY "sponsors public submit pending" ON public.sponsors
  FOR INSERT WITH CHECK (status = 'pending');

-- Sponsor packages (admin-set prices per tier)
CREATE TABLE IF NOT EXISTS public.sponsor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL UNIQUE,
  price numeric NOT NULL DEFAULT 0,
  benefits_bn text NOT NULL DEFAULT '',
  benefits_en text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsor_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsor packages public read" ON public.sponsor_packages FOR SELECT USING (true);
CREATE POLICY "sponsor packages admin all" ON public.sponsor_packages FOR ALL
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

INSERT INTO public.sponsor_packages (tier, price) VALUES
  ('gold', 50000), ('silver', 20000), ('bronze', 5000)
ON CONFLICT (tier) DO NOTHING;

-- Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  applies_to text NOT NULL DEFAULT 'all',
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo codes public read active" ON public.promo_codes FOR SELECT USING (is_active);
CREATE POLICY "promo codes admin all" ON public.promo_codes FOR ALL
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

-- payment_submissions: add sponsor + promo
ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS sponsor_id uuid,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;

-- Allow 'sponsor' submission type
-- (no constraint enforced; submission_type is free text)

-- jersey_orders: add promo
ALTER TABLE public.jersey_orders
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;
