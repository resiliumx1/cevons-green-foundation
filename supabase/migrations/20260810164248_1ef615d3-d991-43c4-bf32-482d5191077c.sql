REVOKE ALL ON public.content_strings FROM anon;
REVOKE ALL ON public.content_string_versions FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.content_strings FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.content_string_versions FROM authenticated;
GRANT SELECT, UPDATE ON public.content_strings TO authenticated;
GRANT SELECT ON public.content_string_versions TO authenticated;
GRANT SELECT ON public.public_content_strings TO anon, authenticated;