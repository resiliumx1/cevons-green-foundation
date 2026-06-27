import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Clock3,
  Award,
  Headphones,
  BookOpen,
  Calendar,
  Tag,
  MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WaveHalftoneDivider } from "@/components/WaveHalftoneDivider";
import { whatsappHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";
import { NewsletterSignup } from "@/components/NewsletterSignup";
const heroNewsroom = "/assets/heroes/hero-newsroom.webp";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgOil from "@/assets/svc-oil.jpg";
import imgWastewater from "@/assets/svc-wastewater.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgSeptic from "@/assets/svc-septic.jpg";
import imgScrap from "@/assets/svc-scrap.jpg";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Insights | CEVONS Environmental Services" },
      { name: "description", content: "Read CEVONS tips and insights on waste management, recycling, compliance, service preparation, and environmental responsibility in Guyana." },
      { property: "og:title", content: "Resources & Insights | CEVONS Environmental Services" },
      { property: "og:description", content: "Read CEVONS tips and insights on waste management, recycling, compliance, service preparation, and environmental responsibility in Guyana." },
      { property: "og:url", content: "/resources" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
      ])) },
    ],
  }),
  component: ResourcesPage,
});

type Category = "All" | "News" | "Sustainability" | "Compliance" | "Industry" | "Service Tips";
const categories: Category[] = ["All", "News", "Sustainability", "Compliance", "Industry", "Service Tips"];

type Article = {
  title: string;
  excerpt: string;
  category: Exclude<Category, "All">;
  date: string;
  img: string;
  alt: string;
  featured?: boolean;
};

const articles: Article[] = [
  {
    title: "Best Practices for Waste Management in Commercial Buildings",
    excerpt: "Learn how businesses can keep their properties cleaner, safer, and more efficient with responsible waste planning.",
    category: "Industry",
    date: "April 2026",
    img: imgCommercial,
    alt: "Commercial building with organized waste management systems",
    featured: true,
  },
  {
    title: "Why Recycling Waste Oil Matters",
    excerpt: "Responsible waste oil handling helps protect the environment and supports cleaner business operations.",
    category: "Sustainability",
    date: "March 2026",
    img: imgOil,
    alt: "Waste oil recycling process at a facility",
  },
  {
    title: "Understanding EPA Compliance in Guyana",
    excerpt: "What businesses should know about environmental responsibility and proper waste handling.",
    category: "Compliance",
    date: "March 2026",
    img: imgWastewater,
    alt: "Environmental compliance documentation and facility",
  },
  {
    title: "Preparing Your Site for Dumpster Delivery",
    excerpt: "Simple steps to help ensure your dumpster delivery is smooth and efficient.",
    category: "Service Tips",
    date: "February 2026",
    img: imgDumpster,
    alt: "Site preparation for dumpster rental delivery",
  },
  {
    title: "How We Help Our Communities Clean",
    excerpt: "CEVONS supports cleaner communities through reliable environmental services.",
    category: "News",
    date: "February 2026",
    img: imgGarbage,
    alt: "Community cleanup and environmental service support",
  },
  {
    title: "When to Schedule Septic Tank Clearance",
    excerpt: "Common signs that your septic system may need professional attention.",
    category: "Service Tips",
    date: "January 2026",
    img: imgSeptic,
    alt: "Septic tank clearance service in progress",
  },
  {
    title: "Scrap Metal Recycling for Businesses",
    excerpt: "How businesses can recover value from scrap metal while reducing waste.",
    category: "Sustainability",
    date: "January 2026",
    img: imgScrap,
    alt: "Scrap metal recycling at a business facility",
  },
];

const categoryColors: Record<string, string> = {
  News: "bg-blue-50 text-blue-700 border-blue-200",
  Sustainability: "bg-green-50 text-green-700 border-green-200",
  Compliance: "bg-amber-50 text-amber-700 border-amber-200",
  Industry: "bg-purple-50 text-purple-700 border-purple-200",
  "Service Tips": "bg-sky-50 text-sky-700 border-sky-200",
};

