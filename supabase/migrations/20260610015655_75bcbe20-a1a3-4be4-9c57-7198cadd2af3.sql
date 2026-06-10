
-- notification type enum
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('lead','review','message','campaign','system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_created_at_idx ON public.notifications (created_at DESC);
CREATE INDEX notifications_read_type_idx ON public.notifications (read, type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Open insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Open delete notifications" ON public.notifications FOR DELETE USING (true);

-- preferences (single row)
CREATE TABLE public.notification_preferences (
  id text PRIMARY KEY DEFAULT 'default',
  leads boolean NOT NULL DEFAULT true,
  reviews boolean NOT NULL DEFAULT true,
  messages boolean NOT NULL DEFAULT true,
  campaigns boolean NOT NULL DEFAULT true,
  system boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_preferences_singleton CHECK (id = 'default')
);
INSERT INTO public.notification_preferences (id) VALUES ('default');

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read prefs" ON public.notification_preferences FOR SELECT USING (true);
CREATE POLICY "Open update prefs" ON public.notification_preferences FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Open insert prefs" ON public.notification_preferences FOR INSERT WITH CHECK (true);

-- helper: check preference
CREATE OR REPLACE FUNCTION public.notif_pref_enabled(_type public.notification_type)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; BEGIN
  SELECT * INTO r FROM public.notification_preferences WHERE id='default';
  IF NOT FOUND THEN RETURN true; END IF;
  RETURN CASE _type
    WHEN 'lead' THEN r.leads
    WHEN 'review' THEN r.reviews
    WHEN 'message' THEN r.messages
    WHEN 'campaign' THEN r.campaigns
    WHEN 'system' THEN r.system
  END;
END $$;

-- trigger: new lead
CREATE OR REPLACE FUNCTION public.tg_notify_new_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.notif_pref_enabled('lead') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'lead',
      'New lead: ' || COALESCE(NEW.name, 'Unknown'),
      COALESCE(NEW.service, NEW.category, 'New service request'),
      '/crm/leads'
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER notify_new_lead AFTER INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_new_lead();

-- trigger: new review
CREATE OR REPLACE FUNCTION public.tg_notify_new_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.notif_pref_enabled('review') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'review',
      'New review' || COALESCE(' from ' || NEW.reviewer_name, ''),
      COALESCE(NEW.rating::text || '★ — ', '') || COALESCE(left(NEW.body, 140), ''),
      '/crm/reviews'
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER notify_new_review AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_new_review();

-- trigger: inbound message from activities
CREATE OR REPLACE FUNCTION public.tg_notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.direction = 'inbound'
     AND NEW.type IN ('whatsapp','sms','email','call')
     AND public.notif_pref_enabled('message') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'message',
      'New ' || NEW.type || ' message',
      COALESCE(left(NEW.body, 160), ''),
      '/crm/conversations'
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER notify_new_message AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_new_message();

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notification_preferences REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;
