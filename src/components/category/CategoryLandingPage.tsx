import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Building2,
  Factory,
  Layers3,
  Recycle,
  ShieldCheck,
  ShieldAlert,
  Compass,
  ClipboardList,
  Plus,
  Minus,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";
import { CevonsIcon } from "@/components/CevonsIcon";
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { whatsappHref } from "@/data/cevonsContact";
import { getServicesForSection, type ServiceCategory, type Service } from "@/data/services";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";

const heroImage = "/assets/heroes/hero-services.webp";

type CategoryConfig = {
  label: string;
  headline: string;
  intro: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryIconKey?: CevonsCategoryKey;
  variant: "light" | "dark" | "green";
  ctaVariant: "routine" | "specialist";
  faqs: { q: string; a: string }[];
};

const configs: Record<ServiceCategory, CategoryConfig> = {
  residential: {
    label: "Residential",
    headline: "Reliable, neighbourly waste service for homes and communities",
    intro:
      "Dependable pickups, clear schedules, and courteous crews — CEVONS keeps Guyanese homes and residential communities clean, tidy, and worry-free.",
    icon: Home,
    categoryIconKey: "residential",
    variant: "light",
    ctaVariant: "routine",
    faqs: [
      {
        q: "How do I set up residential trash collection?",
        a: "Send us your address by WhatsApp or the Request a Service form. We'll confirm your collection day, bin requirements, and pricing before your first pickup.",
      },
      {
        q: "Can I rent a dumpster for a home renovation?",
        a: "Yes. We offer short and long term dumpster rentals sized for cleanouts, renovations, and yard projects, with delivery and pickup coordinated to your schedule.",
      },
      {
        q: "Do you service my neighbourhood?",
        a: "CEVONS services Georgetown, Linden, and Berbice with regional teams covering all ten regions of Guyana. Share your location and we'll confirm coverage.",
      },
      {
        q: "What if I miss my collection day?",
        a: "Reach out through WhatsApp or the contact form. In most cases we can arrange a courtesy pickup or add you to the next scheduled route.",
      },
    ],
  },
  commercial: {
    label: "Commercial",
    headline: "Scheduled waste programs and sanitation for businesses and properties",
    intro:
      "From offices and retail to hospitality and institutions, CEVONS designs commercial waste programs that keep your operations compliant, presentable, and efficient.",
    icon: Building2,
    categoryIconKey: "commercial",
    variant: "light",
    ctaVariant: "routine",
    faqs: [
      {
        q: "Can you build a custom collection schedule for my business?",
        a: "Yes. We assess volume, waste streams, and site access, then propose a schedule and equipment mix that fits your operations and budget.",
      },
      {
        q: "Do you provide grease trap and septic servicing for restaurants?",
        a: "We service grease traps and septic systems for restaurants, hotels, and facilities with documented pickups and compliant disposal.",
      },
      {
        q: "Is document shredding certified?",
        a: "Yes. Our document destruction services provide chain-of-custody handling with certificates of destruction on request.",
      },
      {
        q: "Can I combine multiple services into one contract?",
        a: "Absolutely. Many commercial clients bundle general waste, sanitation, and recycling into a single agreement with one point of contact at CEVONS.",
      },
    ],
  },
  industrial: {
    label: "Industrial",
    headline: "Compliance-grade, specialist-reviewed handling of regulated waste",
    intro:
      "Hazardous, liquid, and high-risk industrial waste requires specialists, documentation, and disciplined logistics. CEVONS delivers compliance-first operations for Guyana's most demanding sites.",
    icon: Factory,
    categoryIconKey: "industrial",
    variant: "dark",
    ctaVariant: "specialist",
    faqs: [
      {
        q: "Which industrial services require specialist review?",
        a: "Hazardous waste, wastewater, used waste oil, contaminated soil, tank cleaning, product destruction, and biohazardous disposal are all reviewed by a CEVONS specialist to confirm scope, safety, and compliance.",
      },
      {
        q: "How long does specialist review take?",
        a: "Most reviews are completed within one to two business days. We may request site photos, safety data sheets, or a brief walkthrough before quoting.",
      },
      {
        q: "Do you provide documentation for regulators and audits?",
        a: "Yes. Every regulated pickup includes manifests and disposal records so your compliance and audit trails are complete.",
      },
      {
        q: "Can you support ongoing industrial contracts?",
        a: "Yes. We support long-term industrial contracts with dedicated account management, scheduled servicing, and emergency response availability.",
      },
    ],
  },
  facilities: {
    label: "Facilities",
    headline: "Large-scale recovery and landfill infrastructure for Guyana",
    intro:
      "CEVONS operates and supports the infrastructure that keeps Guyana clean — material recovery, engineered landfill operations, and the systems that turn waste into a managed resource.",
    icon: Layers3,
    categoryIconKey: "facilities",
    variant: "light",
    ctaVariant: "routine",
    faqs: [
      {
        q: "Can businesses direct waste to your facilities?",
        a: "Yes. Commercial and industrial clients can route eligible waste streams to CEVONS facilities with a pre-arranged agreement and documentation.",
      },
      {
        q: "What environmental controls are in place at your landfill?",
        a: "Our landfill operations include leachate management, compaction protocols, and periodic environmental monitoring aligned with local regulations.",
      },
      {
        q: "Do you accept public drop-offs?",
        a: "Facilities access is typically arranged in advance. Contact us to confirm accepted materials, hours, and any documentation required.",
      },
      {
        q: "How do facilities support recycling in Guyana?",
        a: "Our material recovery facility sorts and recovers usable materials from mixed waste, diverting volume from landfill and returning value to local supply chains.",
      },
    ],
  },
  recycling: {
    label: "Recycling",
    headline: "CEVONS's commitment to recycling and environmental preservation",
    intro:
      "Recycling is at the heart of a cleaner, greener Guyana. From material recovery to scrap metal, cooking oil, and plastics — we're building the programs that keep valuable resources in circulation.",
    icon: Recycle,
    variant: "green",
    ctaVariant: "routine",
    faqs: [
      {
        q: "Which materials does CEVONS recycle?",
        a: "We handle ferrous and non-ferrous scrap metals, used cooking oil, business plastics, and mixed recyclables processed through our material recovery facility.",
      },
      {
        q: "Can restaurants schedule regular used cooking oil pickups?",
        a: "Yes. We offer scheduled collection for restaurants and commercial kitchens with sealed containers and documented disposal.",
      },
      {
        q: "Is my recycling actually recycled?",
        a: "Yes. Our recycling programs work with verified processors and end destinations, and we share transparent reporting on request.",
      },
      {
        q: "How do I start a recycling program at my business?",
        a: "Reach out and we'll audit your waste streams, recommend the right containers and pickup frequency, and set up transparent reporting from day one.",
      },
    ],
  },
};

