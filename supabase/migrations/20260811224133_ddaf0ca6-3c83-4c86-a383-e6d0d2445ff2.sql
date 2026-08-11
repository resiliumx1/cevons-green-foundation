INSERT INTO public.content_strings (key, page, section, label, published_value, draft_value, multiline)
VALUES
 ('service.skip-bin-dumpster-rental.sizes.1.best-for.0','service.skip-bin-dumpster-rental','sizes','Size 2 best for 1',NULL,NULL,false),
 ('service.skip-bin-dumpster-rental.sizes.1.best-for.1','service.skip-bin-dumpster-rental','sizes','Size 2 best for 2',NULL,NULL,false),
 ('service.skip-bin-dumpster-rental.sizes.1.best-for.2','service.skip-bin-dumpster-rental','sizes','Size 2 best for 3',NULL,NULL,false)
ON CONFLICT (key) DO NOTHING;