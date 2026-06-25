
CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('release','news','announcement')),
  title text NOT NULL,
  summary text,
  body text,
  outlet text,
  external_url text,
  image_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT ALL ON public.media_items TO service_role;

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media"
  ON public.media_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated can read all media"
  ON public.media_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert media"
  ON public.media_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update media"
  ON public.media_items FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete media"
  ON public.media_items FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.media_items (type, title, summary, body, outlet, external_url, image_url, published_at, is_published, sort_order) VALUES
('release', 'CEVON''S Expands Industrial Waste Capacity at Georgetown Facility',
 'New equipment and routing systems double our industrial waste throughput in support of Guyana''s growing energy sector.',
 'CEVON''S Environmental Services Inc. has commissioned new processing equipment and route-optimization systems at its Georgetown facility, effectively doubling industrial waste throughput. The upgrade supports rapidly expanding demand from Guyana''s oil & gas, manufacturing, and construction sectors.',
 NULL, NULL, '/assets/heroes/hero-industries.webp', '2026-05-12 10:00:00+00', true, 10),

('release', 'CEVON''S Earns ISO 9001:2015 Certification',
 'Independent audit confirms CEVON''S quality management system meets international standards.',
 'Following a comprehensive third-party audit, CEVON''S Environmental Services Inc. has been awarded ISO 9001:2015 certification for quality management systems across its waste collection, recovery, and disposal operations.',
 NULL, NULL, '/assets/heroes/hero-about.webp', '2026-03-04 09:00:00+00', true, 20),

('news', 'Guyana''s Waste Leader Backs Georgetown Cleanup Drive',
 'Local coverage of CEVON''S community cleanup partnership with the Mayor & City Council.',
 NULL, 'Stabroek News', 'https://www.stabroeknews.com/',
 '/services/svc-residential.webp', '2026-04-22 08:00:00+00', true, 10),

('news', 'CEVON''S Profiled as Leading Environmental Operator',
 'Feature on the company''s 25+ year journey from a small Georgetown operator to nationwide waste leader.',
 NULL, 'Guyana Chronicle', 'https://guyanachronicle.com/',
 '/services/svc-industrial.webp', '2026-02-18 08:00:00+00', true, 20),

('news', 'New Berbice Branch Brings Reliable Service to Eastern Guyana',
 'CEVON''S opens its New Amsterdam branch to expand collection coverage in Region 6.',
 NULL, 'Kaieteur News', 'https://www.kaieteurnewsonline.com/',
 '/assets/heroes/hero-locations.webp', '2026-01-30 08:00:00+00', true, 30),

('announcement', 'New Online Service Request Portal Launched',
 'Customers can now book collections, dumpsters, and septic services in under two minutes.',
 'Our new self-service portal lets residential and commercial customers schedule pickups, request dumpsters, and track open requests in real time. Existing customers can continue to call or WhatsApp our team — the portal is an added convenience.',
 NULL, '/request-service', '/assets/heroes/hero-request-service.webp', '2026-06-01 09:00:00+00', true, 10),

('announcement', 'Holiday Collection Schedule — 2026',
 'Updated collection calendar for the upcoming Mashramani and Easter holiday weeks.',
 'During Mashramani and Easter holiday weeks, residential collection routes will run on adjusted schedules. Please place bins out by 6:00 AM on your assigned day. Commercial customers will be contacted directly with route updates.',
 NULL, NULL, '/services/svc-commercial.webp', '2026-01-10 09:00:00+00', true, 20),

('announcement', 'CEVON''S Now Hiring Across Operations & Driver Roles',
 'We''re expanding our team across Georgetown, Linden, and Berbice branches.',
 'CEVON''S is hiring experienced drivers, route supervisors, and facility operators across all three branches. Competitive pay, full benefits, and training provided. Apply via our contact page.',
 NULL, '/contact', '/services/svc-recycling.webp', '2026-05-20 09:00:00+00', true, 30);