function ResourcesPage() {
  const [active, setActive] = useState<Category>("All");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = active === "All" ? articles : articles.filter((a) => a.category === active);
  const featured = articles.find((a) => a.featured);
  const gridArticles = active === "All" ? articles.filter((a) => !a.featured) : filtered.filter((a) => !a.featured);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-labelledby="resources-h1">
        <div className="absolute inset-0">
          <img src={heroNewsroom} alt="CEVONS newsroom and media announcements" className="size-full object-cover hero-img-mobile" width={1920} height={800} loading="eager" />
          <div className="absolute inset-0 hero-photo-overlay" />
        </div>
        <div className="container-cevons relative min-h-[300px] md:min-h-[380px] flex flex-col justify-center py-16 md:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow,#FFD200)] font-semibold">Resources</li>
            </ol>
          </nav>
          <h1 id="resources-h1" className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Resources & Insights
          </h1>
          <p className={`mt-4 text-white/85 text-base md:text-xl max-w-2xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Tips, updates, and insights on waste management and environmental responsibility.
          </p>
        </div>
        <WaveDivider variant="breeze" />
      </section>

      {/* CATEGORY FILTERS */}
      <section aria-label="Filter articles by category" className="border-b border-[var(--cevons-deep-green,#EF7700)]/10 bg-white sticky top-[72px] z-30">
        <div className="container-cevons py-4 flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = active === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={isActive}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cevons-deep-green,#EF7700)] focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-[var(--cevons-deep-green,#EF7700)] text-white border-[var(--cevons-deep-green,#EF7700)] shadow-soft"
                    : "bg-white text-[var(--cevons-dark,#101820)] border-[var(--cevons-border,#E5E7EB)] hover:border-[var(--cevons-deep-green,#EF7700)] hover:text-[var(--cevons-deep-green,#EF7700)]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      {featured && (active === "All" || active === featured.category) && (
        <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Featured article">
          <div className="container-cevons">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              Featured
            </p>
            <article
              className={`rounded-2xl bg-white border border-[var(--cevons-deep-green,#EF7700)]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid md:grid-cols-2 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden bg-[var(--cevons-cream,#FBF7EE)]">
                <img
                  src={featured.img}
                  alt={featured.alt}
                  loading="lazy"
                  width={800}
                  height={500}
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1 border ${categoryColors[featured.category]}`}>
                    <Tag className="size-3" /> {featured.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--cevons-muted,#64748B)]">
                    <Calendar className="size-3" /> {featured.date}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--cevons-deep-green,#EF7700)] leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[var(--cevons-muted,#64748B)] leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[var(--cevons-deep-green,#EF7700)] text-white hover:bg-[var(--cevons-deep-green,#EF7700)]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cevons-deep-green,#EF7700)] focus-visible:ring-offset-2"
                  >
                    <BookOpen className="size-4" /> Read Article
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* BLOG GRID */}
      <section className="section-y bg-white" aria-label="All articles">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-3">Articles</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">
              {active === "All" ? "Latest Insights" : `${active} Articles`}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {gridArticles.map(({ title, excerpt, category, date, img, alt }, i) => (
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
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1 border ${categoryColors[category]}`}>
                    <Tag className="size-3" /> {category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--cevons-muted,#64748B)] mb-2">
                    <Calendar className="size-3" /> {date}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#EF7700)] leading-snug">{title}</h3>
                  <p className="mt-2 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{excerpt}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)] hover:gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cevons-deep-green,#EF7700)] rounded"
                  >
                    Read Article <ArrowRight className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {gridArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--cevons-muted,#64748B)]">No articles in this category yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
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
              <p className="text-[var(--cevons-yellow,#FFD200)] text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <Leaf className="size-4" /> Get Support
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Need Help With Waste Management?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Our team can help you choose the right service for your home, business, or facility.
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

      <NewsletterSignup
        source="resources"
        heading="Get CEVONS tips in your inbox"
        subheading="Practical waste management, compliance and recycling insights — once a month, no spam."
      />

      {/* NEWSROOM CTA */}
      <section className="bg-white py-16 md:py-20 border-t border-[var(--cevons-deep-green,#EF7700)]/10">
        <div className="container-cevons">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-2xl border border-[var(--cevons-deep-green,#EF7700)]/10 bg-[var(--cevons-cream,#FBF7EE)] p-8 md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#EF7700)] mb-2">Press & Milestones</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--cevons-deep-green,#EF7700)]">Visit the CEVONS Newsroom</h3>
              <p className="mt-2 text-[var(--cevons-muted,#64748B)] max-w-xl">Press coverage, company milestones, and the latest updates from Guyana’s leading environmental services provider.</p>
            </div>
            <Link
              to="/newsroom"
              className="btn-base btn-green text-base px-6 py-3.5 shrink-0"
            >
              Go to Newsroom <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
