DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.request_status_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
ALTER TABLE public.service_requests REPLICA IDENTITY FULL;
ALTER TABLE public.request_status_events REPLICA IDENTITY FULL;