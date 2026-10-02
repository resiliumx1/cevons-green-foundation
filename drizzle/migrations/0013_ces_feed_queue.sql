CREATE TABLE public.ces_feed_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  body jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  last_status_code integer,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ces_feed_queue TO service_role;
ALTER TABLE public.ces_feed_queue ENABLE ROW LEVEL SECURITY;
CREATE INDEX ces_feed_queue_pending_idx ON public.ces_feed_queue (next_attempt_at) WHERE status = 'pending';

-- Wake the feed sender (only called when a row was just queued, or rows are due).
CREATE OR REPLACE FUNCTION public.ces_feed_wake()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE k text;
BEGIN
  SELECT value INTO k FROM private.app_keys WHERE name = 'ces_drain_secret';
  IF k IS NULL THEN
    UPDATE public.ces_dispatch_status SET last_error = 'Drain key missing; feed not sent.', last_error_at = now() WHERE id = 'default';
    RETURN;
  END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://cevons.com/api/public/ces/feed',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || k),
      body := '{}'::jsonb, timeout_milliseconds := 15000);
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.ces_dispatch_status SET last_error = 'Feed call failed: ' || left(SQLERRM, 300), last_error_at = now() WHERE id = 'default';
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.ces_feed_wake() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.tg_ces_feed_newsletter()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.consent IS DISTINCT FROM true THEN RETURN NEW; END IF;
  INSERT INTO public.ces_feed_queue (event_id, body)
  VALUES ('newsletter_signup:' || NEW.id, jsonb_strip_nulls(jsonb_build_object(
    'kind','newsletter_signup','externalId',NEW.id::text,'email',NEW.email,
    'source',NEW.source,'consent',true,
    'subscribedAt', to_char(NEW.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))))
  ON CONFLICT (event_id) DO NOTHING;
  PERFORM public.ces_feed_wake();
  RETURN NEW;
END;
$$;
CREATE TRIGGER ces_feed_newsletter AFTER INSERT ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.tg_ces_feed_newsletter();

-- Hourly backup: retry enquiries and feed rows, calling nothing when none wait.
CREATE OR REPLACE FUNCTION public.ces_outbox_dispatch()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
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

CREATE OR REPLACE FUNCTION public.ces_tiktok_daily_dispatch()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE k text;
BEGIN
  SELECT value INTO k FROM private.app_keys WHERE name = 'ces_drain_secret';
  IF k IS NULL THEN
    UPDATE public.ces_dispatch_status SET last_error = 'Drain key missing; TikTok daily not sent.', last_error_at = now() WHERE id = 'default';
    RETURN;
  END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://cevons.com/api/public/ces/tiktok-daily',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || k),
      body := '{}'::jsonb, timeout_milliseconds := 30000);
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.ces_dispatch_status SET last_error = 'TikTok daily call failed: ' || left(SQLERRM, 300), last_error_at = now() WHERE id = 'default';
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.ces_tiktok_daily_dispatch() FROM PUBLIC, anon, authenticated;

-- Backfill: consented sign-ups and recorded TikTok days (queued only; sent by the feed route).
INSERT INTO public.ces_feed_queue (event_id, body)
SELECT 'newsletter_signup:' || n.id, jsonb_strip_nulls(jsonb_build_object(
  'kind','newsletter_signup','externalId',n.id::text,'email',n.email,'source',n.source,'consent',true,
  'subscribedAt', to_char(n.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')))
FROM public.newsletter_subscribers n WHERE n.consent = true
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO public.ces_feed_queue (event_id, body)
SELECT 'social_daily:tiktok:' || s.day || ':' || extract(epoch FROM s.updated_at)::bigint,
  jsonb_strip_nulls(jsonb_build_object(
    'kind','social_daily','platform','tiktok','day', s.day::text,
    'readAt', to_char(s.updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'followers', s.followers, 'likes', s.likes, 'posts', s.posts, 'profileViews', s.profile_views))
FROM public.social_daily_stats s WHERE s.platform = 'tiktok'
ON CONFLICT (event_id) DO NOTHING;

SELECT cron.schedule('ces-tiktok-daily', '0 11 * * *', $$SELECT public.ces_tiktok_daily_dispatch();$$);