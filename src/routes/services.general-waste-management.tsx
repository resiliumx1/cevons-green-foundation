import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Building2, ShoppingBag, Utensils, School, Hospital, Warehouse, Container, FileText, Droplet } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import commercialWasteHeroAsset from "@/assets/commercial-waste-hero.jpeg.asset.json";
import imgRel0 from "@/assets/svc-skip.jpg";
import imgRel1 from "@/assets/svc-shred.jpg";
import imgRel2 from "@/assets/svc-grease.jpg";

const PAGE_TITLE = "Commercial Waste Management in Guyana | CEVONS";
const PAGE_DESC = "Scheduled waste management for businesses, offices, retail, and commercial properties across Guyana.";
const PAGE_URL = "/services/general-waste-management";

export const Route = createFileRoute("/services/general-waste-management")({
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
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "General Waste Management", category: "Commercial", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: Building2, title: "Offices" },
  { icon: ShoppingBag, title: "Retail Stores" },
  { icon: Utensils, title: "Restaurants & Hotels" },
  { icon: School, title: "Schools & Institutions" },
  { icon: Hospital, title: "Clinics & Healthcare" },
  { icon: Warehouse, title: "Warehousing" },
];

const faqs = [
  { q: "How often will my business be serviced?", a: "Frequency is set by your waste volume and operation type. Restaurants and hotels typically run daily or five-day service, offices and retail two or three times per week, and lower-volume sites weekly. We recommend a cadence during your initial waste audit." },
  { q: "What container sizes are available?", a: "Options range from 240L and 360L wheelie bins for small premises to 4-yard front-load skips and 10–52 cubic-yard roll-off dumpsters for larger sites and construction. Compactor rental is available for high-volume operations." },
  { q: "Can you handle multiple locations under one account?", a: "Yes. Multi-site businesses are set up under a single coordinated program with consolidated scheduling, one point of contact, and a combined statement — which simplifies operations for chains, property managers, and estates." },
  { q: "Do you offer source-separated recycling?", a: "Yes. Cardboard, mixed paper, plastics, and metals can be collected separately and routed through our Material Recovery Facility so recoverable streams are diverted from landfill." },
  { q: "What happens if a scheduled pickup is missed?", a: "Contact your account manager or WhatsApp our operations desk the same day. A return trip is dispatched, and the incident is logged so we can address the root cause on your route." },
  { q: "How do we get started with commercial service?", a: "Submit a quote request or WhatsApp our team. We'll arrange a site visit, complete a short waste audit, and propose the container mix, frequency, and pricing that fits your operation." },
];

const related = [
  { title: "Skip Bin & Dumpster Rental", body: "Multiple sizes for site, build, and operational needs.", img: imgRel0, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "Document Shredding", body: "Secure document destruction with chain-of-custody.", img: imgRel1, to: "/services/document-shredding", icon: FileText },
  { title: "Grease Trap / Septic Tank", body: "Grease trap and septic servicing for facilities.", img: imgRel2, to: "/services/grease-trap-septic-tank", icon: Droplet },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Programs, not just pickups",
    heading: "Programs built around your operations",
    paragraphs: [
      "Commercial waste isn't one problem — it's a portfolio. A construction site needs a one-time bulk removal bin, a busy restaurant needs daily front-load service, a hotel needs a compactor cycle that doesn't clash with guest arrivals.",
      "CEVONS designs each customer's program from the ground up: pickup schedules, container types, and collection frequencies are set by local experts who know your building envelope and your operating hours.",
      "The result is a service that fits how your business actually runs — no oversized containers, no missed windows, no waste piling up behind the building at peak trading hours.",
    ],
    images: [
      { src: "/services/detail/commercial-collection-3.webp", alt: "CEVONS commercial waste collection at a Guyana business" },
    ],
  },
  {
    variant: "gallery",
    eyebrow: "The right container for every site",
    heading: "An extensive container inventory that solves tight pick-up-area challenges",
    paragraphs: [
      "Commercial premises rarely have room to spare. Loading bays are narrow, service courts are shared, and pedestrian traffic runs right past the bin store. CEVONS carries an extensive inventory — front-load skips, rear-load bins, roll-off dumpsters, and compactors in multiple footprints — so we can specify a container that actually fits your envelope.",
      "Our operations team walks the site with you and gives on-the-ground advice on size, type, and placement to suit your waste streams and your custodial staff — including how the container will be presented and pulled at collection.",
    ],
    images: [
      { src: "/services/detail/commercial-collection-1.webp", alt: "Commercial front-load skip at a business site" },
      { src: "/services/detail/commercial-collection-2.webp", alt: "Rear-load waste collection at a commercial property" },
      { src: "/services/detail/commercial-collection-3.webp", alt: "CEVONS commercial waste truck serving a business" },
      { src: "/services/detail/commercial-collection-4.webp", alt: "Large-format container placed in a commercial service court" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Start with a waste audit",
    heading: "The right container, the right schedule — specified by experts who visit your site",
    paragraphs: [
      "Before we quote, our team completes a waste audit at your premises. We look at what you actually throw out, how much and how often, where the container has to live, and how your staff present it for collection.",
      "That assessment specifies the right wheelie bin, skip bin, or compactor — and the right pickup schedule — so your program is efficient from day one instead of being tuned after months of over- or under-service.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Building2}
      eyebrowLabel="Commercial"
      breadcrumb="General Waste Management"
      h1="Commercial Waste Management"
      subhead="Scheduled collection programs and waste solutions for offices, retail, hospitality, and multi-tenant properties."
      heroImage={commercialWasteHeroAsset.url}
      heroSlot="svc_general_waste_management_hero"
      heroAlt="CEVONS commercial waste collection at a Guyana business property"
      benefits={["Custom collection schedules", "Right-sized containers", "Reliable, professional crews", "Multi-site coordination", "Recycling programs on request"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="general-waste-management"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
