import { createFileRoute, Link } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
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
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";
import { whatsappHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";

// Landscape hero recut from the 3024x4032 original (1920x1280 native).
// Byte-for-byte in public/assets/heroes/ so the hero renders sharp — the
// prior 1200x1600 portrait had to be upscaled 1.2x to fill the strip.
const heroAbout = "/assets/heroes/about-support-hero.webp";
import { useSiteImage } from "@/lib/siteImages";
import imgRecovery from "@/assets/svc-recovery.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgOil from "@/assets/svc-oil.jpg";
import { useSectionPayload, type PageIntroPayload, type CtaBannerPayload } from "@/lib/pageSections";
import { ContentProvider, Editable, useEditableText } from "@/components/Editable";
import { getPageContent } from "@/lib/content.functions";

export const Route = createFileRoute("/about")({
  validateSearch: (search: Record<string, unknown>): { preview?: string } =>
    typeof search.preview === "string" ? { preview: search.preview } : {},
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: ({ deps }) => getPageContent({ data: { page: "about", token: deps.preview ?? null } }),
  head: () => ({
    meta: [
      { title: "About CEVONS | Waste Management Guyana" },
      { name: "description", content: "Learn about CEVONS Environmental Services Inc., Guyana's trusted partner for waste management, recycling, and environmental solutions since 1997." },
      { property: "og:title", content: "About CEVONS | Waste Management Guyana" },
      { property: "og:description", content: "Learn about CEVONS Environmental Services Inc., Guyana's trusted partner for waste management, recycling, and environmental services." },
      { property: "og:url", content: absUrl("/about") },
    ],
    links: [{ rel: "canonical", href: absUrl("/about") }],
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
  { value: "10", label: "Regions Served Across Guyana", icon: TrendingUp },
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
  const content = Route.useLoaderData();
  return (
    <ContentProvider value={content}>
      <AboutPageInner />
    </ContentProvider>
  );
}

function AboutPageInner() {
  const intro = useSectionPayload<PageIntroPayload>("about", "page_intro");
  const ctaCopy = useSectionPayload<CtaBannerPayload>("about", "cta_banner");
  const hero = useSiteImage("about_hero", heroAbout, "CEVONS front-office team supporting a customer inquiry at the Georgetown office");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ctaEyebrow = useEditableText("about.cta.eyebrow", ctaCopy?.eyebrow || "Partner With Us");
  const ctaTitle = useEditableText("about.cta.title", ctaCopy?.title || "Ready to Work With CEVONS?");
  const ctaSubtitle = useEditableText("about.cta.subtitle", ctaCopy?.subtitle || "Let us help you manage waste responsibly and efficiently across Guyana.");

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[82vh] flex items-center" aria-labelledby="about-h1">
        <div className="absolute inset-0">
          <img
            src={hero.src}
            alt={hero.alt}
            className="size-full object-cover hero-img hero-img-mobile"
            style={{ objectPosition: "center 35%" }}
            width={1920}
            height={1280}
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
            <Editable id="about.hero.title" label="Hero heading" as="span">{intro?.title || "About CEVONS"}</Editable>
          </h1>
          <p className={`mt-5 text-white/85 text-base md:text-xl max-w-xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Editable id="about.hero.subtitle" label="Hero subtitle" as="span">{intro?.subtitle || "Guyana’s trusted environmental services partner since 1997."}</Editable>
          </p>
        </div>

        <WaveHalftoneDivider height={56} />
      </section>

      {/* COMPANY STORY */}
      <section className="section-y bg-[var(--surface-page)]" aria-labelledby="story-heading">
        <div className="container-cevons">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Editable id="about.story.eyebrow" label="Story eyebrow" as="p" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Our Story</Editable>
              <h2 id="story-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)] leading-tight">
                <Editable id="about.story.title" label="Story heading" as="span">Supporting a Cleaner, Safer Guyana</Editable>
              </h2>
              <Editable id="about.story.body1" label="Story paragraph 1" as="p" className="mt-5 text-[var(--text-body,#4A4A4A)] leading-relaxed text-base md:text-lg">For over 25 years, CEVONS Environmental Services Inc. has helped homes, businesses, industries, and communities manage waste responsibly. From collection and rentals to specialized environmental services, our team is committed to reliable service, safety, and environmental responsibility.</Editable>
              <Editable id="about.story.body2" label="Story paragraph 2" as="p" className="mt-4 text-[var(--text-body,#4A4A4A)] leading-relaxed">We serve Georgetown, Linden, and Berbice with a growing fleet and a dedicated team focused on protecting the environment while delivering dependable customer support.</Editable>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="btn-base btn-green"
                >
                  <Editable id="about.story.cta1" label="Story CTA 1 label" as="span">Our Services</Editable> <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/locations"
                  className="btn-base btn-outline-green"
                >
                  <Editable id="about.story.cta2" label="Story CTA 2 label" as="span">Our Locations</Editable> <ArrowRight className="size-4" />
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
            <Editable id="about.mvv.eyebrow" label="Mission Vision Values eyebrow" as="p" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">What Drives Us</Editable>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              <Editable id="about.mvv.title" label="Mission Vision Values heading" as="span">Mission, Vision & Values</Editable>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {mvvcards.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`card-glow flex h-full flex-col rounded-2xl bg-white dark:bg-white/[0.04] p-8 hover:-translate-y-1 motion-reduce:transform-none border-t-4 border-t-[var(--brand-orange)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="flex w-14 h-14 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] mb-5">
                  <Icon className="size-7" />
                </span>
                <h3 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">{title}</h3>
                <p className="mt-3 leading-relaxed text-[var(--text-body,#4A4A4A)] dark:text-white/75">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* COMPLIANCE SECTION */}
      <section className="section-y bg-[var(--surface-page)]" aria-labelledby="compliance-heading">

        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Editable id="about.compliance.eyebrow" label="Compliance eyebrow" as="p" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Standards</Editable>
            <h2 id="compliance-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              <Editable id="about.compliance.title" label="Compliance heading" as="span">Certified. Compliant. Committed.</Editable>
            </h2>
            <Editable id="about.compliance.subtitle" label="Compliance subtitle" as="p" className="mt-4 text-[var(--text-body,#4A4A4A)]">CEVONS is committed to responsible environmental practices and professional service standards.</Editable>
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
                <p className="mt-2 text-sm text-[var(--text-body,#4A4A4A)] dark:text-white/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="relative bg-[var(--cevons-cream,#FBF7EE)] dark:bg-[#0b0b0b] section-y" aria-label="Company impact">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Editable id="about.impact.eyebrow" label="Impact eyebrow" as="p" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">By the Numbers</Editable>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
              <Editable id="about.impact.title" label="Impact heading" as="span">Built on Decades of Trust</Editable>
            </h2>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <li
                key={label}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.04] ring-1 ring-[var(--brand-orange)]/15 p-6 md:p-7 shadow-[0_10px_30px_-15px_rgba(239,119,0,0.45)] hover:shadow-[0_18px_40px_-15px_rgba(239,119,0,0.7)] hover:-translate-y-1 transition-all duration-300"
              >
                <div aria-hidden className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-orange)] to-[var(--brand-orange-dark)]" />
                <div aria-hidden className="absolute -right-10 -bottom-10 size-32 rounded-full bg-[var(--brand-orange)]/5 group-hover:bg-[var(--brand-orange)]/10 transition-colors" />
                <div className="relative">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 text-2xl md:text-3xl font-extrabold leading-tight text-[#1A1A1A] dark:text-white tracking-tight">
                    {value}
                  </p>
                  <p className="mt-1.5 text-xs md:text-sm text-[var(--text-body,#4A4A4A)] dark:text-white/70 font-medium">{label}</p>
                  {i === 0 && (
                    <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-eyebrow)]">
                      {new Date().getFullYear() - 1997}+ Years
                    </span>
                  )}
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
            <Editable id="about.operations.eyebrow" label="Operations eyebrow" as="p" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Operations</Editable>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              <Editable id="about.operations.title" label="Operations heading" as="span">Our Fleet & Team</Editable>
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
                  <p className="mt-1 text-sm text-[var(--text-body,#4A4A4A)] dark:text-white/70">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENVIRONMENTAL RESPONSIBILITY */}
      <section className="section-y bg-[var(--surface-page)] relative" aria-labelledby="env-heading">
        <div className="container-cevons">
          <div className="relative overflow-hidden rounded-[28px] ring-1 ring-black/5 dark:ring-white/10 shadow-[0_30px_60px_-25px_rgba(26,26,26,0.18)] bg-[var(--surface-page)]">
            <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full"
                 style={{ background: "radial-gradient(circle, rgba(239,119,0,0.18) 0%, transparent 65%)" }} />
            <div aria-hidden className="absolute -bottom-24 -left-24 size-72 rounded-full"
                 style={{ background: "radial-gradient(circle, rgba(46,125,50,0.12) 0%, transparent 65%)" }} />

            <div className="relative grid md:grid-cols-2 gap-10 lg:gap-16 items-center p-8 sm:p-10 md:p-14">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-orange)]/10 ring-1 ring-[var(--brand-orange)]/25 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-5">
                  <Leaf className="size-3.5" /> <Editable id="about.env.eyebrow" label="Environmental eyebrow" as="span">Responsibility</Editable>
                </p>
                <h2 id="env-heading" className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] text-[var(--text-heading)]">
                  <Editable id="about.env.title" label="Environmental heading line 1" as="span">Built for Impact.</Editable><br />
                  <span className="text-[var(--text-heading)]"><Editable id="about.env.titleHighlight" label="Environmental heading line 2" as="span">Driven by Responsibility.</Editable></span>
                </h2>
                <Editable id="about.env.body" label="Environmental paragraph" as="p" className="mt-5 text-[var(--text-body)] leading-relaxed text-base md:text-lg max-w-lg">Our work supports cleaner communities, responsible waste handling, and better environmental outcomes for homes, businesses, and industries.</Editable>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[var(--brand-orange)] text-white font-bold hover:bg-[var(--brand-orange-dark)] hover:-translate-y-0.5 transition shadow-[0_10px_24px_rgba(239,119,0,0.45)]"
                  >
                    <Recycle className="size-5" /> <Editable id="about.env.cta" label="Environmental CTA label" as="span">Partner With Us</Editable>
                  </Link>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {[
                  { label: "Recycling Focus", value: "Materials recovery", icon: Recycle, tint: "#2E7D32" },
                  { label: "Safe Disposal", value: "Proper handling", icon: ShieldCheck, tint: "#1E66D0" },
                  { label: "Community Clean", value: "Local support", icon: Heart, tint: "#E53935" },
                  { label: "Sustainable Ops", value: "Long-term care", icon: Leaf, tint: "var(--brand-orange)" },
                ].map((item) => (
                  <div key={item.label} className="group relative rounded-xl bg-[var(--surface-page)] border border-black/10 dark:border-white/10 p-5 hover:border-[var(--brand-orange)]/50 hover:shadow-[0_10px_24px_-12px_rgba(26,26,26,0.18)] transition-all">
                    <span
                      className="inline-flex size-10 items-center justify-center rounded-lg mb-3"
                      style={{ background: `${item.tint}1A`, color: item.tint }}
                    >
                      <item.icon className="size-5" />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)] font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <OrangeCTABanner
        icon={Leaf}
        eyebrow={ctaEyebrow}
        title={ctaTitle}
        subtitle={ctaSubtitle}
      >
        <Link to="/request-service" className="cta-btn-primary">
          <Editable id="about.cta.button1" label="CTA button 1 label" as="span">Request Service</Editable> <ArrowRight className="size-5" />
        </Link>
        <a
          href={whatsappHref}
          {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="cta-btn-wa"
        >
          <MessageCircle className="size-5" /> <Editable id="about.cta.button2" label="CTA button 2 label" as="span">WhatsApp Us</Editable>
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
