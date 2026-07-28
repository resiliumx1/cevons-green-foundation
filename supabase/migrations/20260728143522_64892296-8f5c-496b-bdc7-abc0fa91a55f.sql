DROP POLICY IF EXISTS "Staff update contact attachments" ON storage.objects;
CREATE POLICY "Staff update contact attachments" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'contact-attachments' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'contact-attachments' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update service request attachments" ON storage.objects;
CREATE POLICY "Staff update service request attachments" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'service-request-uploads' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'service-request-uploads' AND public.is_staff(auth.uid()));