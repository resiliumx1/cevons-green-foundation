ALTER TABLE public.site_images DISABLE TRIGGER trg_site_images_guard_del;
DELETE FROM public.site_images WHERE slot = 'svc_skip_bin_hero';
ALTER TABLE public.site_images ENABLE TRIGGER trg_site_images_guard_del;