
-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories read authenticated" ON public.stories
  FOR SELECT TO authenticated USING (expires_at > now());
CREATE POLICY "stories insert own" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories delete own or admin" ON public.stories
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
  );

CREATE INDEX idx_stories_expires ON public.stories(expires_at DESC);
CREATE INDEX idx_stories_user ON public.stories(user_id);

-- Tagging support: simple uuid[] columns
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS tagged_user_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.feed_comments ADD COLUMN IF NOT EXISTS tagged_user_ids uuid[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_feed_posts_tags ON public.feed_posts USING GIN (tagged_user_ids);
CREATE INDEX IF NOT EXISTS idx_feed_comments_tags ON public.feed_comments USING GIN (tagged_user_ids);

-- Ticket redemption columns
ALTER TABLE public.payment_submissions ADD COLUMN IF NOT EXISTS used_at timestamptz;
ALTER TABLE public.payment_submissions ADD COLUMN IF NOT EXISTS used_by uuid;

-- Public lookup (read-only summary)
CREATE OR REPLACE FUNCTION public.lookup_ticket(_code text)
RETURNS TABLE (
  id uuid,
  ticket_code text,
  payer_name text,
  ticket_tier_name text,
  amount numeric,
  status text,
  used_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, ticket_code, payer_name, ticket_tier_name, amount, status, used_at, created_at
  FROM public.payment_submissions
  WHERE ticket_code = _code AND submission_type = 'ticket'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_ticket(text) TO anon, authenticated;

-- Redeem ticket (admin / moderator only)
CREATE OR REPLACE FUNCTION public.redeem_ticket(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  rec public.payment_submissions%ROWTYPE;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  IF NOT (
    has_role(caller, 'super_admin')
    OR has_role(caller, 'admin')
    OR has_role(caller, 'match_manager')
    OR has_role(caller, 'media_manager')
    OR has_role(caller, 'content_manager')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT * INTO rec FROM public.payment_submissions
  WHERE ticket_code = _code AND submission_type = 'ticket'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF rec.status <> 'approved' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_approved', 'status', rec.status);
  END IF;

  IF rec.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', false, 'reason', 'already_used',
      'used_at', rec.used_at,
      'payer_name', rec.payer_name,
      'tier', rec.ticket_tier_name
    );
  END IF;

  UPDATE public.payment_submissions
  SET used_at = now(), used_by = caller
  WHERE id = rec.id;

  RETURN jsonb_build_object(
    'ok', true,
    'payer_name', rec.payer_name,
    'tier', rec.ticket_tier_name,
    'amount', rec.amount,
    'code', rec.ticket_code
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_ticket(text) TO authenticated;

-- Realtime for stories
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
