
-- ============================================
-- Verity vNext: Drops + Trust + Reports + Moderation
-- ============================================

-- 1. DROPS table
CREATE TABLE public.drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  region text NOT NULL DEFAULT 'AU',
  timezone text NOT NULL DEFAULT 'Australia/Sydney',
  max_capacity integer NOT NULL DEFAULT 50,
  is_friendfluence boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view drops"
  ON public.drops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage drops"
  ON public.drops FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. DROP_RSVPS table
CREATE TABLE public.drop_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid REFERENCES public.drops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  friend_invite_code text,
  rsvp_at timestamptz NOT NULL DEFAULT now(),
  checked_in boolean NOT NULL DEFAULT false,
  UNIQUE(drop_id, user_id)
);

ALTER TABLE public.drop_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RSVPs"
  ON public.drop_rsvps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can RSVP"
  ON public.drop_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel RSVP"
  ON public.drop_rsvps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage RSVPs"
  ON public.drop_rsvps FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. USER_TRUST table
CREATE TABLE public.user_trust (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  dob date,
  phone_verified boolean NOT NULL DEFAULT false,
  selfie_verified boolean NOT NULL DEFAULT false,
  safety_pledge_accepted boolean NOT NULL DEFAULT false,
  onboarding_step integer NOT NULL DEFAULT 0,
  onboarding_complete boolean NOT NULL DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_trust ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trust"
  ON public.user_trust FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trust"
  ON public.user_trust FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trust"
  ON public.user_trust FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_trust_updated_at
  BEFORE UPDATE ON public.user_trust
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. PUSH_SUBSCRIPTIONS table
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subs"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. REPORTS table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  call_id uuid REFERENCES public.calls(id),
  reason text NOT NULL,
  buffer_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
  ON public.reports FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. MODERATION_EVENTS table
CREATE TABLE public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES public.calls(id),
  risk_score numeric,
  action_taken text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage moderation events"
  ON public.moderation_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.drops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drop_rsvps;

-- 8. RSVP count view for efficient queries
CREATE OR REPLACE FUNCTION public.get_drop_rsvp_count(_drop_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0) FROM public.drop_rsvps WHERE drop_id = _drop_id
$$;
