import type { ComponentType, ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { serviceJsonLd, breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { Children, isValidElement } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Leaf,
  MessageCircle,
  Phone,
  Truck,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { cevonsContact, primaryTelHref, whatsappHref } from "@/data/cevonsContact";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/cevons-logo.png";

type LucideIcon = ComponentType<{ className?: string }>;

export type RelatedService = {
  title: string;
  body: string;
  img: string;
  to: string;
  icon: LucideIcon;
};

export type DetailImage = { src: string; alt: string; caption?: string };

export type DetailSection = {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  images?: DetailImage[];
  variant: "split-right" | "split-left" | "band" | "gallery";
  bandEmphasis?: boolean;
  videoEmbed?: { youtubeId: string; title: string };
};

export type ServicePageProps = {
  eyebrowIcon: LucideIcon;
  eyebrowLabel: string;
  breadcrumb: string;
  h1: string;
  subhead: string;
  heroImage: string;
  heroAlt: string;
  benefits: string[];
  commonUses: { icon: LucideIcon; title: string }[];
  steps?: { icon: LucideIcon; title: string; body: string }[];
  faqs: { q: string; a: ReactNode }[];
  related?: RelatedService[];
  /** Optional extra section rendered between hero and Common Uses */
  optionsSection?: ReactNode;
  /** "routine" → Request a Quote. "specialist" → Request Specialist Review. */
  ctaVariant?: "routine" | "specialist";
  /** Slug for /request-service?service=<slug> preselection */
  serviceSlug?: string;
  /** Rich long-form detail sections rendered between the hero and Common Uses */
  detailSections?: DetailSection[];
  /** Render the "Need Immediate Assistance" band after detailSections */
  showAssistBand?: boolean;
};

const DEFAULT_STEPS = [
  { icon: MessageCircle, title: "Tell us what you need", body: "Send your details by WhatsApp or quote request." },
  { icon: ClipboardCheck, title: "Confirm requirements", body: "We confirm scope, location, and timing with you." },
  { icon: Calendar, title: "Schedule service", body: "We schedule the service at a time that works for you." },
  { icon: Truck, title: "Service & follow-up", body: "Our team performs the service and follows up as needed." },
];

export function ServicePageTemplate(props: ServicePageProps) {
  const {
    eyebrowIcon: Eyebrow,
    eyebrowLabel,
    breadcrumb,
    h1,
    subhead,
    heroImage,
    heroAlt,
    benefits,
    commonUses,
    steps = DEFAULT_STEPS,
    faqs,
    related,
    optionsSection,
    ctaVariant = "routine",
    serviceSlug,
    detailSections,
    showAssistBand,
  } = props;

  const isSpecialist = ctaVariant === "specialist";
  const primaryCtaLabel = isSpecialist ? "Request Specialist Review" : "Request a Quote";
  const svcQuery = serviceSlug ? `?service=${encodeURIComponent(serviceSlug)}` : "";
  const primaryCtaHref = isSpecialist
    ? `/request-service?type=specialist${serviceSlug ? `&service=${encodeURIComponent(serviceSlug)}` : ""}`
    : `/request-service${svcQuery}`;
  const helpHeading = isSpecialist ? "Need a Specialist Review?" : "Need Help Choosing?";
  const helpBody = isSpecialist
    ? "Specialized waste streams require proper assessment. Our team will review your needs, confirm compliance requirements, and coordinate the right solution."
    : "Our team can help you select the right option for your project, timeline, and waste type.";

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const jsonLdService = JSON.stringify(serviceJsonLd({
    name: h1,
    description: typeof subhead === "string" ? subhead : h1,
    path: pathname,
    category: eyebrowLabel,
    image: typeof heroImage === "string" ? heroImage : undefined,
  }));
  const jsonLdBreadcrumb = JSON.stringify(breadcrumbListJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: breadcrumb, path: pathname },
  ]));

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdService }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdBreadcrumb }} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-cevons-border">
        <div className="container-cevons py-4">
          <ol className="flex items-center gap-1.5 text-xs md:text-sm">
            <li><Link to="/" className="text-cevons-green font-semibold hover:underline">Home</Link></li>
            <li aria-hidden="true"><ChevronRight className="size-3.5 text-cevons-muted" /></li>
            <li><Link to="/services" className="text-cevons-green font-semibold hover:underline">Services</Link></li>
            <li aria-hidden="true"><ChevronRight className="size-3.5 text-cevons-muted" /></li>
            <li aria-current="page" className="text-cevons-muted">{breadcrumb}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-cevons-cream relative overflow-hidden" aria-labelledby="svc-h1">
        <div className="container-cevons section-y grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal variant="up">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-4 inline-flex items-center gap-2">
              <Eyebrow className="size-4" /> {eyebrowLabel}
            </p>
            <h1 id="svc-h1" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-cevons-dark">
              {h1}
            </h1>
            <p className="mt-5 text-base md:text-lg text-cevons-muted max-w-xl leading-relaxed">
              {subhead}
            </p>
            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-3" role="list">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-cevons-dark">
                  <CheckCircle2 className="size-5 text-cevons-green shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={primaryCtaHref} className="btn-base btn-yellow px-6 py-3.5 text-base">
                <FileText className="size-5" /> {primaryCtaLabel}
              </a>
              <a href="/contact" className="btn-base btn-green px-6 py-3.5 text-base">
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
            </div>
          </Reveal>

          <Reveal variant="scale" delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-lift group">
              <img
                src={heroImage}
                alt={heroAlt}
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                width={960}
                height={720}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute top-4 left-4 bg-white rounded-lg px-2.5 py-1.5 shadow-soft flex items-center gap-2">
                <img src={logo} alt="" aria-hidden="true" className="h-6 w-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cevons-dark">CEVONS</span>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {optionsSection}

      {detailSections && detailSections.length > 0 && (
        <DetailSectionsBlock sections={detailSections} />
      )}

      {showAssistBand && (
        <AssistBand
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaHref={primaryCtaHref}
        />
      )}

      {/* Common Uses */}
      <section className="section-y bg-cevons-cream" aria-labelledby="uses-h">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">Common Uses</p>
            <h2 id="uses-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Where this service helps</h2>
          </div>
          <Stagger as="ul" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {commonUses.map(({ icon: Icon, title }) => (
              <StaggerItem
                as="li"
                key={title}
                className="bg-white rounded-xl border border-cevons-border p-5 text-center shadow-soft transition-all hover:border-cevons-green hover:-translate-y-0.5"
              >
                <span className="mx-auto mb-3 size-12 rounded-full bg-cevons-green/10 text-cevons-green flex items-center justify-center">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-cevons-dark leading-snug">{title}</p>
              </StaggerItem>
            ))}
          </Stagger>

        </div>
      </section>

      {/* How it works */}
      <section className="section-y bg-white" aria-labelledby="how-h">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">How It Works</p>
            <h2 id="how-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Simple, professional service</h2>
          </div>
          <Stagger as="ol" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <StaggerItem
                as="li"
                key={title}
                className="relative bg-white rounded-xl border border-cevons-border p-6 shadow-soft"
              >
                <span className="absolute -top-3 left-6 bg-cevons-yellow text-cevons-dark text-xs font-extrabold px-2.5 py-1 rounded-md shadow-soft">
                  Step {i + 1}
                </span>
                <span className="size-12 rounded-full bg-cevons-green text-white flex items-center justify-center mt-2">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-cevons-dark">{title}</h3>
                <p className="mt-1.5 text-sm text-cevons-muted leading-relaxed">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>

        </div>
      </section>

      {/* Help CTA */}
      <section className="bg-white pb-16 md:pb-20" id="quote">
        <div className="container-cevons">
          <div className="rounded-2xl bg-cevons-cream border border-cevons-green/20 p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-soft">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-2 inline-flex items-center gap-2">
                <Leaf className="size-4" /> We're Here to Help
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-cevons-dark">{helpHeading}</h2>
              <p className="mt-3 text-cevons-muted leading-relaxed">
                {helpBody}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a href={primaryCtaHref} className="btn-base btn-yellow px-6 py-3.5 text-base">
                <FileText className="size-5" /> {primaryCtaLabel}
              </a>
              <a href="/contact" className="btn-base btn-green px-6 py-3.5 text-base">
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y bg-cevons-cream" aria-labelledby="faq-h">
        <div className="container-cevons max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">FAQ</p>
            <h2 id="faq-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-xl border border-cevons-border px-5 shadow-soft data-[state=open]:border-cevons-green transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-cevons-dark hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-cevons-muted leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {related && related.length > 0 && (
        <section className="section-y bg-white" aria-labelledby="related-h">
          <div className="container-cevons">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-2">More From CEVONS</p>
                <h2 id="related-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Related Services</h2>
              </div>
              <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
                View all services <ArrowRight className="size-4" />
              </Link>
            </div>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(({ title, body, img, to, icon: Icon }) => (
                <StaggerItem
                  as="article"
                  key={title}
                  className="group bg-white rounded-xl border border-cevons-border overflow-hidden shadow-soft transition-all hover:-translate-y-0.5 hover:border-cevons-green hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cevons-cream">
                    <img src={img} alt={title} loading="lazy" decoding="async" width={640} height={400} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute -bottom-5 left-5 size-12 rounded-full bg-cevons-green text-white border-4 border-white flex items-center justify-center shadow-soft">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="p-6 pt-8">
                    <h3 className="text-lg font-bold text-cevons-dark">{title}</h3>
                    <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                    <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
                      Learn More <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

          </div>
        </section>
      )}
    </SiteLayout>
  );
}

