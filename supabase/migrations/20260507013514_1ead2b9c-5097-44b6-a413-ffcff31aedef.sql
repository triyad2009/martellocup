-- Profiles: add phone & full_name
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS full_name text;

-- Link user accounts to their submissions (nullable to keep public anon flow working)
ALTER TABLE public.jersey_orders        ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.payment_submissions  ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.sponsors             ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.registrations        ADD COLUMN IF NOT EXISTS user_id uuid;

-- Ticket slip code (15 digits, formatted XXXXX-XXXXX-XXXXX) on approved ticket payments
ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS ticket_code text UNIQUE;

-- Allow users to view their own rows
DROP POLICY IF EXISTS "Users view own jersey orders" ON public.jersey_orders;
CREATE POLICY "Users view own jersey orders" ON public.jersey_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own payments" ON public.payment_submissions;
CREATE POLICY "Users view own payments" ON public.payment_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own sponsors" ON public.sponsors;
CREATE POLICY "Users view own sponsors" ON public.sponsors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own registrations" ON public.registrations;
CREATE POLICY "Users view own registrations" ON public.registrations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Auto-generate a 15-digit ticket_code (formatted 5-5-5) when a ticket payment is approved
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  d text;
BEGIN
  IF NEW.submission_type = 'ticket'
     AND NEW.status = 'approved'
     AND (NEW.ticket_code IS NULL OR NEW.ticket_code = '') THEN
    LOOP
      d := lpad((floor(random() * 100000))::int::text, 5, '0')
        || '-' || lpad((floor(random() * 100000))::int::text, 5, '0')
        || '-' || lpad((floor(random() * 100000))::int::text, 5, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.payment_submissions WHERE ticket_code = d);
    END LOOP;
    NEW.ticket_code := d;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_ticket_code ON public.payment_submissions;
CREATE TRIGGER trg_payment_ticket_code
  BEFORE INSERT OR UPDATE ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_code();