-- Tournament settings (singleton)
CREATE TABLE public.tournament_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name text NOT NULL DEFAULT 'Football.Connectivity.Happiness',
  tagline text NOT NULL DEFAULT 'Martello Cup',
  location text NOT NULL DEFAULT 'Gainbari, Gabura, Shyamnagar, Satkhira',
  tournament_start timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  hero_logo_url text,
  is_singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone"
  ON public.tournament_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert settings"
  ON public.tournament_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can update settings"
  ON public.tournament_settings FOR UPDATE
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE TRIGGER tournament_settings_updated_at
BEFORE UPDATE ON public.tournament_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.tournament_settings (season_name, tagline, location)
VALUES ('Football.Connectivity.Happiness', 'Martello Cup', 'Gainbari, Gabura, Shyamnagar, Satkhira');

-- Payment methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  account_number text NOT NULL,
  instructions text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active methods viewable by everyone"
  ON public.payment_methods FOR SELECT USING (is_active OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage payment methods"
  ON public.payment_methods FOR ALL
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE TRIGGER payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payment submissions
CREATE TABLE public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL DEFAULT 'ticket',
  payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  payment_method_name text,
  amount numeric(10,2),
  payer_name text NOT NULL,
  payer_phone text NOT NULL,
  transaction_id text,
  sender_last4 text NOT NULL,
  registration_id uuid,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit payment"
  ON public.payment_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view payments"
  ON public.payment_submissions FOR SELECT
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins update payments"
  ON public.payment_submissions FOR UPDATE
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete payments"
  ON public.payment_submissions FOR DELETE
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE TRIGGER payment_submissions_updated_at
BEFORE UPDATE ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();