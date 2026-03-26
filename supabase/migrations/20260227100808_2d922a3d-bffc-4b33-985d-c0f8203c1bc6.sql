
-- Add drop_id and call_id to matchmaking_queue
ALTER TABLE public.matchmaking_queue ADD COLUMN drop_id uuid REFERENCES public.drops(id) ON DELETE CASCADE;
ALTER TABLE public.matchmaking_queue ADD COLUMN call_id uuid REFERENCES public.calls(id);
ALTER TABLE public.matchmaking_queue ADD CONSTRAINT matchmaking_queue_user_drop_unique UNIQUE(user_id, drop_id);
CREATE INDEX idx_matchmaking_queue_drop_status ON public.matchmaking_queue(drop_id, status, joined_at);

-- Enable realtime for messages only (matchmaking_queue and calls already in publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- user_blocks table
CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can view own blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Storage bucket for selfie verifications
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Users can upload own selfies" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verifications' AND (storage.foldername(name))[1] = 'selfies' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Users can view own selfies" ON storage.objects FOR SELECT USING (bucket_id = 'verifications' AND (storage.foldername(name))[2] = auth.uid()::text);
