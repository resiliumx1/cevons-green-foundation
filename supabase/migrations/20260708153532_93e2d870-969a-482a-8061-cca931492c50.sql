
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reference text,
  action text NOT NULL,
  old_status text,
  new_status text,
  changed_fields text[],
  actor_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_entity_idx ON public.audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX audit_log_created_idx ON public.audit_log(created_at DESC);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.tg_audit_contact_messages()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _changed text[] := '{}';
  _col text;
  _actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(entity_type, entity_id, reference, action, new_status, actor_id, note)
    VALUES ('contact_message', NEW.id, NEW.reference, 'created', NEW.status, _actor,
            'Message received from ' || COALESCE(NEW.name,'unknown'));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.audit_log(entity_type, entity_id, reference, action, old_status, new_status, actor_id)
      VALUES ('contact_message', NEW.id, NEW.reference, 'status_changed', OLD.status, NEW.status, _actor);
    END IF;
    FOREACH _col IN ARRAY ARRAY['name','email','phone','subject','message'] LOOP
      IF to_jsonb(NEW) -> _col IS DISTINCT FROM to_jsonb(OLD) -> _col THEN
        _changed := array_append(_changed, _col);
      END IF;
    END LOOP;
    IF array_length(_changed, 1) IS NOT NULL THEN
      INSERT INTO public.audit_log(entity_type, entity_id, reference, action, changed_fields, actor_id)
      VALUES ('contact_message', NEW.id, NEW.reference, 'updated', _changed, _actor);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_audit_service_requests()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _changed text[] := '{}';
  _col text;
  _actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(entity_type, entity_id, reference, action, new_status, actor_id, note)
    VALUES ('service_request', NEW.id, NEW.reference, 'created', NEW.status, _actor,
            COALESCE(NEW.service, NEW.category, 'Service request'));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.audit_log(entity_type, entity_id, reference, action, old_status, new_status, actor_id)
      VALUES ('service_request', NEW.id, NEW.reference, 'status_changed', OLD.status, NEW.status, _actor);
    END IF;
    FOREACH _col IN ARRAY ARRAY['assigned_to','customer_id','estimated_value','lost_reason','preferred_date','preferred_time','region','service','category','name','email','phone'] LOOP
      IF to_jsonb(NEW) -> _col IS DISTINCT FROM to_jsonb(OLD) -> _col THEN
        _changed := array_append(_changed, _col);
      END IF;
    END LOOP;
    IF array_length(_changed, 1) IS NOT NULL THEN
      INSERT INTO public.audit_log(entity_type, entity_id, reference, action, changed_fields, actor_id)
      VALUES ('service_request', NEW.id, NEW.reference, 'updated', _changed, _actor);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER audit_contact_messages
  AFTER INSERT OR UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_contact_messages();

CREATE TRIGGER audit_service_requests
  AFTER INSERT OR UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_service_requests();
