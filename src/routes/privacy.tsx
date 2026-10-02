import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { cevonsContact, primaryMailtoHref } from "@/data/cevonsContact";
import { absUrl } from "@/lib/seo/site";

const PAGE_TITLE = "Privacy Policy | CEVONS Environmental Services";
const PAGE_DESCRIPTION =
  "How CEVONS Environmental Services in Guyana collects, uses, protects, and manages personal information and Google API data.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absUrl("/privacy") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: absUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-dark-alt)] text-white">
        <div className="container-cevons py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/75">
              <li>
                <Link to="/" className="transition-colors hover:text-white motion-reduce:transition-none">
                  Home
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="size-4" /></li>
              <li aria-current="page" className="font-semibold text-white">Privacy Policy</li>
            </ol>
          </nav>

          <div className="flex max-w-3xl items-start gap-4">
            <span className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-orange)] text-[var(--brand-charcoal)]">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
                Your information
              </p>
              <h1 className="font-display text-4xl font-extrabold md:text-6xl">Privacy Policy</h1>
              <p className="mt-4 text-sm text-white/75">Last updated: October 2, 2026</p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[var(--surface-page)] py-12 md:py-18">
        <div className="container-cevons">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
            <article className="max-w-3xl space-y-10 text-[var(--text-body)]">
              <PolicySection title="Who we are">
                <p>CEVONS Environmental Services is an environmental services company in Guyana.</p>
              </PolicySection>

              <PolicySection title="What we collect">
                <p>We may collect:</p>
                <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-[var(--brand-orange)]">
                  <li>Contact-form details, including your name, email address, phone number, and message.</li>
                  <li>Service enquiry and booking details.</li>
                  <li>Basic website analytics, such as visits and how people use the website.</li>
                </ul>
              </PolicySection>

              <PolicySection title="Google Business Profile integration">
                <p>
                  Our internal tool, <strong className="text-[var(--text-heading)]">CEVONS Nexus</strong>, connects to our own Google Business Profile through the Google Business Profile API. We use it only to read customer reviews of our business, post our own replies to those reviews, and publish our own “What&apos;s new” posts.
                </p>
                <p className="mt-4">
                  The integration accesses only our own business account. It does not collect, sell, share, or transfer Google user data, and Google API data is not used for advertising.
                </p>
                <p className="mt-4">
                  Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.
                </p>
              </PolicySection>

              <PolicySection title="How we use data">
                <p>We use information to respond to enquiries, deliver services, and run our business. We do not sell personal information.</p>
              </PolicySection>

              <PolicySection title="Storage and security">
                <p>We store data with reputable cloud providers and use access controls intended to protect it from unauthorized access, use, or disclosure.</p>
              </PolicySection>

              <PolicySection title="Retention and your rights">
                <p>
                  We retain information only as needed for our services, business operations, and legal obligations. You may ask us to access, correct, or delete your personal information by emailing us at{" "}
                  <a className="font-semibold text-[var(--text-heading)] underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4" href={primaryMailtoHref}>
                    {cevonsContact.email}
                  </a>.
                </p>
              </PolicySection>

              <PolicySection title="Changes to this policy">
                <p>We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page shows when it was most recently revised.</p>
              </PolicySection>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Privacy contact">
              <div className="border-l-4 border-[var(--brand-orange)] bg-[var(--surface-elevated)] p-6 shadow-soft">
                <ShieldCheck className="size-7 text-[var(--brand-orange)]" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold text-[var(--text-heading)]">Contact us</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-body)]">
                  For privacy questions or requests, contact CEVONS Environmental Services.
                </p>
                <a href={primaryMailtoHref} className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--text-heading)] underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4">
                  <Mail className="size-4" aria-hidden="true" />
                  {cevonsContact.email}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <section aria-labelledby={id} className="border-b border-[var(--border-subtle)] pb-10 last:border-0 last:pb-0">
      <h2 id={id} className="mb-4 text-2xl font-extrabold text-[var(--text-heading)] md:text-3xl">{title}</h2>
      <div className="text-base leading-8">{children}</div>
    </section>
  );
}