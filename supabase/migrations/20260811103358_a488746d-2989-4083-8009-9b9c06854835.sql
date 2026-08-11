DO $$
DECLARE
  spec jsonb := '{"biohazardous-disposal":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,1]]},"compactor-rental":{"f":5,"s":[[1,1,2],[1,1,1]]},"contaminated-soil":{"f":5,"s":[[1,1,2],[1,1,1]]},"document-shredding":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,3]]},"dumpster-rental":{"f":5,"s":[[1,1,2],[1,1,2]]},"general-trash-collection":{"f":6,"s":[[1,1,3],[1,1,2],[1,1,2]]},"general-waste-management":{"f":6,"s":[[1,1,3],[1,1,2],[1,1,2]]},"grease-trap-septic-tank":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,2]]},"hazardous-waste":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,2]]},"landfill-operations":{"f":5,"s":[[1,1,2],[1,1,3],[1,1,1]]},"material-recovery-facility":{"f":5,"s":[[1,1,2],[1,1,2]]},"plastic-recycling":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,1]]},"portable-toilet":{"f":6,"s":[[1,1,2],[1,1,1],[1,1,2],[1,1,2]]},"product-destruction":{"f":5,"s":[[1,1,2],[1,1,1],[1,1,1]]},"road-sweeping":{"f":5,"s":[[1,1,2],[1,1,2]]},"scrap-metal-recycling":{"f":5,"s":[[1,1,1],[1,1,1],[1,1,2],[1,1,1],[1,1,1]]},"septic-services":{"f":7,"s":[[1,1,3],[1,1,2],[1,1,2]]},"skip-bin-dumpster-rental":{"f":5,"s":[[1,1,2],[1,1,2]]},"tank-cleaning":{"f":5,"s":[[1,1,1],[1,1,1]]},"used-cooking-oil":{"f":5,"s":[[1,1,2],[1,1,1]]},"used-waste-oil":{"f":5,"s":[[1,1,2],[1,1,2],[1,1,1]]},"wastewater":{"f":5,"s":[[1,1,1],[1,1,2],[1,1,1]]}}'::jsonb;
  slug text;
  page text;
  cfg jsonb;
  sec jsonb;
  i int;
  m int;
  n int;
BEGIN
  FOR slug, cfg IN SELECT * FROM jsonb_each(spec) LOOP
    page := 'service.' || slug;

    INSERT INTO public.content_strings (key, page, section, label, max_length, multiline) VALUES
      (page || '.hero.eyebrow',  page, 'hero', 'Hero eyebrow', 40, false),
      (page || '.hero.title',    page, 'hero', 'Hero heading', 80, false),
      (page || '.hero.subtitle', page, 'hero', 'Hero subheading', NULL, true),
      (page || '.cta.label',     page, 'cta',  'Primary button label', 40, false),
      (page || '.help.heading',  page, 'help', 'Help section heading', 80, false),
      (page || '.help.body',     page, 'help', 'Help section body', NULL, true)
    ON CONFLICT (key) DO NOTHING;

    FOR i IN 0 .. jsonb_array_length(cfg->'s') - 1 LOOP
      sec := cfg->'s'->i;
      IF (sec->>0)::int = 1 THEN
        INSERT INTO public.content_strings (key, page, section, label, max_length, multiline)
        VALUES (page || '.section.' || i || '.eyebrow', page, 'section-' || (i+1), 'Section ' || (i+1) || ' eyebrow', 60, false)
        ON CONFLICT (key) DO NOTHING;
      END IF;
      IF (sec->>1)::int = 1 THEN
        INSERT INTO public.content_strings (key, page, section, label, max_length, multiline)
        VALUES (page || '.section.' || i || '.heading', page, 'section-' || (i+1), 'Section ' || (i+1) || ' heading', 120, false)
        ON CONFLICT (key) DO NOTHING;
      END IF;
      FOR m IN 0 .. (sec->>2)::int - 1 LOOP
        INSERT INTO public.content_strings (key, page, section, label, max_length, multiline)
        VALUES (page || '.section.' || i || '.paragraph.' || m, page, 'section-' || (i+1), 'Section ' || (i+1) || ' paragraph ' || (m+1), NULL, true)
        ON CONFLICT (key) DO NOTHING;
      END LOOP;
    END LOOP;

    FOR n IN 0 .. (cfg->>'f')::int - 1 LOOP
      INSERT INTO public.content_strings (key, page, section, label, max_length, multiline) VALUES
        (page || '.faq.' || n || '.question', page, 'faqs', 'FAQ ' || (n+1) || ' question', 140, false),
        (page || '.faq.' || n || '.answer',   page, 'faqs', 'FAQ ' || (n+1) || ' answer', NULL, true)
      ON CONFLICT (key) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;