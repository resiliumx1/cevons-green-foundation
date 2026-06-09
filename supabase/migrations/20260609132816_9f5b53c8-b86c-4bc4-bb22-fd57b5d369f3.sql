
CREATE POLICY "Anyone can upload service request attachments"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'service-request-uploads');

CREATE POLICY "Staff can read service request attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'service-request-uploads');
