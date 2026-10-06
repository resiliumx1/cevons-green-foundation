ALTER TABLE public.ces_outbox
  ADD COLUMN IF NOT EXISTS sales_status text,
  ADD COLUMN IF NOT EXISTS sales_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales_last_error text,
  ADD COLUMN IF NOT EXISTS sales_last_status_code integer,
  ADD COLUMN IF NOT EXISTS sales_next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS sales_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sales_request_body text,
  ADD COLUMN IF NOT EXISTS sales_lease_token uuid,
  ADD COLUMN IF NOT EXISTS sales_lease_expires_at timestamptz;

UPDATE public.ces_outbox SET sales_status = 'not_queued' WHERE entity_type = 'service_request' AND sales_status IS NULL;

CREATE INDEX IF NOT EXISTS ces_outbox_sales_due_idx ON public.ces_outbox (sales_status, sales_next_attempt_at) WHERE sales_status IS NOT NULL;

CREATE OR REPLACE FUNCTION public.tg_ces_sales_init()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.entity_type = 'service_request' AND NEW.mode = 'live' THEN
    NEW.sales_status := 'pending';
  ELSIF NEW.entity_type = 'service_request' THEN
    NEW.sales_status := 'not_queued';
  ELSE
    NEW.sales_status := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ces_outbox_sales_init ON public.ces_outbox;
CREATE TRIGGER ces_outbox_sales_init BEFORE INSERT ON public.ces_outbox
FOR EACH ROW EXECUTE FUNCTION public.tg_ces_sales_init();

CREATE OR REPLACE FUNCTION public.ces_sales_claim(_limit integer DEFAULT 25, _lease_seconds integer DEFAULT 120)
RETURNS SETOF public.ces_outbox
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _token uuid := gen_random_uuid();
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id FROM public.ces_outbox
    WHERE (sales_status IN ('pending', 'failed') AND sales_next_attempt_at <= now())
       OR (sales_status = 'sending' AND coalesce(sales_lease_expires_at, to_timestamp(0)) < now())
    ORDER BY created_at ASC, id ASC
    LIMIT greatest(1, least(_limit, 200))
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.ces_outbox o
  SET sales_status = 'sending',
      sales_lease_token = _token,
      sales_lease_expires_at = now() + make_interval(secs => greatest(30, least(_lease_seconds, 900)))
  FROM due WHERE o.id = due.id
  RETURNING o.*;
END;
$$;
REVOKE ALL ON FUNCTION public.ces_sales_claim(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ces_sales_claim(integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.ces_outbox_dispatch()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  drain_key text;
  due_count int;
  req_id bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM public.ces_feed_queue WHERE status = 'pending' AND next_attempt_at <= now()) THEN
    PERFORM public.ces_feed_wake();
  END IF;

  SELECT count(*) INTO due_count FROM public.ces_outbox
  WHERE (status IN ('pending','failed') AND next_attempt_at <= now())
     OR (status = 'sending' AND coalesce(lease_expires_at, to_timestamp(0)) < now())
     OR (sales_status IN ('pending','failed') AND sales_next_attempt_at <= now())
     OR (sales_status = 'sending' AND coalesce(sales_lease_expires_at, to_timestamp(0)) < now());
  IF due_count = 0 THEN RETURN; END IF;

  SELECT value INTO drain_key FROM private.app_keys WHERE name = 'ces_drain_secret';
  IF drain_key IS NULL THEN
    UPDATE public.ces_dispatch_status SET last_error = 'Drain key missing; nothing was sent.', last_error_at = now() WHERE id = 'default';
    RETURN;
  END IF;
  BEGIN
    SELECT net.http_post(
      url := 'https://cevons.com/api/public/ces/drain',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || drain_key),
      body := jsonb_build_object('limit', 25),
      timeout_milliseconds := 15000
    ) INTO req_id;
    UPDATE public.ces_dispatch_status SET last_dispatch_at = now(), last_request_id = req_id WHERE id = 'default';
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.ces_dispatch_status SET last_error = 'Dispatch call failed: ' || left(SQLERRM, 300), last_error_at = now() WHERE id = 'default';
  END;
END;
$function$;