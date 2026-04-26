-- HERO STATS (singleton-ish, but allow multiple just in case)
CREATE TABLE public.hero_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teams_count integer NOT NULL DEFAULT 0,
  matches_count integer NOT NULL DEFAULT 0,
  goals_count integer NOT NULL DEFAULT 0,
  players_count integer NOT NULL DEFAULT 0,
  is_singleton boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats public read" ON public.hero_stats FOR SELECT USING (true);
CREATE POLICY "stats admin insert" ON public.hero_stats FOR INSERT WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "stats admin update" ON public.hero_stats FOR UPDATE USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_hero_stats_upd BEFORE UPDATE ON public.hero_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.hero_stats (teams_count, matches_count, goals_count, players_count) VALUES (16, 30, 0, 176);

-- TEAMS
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn text NOT NULL,
  name_en text NOT NULL,
  group_name text,
  coach text,
  player_count integer NOT NULL DEFAULT 0,
  color_from text DEFAULT 'oklch(0.65 0.2 25)',
  color_to text DEFAULT 'oklch(0.55 0.22 15)',
  logo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams public read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams admin all" ON public.teams FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_teams_upd BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PLAYERS
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team text,
  position text,
  jersey integer,
  goals integer NOT NULL DEFAULT 0,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "players admin all" ON public.players FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_players_upd BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FIXTURES
CREATE TABLE public.fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round text,
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date date NOT NULL,
  match_time text,
  venue text,
  status text NOT NULL DEFAULT 'scheduled',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fixtures public read" ON public.fixtures FOR SELECT USING (true);
CREATE POLICY "fixtures admin all" ON public.fixtures FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_fixtures_upd BEFORE UPDATE ON public.fixtures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RESULTS
CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  match_date date NOT NULL,
  motm text,
  scorers text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results public read" ON public.results FOR SELECT USING (true);
CREATE POLICY "results admin all" ON public.results FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_results_upd BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POINTS TABLE
CREATE TABLE public.points_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL DEFAULT 0,
  team text NOT NULL,
  played integer NOT NULL DEFAULT 0,
  won integer NOT NULL DEFAULT 0,
  drawn integer NOT NULL DEFAULT 0,
  lost integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  form text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.points_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points public read" ON public.points_table FOR SELECT USING (true);
CREATE POLICY "points admin all" ON public.points_table FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_points_upd BEFORE UPDATE ON public.points_table FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEWS
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_bn text NOT NULL,
  title_en text NOT NULL,
  excerpt_bn text,
  excerpt_en text,
  content_bn text,
  content_en text,
  category text,
  cover_url text,
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news public read" ON public.news FOR SELECT USING (is_published OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "news admin all" ON public.news FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_news_upd BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GALLERY
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption_bn text,
  caption_en text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery admin all" ON public.gallery_images FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_gallery_upd BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SPONSORS
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL DEFAULT 'gold',
  logo_url text,
  website_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors public read" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "sponsors admin all" ON public.sponsors FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_sponsors_upd BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ABOUT CONTENT (singleton)
CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description_bn text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  mission_bn text NOT NULL DEFAULT '',
  mission_en text NOT NULL DEFAULT '',
  vision_bn text NOT NULL DEFAULT '',
  vision_en text NOT NULL DEFAULT '',
  is_singleton boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about public read" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "about admin insert" ON public.about_content FOR INSERT WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "about admin update" ON public.about_content FOR UPDATE USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_about_upd BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.about_content (description_bn, description_en, mission_bn, mission_en, vision_bn, vision_en) VALUES (
  'মার্টেলো কাপ গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরার একটি গর্বিত স্থানীয় ফুটবল টুর্নামেন্ট।',
  'Martello Cup is a proud local football tournament from Gainbari, Gabura, Shyamnagar, Satkhira.',
  'স্থানীয় প্রতিভা বিকশিত করা এবং কমিউনিটিকে একত্রিত করা।',
  'Develop local talent and unite the community.',
  'একটি সমৃদ্ধ ফুটবল কমিউনিটি গড়ে তোলা।',
  'Build a thriving football community.'
);

-- COMMITTEE MEMBERS
CREATE TABLE public.committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role_bn text NOT NULL,
  role_en text NOT NULL,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "committee public read" ON public.committee_members FOR SELECT USING (true);
CREATE POLICY "committee admin all" ON public.committee_members FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_committee_upd BEFORE UPDATE ON public.committee_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONTACT INFO (singleton)
CREATE TABLE public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text DEFAULT '',
  email text DEFAULT '',
  address_bn text DEFAULT '',
  address_en text DEFAULT '',
  facebook_url text DEFAULT '',
  youtube_url text DEFAULT '',
  instagram_url text DEFAULT '',
  is_singleton boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact public read" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "contact admin insert" ON public.contact_info FOR INSERT WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "contact admin update" ON public.contact_info FOR UPDATE USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_contact_upd BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.contact_info (phone, email, address_bn, address_en) VALUES (
  '+880 1XXX XXXXXX',
  'info@martellocup.com',
  'গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরা',
  'Gainbari, Gabura, Shyamnagar, Satkhira'
);

-- STORAGE BUCKET for gallery + general media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')));
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')));
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')));