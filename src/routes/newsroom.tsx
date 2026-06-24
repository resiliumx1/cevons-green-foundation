import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Newspaper,
  Trophy,
  Award,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveDivider } from "@/components/WaveDivider";
import { breadcrumbListJsonLd, organizationJsonLd } from "@/lib/seo/jsonLd";

const heroNewsroom = "/assets/heroes/hero-newsroom.webp";

export const Route = createFileRoute("/newsroom")({
  head: () => ({
    meta: [
      { title: "Newsroom | CEVON’S Environmental Services" },
      {
        name: "description",
        content:
          "Press coverage, milestones, and the latest news from CEVON’S Environmental Services Inc., Guyana’s leader in waste management since 1997.",
      },
      {
        property: "og:title",
        content: "Newsroom | CEVON’S Environmental Services",
      },
      {
        property: "og:description",
        content:
          "Press coverage, milestones, and the latest news from CEVON’S Environmental Services Inc.",
      },
      { property: "og:url", content: "/newsroom" },
    ],
    links: [{ rel: "canonical", href: "/newsroom" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          organizationJsonLd()
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Newsroom", path: "/newsroom" },
          ])
        ),
      },
    ],
  }),
  component: NewsroomPage,
});

/* ───────── PRESS CLIPS (placeholder) ───────── */
interface PressClip {
  outlet: string;
  title: string;
  date: string;
  link?: string; // optional external URL
  replace?: boolean;
}

const pressClips: PressClip[] = [
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] CEVON’S Environmental Services featured in local press for community cleanup initiative",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] Guyana’s waste management leader expands fleet with new collection vehicles",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] CEVON’S receives ISO 9001:2015 certification for quality management systems",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] Environmental responsibility: How CEVON’S supports Georgetown’s green goals",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] New Berbice branch opens to serve growing demand in eastern Guyana",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
  {
    outlet: "[REPLACE] News Outlet",
    title:
      "[REPLACE] CEVON’S partners with local industries for hazardous waste compliance",
    date: "[REPLACE] Month YYYY",
    replace: true,
  },
];

/* ───────── MILESTONES ───────── */
interface Milestone {
  year: string;
  label: string;
  body: string;
  icon: typeof Trophy;
  replace?: boolean;
}

const milestones: Milestone[] = [
  {
    year: "1997",
    label: "Founded",
    body: "CEVON’S Environmental Services Inc. is established in Guyana with a mission to deliver reliable waste management solutions.",
    icon: Leaf,
  },
  {
    year: "[REPLACE]",
    label: "Fleet Expansion",
    body: "[REPLACE] Key growth moment: expanded collection fleet and routing capacity to serve more communities across Georgetown.",
    icon: TrendingUp,
    replace: true,
  },
  {
    year: "[REPLACE]",
    label: "ISO 9001:2015 Certification",
    body: "[REPLACE] Achieved ISO 9001:2015 certification for quality management systems, reinforcing our commitment to operational excellence.",
    icon: Award,
    replace: true,
  },
  {
    year: "[REPLACE]",
    label: "EPA Certification",
    body: "[REPLACE] Earned EPA certification, meeting national environmental standards for waste handling and disposal.",
    icon: ShieldCheck,
    replace: true,
  },
  {
    year: "[REPLACE]",
    label: "Linden Branch Opens",
    body: "[REPLACE] Opened the Linden branch to bring dedicated waste management services to communities south of Georgetown.",
    icon: MapPin,
    replace: true,
  },
  {
    year: "[REPLACE]",
    label: "Berbice Branch Opens",
    body: "[REPLACE] Launched the Berbice / New Amsterdam branch, extending reliable coverage to eastern Guyana.",
    icon: MapPin,
    replace: true,
  },
  {
    year: "[REPLACE]",
    label: "Recent Achievement",
    body: "[REPLACE] Recent company milestone: new service line launch, industry partnership, or award recognition.",
    icon: Trophy,
    replace: true,
  },
];

