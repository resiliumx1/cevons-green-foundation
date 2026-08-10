DROP POLICY IF EXISTS "Staff delete contact attachments" ON storage.objects;
CREATE POLICY "Staff delete contact attachments" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contact-attachments' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff delete service request attachments" ON storage.objects;
CREATE POLICY "Staff delete service request attachments" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'service-request-uploads' AND public.is_staff(auth.uid()));

REVOKE ALL ON FUNCTION public.tg_page_sections_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_page_sections_version() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_promotions_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_site_images_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_site_images_guard_del() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_promotion_click(uuid) FROM PUBLIC, anon;