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
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveDivider } from "@/components/WaveDivider";
import { CevonsIcon } from "@/components/CevonsIcon";
import { GuyanaBranchMap, type BranchPoint } from "@/components/GuyanaBranchMap";
import { ContactForm } from "@/components/contact/ContactForm";

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
      { title: "Contact CEVON’S | Waste Management & Environmental Services Guyana" },
      { name: "description", content: "Contact CEVON’S Environmental Services for waste management, dumpster rental, skip bin rental, septic services, recycling, and environmental solutions in Guyana." },
      { property: "og:title", content: "Contact CEVON’S | Waste Management & Environmental Services Guyana" },
      { property: "og:description", content: "Contact CEVON’S Environmental Services for waste management, dumpster rental, skip bin rental, septic services, recycling, and environmental solutions in Guyana." },
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
      <section className="relative overflow-hidden" aria-labelledby="contact-h1">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--cevons-deep-green,#006B35) 0%, #014a25 55%, #002f17 100%)",
          }}
        />
        {/* Subtle radial accent */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 85% 10%, rgba(245,197,24,0.18), transparent 60%), radial-gradient(50% 70% at 10% 100%, rgba(255,255,255,0.06), transparent 60%)",
          }}
        />
        <div className="container-cevons relative min-h-[240px] md:min-h-[300px] flex flex-col justify-center py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow,#FFD200)] font-semibold">Contact</li>
            </ol>
          </nav>
          <h1 id="contact-h1" className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Get in Touch
          </h1>
          <p className={`mt-4 text-white/85 text-base md:text-lg max-w-2xl transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            We&rsquo;re here to help. Reach out — we typically respond the same business day.
          </p>

        </div>
        <div className="brand-ribbon" aria-hidden="true" />
      </section>

      {/* CONTACT METHODS */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Contact methods">
        <div className="container-cevons">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactMethods.map(({ icon: Icon, title, body, action, href, primary }, i) => (
              <div
                key={title}
                className={`rounded-2xl bg-white border p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  primary
                    ? "border-[var(--cevons-deep-green,#006B35)]/20 ring-1 ring-[var(--cevons-deep-green,#006B35)]/10"
                    : "border-[var(--cevons-deep-green,#006B35)]/10"
                } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span className={`flex w-12 h-12 items-center justify-center rounded-xl mb-4 ${
                  primary ? "bg-[var(--cevons-deep-green,#006B35)] text-white" : "bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]"
                }`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#006B35)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{body}</p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-4 py-2.5 text-sm transition-colors w-full ${
                    primary
                      ? "bg-[var(--cevons-deep-green,#006B35)] text-white hover:bg-[var(--cevons-deep-green,#006B35)]/90"
                      : "border-2 border-[var(--cevons-deep-green,#006B35)] text-[var(--cevons-deep-green,#006B35)] hover:bg-[var(--cevons-deep-green,#006B35)] hover:text-white"
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
      <section className="section-y bg-white" aria-label="Contact form and branches">
        <div className="container-cevons">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* FORM */}
            <div className="lg:col-span-3">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#006B35)] mb-3">Message</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#006B35)] mb-3">Offices</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
                  Our Branches
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {branches.map((b, i) => (
                  <div
                    key={b.name}
                    className={`rounded-xl bg-[var(--cevons-cream,#FBF7EE)] border border-[var(--cevons-deep-green,#006B35)]/10 p-6 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex w-10 h-10 items-center justify-center rounded-lg bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]">
                        <MapPin className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[var(--cevons-deep-green,#006B35)]">{b.name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#B58900]">{b.label}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[var(--cevons-muted,#64748B)]">
                      <li className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{b.address}</li>
                      <li className="flex gap-2"><Phone className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />
                        <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                          {b.phones.map((p) => (
                            <a key={p} href={telHref(p)} className="hover:text-[var(--cevons-deep-green,#006B35)] hover:underline">{p}</a>
                          ))}
                        </span>
                      </li>
                      <li className="flex gap-2"><Mail className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />
                        <a href={mailtoHref(b.email)} className="hover:text-[var(--cevons-deep-green,#006B35)] hover:underline">{b.email}</a>
                      </li>
                      <li className="flex gap-2"><Clock3 className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{b.hours}</li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* INTERACTIVE MAP */}
              <div className={`mt-6 rounded-2xl overflow-hidden border border-[var(--cevons-deep-green,#006B35)]/10 bg-[var(--cevons-cream,#FBF7EE)] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "500ms" }}>
                <div className="aspect-[4/3] relative">
                  <GuyanaBranchMap branches={mapBranches} className="absolute inset-0 size-full" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* URGENT CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-cevons">
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-14 md:px-16 md:py-20 text-center"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, #00713A 0%, #003F27 60%, #002819 100%)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <p className="text-[var(--cevons-yellow,#FFD200)] text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <Leaf className="size-4" /> Urgent
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Need Urgent Assistance?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Contact us on WhatsApp and our team will respond as soon as possible.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={whatsappHref}
                  {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="btn-base btn-green text-base px-6 py-3.5"
                >
                  <MessageCircle className="size-5" /> WhatsApp Us
                </a>
                <a
                  href={primaryTelHref}
                  className="btn-base btn-yellow text-base px-6 py-3.5"
                >
                  <Phone className="size-5" /> Call {cevonsContact.primaryPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--cevons-cream,#FBF7EE)] border-t border-[var(--cevons-deep-green,#006B35)]/10">
        <div className="container-cevons py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "Licensed & Insured" },
            { icon: Clock3, label: "Same-Day Response" },
            { icon: Award, label: "Trusted Across Guyana" },
            { icon: Headphones, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center text-center">
              <Icon className="w-6 h-6 text-[var(--cevons-deep-green,#006B35)]" />
              <span className="text-sm font-semibold text-[var(--cevons-deep-green,#006B35)]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
