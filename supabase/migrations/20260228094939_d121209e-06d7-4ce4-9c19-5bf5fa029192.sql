-- Deny-all RLS policy on stripe_processed_events (service-role-only table)
CREATE POLICY "Deny all client access"
ON public.stripe_processed_events
FOR ALL
USING (false)
WITH CHECK (false);