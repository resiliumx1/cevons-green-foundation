import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";


// One-line swap: replace with the BambooHR portal URL (e.g. "https://cevons.bamboohr.com/careers")
// when it's available. External https URLs automatically render as new-tab links below.
const APPLY_URL = "https://cevonswaste.bamboohr.com/careers"; // CEVONS BambooHR careers portal

// Careers hero reuses the wider About office/team photo (1920x1280, downscales
// sharp to a landscape hero) — front-office-training.webp is portrait
// (1200x1600) and got 1.33x upscaled + heads clipped when used here.
import heroCareersAsset from "@/assets/about-front-office-support.webp.asset.json";
const heroCareers = heroCareersAsset.url;

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — CEVONS Environmental Services" },
      {
        name: "description",
        content:
          "Join CEVONS Environmental Services. Explore current opportunities across operations, finance, HR, engineering, and more across Guyana.",
      },
      { property: "og:title", content: "Careers — CEVONS Environmental Services" },
      {
        property: "og:description",
        content:
          "Build a cleaner tomorrow with CEVONS. Explore current openings and grow your career in environmental services.",
      },
      { property: "og:url", content: "https://cevons-green-foundation.lovable.app/careers" },
    ],
    links: [
      { rel: "canonical", href: "https://cevons-green-foundation.lovable.app/careers" },
    ],
  }),
  component: CareersPage,
});

