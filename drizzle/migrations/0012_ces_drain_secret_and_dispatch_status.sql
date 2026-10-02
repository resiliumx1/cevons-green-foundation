-- lovable-cron-fallback-reviewed: user-required 5-minute retry backstop; sends are also woken on enqueue and the function exits immediately when nothing is due
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS private.app_keys (name text PRIMARY KEY, value text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON private.app_keys FROM PUBLIC, anon, authenticated;
INSERT INTO private.app_keys (name, value) VALUES ('ces_drain_secret', encode(extensions.gen_random_bytes(32), 'hex')) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.check_ces_drain_token(_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(length(_token), 0) >= 32 AND EXISTS (
    SELECT 1 FROM private.app_keys WHERE name = 'ces_drain_secret' AND value = _token);
$$;
REVOKE ALL ON FUNCTION public.check_ces_drain_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_ces_drain_token(text) TO service_role;

CREATE TABLE IF NOT EXISTS public.ces_dispatch_status (
  id text PRIMARY KEY DEFAULT 'default',
  last_dispatch_at timestamptz,
  last_request_id bigint,
  last_error text,
  last_error_at timestamptz,
  last_drain_at timestamptz,
  last_drain_result jsonb
);
GRANT SELECT ON public.ces_dispatch_status TO authenticated;
GRANT ALL ON public.ces_dispatch_status TO service_role;
ALTER TABLE public.ces_dispatch_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read dispatch status" ON public.ces_dispatch_status FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
INSERT INTO public.ces_dispatch_status (id) VALUES ('default') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.ces_outbox_dispatch()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  drain_key text;
  due_count int;
  req_id bigint;
BEGIN
  SELECT count(*) INTO due_count FROM public.ces_outbox
  WHERE (status IN ('pending','failed') AND next_attempt_at <= now())
     OR (status = 'sending' AND coalesce(lease_expires_at, to_timestamp(0)) < now());
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
$$;

CREATE OR REPLACE FUNCTION public.tg_push_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE drain_key text;
BEGIN
  SELECT value INTO drain_key FROM private.app_keys WHERE name = 'ces_drain_secret';
  IF drain_key IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://cevons.com/api/public/notify/push',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || drain_key),
      body := jsonb_build_object('id', NEW.id, 'type', NEW.type, 'title', NEW.title, 'body', NEW.body, 'link', NEW.link),
      timeout_milliseconds := 5000);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

SELECT cron.unschedule('ces-outbox-dispatch');
SELECT cron.schedule('ces-outbox-dispatch', '*/5 * * * *', $$SELECT public.ces_outbox_dispatch();$$);