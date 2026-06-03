-- 1. Tracking codes
ALTER TABLE public.jersey_orders ADD COLUMN IF NOT EXISTS tracking_code text UNIQUE;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS tracking_code text UNIQUE;

CREATE OR REPLACE FUNCTION public.generate_jersey_tracking_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE d text;
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    LOOP
      d := 'JRS-' || lpad((floor(random()*100000))::int::text,5,'0')
        || '-' || lpad((floor(random()*100000))::int::text,5,'0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.jersey_orders WHERE tracking_code = d);
    END LOOP;
    NEW.tracking_code := d;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS jersey_tracking_code_trg ON public.jersey_orders;
CREATE TRIGGER jersey_tracking_code_trg BEFORE INSERT ON public.jersey_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_jersey_tracking_code();

CREATE OR REPLACE FUNCTION public.generate_registration_tracking_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE d text;
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    LOOP
      d := 'REG-' || lpad((floor(random()*100000))::int::text,5,'0')
        || '-' || lpad((floor(random()*100000))::int::text,5,'0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.registrations WHERE tracking_code = d);
    END LOOP;
    NEW.tracking_code := d;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS reg_tracking_code_trg ON public.registrations;
CREATE TRIGGER reg_tracking_code_trg BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.generate_registration_tracking_code();

-- Backfill existing rows
UPDATE public.jersey_orders SET tracking_code =
  'JRS-' || lpad((floor(random()*100000))::int::text,5,'0') || '-' || lpad((floor(random()*100000))::int::text,5,'0')
  WHERE tracking_code IS NULL;
UPDATE public.registrations SET tracking_code =
  'REG-' || lpad((floor(random()*100000))::int::text,5,'0') || '-' || lpad((floor(random()*100000))::int::text,5,'0')
  WHERE tracking_code IS NULL;

-- 2. Public lookups (security definer; safe non-PII fields)
CREATE OR REPLACE FUNCTION public.lookup_jersey_order(_code text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'kind','jersey',
    'found', (j.id IS NOT NULL),
    'tracking_code', j.tracking_code,
    'product_name', j.product_name,
    'customer_name', j.customer_name,
    'size', j.size,
    'quantity', j.quantity,
    'total_amount', j.total_amount,
    'status', j.status,
    'created_at', j.created_at
  )
  FROM public.jersey_orders j WHERE j.tracking_code = _code LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.lookup_registration(_code text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'kind','registration',
    'found', (r.id IS NOT NULL),
    'tracking_code', r.tracking_code,
    'team_name', r.team_name,
    'short_name', r.short_name,
    'category', r.category,
    'captain_name', r.captain_name,
    'status', r.status,
    'created_at', r.created_at
  )
  FROM public.registrations r WHERE r.tracking_code = _code LIMIT 1;
$$;

-- 3. Unified scanner lookup — detects ticket / jersey / registration in one call
CREATE OR REPLACE FUNCTION public.scan_any_code(_code text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF _code LIKE 'JRS-%' THEN
    SELECT public.lookup_jersey_order(_code) INTO result;
    RETURN COALESCE(result, jsonb_build_object('kind','jersey','found',false));
  ELSIF _code LIKE 'REG-%' THEN
    SELECT public.lookup_registration(_code) INTO result;
    RETURN COALESCE(result, jsonb_build_object('kind','registration','found',false));
  ELSE
    -- treat as ticket
    SELECT jsonb_build_object(
      'kind','ticket','found',(t.id IS NOT NULL),
      'ticket_code',t.ticket_code,'payer_name',t.payer_name,
      'tier',t.ticket_tier_name,'amount',t.amount,
      'status',t.status,'used_at',t.used_at
    ) INTO result
    FROM public.payment_submissions t
    WHERE t.ticket_code = _code AND t.submission_type='ticket' LIMIT 1;
    RETURN COALESCE(result, jsonb_build_object('kind','ticket','found',false));
  END IF;
END $$;

-- 4. Admin auto-friend: relax get_or_create_conversation so admins can DM anyone
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u1 uuid; u2 uuid; conv_id uuid;
  caller uuid := auth.uid();
  caller_is_admin boolean;
  other_is_admin boolean;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF caller = other_user THEN RAISE EXCEPTION 'cannot chat self'; END IF;

  caller_is_admin := has_role(caller,'super_admin') OR has_role(caller,'admin');
  other_is_admin := has_role(other_user,'super_admin') OR has_role(other_user,'admin');

  IF NOT (caller_is_admin OR other_is_admin) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status='accepted'
        AND ((requester_id=caller AND receiver_id=other_user)
          OR (requester_id=other_user AND receiver_id=caller))
    ) THEN RAISE EXCEPTION 'not friends'; END IF;
  END IF;

  IF caller < other_user THEN u1:=caller; u2:=other_user;
  ELSE u1:=other_user; u2:=caller; END IF;

  SELECT id INTO conv_id FROM public.conversations WHERE user1_id=u1 AND user2_id=u2;
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (user1_id,user2_id) VALUES (u1,u2) RETURNING id INTO conv_id;
  END IF;
  RETURN conv_id;
END $$;

-- 5. Helper: list admin user_ids for client to show "auto-friend" UI
CREATE OR REPLACE FUNCTION public.list_admin_user_ids()
RETURNS TABLE(user_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT user_id FROM public.user_roles
  WHERE role IN ('super_admin','admin');
$$;