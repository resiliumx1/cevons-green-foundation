CREATE TABLE IF NOT EXISTS public.ces_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  entity_type text NOT NULL CHECK (entity_type IN ('service_request','contact_message')),
  entity_id uuid NOT NULL,
  reference text,
  mode text NOT NULL DEFAULT 'live' CHECK (mode IN ('live','backfill')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','dead')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  last_status_code integer,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ces_outbox TO authenticated;
GRANT ALL ON public.ces_outbox TO service_role;

ALTER TABLE public.ces_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view the CES delivery queue" ON public.ces_outbox;
CREATE POLICY "Staff can view the CES delivery queue"
  ON public.ces_outbox FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS ces_outbox_ready_idx
  ON public.ces_outbox (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS ces_outbox_entity_idx
  ON public.ces_outbox (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS ces_outbox_created_idx
  ON public.ces_outbox (created_at DESC);

DROP TRIGGER IF EXISTS trg_ces_outbox_updated_at ON public.ces_outbox;
CREATE TRIGGER trg_ces_outbox_updated_at
  BEFORE UPDATE ON public.ces_outbox
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();