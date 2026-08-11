# Verify email delivery end-to-end

## Where things stand (checked just now)

- `notify.cevons.com` — **Verified**. DNS has propagated; the NS delegation to Lovable's nameservers (ns3/ns4.lovable.cloud) is live and SPF/DKIM are managed there.
- Live email queue — healthy, but **0 emails sent in the last 7 days**, and **2 emails permanently failed (dead-lettered) earlier**. Dead-lettered mail is never retried automatically.
- Preview/dev send log — completely empty, so nothing has been sent from the preview environment either.

So: the domain is ready, but nothing has actually been put through it yet. "Verified" is not proof of delivery — a real send is the only test.

## What I'd do to actually test it

1. Submit one real contact-form entry and one service-request through the preview site, using a mailbox you can check.
2. Read the send log for those two submissions and report the outcome per recipient: queued, sent, suppressed, or failed with the exact error.
3. Inspect the two earlier dead-lettered messages to identify why they failed (most likely they were enqueued before the domain verified) and confirm the cause no longer applies.
4. If a send fails, fix the cause and re-run the same test rather than guessing.

## Notes

- Current recipients come from the notification settings in Admin → Settings; by default service requests go to info@ and sales@, contact messages to info@.
- Emails send from `no-reply@notify.cevons.com` with replies directed to `info@cevons.com`.
- Publishing is needed before the Live queue is exercised; the preview test proves the pipeline first.

## Before I run it

Tell me which inbox to use as the test recipient — I'd rather not fire test mail at info@/sales@ unless you want that.
