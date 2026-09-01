CREATE TABLE IF NOT EXISTS public.admin_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_push_tokens TO authenticated;
GRANT ALL ON public.admin_push_tokens TO service_role;

ALTER TABLE public.admin_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage their own push devices"
  ON public.admin_push_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_admin_push_tokens_user ON public.admin_push_tokens(user_id);

CREATE OR REPLACE FUNCTION public.tg_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  service_key text;
BEGIN
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'email_queue_service_role_key'
  LIMIT 1;

  IF service_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://cevons.com/api/public/notify/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'id', NEW.id,
      'type', NEW.type,
      'title', NEW.title,
      'body', NEW.body,
      'link', NEW.link
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_push_notification() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_push_notification ON public.notifications;
CREATE TRIGGER trg_push_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.tg_push_notification();