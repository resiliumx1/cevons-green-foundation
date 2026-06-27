import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, FileText, Home, Map, Newspaper, Phone, Recycle, Truck } from "lucide-react";
import { useT } from "@/contexts/SettingsContext";

const BRAND_ORANGE = "#EF7700";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap — CEVONS Environmental Services" },
      {
        name: "description",
        content:
          "Browse every page on the CEVONS Environmental Services website — services, industries, locations, careers, newsroom and more.",
      },
      { property: "og:title", content: "Sitemap — CEVONS Environmental Services" },
      {
        property: "og:description",
        content:
          "Browse every page on the CEVONS Environmental Services website — services, industries, locations, careers, newsroom and more.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: SitemapPage,
});

type NavItem = { label: string; to: string };
type NavGroup = { title: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[] };

// Pulled from src/routes/*.tsx — every public, non-CRM route.
const MAIN: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Locations", to: "/locations" },
  { label: "Industries", to: "/industries" },
  { label: "Resources", to: "/resources" },
  { label: "Newsroom", to: "/newsroom" },
  { label: "Careers", to: "/careers" },
];

const REQUEST: NavItem[] = [
  { label: "Request Service", to: "/request-service" },
  { label: "Track Request", to: "/track-request" },
];

const SERVICES_INDEX: NavItem = { label: "All Services", to: "/services" };

// One entry per services.<slug>.tsx route file in src/routes/.
const SERVICE_DETAILS: NavItem[] = [
  { label: "Biohazardous Disposal", to: "/services/biohazardous-disposal" },
  { label: "Contaminated Soil", to: "/services/contaminated-soil" },
  { label: "Document Shredding", to: "/services/document-shredding" },
  { label: "Dumpster Rental", to: "/services/dumpster-rental" },
  { label: "General Trash Collection", to: "/services/general-trash-collection" },
  { label: "General Waste Management", to: "/services/general-waste-management" },
  { label: "Grease Trap & Septic Tank", to: "/services/grease-trap-septic-tank" },
  { label: "Hazardous Waste", to: "/services/hazardous-waste" },
  { label: "Landfill Operations", to: "/services/landfill-operations" },
  { label: "Material Recovery Facility", to: "/services/material-recovery-facility" },
  { label: "Portable Toilet Rental", to: "/services/portable-toilet" },
  { label: "Product Destruction", to: "/services/product-destruction" },
  { label: "Septic Services", to: "/services/septic-services" },
  { label: "Skip Bin & Dumpster Rental", to: "/services/skip-bin-dumpster-rental" },
  { label: "Tank Cleaning", to: "/services/tank-cleaning" },
  { label: "Used / Waste Oil", to: "/services/used-waste-oil" },
  { label: "Wastewater", to: "/services/wastewater" },
];

const GROUPS: NavGroup[] = [
  { title: "Main", icon: Home, items: MAIN },
  { title: "Request & Track", icon: Phone, items: REQUEST },
];

function SitemapLink({ to, label }: NavItem) {
  return (
    <Link
      to={to}
      className="group/sm inline-flex items-center gap-2 py-1.5 text-[15px] text-cevons-dark dark:text-white/85 hover:text-[color:var(--sm-orange)] focus-visible:text-[color:var(--sm-orange)] transition-colors motion-reduce:transition-none"
      style={{ ["--sm-orange" as never]: BRAND_ORANGE }}
    >
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 motion-reduce:transition-none group-hover/sm:opacity-100 group-hover/sm:translate-x-0 group-focus-visible/sm:opacity-100 group-focus-visible/sm:translate-x-0"
        style={{ color: BRAND_ORANGE }}
      />
      <span className="transition-transform duration-200 motion-reduce:transition-none group-hover/sm:translate-x-0.5">
        {label}
      </span>
    </Link>
  );
}

function GroupCard({ group }: { group: NavGroup }) {
  const Icon = group.icon;
  return (
    <section
      aria-labelledby={`sm-${group.title.toLowerCase().replace(/\s+/g, "-")}`}
      className="rounded-2xl border border-cevons-border dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 shadow-soft"
    >
      <header className="flex items-center gap-3 mb-4">
        <span
          className="size-10 rounded-xl inline-flex items-center justify-center ring-1 ring-cevons-border dark:ring-white/10"
          style={{ backgroundColor: "rgba(239,119,0,0.12)" }}
        >
          <Icon className="size-5" style={{ color: BRAND_ORANGE }} />
        </span>
        <h2
          id={`sm-${group.title.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-xl font-extrabold text-cevons-dark dark:text-white"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {group.title}
        </h2>
      </header>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {group.items.map((it) => (
          <li key={it.to}><SitemapLink {...it} /></li>
        ))}
      </ul>
    </section>
  );
}

function SitemapPage() {
  const t = useT();
  void t; // reserved for future translated headings
  return (
    <div className="bg-background">
      <header className="bg-gradient-to-b from-cevons-cream to-background dark:from-[var(--surface-1)] dark:to-background border-b border-cevons-border dark:border-white/10">
        <div className="container-cevons py-14 md:py-20">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.22em] mb-3"
            style={{ color: BRAND_ORANGE }}
          >
            Navigate the site
          </p>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-cevons-dark dark:text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Sitemap
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-cevons-muted dark:text-white/70">
            Every public page on the CEVONS Environmental Services website, grouped for quick
            reference. Looking for something specific? Use the links below or jump straight to
            <Link
              to="/contact"
              className="ml-1 font-semibold underline decoration-2 underline-offset-2 hover:text-[color:var(--sm-orange)]"
              style={{ ["--sm-orange" as never]: BRAND_ORANGE }}
            >
              Contact
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="container-cevons py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GROUPS.map((g) => (
            <GroupCard key={g.title} group={g} />
          ))}

          {/* Services group spans full width on lg and has its own 3-column list */}
          <section
            aria-labelledby="sm-services"
            className="lg:col-span-2 rounded-2xl border border-cevons-border dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 shadow-soft"
          >
            <header className="flex items-center gap-3 mb-2">
              <span
                className="size-10 rounded-xl inline-flex items-center justify-center ring-1 ring-cevons-border dark:ring-white/10"
                style={{ backgroundColor: "rgba(239,119,0,0.12)" }}
              >
                <Truck className="size-5" style={{ color: BRAND_ORANGE }} />
              </span>
              <h2
                id="sm-services"
                className="text-xl font-extrabold text-cevons-dark dark:text-white"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Services
              </h2>
            </header>

            <div className="mt-3 mb-4">
              <SitemapLink {...SERVICES_INDEX} />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cevons-muted dark:text-white/55 mb-2">
              Individual services
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              {SERVICE_DETAILS.map((it) => (
                <li key={it.to}><SitemapLink {...it} /></li>
              ))}
            </ul>
          </section>
        </div>

        {/* Small legend strip for a touch of brand */}
        <div className="mt-12 flex flex-wrap items-center gap-3 text-xs text-cevons-muted dark:text-white/55">
          <span className="inline-flex items-center gap-2">
            <Map className="size-4" style={{ color: BRAND_ORANGE }} />
            {MAIN.length + REQUEST.length + 1 + SERVICE_DETAILS.length} pages indexed
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-2"><Building2 className="size-4" /> Industries</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-2"><Newspaper className="size-4" /> Newsroom</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-2"><Recycle className="size-4" /> Services</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-2"><FileText className="size-4" /> Resources</span>
        </div>
      </div>
    </div>
  );
}
