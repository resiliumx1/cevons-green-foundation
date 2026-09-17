CREATE OR REPLACE FUNCTION public.tg_notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.notif_pref_enabled('review') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'review',
      'New review' || COALESCE(' from ' || NEW.reviewer_name, ''),
      COALESCE(NEW.rating::text || '★ — ', '') || COALESCE(left(NEW.body, 140), ''),
      '/admin/reviews'
    );
  END IF;
  RETURN NEW;
END $function$;

REVOKE EXECUTE ON FUNCTION public.tg_notify_new_review() FROM PUBLIC, anon, authenticated;