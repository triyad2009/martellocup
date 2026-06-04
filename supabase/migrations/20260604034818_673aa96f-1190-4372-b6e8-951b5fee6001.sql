
-- 1) PROFILES: restrict to authenticated
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- 2) MEMBERS: drop public read with phone; allow authenticated full read; public view without phone/email contact-only
DROP POLICY IF EXISTS "members public read" ON public.members;
CREATE POLICY "members authenticated read"
  ON public.members FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE VIEW public.members_public
WITH (security_invoker=on) AS
SELECT id, name, role_bn, role_en, role_sat, bio_bn, bio_en, bio_sat,
       photo_url, facebook_url, instagram_url, youtube_url, tiktok_url, whatsapp_url,
       sort_order, created_at, updated_at
FROM public.members;

GRANT SELECT ON public.members_public TO anon, authenticated;

-- Allow public view to bypass base-table RLS by exposing only the safe columns through an additional policy.
-- Because security_invoker is on, viewers query members directly — we need an anon select policy that ONLY
-- works when accessed through the view. Easiest: keep base table authenticated-only and re-create the view
-- as a SECURITY DEFINER view via a function-backed approach instead.
DROP VIEW IF EXISTS public.members_public;

CREATE OR REPLACE FUNCTION public.list_members_public()
RETURNS TABLE(
  id uuid, name text, role_bn text, role_en text, role_sat text,
  bio_bn text, bio_en text, bio_sat text, photo_url text,
  facebook_url text, instagram_url text, youtube_url text, tiktok_url text, whatsapp_url text,
  sort_order int, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, name, role_bn, role_en, role_sat, bio_bn, bio_en, bio_sat,
         photo_url, facebook_url, instagram_url, youtube_url, tiktok_url, whatsapp_url,
         sort_order, created_at, updated_at
  FROM public.members ORDER BY sort_order ASC;
$$;
GRANT EXECUTE ON FUNCTION public.list_members_public() TO anon, authenticated;

-- 3) JERSEY_ORDERS: remove public blanket SELECT, require auth for insert
DROP POLICY IF EXISTS "Public can lookup order by id" ON public.jersey_orders;
DROP POLICY IF EXISTS "Anyone can submit jersey order" ON public.jersey_orders;
CREATE POLICY "Authenticated can submit jersey order"
  ON public.jersey_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4) REGISTRATIONS: remove approved public read, require auth for insert
DROP POLICY IF EXISTS "Approved registrations are public" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.registrations;
CREATE POLICY "Authenticated can submit a registration"
  ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Safe public listing of approved team names only via function
CREATE OR REPLACE FUNCTION public.list_approved_teams()
RETURNS TABLE(id uuid, team_name text, short_name text, category text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, team_name, short_name, category, created_at
  FROM public.registrations WHERE status='approved' ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.list_approved_teams() TO anon, authenticated;

-- 5) PROMO_CODES: drop public listing; provide validate function
DROP POLICY IF EXISTS "promo codes public read active" ON public.promo_codes;

CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text, _applies_to text, _base_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE p public.promo_codes%ROWTYPE; disc numeric;
BEGIN
  SELECT * INTO p FROM public.promo_codes
    WHERE upper(code) = upper(_code) AND is_active = true LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok',false,'reason','invalid');
  END IF;
  IF p.expires_at IS NOT NULL AND p.expires_at < now() THEN
    RETURN jsonb_build_object('ok',false,'reason','expired');
  END IF;
  IF p.max_uses IS NOT NULL AND p.used_count >= p.max_uses THEN
    RETURN jsonb_build_object('ok',false,'reason','limit_reached');
  END IF;
  IF p.applies_to <> 'all' AND p.applies_to <> _applies_to THEN
    RETURN jsonb_build_object('ok',false,'reason','not_applicable');
  END IF;
  IF p.discount_type = 'percentage' THEN
    disc := round((_base_amount * p.discount_value) / 100);
  ELSE
    disc := p.discount_value;
  END IF;
  disc := LEAST(disc, _base_amount);
  RETURN jsonb_build_object('ok',true,'code',upper(p.code),'discount',disc);
END $$;
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text,text,numeric) TO anon, authenticated;

-- 6) Storage: drop broad listing on media bucket; keep public-URL access (works without RLS for public buckets)
DROP POLICY IF EXISTS "media public read" ON storage.objects;

-- 7) Revoke EXECUTE on sensitive SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.get_or_create_conversation(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_ticket(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_admin_user_ids() FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_admin_user_ids() FROM authenticated;
