import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Building2,
  Factory,
  Recycle,
  Trash2,
  Container,
  Droplet,
  Waves,
  FileText,
  ShieldAlert,
  Flame,
  Beaker,
  Sprout,
  PackageX,
  Biohazard,
  Truck,
  Mountain,
  ShieldCheck,
  Award,
  Clock3,
  Headphones,
  Leaf,
  MessageCircle,
  HelpCircle,
  Layers3,
  Wrench,
  Plus,
  Minus,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsServiceKey, CevonsCategoryKey } from "@/data/cevonsIconRegistry";
import forestBg from "@/assets/forest-bg.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | CEVON’S Environmental Services — Guyana" },
      {
        name: "description",
        content:
          "Complete waste management and environmental services for homes, businesses, industries, and facilities across Georgetown, Linden, and Berbice.",
      },
      { property: "og:title", content: "CEVON’S Services — Waste Management Guyana" },
      {
        property: "og:description",
        content:
          "Residential, commercial, industrial, and facility waste services across Guyana.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

type CategoryKey = "residential" | "commercial" | "industrial" | "facilities";
type FilterKey = "all" | CategoryKey;

type ServiceItem = {
  title: string;
  body: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  iconKey: CevonsServiceKey;
};

const residential: ServiceItem[] = [
  { title: "General Trash Collection", slug: "/services/general-trash-collection", icon: Trash2, iconKey: "general-trash-collection", body: "Reliable household waste pickup on a schedule that fits your community." },
  { title: "Dumpster Rental", slug: "/services/dumpster-rental", icon: Container, iconKey: "dumpster-rental", body: "Short or long term dumpster rentals for home projects and cleanouts." },
  { title: "Septic Services", slug: "/services/septic-services", icon: Droplet, iconKey: "septic-services", body: "Safe, efficient septic tank pumping and clearance for homes." },
  { title: "Portable Toilet", slug: "/services/portable-toilet", icon: Waves, iconKey: "portable-toilet", body: "Clean, hygienic portable toilet rentals for residential events and projects." },
];

const commercial: ServiceItem[] = [
  { title: "General Waste Management", slug: "/services/general-waste-management", icon: Trash2, iconKey: "general-waste-management", body: "Scheduled collection and waste programs for businesses and properties." },
  { title: "Skip Bin & Dumpster Rental", slug: "/services/skip-bin-dumpster-rental", icon: Container, iconKey: "skip-bin", body: "Multiple sizes for construction, renovation, and ongoing site needs." },
  { title: "Portable Toilet", slug: "/services/portable-toilet", icon: Waves, iconKey: "portable-toilet", body: "Sanitation units for sites, events, and commercial properties." },
  { title: "Grease Trap / Septic Tank", slug: "/services/grease-trap-septic-tank", icon: Droplet, iconKey: "grease-trap", body: "Grease trap and septic servicing for restaurants and facilities." },
  { title: "Document Shredding", slug: "/services/document-shredding", icon: FileText, iconKey: "document-shredding", body: "Secure on-site or off-site document destruction with chain-of-custody." },
];

const industrial: ServiceItem[] = [
  { title: "Hazardous Waste", slug: "/services/hazardous-waste", icon: ShieldAlert, iconKey: "hazardous-waste", body: "Regulated handling, transport, and disposal of hazardous waste streams." },
  { title: "Wastewater", slug: "/services/wastewater", icon: Waves, iconKey: "liquid-wastewater", body: "Industrial wastewater collection and treatment coordination." },
  { title: "Used Waste Oil", slug: "/services/used-waste-oil", icon: Flame, iconKey: "used-waste-oil", body: "Compliant collection and responsible recycling of used waste oil." },
  { title: "Contaminated Soil", slug: "/services/contaminated-soil", icon: Sprout, iconKey: "contaminated-soil", body: "Excavation, transport, and treatment of contaminated solid waste." },
  { title: "Tank Cleaning", slug: "/services/tank-cleaning", icon: Beaker, iconKey: "tank-cleaning", body: "Industrial tank cleaning with safety controls and proper waste disposal." },
  { title: "Product Destruction", slug: "/services/product-destruction", icon: PackageX, iconKey: "product-destruction", body: "Certified product destruction with auditable documentation." },
  { title: "Biohazardous Disposal", slug: "/services/biohazardous-disposal", icon: Biohazard, iconKey: "biohazardous-disposal", body: "Safe biohazardous waste collection and compliant disposal." },
];

const facilities: ServiceItem[] = [
  { title: "Material Recovery Facility", slug: "/services/material-recovery-facility", icon: Recycle, iconKey: "material-recovery", body: "Sorting and recovery infrastructure that turns waste into resources." },
  { title: "Landfill Operations", slug: "/services/landfill-operations", icon: Mountain, iconKey: "landfill-operations", body: "Managed landfill operations with environmental safeguards." },
];

const categoryOverview: {
  key: CategoryKey;
  label: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
  items: string[];
  accent: string;
}[] = [
  {
    key: "residential",
    label: "Residential",
    title: "Homes & Communities",
    icon: Home,
    blurb: "Reliable, neighbourly waste solutions for households across Guyana.",
    items: residential.map((s) => s.title),
    accent: "from-[#006B35] to-[#00713A]",
  },
  {
    key: "commercial",
    label: "Commercial",
    title: "Businesses & Properties",
    icon: Building2,
    blurb: "Scheduled collection and sanitation for offices, retail, and institutions.",
    items: commercial.map((s) => s.title),
    accent: "from-[#FFD200] to-[#F0C500]",
  },
  {
    key: "industrial",
    label: "Industrial",
    title: "Specialized & Regulated",
    icon: Factory,
    blurb: "Compliance-grade handling for hazardous, liquid, and solid industrial waste.",
    items: industrial.map((s) => s.title),
    accent: "from-[#003F27] to-[#002819]",
  },
  {
    key: "facilities",
    label: "Facilities",
    title: "Environmental Infrastructure",
    icon: Layers3,
    blurb: "Large-scale recovery and landfill operations supporting cleaner Guyana.",
    items: facilities.map((s) => s.title),
    accent: "from-[#00563d] to-[#003F27]",
  },
];

const tabs: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "industrial", label: "Industrial" },
  { key: "facilities", label: "Facilities" },
];

