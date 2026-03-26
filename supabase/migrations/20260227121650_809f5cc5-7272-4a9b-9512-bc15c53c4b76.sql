
-- Create stripe_processed_events table for webhook idempotency
CREATE TABLE public.stripe_processed_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policies needed; only service role writes

-- Add stripe_customer_id to profiles
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text;
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles (stripe_customer_id);
