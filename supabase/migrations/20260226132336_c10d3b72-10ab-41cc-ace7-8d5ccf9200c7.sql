
-- ══════════════════════════════════════════════════════════════
-- VERITY — Complete Database Schema
-- ══════════════════════════════════════════════════════════════

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.call_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
CREATE TYPE public.spark_decision AS ENUM ('spark', 'pass');
CREATE TYPE public.appeal_status AS ENUM ('pending', 'upheld', 'denied');
CREATE TYPE public.moderation_action AS ENUM ('ban', 'warn', 'clear');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pass_monthly', 'pass_annual');

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  age INTEGER,
  gender TEXT,
  verification_status TEXT DEFAULT 'unverified',
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  token_balance INTEGER DEFAULT 3 NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. USER ROLES TABLE (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. ROOMS TABLE
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  is_premium BOOLEAN DEFAULT false,
  active_users INTEGER DEFAULT 0,
  gender_balance JSONB DEFAULT '{"women": 50, "men": 50}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. MATCHMAKING QUEUE
CREATE TABLE public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  matched_at TIMESTAMPTZ,
  UNIQUE (user_id, room_id)
);
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own queue entry" ON public.matchmaking_queue FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all queue entries" ON public.matchmaking_queue FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. CALLS TABLE
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id),
  caller_id UUID REFERENCES auth.users(id) NOT NULL,
  callee_id UUID REFERENCES auth.users(id) NOT NULL,
  agora_channel TEXT,
  status call_status DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 45,
  caller_decision spark_decision,
  callee_decision spark_decision,
  is_mutual_spark BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own calls" ON public.calls FOR SELECT TO authenticated USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Users can update own call decisions" ON public.calls FOR UPDATE TO authenticated USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "System can insert calls" ON public.calls FOR INSERT TO authenticated WITH CHECK (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Admins can view all calls" ON public.calls FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. SPARKS (mutual connections)
CREATE TABLE public.sparks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) NOT NULL,
  user_a UUID REFERENCES auth.users(id) NOT NULL,
  user_b UUID REFERENCES auth.users(id) NOT NULL,
  ai_insight TEXT,
  voice_intro_a TEXT,
  voice_intro_b TEXT,
  is_archived BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.sparks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sparks" ON public.sparks FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can update own sparks" ON public.sparks FOR UPDATE TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "System can insert sparks" ON public.sparks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- 8. MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spark_id UUID REFERENCES public.sparks(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT,
  is_voice BOOLEAN DEFAULT false,
  voice_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Function to check spark membership
CREATE OR REPLACE FUNCTION public.is_spark_member(_user_id UUID, _spark_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sparks WHERE id = _spark_id AND (user_a = _user_id OR user_b = _user_id)
  )
$$;

CREATE POLICY "Spark members can view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_spark_member(auth.uid(), spark_id));
CREATE POLICY "Spark members can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_spark_member(auth.uid(), spark_id));
CREATE POLICY "Spark members can update read status" ON public.messages FOR UPDATE TO authenticated USING (public.is_spark_member(auth.uid(), spark_id));

-- 9. MODERATION FLAGS
CREATE TABLE public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  flagged_user_id UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT,
  ai_confidence NUMERIC(4,2),
  clip_url TEXT,
  action_taken moderation_action,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage flags" ON public.moderation_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own flags" ON public.moderation_flags FOR SELECT TO authenticated USING (auth.uid() = flagged_user_id);

-- 10. APPEALS
CREATE TABLE public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flag_id UUID REFERENCES public.moderation_flags(id),
  explanation TEXT NOT NULL,
  voice_note_url TEXT,
  status appeal_status DEFAULT 'pending',
  admin_response TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appeals" ON public.appeals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can submit appeals" ON public.appeals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage appeals" ON public.appeals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. TOKEN TRANSACTIONS
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.token_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.token_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 12. RUNTIME ALERT EVENTS (admin monitoring)
CREATE TABLE public.runtime_alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.runtime_alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view alerts" ON public.runtime_alert_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. PLATFORM STATS (for transparency page)
CREATE TABLE public.platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE DEFAULT CURRENT_DATE NOT NULL UNIQUE,
  total_sparks INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  moderation_flags_count INTEGER DEFAULT 0,
  appeals_upheld INTEGER DEFAULT 0,
  appeals_total INTEGER DEFAULT 0,
  ai_accuracy NUMERIC(5,2) DEFAULT 96.80,
  gender_balance JSONB DEFAULT '{"women": 52, "men": 45, "nonbinary": 3}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stats" ON public.platform_stats FOR SELECT USING (true);
CREATE POLICY "Admins can manage stats" ON public.platform_stats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════════════════════
-- TRIGGERS & FUNCTIONS
-- ══════════════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mutual spark detection trigger
CREATE OR REPLACE FUNCTION public.check_mutual_spark()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.caller_decision = 'spark' AND NEW.callee_decision = 'spark' THEN
    NEW.is_mutual_spark = true;
    
    INSERT INTO public.sparks (call_id, user_a, user_b)
    VALUES (NEW.id, NEW.caller_id, NEW.callee_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_call_decisions_complete
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  WHEN (NEW.caller_decision IS NOT NULL AND NEW.callee_decision IS NOT NULL AND OLD.is_mutual_spark = false)
  EXECUTE FUNCTION public.check_mutual_spark();

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sparks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_flags;
ALTER PUBLICATION supabase_realtime ADD TABLE public.runtime_alert_events;

-- Seed default rooms
INSERT INTO public.rooms (name, description, category, icon, is_premium, active_users) VALUES
  ('Creative Minds', 'Artists, designers, and creative thinkers', 'creative', 'Palette', false, 24),
  ('Tech Professionals', 'Engineers, founders, and tech enthusiasts', 'tech', 'Code', false, 31),
  ('Adventure Seekers', 'Travellers and outdoor enthusiasts', 'adventure', 'Mountain', false, 18),
  ('Bookworms & Thinkers', 'Readers, writers, and deep conversationalists', 'books', 'BookOpen', false, 15),
  ('Entrepreneurs', 'Business minds and ambitious builders', 'business', 'Briefcase', true, 12),
  ('Music & Culture', 'Musicians, concertgoers, and culture lovers', 'music', 'Music', true, 9);
