ALTER VIEW public.public_content_strings SET (security_invoker = on);

CREATE POLICY "Anyone can read published content strings"
ON public.content_strings FOR SELECT TO anon, authenticated
USING (true);

GRANT SELECT (key, published_value) ON public.content_strings TO anon, authenticated;
GRANT SELECT ON public.public_content_strings TO anon, authenticated;
GRANT ALL ON public.content_strings TO service_role;