ALTER TABLE public.ces_outbox
  ADD COLUMN IF NOT EXISTS delivery_event_id text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  ADD COLUMN IF NOT EXISTS request_body jsonb,
  ADD COLUMN IF NOT EXISTS issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reconciled_at timestamptz,
  ADD COLUMN IF NOT EXISTS remote_stage text,
  ADD COLUMN IF NOT EXISTS remote_lead_id text;

CREATE INDEX IF NOT EXISTS idx_ces_outbox_due ON public.ces_outbox(status, next_attempt_at);

CREATE OR REPLACE FUNCTION public.ces_outbox_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  service_key text;
  due_count int;
BEGIN
  SELECT count(*) INTO due_count
  FROM public.ces_outbox
  WHERE status IN ('pending', 'failed')
    AND next_attempt_at <= now();

  IF due_count = 0 THEN
    RETURN;
  END IF;

  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'email_queue_service_role_key'
  LIMIT 1;

  IF service_key IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://cevons.com/api/public/ces/drain',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('limit', 25),
    timeout_milliseconds := 10000
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ces_outbox_dispatch() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ces_outbox_dispatch() TO service_role, postgres;

-- Atomic enqueue + immediate wake (no polling needed for the happy path).
CREATE OR REPLACE FUNCTION public.tg_ces_enqueue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  etype text;
BEGIN
  etype := CASE TG_TABLE_NAME
    WHEN 'service_requests' THEN 'service_request'
    ELSE 'contact_message'
  END;

  INSERT INTO public.ces_outbox (event_id, entity_type, entity_id, reference, mode, payload)
  VALUES (etype || ':' || NEW.id::text, etype, NEW.id, NEW.reference, 'live', '{}'::jsonb)
  ON CONFLICT (event_id) DO NOTHING;

  BEGIN
    PERFORM public.ces_outbox_dispatch();
  EXCEPTION WHEN OTHERS THEN
    NULL; -- delivery problems must never affect the customer's submission
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_ces_enqueue() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_ces_enqueue_service_requests ON public.service_requests;
CREATE TRIGGER trg_ces_enqueue_service_requests
AFTER INSERT ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_ces_enqueue();

DROP TRIGGER IF EXISTS trg_ces_enqueue_contact_messages ON public.contact_messages;
CREATE TRIGGER trg_ces_enqueue_contact_messages
AFTER INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.tg_ces_enqueue();

-- Hourly catch-up for retries only; it exits immediately when nothing is due.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('ces-outbox-dispatch')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ces-outbox-dispatch');
    PERFORM cron.schedule('ces-outbox-dispatch', '0 * * * *', $cron$SELECT public.ces_outbox_dispatch();$cron$);
  END IF;
END;
$$;