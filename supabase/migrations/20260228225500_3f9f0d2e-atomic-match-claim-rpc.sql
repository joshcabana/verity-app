-- Atomic queue claim for matchmaking using row-level locking.
-- This prevents two concurrent callers from claiming the same partner.
CREATE OR REPLACE FUNCTION public.claim_match_candidate(
  p_user_id uuid,
  p_drop_id uuid
)
RETURNS TABLE(candidate_queue_id uuid, candidate_user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_self_queue_id uuid;
  v_self_status text;
BEGIN
  -- Lock the caller row for this drop.
  SELECT id, status
  INTO v_self_queue_id, v_self_status
  FROM public.matchmaking_queue
  WHERE user_id = p_user_id
    AND drop_id = p_drop_id
  ORDER BY joined_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_self_queue_id IS NULL OR v_self_status <> 'waiting' THEN
    RETURN;
  END IF;

  -- Move caller into matching while we claim a partner.
  UPDATE public.matchmaking_queue
  SET status = 'matching'
  WHERE id = v_self_queue_id
    AND status = 'waiting';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Lock and select the oldest compatible waiting candidate.
  SELECT mq.id, mq.user_id
  INTO candidate_queue_id, candidate_user_id
  FROM public.matchmaking_queue mq
  WHERE mq.drop_id = p_drop_id
    AND mq.status = 'waiting'
    AND mq.user_id <> p_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks ub
      WHERE ub.blocker_id = p_user_id
        AND ub.blocked_id = mq.user_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks ub
      WHERE ub.blocker_id = mq.user_id
        AND ub.blocked_id = p_user_id
    )
  ORDER BY mq.joined_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF candidate_queue_id IS NULL THEN
    UPDATE public.matchmaking_queue
    SET status = 'waiting'
    WHERE id = v_self_queue_id
      AND status = 'matching';
    RETURN;
  END IF;

  -- Claim candidate.
  UPDATE public.matchmaking_queue
  SET status = 'matching'
  WHERE id = candidate_queue_id
    AND status = 'waiting';

  IF NOT FOUND THEN
    UPDATE public.matchmaking_queue
    SET status = 'waiting'
    WHERE id = v_self_queue_id
      AND status = 'matching';
    RETURN;
  END IF;

  RETURN NEXT;
END;
$$;

-- Service-role only: clients must go through the find-match edge function.
REVOKE ALL ON FUNCTION public.claim_match_candidate(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_match_candidate(uuid, uuid) TO service_role;
