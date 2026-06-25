
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['activities','campaigns','crm_settings','customers','invoices','jobs','quotes','reviews','service_requests']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'auth_all_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', 'auth_select_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)', 'auth_insert_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)', 'auth_update_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)', 'auth_delete_' || t, t);
  END LOOP;
END$$;

-- notifications: rewrite update/delete with auth.uid() check
DROP POLICY IF EXISTS "Authenticated update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated delete notifications" ON public.notifications;
CREATE POLICY "Authenticated update notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- notification_preferences
DROP POLICY IF EXISTS "Authenticated insert prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Authenticated update prefs" ON public.notification_preferences;
CREATE POLICY "Authenticated insert prefs" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update prefs" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- contact_messages existing "update" policy uses with_check true — tighten
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- service_requests existing update policy with_check true — tighten
DROP POLICY IF EXISTS "Authenticated users can update service requests" ON public.service_requests;
-- (already replaced by auth_update_service_requests above)

-- request_status_events insert with_check true
DROP POLICY IF EXISTS auth_insert_status_events ON public.request_status_events;
CREATE POLICY auth_insert_status_events ON public.request_status_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- utm_links update/insert with_check true
DROP POLICY IF EXISTS "Authenticated can insert utm_links" ON public.utm_links;
DROP POLICY IF EXISTS "Authenticated can update utm_links" ON public.utm_links;
CREATE POLICY "Authenticated can insert utm_links" ON public.utm_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update utm_links" ON public.utm_links
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- storage objects: rewrite our update policies to drop literal true with_check
DROP POLICY IF EXISTS "Staff update contact attachments" ON storage.objects;
DROP POLICY IF EXISTS "Staff update service request attachments" ON storage.objects;
CREATE POLICY "Staff update contact attachments" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'contact-attachments' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'contact-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Staff update service request attachments" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'service-request-uploads' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'service-request-uploads' AND auth.uid() IS NOT NULL);
