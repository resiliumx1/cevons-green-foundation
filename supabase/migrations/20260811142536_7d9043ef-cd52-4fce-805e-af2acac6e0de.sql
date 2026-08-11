UPDATE public.crm_settings
SET value = jsonb_set(
  jsonb_set(coalesce(value,'{}'::jsonb), '{serviceRequests}', '["sales@cevons.com"]'::jsonb, true),
  '{contactMessages}', '["sales@cevons.com"]'::jsonb, true)
WHERE key = 'notification_recipients';