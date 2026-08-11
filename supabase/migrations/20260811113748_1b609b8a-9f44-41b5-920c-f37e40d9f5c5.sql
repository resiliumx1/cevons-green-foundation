delete from public.contact_messages where email = 'diag-test@example.com';
delete from public.service_requests where email = 'diag-test@example.com';
delete from public.notifications where created_at > now() - interval '30 minutes';
delete from public.email_send_log where message_id like '%TEST-DIAG-1%';
select pgmq.purge_queue('transactional_emails');