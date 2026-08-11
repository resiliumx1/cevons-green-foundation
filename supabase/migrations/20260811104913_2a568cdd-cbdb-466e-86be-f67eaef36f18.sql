-- 1. Trigger functions now write /admin/* links that match real routes.
CREATE OR REPLACE FUNCTION public.tg_notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.notif_pref_enabled('lead') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'lead',
      'New lead: ' || COALESCE(NEW.name, 'Unknown'),
      COALESCE(NEW.service, NEW.category, 'New service request'),
      '/admin/leads'
    );
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.tg_notify_new_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.notif_pref_enabled('message') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'message',
      'New contact message from ' || COALESCE(NEW.name, 'Unknown'),
      COALESCE(NEW.subject || ' — ', '') || COALESCE(left(NEW.message, 140), ''),
      '/admin/messages'
    );
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.tg_notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.direction = 'inbound'
     AND NEW.type IN ('whatsapp','sms','email','call')
     AND public.notif_pref_enabled('message') THEN
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'message',
      'New ' || NEW.type || ' message',
      COALESCE(left(NEW.body, 160), ''),
      '/admin/messages'
    );
  END IF;
  RETURN NEW;
END $function$;

-- There is no dedicated reviews page in the admin; link to the admin overview.
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
      '/admin'
    );
  END IF;
  RETURN NEW;
END $function$;

-- 2. One-time backfill of existing rows.
UPDATE public.notifications SET link = '/admin/leads'    WHERE link = '/crm/leads';
UPDATE public.notifications SET link = '/admin/messages' WHERE link IN ('/crm/conversations', '/crm/messages');
UPDATE public.notifications SET link = '/admin'          WHERE link = '/crm/reviews';
UPDATE public.notifications SET link = '/admin' || substring(link from 5) WHERE link LIKE '/crm/%';
UPDATE public.notifications SET link = '/admin'          WHERE link = '/crm';