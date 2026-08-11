insert into public.crm_settings (key, value)
values (
  'notification_recipients',
  jsonb_build_object(
    'enabled', true,
    'serviceRequests', jsonb_build_array('info@cevons.com', 'sales@cevons.com'),
    'contactMessages', jsonb_build_array('info@cevons.com', 'sales@cevons.com'),
    'whatsapp', jsonb_build_object('enabled', false, 'numbers', '[]'::jsonb)
  )
)
on conflict (key) do nothing;