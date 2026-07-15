import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Send,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Award,
  Headphones,
  Upload,
  Leaf,
  Siren,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { GuyanaBranchMap, type BranchPoint } from "@/components/GuyanaBranchMap";
import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";

import { cevonsContact, telHref, mailtoHref, whatsappHref, primaryTelHref, primaryMailtoHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";

const mapBranches: BranchPoint[] = cevonsContact.regions.map((r) => ({
  id: r.name,
  name: r.name,
  label: r.officeType,
  lat: r.name === "Georgetown" ? 6.8013 : r.name === "Linden" ? 6.0064 : 6.2485,
  lng: r.name === "Georgetown" ? -58.1551 : r.name === "Linden" ? -58.3018 : -57.517,
  phone: r.phones[0],
  hours: r.hours,
}));

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact CEVONS | Waste Management Guyana" },
      { name: "description", content: "Get in touch with CEVONS for waste management, dumpster rental, septic, recycling, and environmental services across Guyana." },
      { property: "og:title", content: "Contact CEVONS | Waste Management Guyana" },
      { property: "og:description", content: "Get in touch with CEVONS for waste management, dumpster rental, septic, and environmental services across Guyana." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ])) },
    ],
  }),
  component: ContactPage,
});

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Message us directly on WhatsApp.",
    action: "WhatsApp Us",
    href: whatsappHref,
    primary: true,
  },
  {
    icon: Phone,
    title: "Call Us",
    body: `Speak with our team at ${cevonsContact.primaryPhone}.`,
    action: "Call Now",
    href: primaryTelHref,
    primary: false,
  },
  {
    icon: Mail,
    title: "Email Us",
    body: `Send your inquiry to ${cevonsContact.email}.`,
    action: "Email CEVON\u2019S",
    href: primaryMailtoHref,
    primary: false,
  },
  {
    icon: MapPin,
    title: "Head Office",
    body: `${cevonsContact.regions[0].addressLine1}, ${cevonsContact.regions[0].addressLine2}.`,
    action: "View Locations",
    href: "/locations",
    primary: false,
  },
];

const subjects = [
  "General Inquiry",
  "Request Service",
  "Billing",
  "Existing Request",
  "Business Partnership",
  "Other",
];

const branches = cevonsContact.regions.map((r) => ({
  name: r.name,
  label: r.officeType,
  address: `${r.addressLine1}, ${r.addressLine2}`,
  phones: r.phones,
  email: r.email,
  hours: r.hours,
}));

function ContactPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);



  return (
    <SiteLayout>
      {/* HERO */}
      <PageHero
        title="Get in Touch"
        eyebrow="Contact"
        subtitle="We're here to help. Reach out — we typically respond the same business day."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        imageSrc="/assets/heroes/hero-contact.webp"
        imageAlt="CEVONS team ready to assist with waste management inquiries"
        height="standard"
        waveVariant="drift"
      />


      {/* CONTACT METHODS */}
      <section className="section-y bg-[var(--surface-page)]" aria-label="Contact methods">
        <div className="container-cevons">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactMethods.map(({ icon: Icon, title, body, action, href, primary }, i) => (
              <div
                key={title}
                className={`contact-card group rounded-2xl bg-[var(--brand-white)] border border-[var(--border-hairline)] p-7 shadow-sm ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span
                  className="contact-card__chip flex w-12 h-12 items-center justify-center rounded-xl mb-4"
                  style={{
                    backgroundColor: "color-mix(in oklab, var(--brand-orange) 12%, transparent)",
                    color: "var(--brand-orange)",
                  }}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--text-heading)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-body,#4A4A4A)] leading-relaxed">{body}</p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-4 py-2.5 text-sm transition-colors w-full ${
                    primary
                      ? "bg-[var(--brand-green)] text-[var(--text-on-green)] hover:brightness-110"
                      : "border-2 border-[var(--brand-orange)] text-[var(--text-heading)] hover:bg-[var(--brand-orange)] hover:text-[var(--text-on-orange)]"
                  }`}
                >
                  {action} <ArrowRight className="size-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CONTACT FORM + BRANCH INFO */}
      <section className="section-y bg-[var(--surface-page)]" aria-label="Contact form and branches">
        <div className="container-cevons">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* FORM */}
            <div className="lg:col-span-3">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Message</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
                  Send Us a Message
                </h2>
              </div>

              <div className={`mt-8 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <ContactForm />
              </div>

            </div>

            {/* BRANCH INFO */}
            <aside className="lg:col-span-2">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Offices</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
                  Our Branches
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {branches.map((b, i) => (
                  <div
                    key={b.name}
                    className={`rounded-xl bg-[var(--cevons-cream,#FBF7EE)] border border-[var(--cevons-deep-green,#EF7700)]/10 p-6 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex w-10 h-10 items-center justify-center rounded-lg bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)]">
                        <MapPin className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[var(--cevons-deep-green,#EF7700)]">{b.name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-eyebrow)]">{b.label}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[var(--text-body,#4A4A4A)]">
                      <li className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#EF7700)]" />{b.address}</li>
                      <li className="flex gap-2"><Phone className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#EF7700)]" />
                        <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                          {b.phones.map((p) => (
                            <a key={p} href={telHref(p)} className="hover:text-[var(--cevons-deep-green,#EF7700)] hover:underline">{p}</a>
                          ))}
                        </span>
                      </li>
                      <li className="flex gap-2"><Mail className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#EF7700)]" />
                        <a href={mailtoHref(b.email)} className="hover:text-[var(--cevons-deep-green,#EF7700)] hover:underline">{b.email}</a>
                      </li>
                      <li className="flex gap-2"><Clock3 className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#EF7700)]" />{b.hours}</li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* INTERACTIVE MAP */}
              <div className={`mt-6 rounded-2xl overflow-hidden border border-[var(--cevons-deep-green,#EF7700)]/10 bg-[var(--cevons-cream,#FBF7EE)] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "500ms" }}>
                <div className="aspect-[4/3] relative">
                  <GuyanaBranchMap branches={mapBranches} className="absolute inset-0 size-full" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* URGENT CTA */}
      <OrangeCTABanner
        icon={Siren}
        eyebrow="24/7 Emergency Line"
        title="Need Urgent Assistance?"
        subtitle="Contact our team right away for fast support, urgent service coordination, or immediate guidance — anywhere in Guyana."
        actionEyebrow="Talk to us now"
        actionIntro="Tap to call our dispatch line — or reach us on WhatsApp / email."
      >
        <a href={primaryTelHref} className="cta-btn-primary">
          <Phone className="size-5" /> Call {cevonsContact.primaryPhone}
        </a>
        <a
          href={whatsappHref}
          {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="cta-btn-wa"
        >
          <WhatsApp className="size-5" /> WhatsApp Us
        </a>
        <a
          href={primaryMailtoHref}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-[var(--brand-charcoal)] text-[var(--text-heading)] font-bold hover:bg-[var(--brand-charcoal)] hover:text-white transition"
        >
          <Mail className="size-5" /> Email Us
        </a>
      </OrangeCTABanner>



      {/* TRUST STRIP */}
      <section className="bg-[var(--cevons-cream,#FBF7EE)] border-t border-[var(--cevons-deep-green,#EF7700)]/10">
        <div className="container-cevons py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "Licensed & Insured" },
            { icon: Clock3, label: "Same-Day Response" },
            { icon: Award, label: "Trusted Across Guyana" },
            { icon: Headphones, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center text-center">
              <Icon className="w-6 h-6 text-[var(--cevons-deep-green,#EF7700)]" />
              <span className="text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
