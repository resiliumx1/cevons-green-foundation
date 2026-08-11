import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Container, ShoppingCart, Hotel, Factory, Building2, Warehouse, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-industrial.jpg";
import imgRel0 from "@/assets/svc-skip.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";

const PAGE_TITLE = "Commercial Compactor Rental in Guyana | CEVONS";
const PAGE_DESC = "Stationary waste compactors for high-volume sites — supplied, serviced, and emptied under one CEVONS program.";
const PAGE_URL = "/services/compactor-rental";

export const Route = createFileRoute("/services/compactor-rental")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: absUrl(PAGE_URL) },
    ],
    links: [{ rel: "canonical", href: absUrl(PAGE_URL) }],
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Compactor Rental", category: "Commercial", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: ShoppingCart, title: "Supermarkets" },
  { icon: Hotel, title: "Hotels & Resorts" },
  { icon: Factory, title: "Manufacturing" },
  { icon: Building2, title: "Institutions" },
  { icon: Warehouse, title: "Distribution Centres" },
  { icon: Container, title: "High-Volume Sites" },
];

const faqs = [
  { q: "Which sites benefit most from a compactor?", a: "Sites where waste volume is genuinely large and steady — supermarkets, hotels, manufacturing plants, institutions, and distribution centres. If your service yard is filling up with bins between collections, a compactor is usually the answer." },
  { q: "How is emptying scheduled?", a: "On a cadence set against how quickly the unit fills. That's the whole operational win — you empty the compactor on the schedule the site actually needs, instead of running a fixed bin route regardless." },
  { q: "What are the siting and power requirements?", a: "Placement needs a level pad with truck access for hauling, and a stationary compactor needs a power connection to run. We survey the site up front so nothing gets installed and then discovered." },
  { q: "Can we combine a compactor with source-separated recycling?", a: "Yes — the compactor takes the general waste stream while recyclables are collected separately. That combination is how large sites keep hauling costs down while still hitting diversion targets." },
  { q: "How do I request one?", a: "Send us the site type, the waste stream, and an estimate of weekly volume. We'll come back with the right unit and a service cadence." },
];

const related = [
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel0, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Material Recovery Facility", body: "Sorting and recovery infrastructure.", img: imgRel2, to: "/services/material-recovery-facility", icon: Recycle },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "When a compactor beats a bin",
    heading: "High-volume sites don't have a waste problem — they have a hauling problem",
    paragraphs: [
      "On a supermarket, hotel, plant, or institution generating genuinely large volumes of waste, the cost isn't the waste itself — it's the number of times a truck has to visit to move it. A stationary compactor is the piece of equipment that changes that maths.",
      "The compactor sits on site, compresses waste as it's loaded, and holds far more material per collection than a stack of open bins. Fewer collections, less loose waste around the service yard, better control of odour and pests, and a loading area that stays tidy instead of drifting toward chaos between pickups.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "One program",
    heading: "Supplied, serviced, and emptied by CEVONS — under one contract",
    paragraphs: [
      "CEVONS supplies the compactor, keeps it in working order, and runs the collection cycle that empties it. One provider, one point of contact, one invoice — no chasing separate rental, service, and hauling companies when something needs attention.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Commercial"
      breadcrumb="Compactor Rental"
      h1="Commercial Compactor Rental"
      subhead="Stationary waste compactors for supermarkets, hotels, manufacturing, and institutions — supplied, serviced, and emptied under one CEVONS program."
      heroImage={imgHero}
      heroSlot="svc_compactor_rental_hero"
      heroAlt="Commercial waste compactor installed at a CEVONS client loading dock"
      benefits={[
        "Reduces waste volume on-site",
        "Cuts collection frequency",
        "Controls odour and pests",
        "Keeps service yards clear",
        "One provider for supply, service, and haul",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="compactor-rental"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
