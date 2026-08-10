CREATE OR REPLACE FUNCTION public.tg_page_sections_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_publish(auth.uid()) THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.published IS TRUE OR (NEW.payload IS NOT NULL AND NEW.payload <> '{}'::jsonb) THEN
        RAISE EXCEPTION 'Your role can save drafts but cannot publish';
      END IF;
    ELSIF NEW.payload IS DISTINCT FROM OLD.payload
       OR NEW.published IS DISTINCT FROM OLD.published THEN
      RAISE EXCEPTION 'Your role can save drafts but cannot publish';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tg_promotions_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_publish(auth.uid()) THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.published IS TRUE THEN
        RAISE EXCEPTION 'Your role can save drafts but cannot publish';
      END IF;
    ELSIF NEW.published IS DISTINCT FROM OLD.published THEN
      RAISE EXCEPTION 'Your role can save drafts but cannot publish';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_page_sections_guard_ins ON public.page_sections;
CREATE TRIGGER trg_page_sections_guard_ins
BEFORE INSERT ON public.page_sections
FOR EACH ROW EXECUTE FUNCTION public.tg_page_sections_guard();

DROP TRIGGER IF EXISTS trg_promotions_guard_ins ON public.promotions;
CREATE TRIGGER trg_promotions_guard_ins
BEFORE INSERT ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.tg_promotions_guard();