-- Backup send check runs once an hour; new enquiries are still sent on arrival.
SELECT cron.unschedule('ces-outbox-dispatch');
SELECT cron.schedule('ces-outbox-dispatch', '0 * * * *', $$SELECT public.ces_outbox_dispatch();$$);