/* ---------- Detail Sections ---------- */

const CHARCOAL = "#1A1A1A";
const CREAM_ALT = "#F7F5F1";
const EYEBROW_ORANGE = "var(--brand-orange-dark, #C45F00)";

function DetailSectionsBlock({ sections }: { sections: DetailSection[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const isAlt = i % 2 === 1;
        return (
          <section
            key={i}
            className="py-12 md:py-16"
            style={isAlt ? { backgroundColor: CREAM_ALT } : { backgroundColor: "#ffffff" }}
          >
            <div className="container-cevons">
              <DetailSectionRender section={s} />
            </div>
          </section>
        );
      })}
    </>
  );
}

function SectionText({ section }: { section: DetailSection }) {
  return (
    <div>
      {section.eyebrow && (
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: EYEBROW_ORANGE }}
        >
          {section.eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
        {section.heading}
      </h2>
      <div className="mt-5 space-y-4 text-base text-cevons-muted leading-relaxed">
        {section.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {section.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-cevons-dark">
              <CheckCircle2
                className="size-5 shrink-0 mt-0.5"
                style={{ color: "var(--brand-orange)" }}
                aria-hidden="true"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionImages({ images }: { images: DetailImage[] }) {
  if (images.length === 1) {
    const img = images[0];
    return (
      <figure className="rounded-2xl overflow-hidden shadow-lift">
        <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover" />
        {img.caption && <figcaption className="mt-2 text-xs text-cevons-muted">{img.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((img, idx) => (
        <figure key={idx} className="rounded-xl overflow-hidden shadow-soft">
          <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="w-full aspect-square object-cover" />
        </figure>
      ))}
    </div>
  );
}

function DetailSectionRender({ section }: { section: DetailSection }) {
  if (section.variant === "band") {
    const emphasis = section.bandEmphasis;
    return (
      <Reveal variant="up">
        <div
          className={`max-w-3xl mx-auto text-center ${emphasis ? "rounded-2xl p-8 md:p-10 shadow-lift" : ""}`}
          style={emphasis ? { backgroundColor: CHARCOAL } : undefined}
        >
          {section.eyebrow && (
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: emphasis ? "var(--brand-orange)" : EYEBROW_ORANGE }}
            >
              {section.eyebrow}
            </p>
          )}
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: emphasis ? "#ffffff" : "var(--cevons-dark, #1A1A1A)" }}
          >
            {section.heading}
          </h2>
          <div
            className="mt-5 space-y-4 text-base leading-relaxed"
            style={{ color: emphasis ? "rgba(255,255,255,0.88)" : undefined }}
          >
            {section.paragraphs.map((p, idx) => (
              <p key={idx} className={emphasis ? "" : "text-cevons-muted"}>{p}</p>
            ))}
          </div>
          {section.videoEmbed && (
            <figure
              className="mt-8 mx-auto"
              style={{ maxWidth: 820 }}
              aria-label={`${section.videoEmbed.title} video`}
            >
              <div
                className="relative w-full overflow-hidden rounded-2xl shadow-lift focus-within:ring-2 focus-within:ring-offset-2"
                style={{ paddingBottom: "56.25%", backgroundColor: "#000" }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${section.videoEmbed.youtubeId}?rel=0`}
                  title={`${section.videoEmbed.title} — video`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  tabIndex={0}
                  className="absolute inset-0 w-full h-full border-0 focus:outline-none"
                />
              </div>
              <figcaption className="sr-only">{section.videoEmbed.title}</figcaption>
            </figure>
          )}
        </div>
      </Reveal>
    );
  }


  if (section.variant === "gallery") {
    return (
      <>
        <div className="max-w-3xl mx-auto text-center mb-8">
          <Reveal variant="up"><SectionText section={section} /></Reveal>
        </div>
        {section.images && section.images.length > 0 && (
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto justify-items-center">
            {section.images.map((img, idx) => (
              <StaggerItem key={idx} className="rounded-xl overflow-hidden shadow-soft bg-white border border-cevons-border w-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-square object-cover"
                  style={{ maxWidth: 300 }}
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </>
    );
  }

  // split-right / split-left
  const reverse = section.variant === "split-left";
  return (
    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-14 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <Reveal variant={reverse ? "right" : "left"}>
        <SectionText section={section} />
      </Reveal>
      {section.images && section.images.length > 0 && (
        <Reveal variant="scale" delay={0.1}>
          <SectionImages images={section.images} />
        </Reveal>
      )}
    </div>
  );
}

/* ---------- Assist Band ---------- */

function AssistBand({ primaryCtaLabel: _label, primaryCtaHref }: { primaryCtaLabel: string; primaryCtaHref: string }) {
  return (
    <section className="py-10 md:py-14 bg-white" aria-labelledby="assist-h">
      <div className="container-cevons">
        <div
          className="rounded-2xl overflow-hidden shadow-lift p-6 md:p-8"
          style={{ backgroundColor: CHARCOAL }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <p
                className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: "var(--brand-orange)" }}
              >
                Talk to a specialist
              </p>
              <h2 id="assist-h" className="text-2xl md:text-3xl font-extrabold text-white">
                Need Immediate Assistance?
              </h2>
              <p className="mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                Call our Georgetown Head Office and we'll route your request to the right team today.
              </p>
              <a
                href={primaryTelHref}
                className="mt-4 inline-flex items-center gap-3 text-xl md:text-2xl font-extrabold transition-opacity hover:opacity-90"
                style={{ color: "var(--brand-orange)" }}
              >
                <Phone className="size-6" aria-hidden="true" />
                {cevonsContact.primaryPhone}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={primaryCtaHref}
                className="btn-base px-6 py-3 text-base font-semibold rounded-lg hover:opacity-95 transition-opacity"
                style={{ backgroundColor: "var(--brand-orange)", color: "#ffffff" }}
              >
                <FileText className="size-5" /> Start a Service Request
              </a>
              <a
                href={whatsappHref}
                {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="btn-base px-6 py-3 text-base font-semibold rounded-lg border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
