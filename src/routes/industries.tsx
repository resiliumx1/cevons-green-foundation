import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Factory,
  Hospital,
  GraduationCap,
  Utensils,
  Landmark,
  HardHat,
  Warehouse,
  ChevronRight,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  Recycle,
  FileText,
  MessageCircle,
  Award,
  Layers,
  MapPin,
  Leaf,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Headphones,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveDivider } from "@/components/WaveDivider";
import { whatsappHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";
import { SocialProofMarquee } from "@/components/SocialProofMarquee";
const heroIndustries = "/assets/heroes/hero-industries.webp";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgResidential from "@/assets/svc-residential.jpg";
import imgToilet from "@/assets/svc-toilet.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgSkip from "@/assets/svc-skip.jpg";
import imgWastewater from "@/assets/svc-wastewater.jpg";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries Served | CEVONS Environmental Services Guyana" },
      { name: "description", content: "CEVONS serves commercial, industrial, healthcare, education, hospitality, construction, logistics, and government clients across Guyana." },
      { property: "og:title", content: "Industries Served | CEVONS Environmental Services Guyana" },
      { property: "og:description", content: "CEVONS serves commercial, industrial, healthcare, education, hospitality, construction, and government clients across Guyana." },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "Industries", path: "/industries" },
      ])) },
    ],
  }),
  component: IndustriesPage,
});

type Industry = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  img: string;
  alt: string;
};

const industries: Industry[] = [
  {
    title: "Commercial Real Estate",
    description: "Waste and environmental services for commercial properties, plazas, and managed facilities.",
    icon: Building2,
    img: imgCommercial,
    alt: "Commercial property building with clean surroundings",
  },
  {
    title: "Manufacturing & Industrial Facilities",
    description: "Specialized support for industrial waste streams, wastewater, waste oil, and facility needs.",
    icon: Factory,
    img: imgIndustrial,
    alt: "Industrial facility with organized waste management systems",
  },
  {
    title: "Healthcare & Hospitals",
    description: "Professional waste support for healthcare facilities, clinics, and hospitals.",
    icon: Hospital,
    img: imgResidential,
    alt: "Healthcare facility with professional environmental support",
  },
  {
    title: "Education",
    description: "Waste collection and sanitation support for schools and educational institutions.",
    icon: GraduationCap,
    img: imgGarbage,
    alt: "Educational institution with clean waste management",
  },
  {
    title: "Hospitality",
    description: "Waste, grease trap, portable sanitation, and collection support for hotels and restaurants.",
    icon: Utensils,
    img: imgToilet,
    alt: "Hospitality venue with sanitation services",
  },
  {
    title: "Government & Municipal",
    description: "Environmental service support for government and municipal organizations.",
    icon: Landmark,
    img: imgGarbage,
    alt: "Municipal services and government buildings",
  },
  {
    title: "Construction",
    description: "Skip bins, dumpsters, portable toilets, and site waste solutions for construction projects.",
    icon: HardHat,
    img: imgSkip,
    alt: "Construction site with skip bins and portable sanitation",
  },
  {
    title: "Logistics & Warehousing",
    description: "Waste and recycling support for warehouses, distribution centers, and logistics facilities.",
    icon: Warehouse,
    img: imgWastewater,
    alt: "Warehouse facility with organized waste and recycling support",
  },
];

const solutionFeatures = [
  { icon: CalendarCheck, title: "Scheduled Collection", body: "Regular, reliable pickups aligned with your operation's rhythm." },
  { icon: ClipboardList, title: "Site-Based Service Planning", body: "Tailored waste plans designed around your facility layout and workflow." },
  { icon: FlaskConical, title: "Specialized Waste Handling", body: "Professional handling of regulated and non-standard waste streams." },
  { icon: Recycle, title: "Recycling & Recovery", body: "Maximize resource recovery and minimize landfill through smart sorting." },
  { icon: FileText, title: "Documentation Support", body: "Records and reporting to support your internal compliance needs." },
  { icon: MessageCircle, title: "Responsive Communication", body: "Direct WhatsApp and phone access for fast updates and coordination." },
];

