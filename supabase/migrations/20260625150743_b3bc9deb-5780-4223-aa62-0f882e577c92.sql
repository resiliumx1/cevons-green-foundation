
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete service requests" ON public.service_requests;
CREATE POLICY "Authenticated users can delete service requests" ON public.service_requests
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can delete utm_links" ON public.utm_links;
CREATE POLICY "Authenticated can delete utm_links" ON public.utm_links
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