export function getCategoryConfig(category: ServiceCategory): CategoryConfig {
  return configs[category];
}

function ServiceCard({ s, variant }: { s: Service; variant: "light" | "industrial" | "green" }) {
  if (variant === "industrial") {
    return (
      <article className="group relative rounded-2xl border border-white/10 bg-[#062a1c] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cevons-yellow)]/50 hover:shadow-[0_20px_50px_-20px_rgba(0,107,53,0.6)]">
        <div className="flex items-start gap-4">
          <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#101820] ring-1 ring-[var(--cevons-yellow)]/30 shadow-md">
            <CevonsIcon group="services" name={s.iconKey} fill decorative />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cevons-yellow)]">
                <ShieldCheck className="size-3" /> Specialist
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{s.shortBody}</p>
          </div>
        </div>
        <Link
          to={s.path}
          className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--cevons-yellow)] hover:gap-2 transition-all"
        >
          Request Specialist Review <ArrowRight className="size-4" />
        </Link>
      </article>
    );
  }
  const accent = variant === "green" ? "hover:border-[#00563d]" : "hover:border-[var(--cevons-green)]";
  const titleColor = variant === "green" ? "text-[#00432a]" : "text-[var(--cevons-deep-green)]";
  const linkColor = variant === "green" ? "text-[#00563d]" : "text-[var(--cevons-deep-green)]";
  return (
    <article className={`group relative rounded-2xl border border-[var(--cevons-deep-green)]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 ${accent} hover:shadow-xl`}>
      <span className="relative flex h-20 w-20 overflow-hidden rounded-2xl bg-[#101820] ring-1 ring-[var(--cevons-green)]/15 shadow-sm mb-4 transition-transform duration-300 group-hover:scale-[1.04]">
        <CevonsIcon group="services" name={s.iconKey} fill decorative />
      </span>
      <h3 className={`text-lg font-bold ${titleColor}`}>{s.title}</h3>
      <p className="mt-2 text-sm text-[var(--cevons-muted)] leading-relaxed">{s.shortBody}</p>
      <div className="mt-5 flex items-center gap-4 flex-wrap">
        <Link
          to={s.path}
          className={`inline-flex items-center gap-1 text-sm font-bold ${linkColor} hover:gap-2 transition-all`}
        >
          Learn more <ArrowRight className="size-4" />
        </Link>
        <span className="text-[var(--cevons-border)]">•</span>
        <Link
          to="/request-service"
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--cevons-green)] hover:gap-2 transition-all"
        >
          Request Service <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function CategoryLandingPage({ category }: { category: ServiceCategory }) {
  const cfg = configs[category];
  const services = getServicesForSection(category);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isDark = cfg.variant === "dark";
  const isGreen = cfg.variant === "green";
  const cardVariant: "light" | "industrial" | "green" =
    isDark ? "industrial" : isGreen ? "green" : "light";

  const Icon = cfg.icon;

  return (
    <SiteLayout>
      {/* HERO */}
      <section
        className={`relative overflow-hidden ${isDark ? "text-white" : ""}`}
        style={
          isDark
            ? {
                background:
                  "radial-gradient(120% 100% at 0% 0%, #00432a 0%, #002b1b 60%, #00190f 100%)",
              }
            : undefined
        }
      >
        {!isDark && (
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="size-full object-cover"
              width={1920}
              height={800}
              loading="eager"
            />
            <div className="absolute inset-0 hero-photo-overlay" />
          </div>
        )}
        {isDark && (
          <>
            <div aria-hidden="true" className="absolute -top-20 -right-20 size-64 rounded-full bg-[var(--cevons-green)]/20 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[var(--cevons-yellow)]/10 blur-3xl" />
          </>
        )}
        <div className="container-cevons relative min-h-[360px] md:min-h-[440px] flex flex-col justify-center py-20 md:py-24 z-10">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm ${isDark ? "text-white/80" : "text-white/85"}`}>
              <li>
                <Link to="/" className="hover:text-[var(--cevons-yellow)] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li>
                <Link to="/services" className="hover:text-[var(--cevons-yellow)] transition-colors">
                  Services
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow)] font-semibold">
                {cfg.label}
              </li>
            </ol>
          </nav>

          <div className="flex items-start gap-5">
            <span
              className={`hidden sm:flex shrink-0 size-20 items-center justify-center rounded-2xl ${
                isDark ? "bg-white/10 ring-1 ring-white/15" : "bg-white/15 ring-1 ring-white/25 backdrop-blur-sm"
              } shadow-[0_10px_30px_rgba(0,0,0,0.25)] overflow-hidden`}
            >
              {cfg.categoryIconKey ? (
                <CevonsIcon group="categories" name={cfg.categoryIconKey} fill decorative />
              ) : (
                <Icon className="size-10 text-white" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] mb-3 ${
                  isDark ? "text-[var(--cevons-yellow)]" : "text-[var(--cevons-yellow)]"
                }`}
              >
                {isDark ? <ShieldAlert className="size-3.5" /> : <Icon className="size-3.5" />}
                {cfg.label} Services
              </p>
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] ${
                  isDark ? "text-white" : "text-white"
                }`}
              >
                {cfg.headline}
              </h1>
              <p className={`mt-5 text-base md:text-xl max-w-2xl ${isDark ? "text-white/85" : "text-white/90"}`}>
                {cfg.intro}
              </p>
            </div>
          </div>
        </div>
        {!isDark && <WaveHalftoneDivider height={48} />}
      </section>

      {/* SERVICES GRID */}
      <section
        className={`section-y ${
          isDark
            ? ""
            : isGreen
              ? "bg-white"
              : "bg-[var(--cevons-cream)]"
        }`}
        style={
          isDark
            ? {
                background:
                  "radial-gradient(120% 100% at 100% 0%, #00432a 0%, #002b1b 60%, #00190f 100%)",
              }
            : undefined
        }
      >
        <div className="container-cevons">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 inline-flex items-center gap-2 ${
                  isDark
                    ? "text-[var(--cevons-yellow)]"
                    : isGreen
                      ? "text-[#00563d]"
                      : "text-[var(--cevons-deep-green)]"
                }`}
              >
                <Icon className="size-4" /> {cfg.label}
              </p>
              <h2
                className={`text-3xl md:text-4xl font-extrabold ${
                  isDark ? "text-white" : isGreen ? "text-[#00432a]" : "text-[var(--cevons-deep-green)]"
                }`}
              >
                {cfg.label} Services
              </h2>
              <p
                className={`mt-2 max-w-2xl ${
                  isDark ? "text-white/80" : "text-[var(--cevons-muted)]"
                }`}
              >
                {cfg.intro}
              </p>
            </div>
            {isDark && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                <ShieldCheck className="size-3.5 text-[var(--cevons-yellow)]" />
                Compliance-First Operations
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <ServiceCard key={s.slug} s={s} variant={cardVariant} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {cfg.ctaVariant === "specialist" ? (
        <OrangeCTABanner
          icon={ShieldCheck}
          eyebrow="Specialist Review"
          title="Regulated Waste? Talk to a CEVONS Specialist."
          subtitle="Share your scope and we'll assess safety, compliance, and logistics before scheduling."
        >
          <a
            href="/request-service?type=specialist"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-[var(--brand-orange)] font-bold hover:bg-white/95 hover:-translate-y-0.5 transition shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
          >
            <ClipboardList className="size-5" /> Request Specialist Review
          </a>
          <a
            href={whatsappHref}
            {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[#2DA339] text-white font-bold hover:bg-[#258A30] hover:-translate-y-0.5 transition shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
          >
            <WhatsApp className="size-5" /> WhatsApp Us
          </a>
        </OrangeCTABanner>
      ) : (
        <OrangeCTABanner
          icon={Compass}
          title={`Ready to book a ${cfg.label} service?`}
          subtitle="Tell us what you need and our team will follow up with a quote and schedule."
        >
          <Link
            to="/request-service"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-[var(--brand-orange)] font-bold hover:bg-white/95 hover:-translate-y-0.5 transition shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
          >
            <ClipboardList className="size-5" /> Request a Quote
          </Link>
          <a
            href={whatsappHref}
            {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[#2DA339] text-white font-bold hover:bg-[#258A30] hover:-translate-y-0.5 transition shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
          >
            <WhatsApp className="size-5" /> WhatsApp Us
          </a>
        </OrangeCTABanner>
      )}

      {/* FAQ */}
      <section className="section-y bg-[var(--cevons-cream)]">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-3">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green)]">
              {cfg.label} — Frequently Asked
            </h2>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-[var(--cevons-deep-green)]/10 rounded-2xl bg-white border border-[var(--cevons-deep-green)]/10 shadow-sm">
            {cfg.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-base md:text-lg font-bold text-[var(--cevons-deep-green)]">{f.q}</span>
                    <span
                      className={`shrink-0 flex size-8 items-center justify-center rounded-full bg-[var(--cevons-deep-green)]/10 text-[var(--cevons-deep-green)] transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    >
                      {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-5 -mt-1 text-sm md:text-base text-[var(--cevons-muted)] leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export default CategoryLandingPage;
