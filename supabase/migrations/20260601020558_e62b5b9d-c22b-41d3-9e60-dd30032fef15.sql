-- FRIENDSHIPS
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id <> receiver_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships read own" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships insert as requester" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships update by participant" ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships delete by participant" ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_receiver ON public.friendships(receiver_id);

CREATE TRIGGER trg_friendships_updated BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONVERSATIONS (1-to-1)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv read own" ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv insert own" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv update own" ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX idx_conv_user1 ON public.conversations(user1_id);
CREATE INDEX idx_conv_user2 ON public.conversations(user2_id);

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  media_url text,
  media_type text NOT NULL DEFAULT 'text' CHECK (media_type IN ('text','image','video','audio','file')),
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msg read in own conv" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "msg insert as sender in own conv" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "msg update own" ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);
CREATE POLICY "msg delete own" ON public.messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at DESC);

-- Helper RPC: get or create conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u1 uuid;
  u2 uuid;
  conv_id uuid;
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF caller = other_user THEN RAISE EXCEPTION 'cannot chat self'; END IF;

  -- Must be accepted friends
  IF NOT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = caller AND receiver_id = other_user)
        OR (requester_id = other_user AND receiver_id = caller))
  ) THEN RAISE EXCEPTION 'not friends'; END IF;

  IF caller < other_user THEN u1 := caller; u2 := other_user;
  ELSE u1 := other_user; u2 := caller; END IF;

  SELECT id INTO conv_id FROM public.conversations WHERE user1_id = u1 AND user2_id = u2;
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (user1_id, user2_id) VALUES (u1, u2) RETURNING id INTO conv_id;
  END IF;
  RETURN conv_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid) TO authenticated;

-- Bump conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION public.bump_conversation_last_message()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_bump_conv AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_message();

-- Enable realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Storage policies for 'media' bucket (chat folder)
CREATE POLICY "chat media authed read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media');
CREATE POLICY "chat media authed insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);