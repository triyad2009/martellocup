
CREATE TABLE public.wc_participants (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  flag_emoji TEXT,
  photo_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.wc_participants TO authenticated;
GRANT SELECT ON public.wc_participants TO anon;
GRANT ALL ON public.wc_participants TO service_role;
ALTER TABLE public.wc_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_participants read all" ON public.wc_participants FOR SELECT USING (true);
CREATE POLICY "wc_participants insert self" ON public.wc_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wc_participants update self" ON public.wc_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER wc_participants_updated BEFORE UPDATE ON public.wc_participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wc_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  flag_emoji TEXT,
  photo_url TEXT,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.wc_chat_messages TO authenticated;
GRANT SELECT ON public.wc_chat_messages TO anon;
GRANT ALL ON public.wc_chat_messages TO service_role;
ALTER TABLE public.wc_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_chat read all" ON public.wc_chat_messages FOR SELECT USING (true);
CREATE POLICY "wc_chat insert self" ON public.wc_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.wc_participants WHERE user_id = auth.uid()));
CREATE POLICY "wc_chat delete self" ON public.wc_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX wc_chat_created_idx ON public.wc_chat_messages(created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.wc_chat_messages;

CREATE TABLE public.wc_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bn TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  points INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_quiz_questions TO authenticated, anon;
GRANT ALL ON public.wc_quiz_questions TO service_role;
ALTER TABLE public.wc_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_quiz read all" ON public.wc_quiz_questions FOR SELECT USING (is_active = true);
CREATE POLICY "wc_quiz admin manage" ON public.wc_quiz_questions FOR ALL TO authenticated USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

CREATE TABLE public.wc_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.wc_quiz_questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);
GRANT SELECT, INSERT ON public.wc_quiz_attempts TO authenticated;
GRANT ALL ON public.wc_quiz_attempts TO service_role;
ALTER TABLE public.wc_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_attempts read self" ON public.wc_quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wc_attempts insert self" ON public.wc_quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wc_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER NOT NULL CHECK (home_score BETWEEN 0 AND 20),
  away_score INTEGER NOT NULL CHECK (away_score BETWEEN 0 AND 20),
  points_earned INTEGER NOT NULL DEFAULT 0,
  match_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);
GRANT SELECT, INSERT, UPDATE ON public.wc_predictions TO authenticated;
GRANT ALL ON public.wc_predictions TO service_role;
ALTER TABLE public.wc_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_pred read self" ON public.wc_predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wc_pred insert self" ON public.wc_predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wc_pred update self" ON public.wc_predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wc_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wc_game_scores TO authenticated;
GRANT ALL ON public.wc_game_scores TO service_role;
ALTER TABLE public.wc_game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_game read self" ON public.wc_game_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wc_game insert self" ON public.wc_game_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.wc_award_points(_points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.wc_participants SET total_points = total_points + GREATEST(_points,0), updated_at = now() WHERE user_id = caller;
END $$;
GRANT EXECUTE ON FUNCTION public.wc_award_points(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.wc_leaderboard(_limit INTEGER DEFAULT 10)
RETURNS TABLE(country_code TEXT, country_name TEXT, flag_emoji TEXT, total_points BIGINT, member_count BIGINT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT country_code, MAX(country_name) AS country_name, MAX(flag_emoji) AS flag_emoji,
         SUM(total_points)::BIGINT AS total_points, COUNT(*)::BIGINT AS member_count
  FROM public.wc_participants
  GROUP BY country_code
  ORDER BY total_points DESC, member_count DESC
  LIMIT GREATEST(_limit,1);
$$;
GRANT EXECUTE ON FUNCTION public.wc_leaderboard(INTEGER) TO authenticated, anon;

INSERT INTO public.wc_quiz_questions (question_bn, question_en, options, correct_index, points) VALUES
('সবচেয়ে বেশি বিশ্বকাপ কোন দল জিতেছে?', 'Which country has won the most World Cups?', '[{"bn":"ব্রাজিল","en":"Brazil"},{"bn":"জার্মানি","en":"Germany"},{"bn":"ইতালি","en":"Italy"},{"bn":"আর্জেন্টিনা","en":"Argentina"}]'::jsonb, 0, 10),
('প্রথম বিশ্বকাপ কত সালে হয়েছিল?', 'In which year was the first World Cup held?', '[{"bn":"১৯২৮","en":"1928"},{"bn":"১৯৩০","en":"1930"},{"bn":"১৯৩২","en":"1932"},{"bn":"১৯৩৪","en":"1934"}]'::jsonb, 1, 10),
('২০২২ বিশ্বকাপ কে জিতেছে?', 'Who won the 2022 World Cup?', '[{"bn":"ফ্রান্স","en":"France"},{"bn":"ব্রাজিল","en":"Brazil"},{"bn":"আর্জেন্টিনা","en":"Argentina"},{"bn":"ক্রোয়েশিয়া","en":"Croatia"}]'::jsonb, 2, 15),
('লিওনেল মেসি কোন দেশের?', 'Lionel Messi plays for which country?', '[{"bn":"ব্রাজিল","en":"Brazil"},{"bn":"স্পেন","en":"Spain"},{"bn":"পর্তুগাল","en":"Portugal"},{"bn":"আর্জেন্টিনা","en":"Argentina"}]'::jsonb, 3, 5),
('২০২৬ বিশ্বকাপ কোথায় হবে?', 'Where will the 2026 World Cup be held?', '[{"bn":"যুক্তরাষ্ট্র, কানাডা, মেক্সিকো","en":"USA, Canada, Mexico"},{"bn":"কাতার","en":"Qatar"},{"bn":"স্পেন","en":"Spain"},{"bn":"সৌদি আরব","en":"Saudi Arabia"}]'::jsonb, 0, 10);
