
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.portal_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('viewer','manager','treasurer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_credentials TO service_role;
ALTER TABLE public.portal_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read credentials" ON public.portal_credentials FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES public.portal_credentials(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_sessions TO service_role;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.portal_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_submission_id UUID UNIQUE REFERENCES public.payment_submissions(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  collected_by TEXT,
  method TEXT NOT NULL DEFAULT 'cash',
  note TEXT,
  receipt_url TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by_credential UUID REFERENCES public.portal_credentials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_income TO service_role;
ALTER TABLE public.portal_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read income" ON public.portal_income FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.portal_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'misc',
  amount NUMERIC NOT NULL,
  vendor TEXT,
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by_credential UUID REFERENCES public.portal_credentials(id) ON DELETE SET NULL,
  decided_by_credential UUID REFERENCES public.portal_credentials(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_expenses TO service_role;
ALTER TABLE public.portal_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read expenses" ON public.portal_expenses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.portal_expense_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.portal_expenses(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_expense_slips TO service_role;
ALTER TABLE public.portal_expense_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read slips" ON public.portal_expense_slips FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.sync_payment_to_portal_income()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.portal_income (source_submission_id, amount, source_name, source_type, method, note, entry_date)
    VALUES (
      NEW.id,
      COALESCE(NEW.amount, 0),
      COALESCE(NEW.payer_name, 'Unknown'),
      NEW.submission_type,
      'online',
      CASE WHEN NEW.submission_type = 'ticket' THEN 'Ticket: '||COALESCE(NEW.ticket_tier_name,'')
           WHEN NEW.submission_type = 'jersey' THEN 'Jersey order'
           ELSE 'Sponsor / other' END,
      NEW.created_at::date
    )
    ON CONFLICT (source_submission_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_payment_income ON public.payment_submissions;
CREATE TRIGGER trg_sync_payment_income
AFTER INSERT OR UPDATE OF status ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.sync_payment_to_portal_income();

INSERT INTO public.portal_income (source_submission_id, amount, source_name, source_type, method, note, entry_date)
SELECT id, COALESCE(amount,0), COALESCE(payer_name,'Unknown'), submission_type, 'online',
       CASE WHEN submission_type='ticket' THEN 'Ticket: '||COALESCE(ticket_tier_name,'')
            WHEN submission_type='jersey' THEN 'Jersey order'
            ELSE 'Sponsor / other' END,
       created_at::date
FROM public.payment_submissions WHERE status='approved'
ON CONFLICT (source_submission_id) DO NOTHING;

CREATE TRIGGER trg_portal_credentials_updated BEFORE UPDATE ON public.portal_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_expenses_updated BEFORE UPDATE ON public.portal_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.portal_login(_username TEXT, _password TEXT, _user_agent TEXT DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.portal_credentials%ROWTYPE; raw_token TEXT; tok_hash TEXT;
BEGIN
  SELECT * INTO c FROM public.portal_credentials
    WHERE lower(username) = lower(_username) AND is_active = true LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  IF c.password_hash <> crypt(_password, c.password_hash) THEN
    RETURN jsonb_build_object('ok',false,'reason','invalid');
  END IF;
  raw_token := encode(gen_random_bytes(32), 'hex');
  tok_hash := encode(digest(raw_token, 'sha256'), 'hex');
  INSERT INTO public.portal_sessions (credential_id, token_hash, expires_at, user_agent)
    VALUES (c.id, tok_hash, now() + interval '24 hours', _user_agent);
  UPDATE public.portal_credentials SET last_login_at = now() WHERE id = c.id;
  RETURN jsonb_build_object('ok',true,'token',raw_token,'credential', jsonb_build_object(
    'id',c.id,'label',c.label,'username',c.username,'role',c.role
  ));
END $$;
GRANT EXECUTE ON FUNCTION public.portal_login(TEXT,TEXT,TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_validate_token(_token TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tok_hash TEXT; s public.portal_sessions%ROWTYPE; c public.portal_credentials%ROWTYPE;
BEGIN
  IF _token IS NULL OR length(_token) < 10 THEN RETURN jsonb_build_object('ok',false); END IF;
  tok_hash := encode(digest(_token,'sha256'),'hex');
  SELECT * INTO s FROM public.portal_sessions WHERE token_hash = tok_hash AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
  SELECT * INTO c FROM public.portal_credentials WHERE id = s.credential_id AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
  RETURN jsonb_build_object('ok',true,'credential',jsonb_build_object(
    'id',c.id,'label',c.label,'username',c.username,'role',c.role
  ));
END $$;
GRANT EXECUTE ON FUNCTION public.portal_validate_token(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_list_income(_token TEXT)
RETURNS SETOF public.portal_income LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb;
BEGIN
  v := public.portal_validate_token(_token);
  IF NOT (v->>'ok')::boolean THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY SELECT * FROM public.portal_income ORDER BY entry_date DESC, created_at DESC;
END $$;
GRANT EXECUTE ON FUNCTION public.portal_list_income(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_list_expenses(_token TEXT)
RETURNS TABLE(id UUID, title TEXT, category TEXT, amount NUMERIC, vendor TEXT, description TEXT,
              entry_date DATE, status TEXT, requested_by_credential UUID, decided_by_credential UUID,
              decided_at TIMESTAMPTZ, decision_note TEXT, created_at TIMESTAMPTZ, slips JSONB)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb;
BEGIN
  v := public.portal_validate_token(_token);
  IF NOT (v->>'ok')::boolean THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT e.id,e.title,e.category,e.amount,e.vendor,e.description,e.entry_date,e.status,
           e.requested_by_credential,e.decided_by_credential,e.decided_at,e.decision_note,e.created_at,
           COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'file_url',s.file_url,'file_type',s.file_type))
             FROM public.portal_expense_slips s WHERE s.expense_id = e.id), '[]'::jsonb) AS slips
    FROM public.portal_expenses e ORDER BY e.created_at DESC;
END $$;
GRANT EXECUTE ON FUNCTION public.portal_list_expenses(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_add_income(_token TEXT, _amount NUMERIC, _source_name TEXT,
  _collected_by TEXT, _method TEXT, _note TEXT, _receipt_url TEXT, _entry_date DATE)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb; cid UUID;
BEGIN
  v := public.portal_validate_token(_token);
  IF NOT (v->>'ok')::boolean THEN RAISE EXCEPTION 'unauthorized'; END IF;
  cid := ((v->'credential')->>'id')::uuid;
  INSERT INTO public.portal_income (amount, source_name, source_type, collected_by, method, note, receipt_url, entry_date, created_by_credential)
    VALUES (_amount, _source_name, 'manual', _collected_by, COALESCE(_method,'cash'), _note, _receipt_url, COALESCE(_entry_date, CURRENT_DATE), cid);
  RETURN jsonb_build_object('ok',true);
END $$;
GRANT EXECUTE ON FUNCTION public.portal_add_income(TEXT,NUMERIC,TEXT,TEXT,TEXT,TEXT,TEXT,DATE) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_submit_expense(_token TEXT, _title TEXT, _category TEXT,
  _amount NUMERIC, _vendor TEXT, _description TEXT, _entry_date DATE, _slip_urls TEXT[])
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb; cid UUID; new_id UUID; u TEXT;
BEGIN
  v := public.portal_validate_token(_token);
  IF NOT (v->>'ok')::boolean THEN RAISE EXCEPTION 'unauthorized'; END IF;
  cid := ((v->'credential')->>'id')::uuid;
  INSERT INTO public.portal_expenses (title,category,amount,vendor,description,entry_date,requested_by_credential)
    VALUES (_title, COALESCE(_category,'misc'), _amount, _vendor, _description, COALESCE(_entry_date, CURRENT_DATE), cid)
    RETURNING id INTO new_id;
  IF _slip_urls IS NOT NULL THEN
    FOREACH u IN ARRAY _slip_urls LOOP
      INSERT INTO public.portal_expense_slips (expense_id, file_url) VALUES (new_id, u);
    END LOOP;
  END IF;
  RETURN jsonb_build_object('ok',true,'id',new_id);
END $$;
GRANT EXECUTE ON FUNCTION public.portal_submit_expense(TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,DATE,TEXT[]) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.portal_decide_expense(_token TEXT, _expense_id UUID, _decision TEXT, _note TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb; cid UUID; role_txt TEXT;
BEGIN
  v := public.portal_validate_token(_token);
  IF NOT (v->>'ok')::boolean THEN RAISE EXCEPTION 'unauthorized'; END IF;
  cid := ((v->'credential')->>'id')::uuid;
  role_txt := (v->'credential')->>'role';
  IF role_txt NOT IN ('treasurer','manager') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'bad decision'; END IF;
  UPDATE public.portal_expenses
    SET status=_decision, decided_by_credential=cid, decided_at=now(), decision_note=_note
    WHERE id=_expense_id;
  RETURN jsonb_build_object('ok',true);
END $$;
GRANT EXECUTE ON FUNCTION public.portal_decide_expense(TEXT,UUID,TEXT,TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_portal_credential(_label TEXT, _username TEXT, _password TEXT, _role TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller UUID := auth.uid(); new_id UUID;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF NOT (public.has_role(caller,'super_admin') OR public.has_role(caller,'admin')) THEN
    RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.portal_credentials (label,username,password_hash,role,created_by)
    VALUES (_label, lower(_username), crypt(_password, gen_salt('bf', 10)), COALESCE(_role,'manager'), caller)
    RETURNING id INTO new_id;
  RETURN jsonb_build_object('ok',true,'id',new_id);
END $$;
GRANT EXECUTE ON FUNCTION public.admin_create_portal_credential(TEXT,TEXT,TEXT,TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_portal_credential_active(_id UUID, _active BOOLEAN)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller UUID := auth.uid();
BEGIN
  IF caller IS NULL OR NOT (public.has_role(caller,'super_admin') OR public.has_role(caller,'admin')) THEN
    RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.portal_credentials SET is_active=_active WHERE id=_id;
  RETURN jsonb_build_object('ok',true);
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_portal_credential_active(UUID,BOOLEAN) TO authenticated;
