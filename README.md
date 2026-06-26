# CEVONS Environmental Services — CRM & Website

Built on TanStack Start + Lovable Cloud (Supabase). The CRM modules below are wired to real
Supabase tables via `react-query`. This README captures the implementation prompts used to
build each CRM module so they can be re-run, audited, or extended.

---

## CRM Implementation Prompts

Each section is the exact prompt used to wire that module. Re-run any of these to rebuild or
extend the corresponding route under `src/routes/crm.*`.

### 1. Invoices — `src/routes/crm.invoices.tsx`

> Wire Invoices to the `invoices` table (Supabase + react-query). Keep existing UI/animations.
>
> - List with status filter (draft/sent/paid/overdue/void), search, totals; auto-flag overdue
>   (`due_date < today` and `status != paid`).
> - Create/edit invoice: link to customer and/or job, line items with auto totals,
>   `issued_date`, `due_date`, notes. Auto-generate number like `INV-1001`.
> - Actions: mark Sent, mark Paid (set `paid_date`, log activity), void. Show outstanding vs
>   paid summary at top.
> - Printable/preview view.
> - Loading/empty/error states; invalidate on mutations.

### 2. Conversations — `src/routes/crm.conversations.tsx`

> Wire Conversations to the `activities` table as an internal communication log (Supabase +
> react-query). NOTE: there is no live WhatsApp/SMS sync yet (that comes with GoHighLevel
> later) — for now this is a manual log of calls/messages/notes against leads and customers.
> Keep existing UI/animations.
>
> - Show threads grouped by lead/customer, each thread = that entity's activities of type
>   `call/whatsapp/sms/email/note`, newest activity surfaced. Inbox-style list + thread view.
> - Log a new entry: pick lead/customer, type, direction (inbound/outbound), body → insert
>   activity, update `last_contacted_at` on the lead.
> - A "WhatsApp" quick action that opens `wa.me` with the contact's number prefilled (logs an
>   outbound whatsapp activity).
> - Clearly label the module so staff know live message sync is coming with the GHL
>   integration.
> - Loading/empty/error states; invalidate on mutations.

### 3. Reviews — `src/routes/crm.reviews.tsx`

> Wire Reviews to the `reviews` table (Supabase + react-query). Source is manual for now
> (Google/Facebook sync comes later). Keep existing UI/animations.
>
> - List reviews with rating, reviewer, source, status, date; filter by rating/source/status.
> - Add review manually; write/edit a response (set `status='responded'`); change status
>   (publish/hide/pending).
> - Summary: average rating + rating distribution bar.
> - Add a clearly-labeled placeholder note that automated Google review requests + import
>   will connect later.
> - Loading/empty/error states; invalidate on mutations.

### 4. Marketing — `src/routes/crm.marketing.tsx`

> Wire the Marketing command centre to real attribution data (Supabase + react-query).
> Lead/source/region/service data is REAL (from `service_requests` UTM fields); campaign
> spend is entered manually via the `campaigns` table; ROI/CPL are computed. Keep existing
> UI/charts/animations.
>
> - KPIs: Total leads, Website requests, WhatsApp clicks (leads where source/contact_method
>   indicates WhatsApp), Calls, Cost per lead (total campaign cost / total leads), Estimated
>   ROI (revenue from won leads' invoices vs total campaign cost).
> - Channel performance from `service_requests` grouped by `utm_source`/`utm_medium`.
> - Campaigns CRUD against `campaigns` table; each campaign auto-computes leads
>   (`service_requests` where `utm_campaign` matches), jobs/revenue (linked), CPL and ROI.
> - Service demand (group by service), Region performance (group by region), and a simple
>   funnel from status counts (new → contacted → quoted → won).
> - Where data genuinely needs ad-platform/GHL integration (e.g. impressions, click costs
>   from Google Ads), show a clearly-labeled "connect later" placeholder rather than fake
>   numbers.
> - Loading/empty/error states; invalidate on mutations.

### 5. Reports — `src/routes/crm.reports.tsx`

> Wire Reports to real aggregations across `service_requests`, `jobs`, and `invoices`
> (Supabase + react-query). Keep existing UI/animations.
>
> - Date-range selector (this month / last month / quarter / custom).
> - Revenue trend (paid invoices over time), Lead trend, Conversion rate (won / total leads),
>   Average deal value, Jobs completed.
> - Area/region performance table (leads, won, revenue by region) — this was an explicit
>   client ask.
> - Lead source performance (leads + conversion by source).
> - Top services by volume and by revenue.
> - CSV export of the current report view.
> - Loading/empty/error states.

### 6. Settings — `src/routes/crm.settings.tsx`

> Wire Settings to the `crm_settings` key-value table (Supabase + react-query). Keep existing
> UI/animations.
>
> - Company profile (name, branches/regions with phone+address+hours, EPA/ISO credentials,
>   WhatsApp number).
> - Service catalog (the list of services + which are "specialist review").
> - Pipeline stages config (the lead status options).
> - Notification preferences (placeholders for now).
>
> Each section is a form that loads from and saves to `crm_settings` (one key per section,
> value `jsonb`). Show save confirmation; handle errors.
>
> Note: user management / roles is deferred until auth is added.

---

## Deferred Integrations

These are intentionally stubbed in the UI with "connect later" labels:

- **GoHighLevel** — live WhatsApp/SMS sync into Conversations.
- **Google / Facebook Reviews** — automated review requests and import.
- **Google Ads / Meta Ads** — impressions and click-cost metrics in Marketing.
- **Auth + user roles** — required before enabling Settings → Team management.

## Tech Stack

- TanStack Start v1 (React 19, Vite 7) — file-based routing under `src/routes/`.
- Tailwind CSS v4 via `src/styles.css`.
- Lovable Cloud (Supabase) — Postgres + RLS, accessed via
  `@/integrations/supabase/client` on the client and `createServerFn` on the server.
- `@tanstack/react-query` for all CRM data fetching and mutations.
- `recharts` for charts; `framer-motion` for animations.
