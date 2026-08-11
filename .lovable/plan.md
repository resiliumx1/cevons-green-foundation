# Add DMARC for cevons.com (monitoring mode)

This is a DNS-only change. No application code, no site design, and no backend changes are involved — nothing in the app needs to be rebuilt or republished for it.

## What this does

DMARC tells receiving mail servers (Gmail, Outlook, Yahoo) what to do with mail that claims to be from cevons.com but fails authentication, and asks them to send you daily reports on every sender using your domain. Publishing it at the root covers all cevons.com mail — the Bluehost inboxes and, by inheritance, the future `notify.cevons.com` app sender.

Starting at `p=none` means **nothing about your current mail delivery changes**. It is monitoring only: you collect evidence about who is sending as cevons.com before enforcing anything.

## One record to add at Bluehost

| Field | Value |
|---|---|
| Type | TXT |
| Host / Name | `_dmarc` (some panels want the full `_dmarc.cevons.com`) |
| Value | `v=DMARC1; p=none; rua=mailto:info@cevons.com; fo=1; adkim=r; aspf=r` |
| TTL | 3600 (or leave the Bluehost default) |

Scope: **root domain**. It does not touch, replace, or require any change to the existing MX records or SPF record — DMARC is a separate TXT record at its own `_dmarc` hostname. Your Bluehost mail flow is unaffected.

Because the report address `info@cevons.com` is on the same domain as the policy, no extra external-reporting authorization record is needed.

## What to expect afterwards

- Within 24–72 hours, `info@cevons.com` starts receiving daily aggregate reports — XML attachments, roughly one per receiving provider. They are machine-readable, not human-friendly; paste them into any free DMARC report reader to see which senders pass and fail.
- No mail is blocked or filtered by this record at `p=none`.

## Interaction with the app sender

`notify.cevons.com` has not been added as a sending domain yet, so there is nothing to configure for it today. Once it is set up, that subdomain gets delegated to Lovable's nameservers, which then manage its SPF and DKIM automatically. The root DMARC policy above applies to it by inheritance in the meantime, so app email is covered from day one.

## Follow-up, once reports are clean

After a few weeks of reports confirming that every legitimate sender — Bluehost, the app sender, and any third-party tools sending as cevons.com — passes authentication, tighten the policy to `p=quarantine` and later `p=reject`. That is a one-value edit to the same record. I would not tighten before the reports justify it, as premature enforcement can send real business mail to spam.

## Technical notes

- `p=none` — take no action on failures; monitor only.
- `rua=mailto:info@cevons.com` — destination for aggregate reports.
- `fo=1` — request a failure report when any authentication mechanism fails, not only when all do.
- `adkim=r` / `aspf=r` — relaxed alignment, which allows subdomain senders such as `notify.cevons.com` to align against the root organizational domain. Strict alignment would break inheritance for the app sender.
- No `sp=` tag is set, so subdomains inherit `p=none` from the root policy. If Lovable later publishes its own `_dmarc` record inside the delegated `notify.cevons.com` zone, that more specific record takes precedence for app email — which is the correct behaviour.

## Verification

After adding the record at Bluehost, confirm it resolves with a public DNS lookup of the TXT record at `_dmarc.cevons.com`, then confirm the first aggregate report lands in `info@cevons.com` within about three days.