/** Renders as internal Link for app paths, or external anchor when APPLY_URL becomes https://... */
function ApplyAction({
  children,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const isExternal = APPLY_URL.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={APPLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={APPLY_URL} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

type Value = { icon: React.ComponentType<{ className?: string }>; title: string; body: string };
const VALUES: Value[] = [
  { icon: ShieldCheck, title: "Professionalism", body: "Structured operations and high standards in everything we do." },
  { icon: HeartHandshake, title: "Reliability", body: "Consistent, dependable service to our customers and communities." },
  { icon: TrendingUp, title: "Internal Growth", body: "We promote from within and invest in your development." },
  { icon: Users, title: "Diversity & Teamwork", body: "A multicultural team working toward a common goal." },
  { icon: Leaf, title: "Safety & Environmental Responsibility", body: "Committed to safe operations and a cleaner planet." },
  { icon: Lightbulb, title: "Innovation", body: "Continuous improvement in systems, processes, and technology." },
];

const OPPORTUNITY_AREAS: string[] = [
  "Waste Collection & Field Operations",
  "Environmental & Industrial Services",
  "Recycling & Resource Recovery",
  "Logistics & Transportation",
  "Sales & Client Services",
  "Administration, Finance & Support Services",
  "Health, Safety & Environmental (HSE)",
  "Human Resources",
  "Engineering & Maintenance",
  "Information Technology",
];

function BambooHREmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (document.getElementById("bamboohr-embed-script")) return;

    const script = document.createElement("script");
    script.id = "bamboohr-embed-script";
    script.src = "https://cevonswaste.bamboohr.com/js/embed.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="BambooHR"
      data-domain="cevonswaste.bamboohr.com"
      data-version="1.0.0"
      data-departmentId=""
    />
  );
}

function scrollToOpenPositions(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById("open-positions");
  if (el) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

function CareersPage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden min-h-[640px] md:min-h-[720px] flex items-center">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroCareers}
            alt="CEVONS front-office team supporting a customer inquiry at the Georgetown office"
            className="h-full w-full object-cover object-[60%_35%] scale-105 animate-[heroDrift_18s_ease-in-out_infinite_alternate]"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1280}
          />
          {/* Left-weighted scrim: keeps text legible on the left, faces clean on the right */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,14,0.88)_0%,rgba(10,12,14,0.72)_35%,rgba(10,12,14,0.30)_60%,rgba(10,12,14,0.10)_85%,rgba(10,12,14,0.05)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_35%,transparent_65%,rgba(0,0,0,0.45)_100%)]" />
          {/* Brand orange glow anchoring the copy block */}
          <div className="absolute -left-24 top-1/3 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(239,119,0,0.28),transparent_70%)] blur-2xl" />
        </div>

        <div className="container-cevons py-24 md:py-32 lg:py-36 text-white relative">
          <div className="max-w-xl lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-orange)]/50 bg-black/30 backdrop-blur-sm px-3.5 py-1.5">
              <span className="size-1.5 rounded-full bg-[var(--brand-orange)] shadow-[0_0_10px_var(--brand-orange)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--brand-orange)]">
                Careers at CEVONS
              </p>
            </div>
            <h1
              className="mt-5 text-4xl md:text-6xl lg:text-[68px] font-bold leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Build a Cleaner Tomorrow.
              <span className="block mt-2 bg-gradient-to-r from-[var(--brand-orange)] via-[#FFB061] to-[var(--brand-orange)] bg-clip-text text-transparent italic">
                Together.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-white/90 leading-relaxed">
              Join a team that&rsquo;s committed to protecting our environment, strengthening our
              communities, and creating opportunities that last.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#open-positions"
                onClick={scrollToOpenPositions}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-[var(--brand-orange)] px-6 py-3.5 text-[15px] font-semibold text-[var(--brand-grey-dark)] shadow-[0_10px_30px_-8px_rgba(239,119,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(239,119,0,0.75)] hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                <Sparkles className="size-4 transition-transform duration-300 group-hover:rotate-12" />
                Explore Opportunities
                <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors duration-300 group-hover:bg-white/5" aria-hidden />
              </a>
              <ApplyAction className="group inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-[var(--brand-grey-dark)] hover:border-white">
                View All Positions
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </ApplyAction>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/75">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[var(--brand-orange)]" /> Guyana-based team</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[var(--brand-orange)]" /> Full-time & apprenticeships</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[var(--brand-orange)]" /> Grow with us</span>
            </div>
          </div>
        </div>
        <WaveHalftoneDivider height={56} />
      </section>

      {/* WHY WORK WITH US */}
      <section className="section-y bg-background">
        <div className="container-cevons">
          <div className="max-w-3xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--text-eyebrow)]">
              WHY WORK WITH US
            </p>
            <h2
              className="mt-3 text-3xl md:text-5xl font-bold text-cevons-dark dark:text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Purpose. People. Progress.
            </h2>
            <p className="mt-5 text-cevons-muted dark:text-white/70 text-lg leading-relaxed">
              At CEVONS, our people are our greatest asset. We foster a culture of respect,
              accountability, and continuous improvement — where your work makes a real difference
              every day.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="card-glow group flex h-full flex-col rounded-2xl bg-white dark:bg-white/[0.04] p-6 md:p-7 hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <div className="flex items-start gap-4">
                  <span className="shrink-0 inline-flex size-12 items-center justify-center rounded-xl bg-cevons-green/10 text-cevons-green group-hover:bg-cevons-green group-hover:text-white transition-colors">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-cevons-dark dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-cevons-muted dark:text-white/70 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHERE YOUR SKILLS DRIVE IMPACT */}
      <section className="section-y bg-cevons-cream dark:bg-white/[0.02]">
        <div className="container-cevons">
          <div className="max-w-3xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--text-eyebrow)]">
              CAREER OPPORTUNITIES
            </p>
            <h2
              className="mt-3 text-3xl md:text-5xl font-bold text-cevons-dark dark:text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Where Your Skills Drive Impact
            </h2>
            <p className="mt-5 text-cevons-muted dark:text-white/70 text-lg leading-relaxed">
              We offer opportunities across a range of environmental and operational functions,
              including:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <ul className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {OPPORTUNITY_AREAS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <CheckCircle2 className="size-5 mt-0.5 text-cevons-green shrink-0" />
                  <span className="text-cevons-dark dark:text-white/90 font-medium">{item}</span>
                </li>
              ))}
              <li className="md:col-span-2 mt-4">
                <ApplyAction className="btn-base btn-green btn-shine">
                  View All Positions
                  <ArrowRight className="size-4" />
                </ApplyAction>
              </li>
            </ul>

            <aside className="rounded-2xl border border-cevons-green/25 bg-cevons-green/10 dark:bg-cevons-green/15 p-7 md:p-8 shadow-sm">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-cevons-green text-white shadow-[0_8px_20px_rgba(239,119,0,0.30)]">
                <Users className="size-7" />
              </span>
              <h3
                className="mt-5 text-2xl md:text-3xl font-bold text-cevons-dark dark:text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Grow with CEVONS.
              </h3>
              <p className="mt-3 text-cevons-dark/80 dark:text-white/80 leading-relaxed">
                We invest in our people because we believe a strong team builds a stronger future.
              </p>
              <a
                href="#open-positions"
                onClick={scrollToOpenPositions}
                className="mt-6 btn-base btn-green btn-shine w-full"
              >
                Join Our Team
                <ArrowRight className="size-4" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section id="open-positions" className="section-y bg-background scroll-mt-24">
        <div className="container-cevons">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--text-eyebrow)]">
              OPEN POSITIONS
            </p>
            <h2
              className="mt-3 text-3xl md:text-5xl font-bold text-cevons-dark dark:text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Explore Current Opportunities
            </h2>
          </div>

          <div className="mt-12">
            <BambooHREmbed />
          </div>

          <div className="mt-12 flex justify-center">
            <ApplyAction className="btn-base btn-green btn-shine">
              View All Jobs
              <ArrowRight className="size-4" />
            </ApplyAction>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