const faqs = [
  {
    q: "What types of waste does CEVON’S handle?",
    a: "We handle residential trash, commercial waste, industrial and hazardous waste, liquid waste (wastewater and used waste oil), contaminated soil, biohazardous waste, and more across our facilities.",
  },
  {
    q: "Do you provide commercial and industrial services?",
    a: "Yes. CEVON’S supports businesses, properties, institutions, and industrial operators with scheduled collection, rentals, sanitation, and specialized waste programs.",
  },
  {
    q: "Can I book online?",
    a: "Most standard services can be requested through our Request a Service form. Specialized industrial services route to a specialist for review and confirmation before scheduling.",
  },
  {
    q: "Which services require specialist review?",
    a: "Hazardous waste, wastewater, used waste oil, contaminated soil, tank cleaning, product destruction, and biohazardous disposal are reviewed by a specialist to confirm scope, safety, and compliance.",
  },
  {
    q: "Do you serve Georgetown, Linden, and Berbice?",
    a: "Yes — CEVON’S operates across Georgetown, Linden, and Berbice, with regional teams supporting each area.",
  },
  {
    q: "Can I upload photos or documents with my request?",
    a: "Yes. The Request a Service form lets you attach photos, site details, or documents so our team can route the request and respond quickly.",
  },
];

function HeroSwoosh() {
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full h-[70px] md:h-[100px] z-10 pointer-events-none"
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
    >
      <path d="M0,90 C480,30 980,10 1440,0 L1440,110 L0,110 Z" fill="#FFD200" />
      <path d="M0,70 C520,20 1000,8 1440,-10 L1440,60 C1000,40 520,55 0,90 Z" fill="#E31B23" />
    </svg>
  );
}

function ServiceCard({ s, variant = "light" }: { s: ServiceItem; variant?: "light" | "industrial" }) {
  if (variant === "industrial") {
    return (
      <article className="group relative rounded-2xl border border-white/10 bg-[#062a1c] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cevons-yellow)]/50 hover:shadow-[0_20px_50px_-20px_rgba(0,107,53,0.6)]">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 ring-1 ring-[var(--cevons-yellow)]/30 shadow-md">
            <CevonsIcon group="services" name={s.iconKey} size="md" decorative />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cevons-yellow)]">
                <ShieldCheck className="size-3" /> Specialist
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{s.body}</p>
          </div>
        </div>
        <a
          href={s.slug}
          className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--cevons-yellow)] hover:gap-2 transition-all"
        >
          Request Specialist Review <ArrowRight className="size-4" />
        </a>
      </article>
    );
  }
  return (
    <article className="group relative rounded-2xl border border-[var(--cevons-deep-green)]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cevons-green)] hover:shadow-xl">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cevons-cream)] to-[var(--cevons-green)]/10 ring-1 ring-[var(--cevons-green)]/15 shadow-sm mb-4 transition-transform duration-300 group-hover:scale-[1.04]">
        <CevonsIcon group="services" name={s.iconKey} size="lg" decorative />
      </span>
      <h3 className="text-lg font-bold text-[var(--cevons-deep-green)]">{s.title}</h3>
      <p className="mt-2 text-sm text-[var(--cevons-muted)] leading-relaxed">{s.body}</p>
      <div className="mt-5 flex items-center gap-4">
        <a
          href={s.slug}
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--cevons-deep-green)] hover:gap-2 transition-all"
        >
          Learn More <ArrowRight className="size-4" />
        </a>
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

