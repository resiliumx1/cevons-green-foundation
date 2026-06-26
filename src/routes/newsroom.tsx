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
import { WaveDivider } from "@/components/WaveDivider";
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
  { year: "[REPLACE]", label: "Fleet Expansion", body: "[REPLACE] Key growth moment: expanded collection fleet and routing capacity to serve more communities across Georgetown.", icon: TrendingUp, replace: true },
  { year: "[REPLACE]", label: "ISO 9001:2015 Certification", body: "[REPLACE] Achieved ISO 9001:2015 certification for quality management systems, reinforcing our commitment to operational excellence.", icon: Award, replace: true },
  { year: "[REPLACE]", label: "EPA Certification", body: "[REPLACE] Earned EPA certification, meeting national environmental standards for waste handling and disposal.", icon: ShieldCheck, replace: true },
  { year: "[REPLACE]", label: "Linden Branch Opens", body: "[REPLACE] Opened the Linden branch to bring dedicated waste management services to communities south of Georgetown.", icon: MapPin, replace: true },
  { year: "[REPLACE]", label: "Berbice Branch Opens", body: "[REPLACE] Launched the Berbice / New Amsterdam branch, extending reliable coverage to eastern Guyana.", icon: MapPin, replace: true },
  { year: "[REPLACE]", label: "Recent Achievement", body: "[REPLACE] Recent company milestone: new service line launch, industry partnership, or award recognition.", icon: Trophy, replace: true },
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
          <img src={heroNewsroom} alt="CEVONS newsroom and press announcements" className="size-full object-cover" width={1920} height={800} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cevons-deep-green,#EF7700)]/95 via-[var(--cevons-deep-green,#EF7700)]/85 to-[var(--cevons-deep-green,#EF7700)]/60" />
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
        <WaveDivider variant="breeze" />
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

      {/* MILESTONES */}
      <section className="section-y bg-white" aria-labelledby="milestones-heading">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-2">Our Journey</p>
            <h2 id="milestones-heading" className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]" style={{ fontFamily: "Playfair Display, serif" }}>
              Milestones
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-[19px] md:left-[27px] top-0 bottom-0 w-px bg-[var(--cevons-deep-green,#EF7700)]/20" aria-hidden="true" />
            <ol className="space-y-10 md:space-y-14">
              {milestones.map(({ year, label, body, icon: Icon, replace }, i) => (
                <li key={i} className={`relative pl-14 md:pl-20 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="absolute left-0 top-0 size-10 md:size-14 rounded-full bg-[var(--cevons-deep-green,#EF7700)] text-white flex items-center justify-center shadow-sm" aria-hidden="true">
                    <Icon className="size-5 md:size-6" />
                  </span>
                  <div className="bg-white rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/10 p-5 md:p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-block text-sm font-extrabold px-2.5 py-0.5 rounded ${replace ? "bg-[var(--cevons-yellow,#FFD200)]/20 text-[var(--cevons-dark,#101820)]" : "bg-[var(--cevons-yellow,#FFD200)] text-[var(--cevons-dark,#101820)]"}`}>
                        {year}
                      </span>
                      <span className="text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)]">{label}</span>
                      {replace && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cevons-muted,#64748B)] bg-[var(--cevons-cream,#FBF7EE)] px-2 py-0.5 rounded">
                          [REPLACE]
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--cevons-muted,#64748B)] leading-relaxed text-sm md:text-base">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
