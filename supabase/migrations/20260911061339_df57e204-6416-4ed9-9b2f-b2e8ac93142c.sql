CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  project_id text NOT NULL,
  requested_start timestamptz NOT NULL,
  requested_end timestamptz NOT NULL,
  fetched_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_snapshots_unique
  ON public.analytics_snapshots (source, project_id, requested_start, requested_end);

GRANT SELECT ON public.analytics_snapshots TO authenticated;
GRANT ALL ON public.analytics_snapshots TO service_role;

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read analytics snapshots" ON public.analytics_snapshots;
CREATE POLICY "Admins can read analytics snapshots"
  ON public.analytics_snapshots FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

INSERT INTO public.analytics_snapshots (source, project_id, requested_start, requested_end, fetched_at, payload)
VALUES (
  'Lovable hosting analytics',
  'b37380ed-9ae0-44bc-9cd4-24f76810d45b',
  '2026-07-01T00:00:00Z',
  '2026-09-11T00:00:00Z',
  '2026-09-11T00:00:00Z',
  $json${"source":"Lovable hosting analytics","projectId":"b37380ed-9ae0-44bc-9cd4-24f76810d45b","requestedStart":"2026-07-01T00:00:00Z","requestedEnd":"2026-09-11T00:00:00Z","totals":{"visitors":9283,"pageviews":15438,"pageviewsPerVisit":1.66,"sessionDuration":155,"bounceRate":69},"dailyVisitors":[{"date":"2026-07-14 00:00:00","value":3},{"date":"2026-07-23 00:00:00","value":7},{"date":"2026-07-24 00:00:00","value":3},{"date":"2026-07-28 00:00:00","value":1},{"date":"2026-07-30 00:00:00","value":3},{"date":"2026-07-31 00:00:00","value":1},{"date":"2026-08-03 00:00:00","value":4},{"date":"2026-08-04 00:00:00","value":1},{"date":"2026-08-10 00:00:00","value":21},{"date":"2026-08-11 00:00:00","value":492},{"date":"2026-08-12 00:00:00","value":190},{"date":"2026-08-13 00:00:00","value":188},{"date":"2026-08-14 00:00:00","value":159},{"date":"2026-08-15 00:00:00","value":131},{"date":"2026-08-16 00:00:00","value":142},{"date":"2026-08-17 00:00:00","value":523},{"date":"2026-08-18 00:00:00","value":182},{"date":"2026-08-19 00:00:00","value":192},{"date":"2026-08-20 00:00:00","value":159},{"date":"2026-08-21 00:00:00","value":213},{"date":"2026-08-22 00:00:00","value":471},{"date":"2026-08-23 00:00:00","value":128},{"date":"2026-08-24 00:00:00","value":385},{"date":"2026-08-25 00:00:00","value":495},{"date":"2026-08-26 00:00:00","value":505},{"date":"2026-08-27 00:00:00","value":183},{"date":"2026-08-28 00:00:00","value":218},{"date":"2026-08-29 00:00:00","value":397},{"date":"2026-08-30 00:00:00","value":484},{"date":"2026-08-31 00:00:00","value":265},{"date":"2026-09-01 00:00:00","value":362},{"date":"2026-09-02 00:00:00","value":302},{"date":"2026-09-03 00:00:00","value":212},{"date":"2026-09-04 00:00:00","value":537},{"date":"2026-09-05 00:00:00","value":242},{"date":"2026-09-06 00:00:00","value":162},{"date":"2026-09-07 00:00:00","value":283},{"date":"2026-09-08 00:00:00","value":253},{"date":"2026-09-09 00:00:00","value":205},{"date":"2026-09-10 00:00:00","value":538},{"date":"2026-09-11 00:00:00","value":41}],"dailyPageviews":[{"date":"2026-07-14 00:00:00","value":11},{"date":"2026-07-23 00:00:00","value":37},{"date":"2026-07-24 00:00:00","value":14},{"date":"2026-07-28 00:00:00","value":1},{"date":"2026-07-30 00:00:00","value":27},{"date":"2026-07-31 00:00:00","value":5},{"date":"2026-08-03 00:00:00","value":8},{"date":"2026-08-04 00:00:00","value":1},{"date":"2026-08-10 00:00:00","value":105},{"date":"2026-08-11 00:00:00","value":1062},{"date":"2026-08-12 00:00:00","value":422},{"date":"2026-08-13 00:00:00","value":356},{"date":"2026-08-14 00:00:00","value":281},{"date":"2026-08-15 00:00:00","value":211},{"date":"2026-08-16 00:00:00","value":236},{"date":"2026-08-17 00:00:00","value":868},{"date":"2026-08-18 00:00:00","value":340},{"date":"2026-08-19 00:00:00","value":290},{"date":"2026-08-20 00:00:00","value":287},{"date":"2026-08-21 00:00:00","value":364},{"date":"2026-08-22 00:00:00","value":723},{"date":"2026-08-23 00:00:00","value":175},{"date":"2026-08-24 00:00:00","value":625},{"date":"2026-08-25 00:00:00","value":741},{"date":"2026-08-26 00:00:00","value":806},{"date":"2026-08-27 00:00:00","value":315},{"date":"2026-08-28 00:00:00","value":344},{"date":"2026-08-29 00:00:00","value":646},{"date":"2026-08-30 00:00:00","value":718},{"date":"2026-08-31 00:00:00","value":416},{"date":"2026-09-01 00:00:00","value":541},{"date":"2026-09-02 00:00:00","value":467},{"date":"2026-09-03 00:00:00","value":372},{"date":"2026-09-04 00:00:00","value":845},{"date":"2026-09-05 00:00:00","value":345},{"date":"2026-09-06 00:00:00","value":200},{"date":"2026-09-07 00:00:00","value":478},{"date":"2026-09-08 00:00:00","value":395},{"date":"2026-09-09 00:00:00","value":334},{"date":"2026-09-10 00:00:00","value":959},{"date":"2026-09-11 00:00:00","value":67}],"breakdowns":{"page":{"label":"page","data":[{"label":"/","value":7902},{"label":"/services","value":192},{"label":"/request-service","value":163},{"label":"/contact","value":158},{"label":"/locations","value":140},{"label":"/services/skip-bin-dumpster-rental","value":140},{"label":"/careers","value":116},{"label":"/contact-us","value":82},{"label":"/about","value":56},{"label":"/services/septic-services","value":50}]},"source":{"label":"source","data":[{"label":"Direct","value":6634},{"label":"google.com","value":756},{"label":"googleads.g.doubleclick.net","value":307},{"label":"weather.com","value":162},{"label":"atlas.taboolanews.com","value":97},{"label":"trends.glance.com","value":69},{"label":"bing.com","value":60},{"label":"en.cnnstars.com","value":40},{"label":"m.facebook.com","value":25},{"label":"shareit.hpyfeds.com","value":20}]},"device":{"label":"device","data":[{"label":"mobile","value":7286},{"label":"desktop","value":1984},{"label":"tablet","value":7}]},"country":{"label":"country","data":[{"label":"GY","value":7563},{"label":"CN","value":705},{"label":"US","value":238},{"label":"BO","value":161},{"label":"Unknown","value":57},{"label":"CA","value":34},{"label":"TT","value":29},{"label":"CU","value":29},{"label":"SR","value":27},{"label":"AE","value":23}]}}}$json$::jsonb
)
ON CONFLICT (source, project_id, requested_start, requested_end) DO NOTHING;