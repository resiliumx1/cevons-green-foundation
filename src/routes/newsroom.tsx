import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Newspaper,
  Megaphone,
  FileText,
  Trophy,
  Award,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";
import { breadcrumbListJsonLd, organizationJsonLd } from "@/lib/seo/jsonLd";
import { supabase } from "@/integrations/supabase/client";
import { NewsroomSocialSection } from "@/components/newsroom/NewsroomSocialSection";

const heroNewsroom = "/assets/heroes/hero-newsroom.webp";

export const Route = createFileRoute("/newsroom")({
  head: () => ({
    meta: [
      { title: "Newsroom | CEVONS Environmental Services" },
      {
        name: "description",
        content:
          "Press releases, news coverage, and announcements from CEVONS Environmental Services Inc., Guyana’s leader in waste management since 1997.",
      },
      { property: "og:title", content: "Newsroom | CEVONS Environmental Services" },
      {
        property: "og:description",
        content: "Press releases, news coverage, and announcements from CEVONS Environmental Services Inc.",
      },
      { property: "og:url", content: "/newsroom" },
    ],
    links: [{ rel: "canonical", href: "/newsroom" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationJsonLd()) },
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

type MediaItem = {
  id: string;
  type: "release" | "news" | "announcement";
  title: string;
  summary: string | null;
  body: string | null;
  outlet: string | null;
  external_url: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  sort_order: number;
};

/* ───────── MILESTONES (unchanged) ───────── */
interface Milestone {
  year: string;
  label: string;
  body: string;
  icon: typeof Trophy;
  replace?: boolean;
}

const milestones: Milestone[] = [
  { year: "1997", label: "Founded", body: "CEVONS Environmental Services Inc. is established in Guyana with a mission to deliver reliable waste management solutions.", icon: Leaf },
  { year: "", label: "Fleet Expansion", body: "Key growth moment: expanded collection fleet and routing capacity to serve more communities across Georgetown.", icon: TrendingUp },
  { year: "", label: "ISO 9001:2015 Certification", body: "Achieved ISO 9001:2015 certification for quality management systems, reinforcing our commitment to operational excellence.", icon: Award },
  { year: "", label: "EPA Certification", body: "Earned EPA certification, meeting national environmental standards for waste handling and disposal.", icon: ShieldCheck },
  { year: "", label: "Linden Branch Opens", body: "Opened the Linden branch to bring dedicated waste management services to communities south of Georgetown.", icon: MapPin },
  { year: "", label: "Berbice Branch Opens", body: "Launched the Berbice / New Amsterdam branch, extending reliable coverage to eastern Guyana.", icon: MapPin },
  { year: "", label: "Recent Achievement", body: "Recent company milestone: new service line launch, industry partnership, or award recognition.", icon: Trophy },
];

const SECTION_META: Record<MediaItem["type"], { title: string; eyebrow: string; icon: typeof Newspaper }> = {
  release: { title: "Media Releases", eyebrow: "Press Releases", icon: FileText },
  news: { title: "CEVONS in the News", eyebrow: "Press Coverage", icon: Newspaper },
  announcement: { title: "Announcements", eyebrow: "Latest Updates", icon: Megaphone },
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

function MediaCard({ item }: { item: MediaItem }) {
  const meta = SECTION_META[item.type];
  const href = item.external_url ?? undefined;
  const isExternal = !!href && /^https?:\/\//i.test(href);
  return (
    <article className="group relative bg-white rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/10 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-[var(--cevons-deep-green,#EF7700)]/25 flex flex-col">
      {item.image_url && (
        <div className="aspect-[16/9] overflow-hidden bg-[var(--cevons-cream,#FBF7EE)]">
          <img
            src={item.image_url}
            alt={item.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cevons-deep-green,#EF7700)]/10 text-[var(--cevons-deep-green,#EF7700)] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
            <meta.icon className="size-3" />
            {item.outlet ?? meta.eyebrow}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--cevons-muted,#64748B)]">
            <Calendar className="size-3" />
            {formatDate(item.published_at)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[var(--cevons-dark,#101820)] leading-snug mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed flex-1">{item.summary}</p>
        )}
        {href && (
          <div className="mt-5 pt-4 border-t border-[var(--cevons-deep-green,#EF7700)]/10">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)] hover:gap-2 transition-all"
              >
                {item.type === "news" ? "Read article" : "Read more"} <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <Link
                to={href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)] hover:gap-2 transition-all"
              >
                Learn more <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function MediaSection({ type, items }: { type: MediaItem["type"]; items: MediaItem[] }) {
  if (items.length === 0) return null;
  const meta = SECTION_META[type];
  return (
    <section className="mb-16 last:mb-0" aria-labelledby={`media-${type}`}>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-2">
            {meta.eyebrow}
          </p>
          <h2 id={`media-${type}`} className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-dark,#101820)]" style={{ fontFamily: "Playfair Display, serif" }}>
            {meta.title}
          </h2>
        </div>
        <meta.icon className="size-8 text-[var(--cevons-deep-green,#EF7700)]/30 hidden md:block" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {items.map((it) => <MediaCard key={it.id} item={it} />)}
      </div>
    </section>
  );
}

function NewsroomPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["public-media-items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("media_items")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });

  const releases = items.filter((i) => i.type === "release");
  const news = items.filter((i) => i.type === "news");
  const announcements = items.filter((i) => i.type === "announcement");

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-labelledby="newsroom-h1">
        <div className="absolute inset-0">
          <img src={heroNewsroom} alt="CEVONS newsroom and press announcements" className="size-full object-cover hero-img-mobile" width={1920} height={800} loading="eager" />
          <div className="absolute inset-0 hero-photo-overlay" />
        </div>
        <div className="container-cevons relative min-h-[300px] md:min-h-[380px] flex flex-col justify-center py-16 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow,#FFD200)] font-semibold">Newsroom</li>
            </ol>
          </nav>
          <h1 id="newsroom-h1" className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ fontFamily: "Playfair Display, serif" }}>
            Newsroom
          </h1>
          <p className={`mt-4 text-white/85 text-base md:text-xl max-w-2xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Press releases, news coverage, milestones, and the stories behind Guyana’s leading environmental services company.
          </p>
        </div>
        <WaveHalftoneDivider height={48} />
      </section>

      {/* MEDIA HUB */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]">
        <div className="container-cevons">
          {isLoading ? (
            <div className="text-center py-16 text-[var(--cevons-muted,#64748B)]">Loading newsroom…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-[var(--cevons-muted,#64748B)]">No items published yet. Check back soon.</div>
          ) : (
            <>
              <MediaSection type="release" items={releases} />
              <MediaSection type="news" items={news} />
              <MediaSection type="announcement" items={announcements} />
            </>
          )}
        </div>
      </section>

      {/* MILESTONES */}
      {/* SOCIAL */}
      <NewsroomSocialSection />

      {/* MILESTONES — editorial alternating timeline */}
      <section
        className="section-y bg-[var(--cevons-cream,#FBF7EE)] dark:bg-[#0f0f0f]"
        aria-labelledby="milestones-heading"
      >
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="block text-xs md:text-sm font-semibold uppercase tracking-[0.28em] text-[#EF7700] mb-3">
              Our Journey
            </span>
            <h2
              id="milestones-heading"
              className="font-display text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white tracking-tight"
            >
              Company Milestones
            </h2>
            <div aria-hidden className="mt-5 mx-auto h-[3px] w-20 rounded-full bg-[#EF7700]" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical spine */}
            <div
              aria-hidden="true"
              className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1A1A1A]/15 dark:via-white/15 to-transparent"
            />

            <ol className="space-y-12 md:space-y-20">
              {milestones.map(({ year, label, body, icon: Icon, replace }, i) => {
                const right = i % 2 === 1; // alternate on md+
                return (
                  <li
                    key={i}
                    className={`relative flex flex-col md:flex-row ${right ? "md:flex-row-reverse" : ""} items-start md:items-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {/* Content column */}
                    <div className={`w-full md:w-1/2 pl-14 md:pl-0 ${right ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                      <div className={`inline-flex items-center gap-2 mb-4 ${right ? "" : "md:flex-row-reverse"}`}>
                        {year ? (
                          <span
                            className={`px-4 py-1 text-sm font-bold rounded-full ${
                              replace ? "bg-[#1A1A1A] text-white" : "bg-[#EF7700] text-white"
                            }`}
                          >
                            {year}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full bg-[#EF7700]/10 text-[#EF7700] ring-1 ring-[#EF7700]/30">
                            Milestone
                          </span>
                        )}
                      </div>
                      <h3
                        className={`font-display text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3 leading-tight max-w-sm ${right ? "" : "md:ml-auto"}`}
                      >
                        {label}
                      </h3>
                      <p
                        className={`text-[#4B5563] dark:text-white/75 leading-relaxed max-w-sm text-sm md:text-base ${right ? "" : "md:ml-auto"}`}
                      >
                        {body}
                      </p>
                    </div>

                    {/* Spine node */}
                    <div className="absolute left-4 md:left-1/2 top-1 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] shadow-md border-4 ${
                          replace
                            ? "border-dashed border-[#1A1A1A]/40 dark:border-white/40"
                            : "border-[#EF7700]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${replace ? "text-[#1A1A1A]/60 dark:text-white/60" : "text-[#EF7700]"}`}
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Spacer for desktop balance */}
                    <div className="hidden md:block md:w-1/2" />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
