
-- 1) Server-side payment submission validation + promo enforcement
CREATE OR REPLACE FUNCTION public.payment_submission_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base numeric;
  p public.promo_codes%ROWTYPE;
  disc numeric := 0;
BEGIN
  -- Canonical base price
  IF NEW.submission_type = 'ticket' AND NEW.ticket_tier_id IS NOT NULL THEN
    SELECT price INTO base FROM public.ticket_tiers WHERE id = NEW.ticket_tier_id;
  ELSIF NEW.submission_type = 'jersey' AND NEW.jersey_order_id IS NOT NULL THEN
    SELECT total_amount INTO base FROM public.jersey_orders WHERE id = NEW.jersey_order_id;
  END IF;
  IF base IS NULL THEN base := COALESCE(NEW.amount, 0); END IF;

  -- Promo validation + atomic increment
  IF NEW.promo_code IS NOT NULL AND length(trim(NEW.promo_code)) > 0 THEN
    SELECT * INTO p FROM public.promo_codes
      WHERE upper(code) = upper(trim(NEW.promo_code)) AND is_active = true
      FOR UPDATE;
    IF FOUND
       AND (p.expires_at IS NULL OR p.expires_at > now())
       AND (p.max_uses IS NULL OR p.used_count < p.max_uses)
       AND (p.applies_to = 'all' OR p.applies_to = NEW.submission_type) THEN
      IF p.discount_type = 'percentage' THEN
        disc := round((base * p.discount_value) / 100);
      ELSE
        disc := p.discount_value;
      END IF;
      disc := LEAST(GREATEST(disc, 0), base);
      UPDATE public.promo_codes SET used_count = used_count + 1, updated_at = now() WHERE id = p.id;
      NEW.promo_code := upper(p.code);
    ELSE
      NEW.promo_code := NULL;
      disc := 0;
    END IF;
  ELSE
    disc := 0;
  END IF;

  NEW.discount_amount := disc;
  NEW.amount := GREATEST(base - disc, 0);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS payment_submission_validate_trg ON public.payment_submissions;
CREATE TRIGGER payment_submission_validate_trg
BEFORE INSERT ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.payment_submission_validate();

-- 2) Restrict ticket lookup to signed-in staff
REVOKE EXECUTE ON FUNCTION public.lookup_ticket(text) FROM anon;
