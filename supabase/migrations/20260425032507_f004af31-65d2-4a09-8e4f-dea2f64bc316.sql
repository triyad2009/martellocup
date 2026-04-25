
CREATE TABLE public.ticket_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active tiers viewable by everyone"
ON public.ticket_tiers FOR SELECT
USING (is_active OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage tiers"
ON public.ticket_tiers FOR ALL
USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE TRIGGER update_ticket_tiers_updated_at
BEFORE UPDATE ON public.ticket_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.payment_submissions
ADD COLUMN ticket_tier_id uuid REFERENCES public.ticket_tiers(id) ON DELETE SET NULL,
ADD COLUMN ticket_tier_name text;
