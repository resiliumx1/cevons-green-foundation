ALTER TABLE public.ces_outbox
  ADD COLUMN IF NOT EXISTS lease_token uuid,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS ces_outbox_claim_idx
  ON public.ces_outbox (status, next_attempt_at, created_at);

CREATE OR REPLACE FUNCTION public.ces_outbox_claim(_limit integer DEFAULT 25, _lease_seconds integer DEFAULT 120)
RETURNS SETOF public.ces_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token uuid := gen_random_uuid();
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.ces_outbox
    WHERE (status IN ('pending', 'failed') AND next_attempt_at <= now())
       OR (status = 'sending' AND coalesce(lease_expires_at, to_timestamp(0)) < now())
    ORDER BY created_at ASC, id ASC
    LIMIT greatest(1, least(_limit, 200))
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.ces_outbox o
  SET status = 'sending',
      lease_token = _token,
      lease_expires_at = now() + make_interval(secs => greatest(30, least(_lease_seconds, 900)))
  FROM due
  WHERE o.id = due.id
  RETURNING o.*;
END;
$$;

REVOKE ALL ON FUNCTION public.ces_outbox_claim(integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ces_outbox_claim(integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.ces_outbox_claim(integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.ces_outbox_claim(integer, integer) TO service_role;