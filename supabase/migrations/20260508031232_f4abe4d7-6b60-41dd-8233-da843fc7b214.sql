
CREATE TABLE public.ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer_bn TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  category TEXT,
  route TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active AI knowledge"
  ON public.ai_knowledge FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage AI knowledge insert"
  ON public.ai_knowledge FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage AI knowledge update"
  ON public.ai_knowledge FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage AI knowledge delete"
  ON public.ai_knowledge FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_ai_knowledge_updated_at
  BEFORE UPDATE ON public.ai_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few helpful starter entries
INSERT INTO public.ai_knowledge (question, answer_bn, answer_en, category, route, sort_order) VALUES
('How to register a team?', 'রেজিস্ট্রেশন পেজে গিয়ে দলের নাম, কোচ ও খেলোয়াড় তথ্য পূরণ করে পেমেন্ট সম্পন্ন করুন।', 'Go to the Registration page, fill in team/coach/player info, then complete payment.', 'registration', '/registration', 1),
('How to buy a ticket?', 'টিকেট পেজে গিয়ে টিকেট টিয়ার বেছে নিয়ে পেমেন্ট সম্পন্ন করুন। অনুমোদনের পরে আপনার প্রোফাইলে স্লিপ পাবেন।', 'Open the Tickets page, choose a tier, complete payment. Once approved, your slip appears in your Profile.', 'tickets', '/tickets', 2),
('How to apply as a sponsor?', 'স্পন্সর পেজে গিয়ে আপনার তথ্য দিন, প্যাকেজ বাছাই করে পেমেন্ট করুন। এডমিন অনুমোদনের পরে অটো-পাবলিশ হবে।', 'Go to the Sponsors page, fill in details, choose a package and pay. After admin approval it will auto-publish.', 'sponsors', '/sponsors', 3),
('Where is the Social Feed?', 'নেভিগেশনে Feed অপশন আছে — পোস্ট, লাইক, কমেন্ট সবকিছু সেখানে।', 'There is a Feed link in the navigation — posts, likes and comments all live there.', 'feed', '/feed', 4),
('How to view profile and orders?', 'প্রোফাইল আইকনে ক্লিক করুন — সেখানে কেনা টিকেট, জার্সি, স্পন্সর ও দল আবেদন সব দেখা যাবে।', 'Click the profile icon — your tickets, jerseys, sponsor and team applications are all listed there.', 'profile', '/profile', 5);
