import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Award,
  Headphones,
  Leaf,
  Target,
  Eye,
  Heart,
  BadgeCheck,
  Shield,
  TrendingUp,
  Recycle,
  MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";
import { whatsappHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";

const heroAbout = "/assets/heroes/hero-about.webp";
import imgRecovery from "@/assets/svc-recovery.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgOil from "@/assets/svc-oil.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CEVONS | Waste Management Guyana" },
      { name: "description", content: "Learn about CEVONS Environmental Services Inc., Guyana's trusted partner for waste management, recycling, and environmental solutions since 1997." },
      { property: "og:title", content: "About CEVONS | Waste Management Guyana" },
      { property: "og:description", content: "Learn about CEVONS Environmental Services Inc., Guyana's trusted partner for waste management, recycling, and environmental services." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ])) },
    ],
  }),
  component: AboutPage,
});

const stats: { label: string; value: string; icon: typeof Award }[] = [
  { value: "Since 1997", label: "Trusted Across Guyana", icon: Award },
  { value: "4", label: "Service Categories", icon: Recycle },
  { value: "3", label: "Regions Served", icon: TrendingUp },
  { value: "All Sectors", label: "Residential • Commercial • Industrial • Facilities", icon: Shield },
];

const mvvcards = [
  {
    icon: Target,
    title: "Mission",
    body: "To provide reliable and responsible waste management and environmental services that protect communities and support a cleaner Guyana.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "To be the leading environmental services and waste management partner in Guyana and the Caribbean.",
  },
  {
    icon: Heart,
    title: "Values",
    body: "Safety, integrity, reliability, environmental responsibility, customer focus, and continuous improvement.",
  },
];

const complianceBadges = [
  { icon: BadgeCheck, title: "EPA Certified", body: "Meeting national environmental standards." },
  { icon: Shield, title: "Environmentally Compliant", body: "Adhering to responsible waste practices." },
  { icon: ShieldCheck, title: "Safety-First Culture", body: "Protecting our team, clients, and communities." },
  { icon: TrendingUp, title: "Continuous Improvement", body: "Always evolving our services and standards." },
];

const operationsImages = [
  { src: imgGarbage, alt: "CEVONS waste collection fleet in operation across Guyana", caption: "Collection Fleet", sub: "Daily routes across Guyana" },
  { src: imgIndustrial, alt: "Industrial waste management team at work", caption: "Industrial Crews", sub: "Trained, safety-first teams" },
  { src: imgDumpster, alt: "Dumpster rental services for commercial clients", caption: "Rental Equipment", sub: "Dumpsters, skips & portable units" },
  { src: imgOil, alt: "Waste oil recycling and environmental services", caption: "Specialist Services", sub: "Oil, wastewater & recovery" },
];