function ServicesPage() {
  const [active, setActive] = useState<FilterKey>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showResidential = active === "all" || active === "residential";
  const showCommercial = active === "all" || active === "commercial";
  const showIndustrial = active === "all" || active === "industrial";
  const showFacilities = active === "all" || active === "facilities";

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={forestBg}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
            width={1920}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cevons-deep-green)]/95 via-[var(--cevons-deep-green)]/85 to-[var(--cevons-deep-green)]/60" />
        </div>
        <div className="container-cevons relative min-h-[360px] md:min-h-[440px] flex flex-col justify-center py-20 md:py-24 z-10">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-1.5 text-xs md:text-sm text-white/80">
              <li><Link to="/" className="hover:text-[var(--cevons-yellow)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow)] font-semibold">Services</li>
            </ol>
          </nav>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-tight">
            Our Services
          </h1>
          <p className="mt-4 text-white/85 text-base md:text-xl max-w-2xl">
            Complete waste management and environmental solutions for homes, businesses, industries, and facilities across Guyana.
          </p>
        </div>
        <HeroSwoosh />
      </section>

      {/* CATEGORY TABS (sticky) */}
      <div
        className={`sticky top-[72px] z-40 transition-shadow ${stuck ? "shadow-[0_4px_16px_rgba(16,24,32,0.06)]" : ""} bg-white/95 backdrop-blur border-b border-[var(--cevons-border)]`}
      >
        <div className="container-cevons">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {tabs.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setActive(t.key);
                    if (t.key !== "all") {
                      const el = document.getElementById(`section-${t.key}`);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 130;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    } else {
                      window.scrollTo({ top: 480, behavior: "smooth" });
                    }
                  }}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--cevons-deep-green)] text-white shadow-sm"
                      : "bg-[var(--cevons-cream)] text-[var(--cevons-deep-green)] hover:bg-[var(--cevons-green)]/10"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CATEGORY OVERVIEW */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-3">Service Categories</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green)]">
              Explore by Category
            </h2>
            <p className="mt-4 text-[var(--cevons-muted)]">
              Four service families covering every waste and environmental need across Guyana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryOverview.map(({ key, label, title, icon: Icon, blurb, items, accent }) => {
              const isIndustrial = key === "industrial";
              const isYellow = key === "commercial";
              return (
                <article
                  key={key}
                  className={`relative overflow-hidden rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isYellow
                      ? "bg-gradient-to-br from-[#FFD200] to-[#F0C500] text-[var(--cevons-dark)] border-[#E0B800]"
                      : `bg-gradient-to-br ${accent} text-white border-white/10`
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-12 -top-12 size-48 rounded-full opacity-20"
                    style={{ background: isYellow ? "rgba(16,24,32,0.15)" : "rgba(255,210,0,0.4)" }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5">
                        <CevonsIcon group="categories" name={key as CevonsCategoryKey} size="xl" decorative />
                      </span>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isYellow ? "text-[var(--cevons-dark)]/70" : "text-[var(--cevons-yellow)]"}`}>{label}</p>
                        <h3 className={`text-2xl font-extrabold ${isYellow ? "text-[var(--cevons-dark)]" : "text-white"}`}>{title}</h3>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isYellow ? "text-[var(--cevons-dark)]/85" : "text-white/85"}`}>
                      {blurb}
                    </p>
                    <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {items.map((it) => (
                        <li
                          key={it}
                          className={`flex items-start gap-2 text-sm ${isYellow ? "text-[var(--cevons-dark)]/90" : "text-white/90"}`}
                        >
                          <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${isYellow ? "bg-[var(--cevons-dark)]" : "bg-[var(--cevons-yellow)]"}`} />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setActive(key);
                        const el = document.getElementById(`section-${key}`);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 130;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }}
                      className={`mt-6 inline-flex items-center gap-2 font-bold text-sm ${
                        isYellow ? "text-[var(--cevons-dark)] hover:gap-3" : "text-[var(--cevons-yellow)] hover:gap-3"
                      } transition-all ${isIndustrial ? "" : ""}`}
                    >
                      Explore {label} <ArrowRight className="size-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESIDENTIAL */}
      {showResidential && (
        <section id="section-residential" className="section-y bg-[var(--cevons-cream)] scroll-mt-32">
          <div className="container-cevons">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-2 inline-flex items-center gap-2">
                  <Home className="size-4" /> Residential
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green)]">
                  Residential Waste Services
                </h2>
                <p className="mt-2 text-[var(--cevons-muted)] max-w-2xl">
                  Reliable waste solutions for homes and residential communities.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {residential.map((s) => (
                <ServiceCard key={s.title} s={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMERCIAL */}
      {showCommercial && (
        <section id="section-commercial" className="section-y bg-white scroll-mt-32">
          <div className="container-cevons">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-2 inline-flex items-center gap-2">
                  <Building2 className="size-4" /> Commercial
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green)]">
                  Commercial Waste Services
                </h2>
                <p className="mt-2 text-[var(--cevons-muted)] max-w-2xl">
                  Waste management and sanitation solutions for businesses, properties, and institutions.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {commercial.map((s) => (
                <ServiceCard key={s.title} s={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INDUSTRIAL */}
      {showIndustrial && (
        <section
          id="section-industrial"
          className="section-y relative overflow-hidden scroll-mt-32 text-white"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, #00432a 0%, #002b1b 60%, #00190f 100%)",
          }}
        >
          <div aria-hidden="true" className="absolute -top-20 -right-20 size-64 rounded-full bg-[var(--cevons-green)]/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[var(--cevons-yellow)]/10 blur-3xl" />
          <div className="container-cevons relative">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-yellow)] mb-2 inline-flex items-center gap-2">
                  <ShieldAlert className="size-4" /> Industrial
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                  Industrial & Specialized Waste
                </h2>
                <p className="mt-2 text-white/80 max-w-2xl">
                  Professional handling for specialized, regulated, and high-risk waste streams.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                <ShieldCheck className="size-3.5 text-[var(--cevons-yellow)]" />
                Compliance-First Operations
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {industrial.map((s) => (
                <ServiceCard key={s.title} s={s} variant="industrial" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FACILITIES */}
      {showFacilities && (
        <section id="section-facilities" className="section-y bg-[var(--cevons-cream)] scroll-mt-32">
          <div className="container-cevons">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-2 inline-flex items-center gap-2 justify-center">
                <Layers3 className="size-4" /> Facilities
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green)]">
                Facilities & Environmental Infrastructure
              </h2>
              <p className="mt-2 text-[var(--cevons-muted)]">
                Large-scale recovery and disposal infrastructure supporting Guyana’s waste ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((s) => {
                const Icon = s.icon;
                return (
                  <article
                    key={s.title}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--cevons-deep-green)]/15 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-10 -bottom-10 size-40 rounded-full bg-[var(--cevons-deep-green)]/5"
                    />
                    <div className="relative flex items-start gap-5">
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--cevons-deep-green)] text-[var(--cevons-yellow)]">
                        <Icon className="size-8" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--cevons-green)]">Infrastructure</p>
                        <h3 className="mt-1 text-2xl font-extrabold text-[var(--cevons-deep-green)]">{s.title}</h3>
                        <p className="mt-3 text-sm text-[var(--cevons-muted)] leading-relaxed">{s.body}</p>
                        <a
                          href={s.slug}
                          className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--cevons-deep-green)] hover:gap-2 transition-all"
                        >
                          Learn More <ArrowRight className="size-4" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* "Not Sure" CTA */}
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
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <p className="text-[var(--cevons-yellow)] text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <HelpCircle className="size-4" /> Need Guidance?
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Not sure which service fits your request?
              </h2>
              <p className="mt-4 text-white/85 max-w-xl mx-auto">
                Tell us what you need and our team will route your request to the right service.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/request-service" className="btn-base btn-yellow text-base px-6 py-3.5">
                  <Wrench className="size-5" /> Request a Service
                </Link>
                <a
                  href="/contact"
                  className="btn-base btn-green text-base px-6 py-3.5"
                >
                  <WhatsApp className="size-5" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y bg-[var(--cevons-cream)]">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green)] mb-3">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green)]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-[var(--cevons-deep-green)]/10 rounded-2xl bg-white border border-[var(--cevons-deep-green)]/10 shadow-sm">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-base md:text-lg font-bold text-[var(--cevons-deep-green)]">{f.q}</span>
                    <span className={`shrink-0 flex size-8 items-center justify-center rounded-full bg-[var(--cevons-deep-green)]/10 text-[var(--cevons-deep-green)] transition-transform ${open ? "rotate-180" : ""}`}>
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

      {/* Trust strip */}
      <section className="bg-white border-t border-[var(--cevons-deep-green)]/10">
        <div className="container-cevons py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "Licensed & Insured" },
            { icon: Clock3, label: "Same-Day Response" },
            { icon: Award, label: "Trusted Across Guyana" },
            { icon: Headphones, label: "Responsive Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center text-center">
              <Icon className="w-6 h-6 text-[var(--cevons-deep-green)]" />
              <span className="text-sm font-semibold text-[var(--cevons-deep-green)]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
