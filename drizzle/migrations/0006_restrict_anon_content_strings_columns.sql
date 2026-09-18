-- Anonymous visitors may read published copy only; draft copy stays private.
REVOKE SELECT ON public.content_strings FROM anon;
GRANT SELECT (key, published_value) ON public.content_strings TO anon;