import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";


// One-line swap: replace with the BambooHR portal URL (e.g. "https://cevons.bamboohr.com/careers")
// when it's available. External https URLs automatically render as new-tab links below.
const APPLY_URL = "/contact"; // TODO: replace with CEVONS BambooHR careers portal URL when available

const heroCareers = "/assets/heroes/hero-careers.webp";

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

type Job = { category: string; title: string; location: string; icon: React.ComponentType<{ className?: string }> };
const JOBS: Job[] = [
  { category: "Finance", title: "Snr. Accounts Officer", location: "Georgetown", icon: Briefcase },
  { category: "Human Resources", title: "Verification Officer", location: "Georgetown", icon: Users },
  { category: "Operations", title: "Porter", location: "Georgetown", icon: Building2 },
  { category: "Operations", title: "Truck Driver", location: "Georgetown", icon: Truck },
  { category: "Stores", title: "Stores Clerk", location: "Georgetown", icon: Wrench },
];

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
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroCareers}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(239,119,0,0.18),transparent_70%)]" />
        </div>

        <div className="container-cevons py-24 md:py-32 lg:py-40 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-cevons-green">
            CAREERS
          </p>
          <h1
            className="mt-4 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-4xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Build a Cleaner Tomorrow.{" "}
            <span className="text-cevons-green">Together.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Join a team that&rsquo;s committed to protecting our environment, strengthening our
            communities, and creating opportunities that last.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#open-positions"
              onClick={scrollToOpenPositions}
              className="btn-base btn-green btn-shine"
            >
              <Sparkles className="size-4" />
              Explore Opportunities
            </a>
            <ApplyAction className="btn-base btn-outline-green !text-white !border-white/40 hover:!bg-white/10">
              View All Positions
              <ArrowRight className="size-4" />
            </ApplyAction>
          </div>
        </div>
      </section>

      {/* WHY WORK WITH US */}
      <section className="section-y bg-background">
        <div className="container-cevons">
          <div className="max-w-3xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-cevons-green">
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
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-cevons-green">
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
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-cevons-green">
              OPEN POSITIONS
            </p>
            <h2
              className="mt-3 text-3xl md:text-5xl font-bold text-cevons-dark dark:text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Explore Current Opportunities
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
            {JOBS.map(({ category, title, location, icon: Icon }) => (
              <article
                key={title}
                className="card-glow group flex h-full flex-col rounded-2xl bg-white dark:bg-white/[0.04] p-6 text-center hover:-translate-y-1 motion-reduce:transform-none"
              >
                <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-cevons-green/10 text-cevons-green group-hover:bg-cevons-green group-hover:text-white transition-colors">
                  <Icon className="size-6" />
                </span>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-cevons-green">
                  {category}
                </p>
                <h3 className="mt-2 text-lg font-bold text-cevons-dark dark:text-white leading-snug">
                  {title}
                </h3>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-cevons-muted dark:text-white/65">
                  <MapPin className="size-4 text-cevons-green" />
                  {location}
                </p>
                <ApplyAction
                  className="mt-5 btn-base btn-green btn-shine w-full"
                  ariaLabel={`View details for ${title}`}
                >
                  View Details
                  <ArrowRight className="size-4" />
                </ApplyAction>
              </article>
            ))}
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