/* ───────── COMPONENT ───────── */
function NewsroomPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-labelledby="newsroom-h1">
        <div className="absolute inset-0">
          <img
            src={heroNewsroom}
            alt="CEVON’S newsroom and press announcements"
            className="size-full object-cover"
            width={1920}
            height={800}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cevons-deep-green,#EF7700)]/95 via-[var(--cevons-deep-green,#EF7700)]/85 to-[var(--cevons-deep-green,#EF7700)]/60" />
        </div>
        <div className="container-cevons relative min-h-[300px] md:min-h-[380px] flex flex-col justify-center py-16 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol
              className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <li>
                <Link
                  to="/"
                  className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5 text-white/50" />
              </li>
              <li
                aria-current="page"
                className="text-[var(--cevons-yellow,#FFD200)] font-semibold"
              >
                Newsroom
              </li>
            </ol>
          </nav>
          <h1
            id="newsroom-h1"
            className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Newsroom
          </h1>
          <p
            className={`mt-4 text-white/85 text-base md:text-xl max-w-2xl transition-all duration-700 delay-150 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Press coverage, milestones, and the stories behind Guyana’s leading
            environmental services company.
          </p>
        </div>
        <WaveDivider variant="breeze" />
      </section>

      {/* IN THE NEWS */}
      <section className="section-y bg-white" aria-labelledby="press-heading">
        <div className="container-cevons">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-2">
                Media & Press
              </p>
              <h2
                id="press-heading"
                className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]"
              >
                In the News
              </h2>
            </div>
            <Newspaper className="size-8 text-[var(--cevons-deep-green,#EF7700)]/30 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pressClips.map(({ outlet, title, date, link, replace }, i) => (
              <article
                key={i}
                className={`group relative bg-[var(--cevons-cream,#FBF7EE)] rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/10 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-[var(--cevons-deep-green,#EF7700)]/25 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center rounded-full bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)] text-xs font-bold px-3 py-1">
                      {replace ? "[REPLACE]" : outlet}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--cevons-muted,#64748B)]">
                      <Calendar className="size-3" />
                      {date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)] leading-snug flex-1">
                    {title}
                  </h3>
                  <div className="mt-5 pt-5 border-t border-[var(--cevons-deep-green,#EF7700)]/10">
                    {link && !replace ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)] hover:gap-2 transition-all"
                      >
                        Read article <ArrowUpRight className="size-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cevons-muted,#64748B)]">
                        Link coming soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-labelledby="milestones-heading">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-2">
              Our Journey
            </p>
            <h2
              id="milestones-heading"
              className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]"
            >
              Milestones
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* vertical line */}
            <div
              className="absolute left-[19px] md:left-[27px] top-0 bottom-0 w-px bg-[var(--cevons-deep-green,#EF7700)]/20"
              aria-hidden="true"
            />
            <ol className="space-y-10 md:space-y-14">
              {milestones.map(
                ({ year, label, body, icon: Icon, replace }, i) => (
                  <li
                    key={i}
                    className={`relative pl-14 md:pl-20 transition-all duration-700 ${
                      mounted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {/* dot */}
                    <span
                      className="absolute left-0 top-0 size-10 md:size-14 rounded-full bg-[var(--cevons-deep-green,#EF7700)] text-white flex items-center justify-center shadow-sm"
                      aria-hidden="true"
                    >
                      <Icon className="size-5 md:size-6" />
                    </span>
                    <div className="bg-white rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/10 p-5 md:p-6 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-block text-sm font-extrabold px-2.5 py-0.5 rounded ${
                            replace
                              ? "bg-[var(--cevons-yellow,#FFD200)]/20 text-[var(--cevons-dark,#101820)]"
                              : "bg-[var(--cevons-yellow,#FFD200)] text-[var(--cevons-dark,#101820)]"
                          }`}
                        >
                          {year}
                        </span>
                        <span className="text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)]">
                          {label}
                        </span>
                        {replace && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cevons-muted,#64748B)] bg-[var(--cevons-cream,#FBF7EE)] px-2 py-0.5 rounded">
                            [REPLACE]
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--cevons-muted,#64748B)] leading-relaxed text-sm md:text-base">
                        {body}
                      </p>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
