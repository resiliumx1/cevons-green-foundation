
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS reference text UNIQUE,
  ADD COLUMN IF NOT EXISTS attachment_url text;

CREATE OR REPLACE FUNCTION public.generate_contact_message_reference()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  attempts int := 0;
BEGIN
  LOOP
    candidate := 'MSG-';
    FOR i IN 1..5 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.contact_messages WHERE reference = candidate);
    attempts := attempts + 1;
    IF attempts > 10 THEN EXIT; END IF;
  END LOOP;
  RETURN candidate;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_new_contact_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.notif_pref_enabled('message') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'message',
      'New contact message from ' || COALESCE(NEW.name, 'Unknown'),
      COALESCE(NEW.subject || ' — ', '') || COALESCE(left(NEW.message, 140), ''),
      '/crm/conversations'
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_contact_messages_notify ON public.contact_messages;
CREATE TRIGGER tg_contact_messages_notify
AFTER INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_new_contact_message();

DROP POLICY IF EXISTS "Authenticated read contact attachments" ON storage.objects;
CREATE POLICY "Authenticated read contact attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'contact-attachments');

DROP POLICY IF EXISTS "Anyone can upload contact attachments" ON storage.objects;
CREATE POLICY "Anyone can upload contact attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contact-attachments');
