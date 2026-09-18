CREATE TABLE public.social_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('tiktok','facebook','instagram')),
  day date NOT NULL,
  followers integer,
  posts integer,
  likes integer,
  profile_views integer,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('auto','manual')),
  note text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_daily_stats TO authenticated;
GRANT ALL ON public.social_daily_stats TO service_role;

ALTER TABLE public.social_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read social daily stats" ON public.social_daily_stats
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert social daily stats" ON public.social_daily_stats
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update social daily stats" ON public.social_daily_stats
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete social daily stats" ON public.social_daily_stats
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER social_daily_stats_set_updated_at
  BEFORE UPDATE ON public.social_daily_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX social_daily_stats_platform_day_idx ON public.social_daily_stats (platform, day DESC);