const whyChoose = [
  { icon: Award, title: "Experience", body: "Years of serving Guyana’s residential, commercial, and industrial sectors with dependable results." },
  { icon: Layers, title: "Service Range", body: "One partner for collection, rental, recycling, treatment, and specialized disposal." },
  { icon: MapPin, title: "Regional Coverage", body: "Active operations across Georgetown, Linden, and Berbice with local response." },
  { icon: Leaf, title: "Environmental Responsibility", body: "Committed to sustainable practices that protect Guyana’s ecosystems." },
];

function IndustriesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-labelledby="industries-h1">
        <div className="absolute inset-0">
          <img src={heroIndustries} alt="CEVONS industrial environmental services team at facility" className="size-full object-cover" width={1920} height={800} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cevons-deep-green,#EF7700)]/95 via-[var(--cevons-deep-green,#EF7700)]/85 to-[var(--cevons-deep-green,#EF7700)]/60" />
        </div>
        <div className="container-cevons relative min-h-[320px] md:min-h-[400px] flex flex-col justify-center py-16 md:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow,#FFD200)] font-semibold">Industries</li>
            </ol>
          </nav>
          <h1 id="industries-h1" className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Industries We Serve
          </h1>
          <p className={`mt-4 text-white/85 text-base md:text-xl max-w-2xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Reliable waste management and environmental services for Guyana’s most important sectors.
          </p>
        </div>
        <WaveDivider variant="steady" />
      </section>

      {/* SOCIAL PROOF MARQUEE */}
      <SocialProofMarquee variant="compact" />

      {/* INDUSTRY GRID */}
      <section className="section-y bg-white" aria-label="Industry sectors">

        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Sectors</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              Trusted Across Key Industries
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {industries.map(({ title, description, icon: Icon, img, alt }, i) => (
              <article
                key={title}
                className={`group relative bg-white rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/10 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-[var(--cevons-deep-green,#EF7700)]/25 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--cevons-cream,#FBF7EE)]">
                  <img
                    src={img}
                    alt={alt}
                    loading="lazy"
                    width={600}
                    height={375}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative p-6 pt-9">
                  <span className="absolute -top-6 left-5 size-12 rounded-full bg-[var(--cevons-deep-green,#EF7700)] text-white border-4 border-white flex items-center justify-center shadow-soft">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)]">{title}</h3>
                  <p className="mt-2 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRY-SPECIFIC SOLUTIONS */}
      <section className="section-y bg-[var(--cevons-deep-green,#EF7700)] text-white relative overflow-hidden" aria-labelledby="solutions-heading">
        <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-[var(--cevons-green,#EF7700)]/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[var(--cevons-green,#EF7700)]/20 blur-3xl" />

        <div className="container-cevons relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-yellow,#FFD200)] mb-3">Tailored Approach</p>
            <h2 id="solutions-heading" className="text-3xl md:text-5xl font-extrabold">
              Custom Solutions for Your Industry
            </h2>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">
              Every sector has different waste, compliance, scheduling, and service needs. CEVONS helps match the right solution to your operation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionFeatures.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`rounded-xl bg-white/5 border border-white/10 p-7 hover:bg-white/10 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${200 + i * 70}ms` }}
              >
                <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-[var(--cevons-yellow,#FFD200)] text-[var(--cevons-deep-green,#EF7700)] mb-4">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE CEVONS */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-labelledby="why-heading">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Why CEVONS</p>
            <h2 id="why-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              Why Businesses Choose CEVONS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`rounded-2xl bg-white border border-[var(--cevons-deep-green,#EF7700)]/10 p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)] mb-4">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-cevons">
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-14 md:px-16 md:py-20 text-center"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, #1A1A1A 0%, #1A1A1A 60%, #0A0A0A 100%)",
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
                <Leaf className="size-4" /> Let's Talk
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Need a Waste Solution for Your Business?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Tell us about your industry and facility. We will recommend the right services and schedule.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/request-service"
                  className="btn-base btn-green text-base px-6 py-3.5"
                >
                  Request a Consultation <ArrowRight className="size-5" />
                </Link>
                <a
                  href={whatsappHref} {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="btn-base btn-yellow text-base px-6 py-3.5"
                >
                  WhatsApp Us
                </a>
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
