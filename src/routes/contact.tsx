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
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Contact methods">
        <div className="container-cevons">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactMethods.map(({ icon: Icon, title, body, action, href, primary }, i) => (
              <div
                key={title}
                className={`rounded-2xl bg-white border p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  primary
                    ? "border-[var(--cevons-deep-green,#EF7700)]/20 ring-1 ring-[var(--cevons-deep-green,#EF7700)]/10"
                    : "border-[var(--cevons-deep-green,#EF7700)]/10"
                } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span className={`flex w-12 h-12 items-center justify-center rounded-xl mb-4 ${
                  primary ? "bg-[var(--cevons-deep-green,#EF7700)] text-white" : "bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)]"
                }`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{body}</p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-4 py-2.5 text-sm transition-colors w-full ${
                    primary
                      ? "bg-[var(--cevons-deep-green,#EF7700)] text-white hover:bg-[var(--cevons-deep-green,#EF7700)]/90"
                      : "border-2 border-[var(--cevons-deep-green,#EF7700)] text-[var(--cevons-deep-green,#EF7700)] hover:bg-[var(--cevons-deep-green,#EF7700)] hover:text-white"
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
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#B58900]">{b.label}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[var(--cevons-muted,#64748B)]">
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
      <section className="bg-[var(--cevons-cream,#FBF7EE)] py-14 md:py-20" aria-label="Urgent assistance">
        <div className="container-cevons">
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_60px_-25px_rgba(239,119,0,0.55)] ring-1 ring-black/5">
            {/* Background gradient + decorative texture */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, #C45F00 0%, #EF7700 45%, #FF8A2A 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.7) 1px, transparent 1.5px)",
                backgroundSize: "22px 22px, 32px 32px",
              }}
            />
            <div
              aria-hidden
              className="absolute -left-24 -bottom-24 size-[420px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,210,0,0.35) 0%, transparent 65%)" }}
            />
            <div
              aria-hidden
              className="absolute -right-32 -top-32 size-[480px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)" }}
            />

            {/* Content grid */}
            <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center p-8 sm:p-10 md:p-12 lg:p-14">
              {/* LEFT: copy */}
              <div className="text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  24/7 Emergency Line
                </span>

                <div className="mt-5 flex items-start gap-5">
                  <span className="hidden sm:flex shrink-0 size-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                    <Siren className="size-8 text-white drop-shadow" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                      Need Urgent <br className="hidden sm:inline" />
                      <span className="text-[#FFE9B8]">Assistance?</span>
                    </h2>
                    <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed max-w-xl">
                      Contact our team right away for fast support, urgent service coordination, or immediate guidance — anywhere in Guyana.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/90 text-sm font-semibold">
                  <li className="flex items-center gap-2"><Clock3 className="size-4" /> Avg. response &lt; 30 min</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="size-4" /> Licensed &amp; insured</li>
                  <li className="flex items-center gap-2"><Headphones className="size-4" /> Live dispatch</li>
                </ul>
              </div>

              {/* RIGHT: action card */}
              <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/60">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF7700]">Talk to us now</p>

                <a
                  href={primaryTelHref}
                  className="mt-2 flex items-center gap-3 text-[#1A1A1A] hover:text-[#EF7700] transition-colors group"
                >
                  <Phone className="size-6 text-[#EF7700] shrink-0" />
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight group-hover:underline underline-offset-4 decoration-[#EF7700]/40">
                    {cevonsContact.primaryPhone}
                  </span>
                </a>
                <p className="mt-1 text-sm text-[#64748B]">Tap to call our dispatch line.</p>

                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-[#64748B]">
                  <span className="h-px flex-1 bg-[#E5E7EB]" /> or <span className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <a
                    href={whatsappHref}
                    {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#2DA339] text-white font-bold hover:bg-[#258A30] hover:-translate-y-0.5 transition shadow-[0_10px_24px_rgba(45,163,57,0.35)]"
                  >
                    <WhatsApp className="size-5" /> WhatsApp
                  </a>
                  <a
                    href={primaryMailtoHref}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border-2 border-[#EF7700] text-[#EF7700] font-bold hover:bg-[#EF7700] hover:text-white transition"
                  >
                    <Mail className="size-5" /> Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


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
