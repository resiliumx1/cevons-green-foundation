# Location SEO, lead-form check, publish, and a written report

## What I found already in place

- The sitemap at `/sitemap.xml` already lists 33 pages, including every service page and Request a Service (given top priority after the homepage).
- Service pages already have their own title, description, share text, canonical link and structured data.
- The Request a Service form already saves real enquiries, and they already show on the admin Requests list with notifications.

So two of the four asks are mostly done. The plan below adds what is genuinely missing, verifies the rest end to end, and produces the report.

## 1. Location signals for Guyana

- Add Guyana location tags (country, region, town, map coordinates) to the site-wide head so every page carries them.
- Add the serving location to each service page's structured data so search engines read "this service, in Guyana" rather than inferring it.
- Work "Guyana" and the main served areas naturally into the service page descriptions where a page is currently generic.
- Confirm each service page still has a unique title and description with no duplicates.

## 2. Sitemap

- Keep the single `/sitemap.xml` that already covers every service (Google prefers one file over many).
- Add a last-updated date only where a real page-change date exists; otherwise leave it off rather than inventing one.
- Confirm robots.txt points at the sitemap.

## 3. Lead form to admin Requests

No rebuild. Verification only:

- Submit one clearly marked test enquiry in preview.
- Confirm it appears on the admin Requests page, raises the notification, and reaches the CES inbox.
- Delete or clearly label the test record afterwards, leaving all real enquiries untouched.

## 4. Publish and check in Google

- Publish the site.
- Once live, fetch the live sitemap and homepage to confirm the new tags are being served.
- Submit the sitemap through the connected Search Console property and report back its status.
- Note honestly that appearing in Google results takes days to weeks after submission; submission is the only step that can be completed today.

## 5. The report for you

A single document you can hand to Claude, saved as a file you can download. It spans from when the site went live on cevons.com to today — not from the first public publish. It covers:

- **Search visibility work** — every page given its own title, description and share preview; structured data for services, FAQs and navigation; Request a Service promoted in search; sitemap and crawlability; the new Guyana location signals.
- **Security work** — locked-down data access rules, moving submissions behind secure server endpoints, removal of unrestricted writes, vulnerable package updates, and protection of draft/unpublished content.
- **Reliability and polish** — brand colour and contrast fixes, dark mode, mobile layout work, the new admin, the on-page editor that lets your team change text and photos without a developer, and the site speed pass.
- **Traffic summary** — the July 1 to September 11 hosting snapshot (9,283 visits, 15,438 page views) labelled as its true source and period, plus a clear note that Google Analytics only began collecting in September so earlier Google figures do not exist.

Rules I will follow in the report: no invented numbers, no capacities or certifications that aren't documented, and no mixing of the hosting snapshot with Google figures. Comparisons to the old site will only be made where I have real evidence; otherwise I will describe the improvement in plain terms without a fake percentage.

## Technical notes

- Location meta (`geo.region`, `geo.placename`, `ICBM`) in `src/routes/__root.tsx`; `areaServed` added in `src/lib/seo/jsonLd.ts` service schema.
- Sitemap stays `src/routes/sitemap[.]xml.ts`; no per-service sitemap files.
- Search Console submission goes through the existing connected property; the property is resolved from Google's verified list, never guessed.
- Report written to a downloadable markdown file; no app behaviour changes.