function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[60vh] md:min-h-[68vh] flex items-center" aria-labelledby="about-h1">
        <div className="absolute inset-0">
          <img
            src={heroAbout}
            alt="CEVONS team outside company facility"
            className="size-full object-cover hero-img hero-img-mobile"
            width={1920}
            height={1080}
            loading="eager"
          />
          <div className="absolute inset-0 hero-photo-overlay" />

        </div>

        <div className="container-cevons relative py-24 md:py-32 z-20">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-white font-semibold">About</li>
            </ol>
          </nav>
          <h1 id="about-h1" className={`text-white text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            About CEVONS
          </h1>
          <p className={`mt-5 text-white/85 text-base md:text-xl max-w-xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Guyana’s trusted environmental services partner since 1997.
          </p>
        </div>

        <WaveHalftoneDivider height={48} />
      </section>

      {/* COMPANY STORY */}
      <section className="section-y bg-white" aria-labelledby="story-heading">
        <div className="container-cevons">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Our Story</p>
              <h2 id="story-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)] leading-tight">
                Supporting a Cleaner, Safer Guyana
              </h2>
              <p className="mt-5 text-[var(--cevons-muted,#64748B)] leading-relaxed text-base md:text-lg">
                For over 25 years, CEVONS Environmental Services Inc. has helped homes, businesses, industries, and communities manage waste responsibly. From collection and rentals to specialized environmental services, our team is committed to reliable service, safety, and environmental responsibility.
              </p>
              <p className="mt-4 text-[var(--cevons-muted,#64748B)] leading-relaxed">
                We serve Georgetown, Linden, and Berbice with a growing fleet and a dedicated team focused on protecting the environment while delivering dependable customer support.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="btn-base btn-green"
                >
                  Our Services <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/locations"
                  className="btn-base btn-outline-green"
                >
                  Our Locations <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/newsroom"
                  className="btn-base btn-outline-green"
                >
                  Newsroom <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className={`relative rounded-2xl overflow-hidden shadow-soft group transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <img
                src={imgRecovery}
                alt="CEVONS environmental recovery operations in Guyana"
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Mission, Vision, and Values">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">What Drives Us</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              Mission, Vision & Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {mvvcards.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`card-glow flex h-full flex-col rounded-2xl bg-white dark:bg-white/[0.04] p-8 hover:-translate-y-1 motion-reduce:transform-none border-t-4 border-t-[#EF7700] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="flex w-14 h-14 items-center justify-center rounded-xl bg-[#EF7700]/10 text-[#EF7700] mb-5">
                  <Icon className="size-7" />
                </span>
                <h3 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">{title}</h3>
                <p className="mt-3 leading-relaxed text-[var(--cevons-muted,#64748B)] dark:text-white/75">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* COMPLIANCE SECTION */}
      <section className="section-y bg-white" aria-labelledby="compliance-heading">

        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Standards</p>
            <h2 id="compliance-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              Certified. Compliant. Committed.
            </h2>
            <p className="mt-4 text-[var(--cevons-muted,#64748B)]">
              CEVONS is committed to responsible environmental practices and professional service standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {complianceBadges.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`card-glow flex h-full flex-col rounded-xl bg-white dark:bg-white/[0.04] p-7 text-center hover:-translate-y-1 motion-reduce:transform-none ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)] mb-4">
                  <Icon className="size-7" />
                </span>
                <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--cevons-muted,#64748B)] dark:text-white/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="relative bg-[var(--cevons-deep-green,#EF7700)] overflow-hidden">
        <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] hidden md:block opacity-90">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="size-full">
            <path d="M40,0 L400,0 L400,200 L0,200 Z" fill="#EF7700" />
            <path d="M110,0 L400,0 L400,200 L70,200 Z" fill="#C45F00" />
            <path d="M170,0 L400,0 L400,200 L130,200 Z" fill="#1A1A1A" />
          </svg>
        </div>
        <div className="container-cevons py-14 md:py-16 relative">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-4">
                <Icon className="size-7 text-white shrink-0" />
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold leading-tight text-white">
                    {value}
                  </p>
                  <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium">{label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OPERATIONS IMAGE SECTION */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Operations gallery">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Operations</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              Our Fleet & Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {operationsImages.map(({ src, alt, caption, sub }, i) => (
              <div
                key={alt}
                className={`card-glow group flex h-full flex-col rounded-2xl overflow-hidden bg-white dark:bg-white/[0.04] hover:-translate-y-1 motion-reduce:transform-none ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    width={600}
                    height={450}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-[var(--cevons-deep-green,#EF7700)]">{caption}</h3>
                  <p className="mt-1 text-sm text-[var(--cevons-muted,#64748B)] dark:text-white/70">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENVIRONMENTAL RESPONSIBILITY */}
      <section className="section-y bg-[var(--cevons-deep-green,#EF7700)] text-white relative overflow-hidden" aria-labelledby="env-heading">
        <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-[var(--cevons-green,#EF7700)]/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[var(--cevons-green,#EF7700)]/20 blur-3xl" />

        <div className="container-cevons relative">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3">Responsibility</p>
              <h2 id="env-heading" className="text-3xl md:text-5xl font-extrabold leading-tight">
                Built for Impact.<br />Driven by Responsibility.
              </h2>
              <p className="mt-5 text-white/85 leading-relaxed text-base md:text-lg max-w-lg">
                Our work supports cleaner communities, responsible waste handling, and better environmental outcomes for homes, businesses, and industries.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="btn-base btn-yellow"
                >
                  <Recycle className="size-4" /> Work With CEVONS
                </Link>
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {[
                { label: "Recycling Focus", value: "Materials recovery" },
                { label: "Safe Disposal", value: "Proper handling" },
                { label: "Community Clean", value: "Local support" },
                { label: "Sustainable Ops", value: "Long-term care" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-white/90 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-cevons">
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-14 md:px-16 md:py-20 text-center"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, #EF7700 0%, #EF7700 60%, #C45F00 100%)",
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
              <p className="text-white text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <Leaf className="size-4" /> Partner With Us
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Ready to Work With CEVONS?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Let us help you manage waste responsibly and efficiently.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/request-service"
                  className="btn-base btn-green text-base px-6 py-3.5"
                >
                  Request Service <ArrowRight className="size-5" />
                </Link>
                <a
                  href={whatsappHref} {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="btn-base btn-yellow text-base px-6 py-3.5"
                >
                  <MessageCircle className="size-5" /> WhatsApp Us
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
