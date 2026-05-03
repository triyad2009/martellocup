
-- MEMBERS DIRECTORY
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role_bn TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  role_sat TEXT NOT NULL DEFAULT '',
  bio_bn TEXT DEFAULT '',
  bio_en TEXT DEFAULT '',
  bio_sat TEXT DEFAULT '',
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  whatsapp_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members public read" ON public.members FOR SELECT USING (true);
CREATE POLICY "members admin all" ON public.members FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_members_updated BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FEED POSTS
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'video'
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed posts authenticated read" ON public.feed_posts FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "feed posts insert own" ON public.feed_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed posts update own" ON public.feed_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "feed posts delete own or admin" ON public.feed_posts FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER trg_feed_posts_updated BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FEED LIKES
CREATE TABLE public.feed_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed likes authenticated read" ON public.feed_likes FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "feed likes insert own" ON public.feed_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed likes delete own" ON public.feed_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- FEED COMMENTS
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed comments authenticated read" ON public.feed_comments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "feed comments insert own" ON public.feed_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed comments update own" ON public.feed_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "feed comments delete own or admin" ON public.feed_comments FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER trg_feed_comments_updated BEFORE UPDATE ON public.feed_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_feed_posts_created ON public.feed_posts(created_at DESC);
CREATE INDEX idx_feed_likes_post ON public.feed_likes(post_id);
CREATE INDEX idx_feed_comments_post ON public.feed_comments(post_id, created_at);
