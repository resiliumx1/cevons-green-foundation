import { createFileRoute } from "@tanstack/react-router";
import { Waves, Calendar, Hammer, Home, Building, Users, Truck, Trash2, Container, Droplet } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-toilet.jpg";
import imgRel0 from "@/assets/svc-garbage.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-septic.jpg";

const PAGE_TITLE = "Portable Toilet Rental in Guyana | CEVONS";
const PAGE_DESC = "Luxury-spec portable toilets, EPA-compliant servicing, and event-grade units for weddings, festivals, and worksites across Guyana.";
const PAGE_URL = "/services/portable-toilet";

export const Route = createFileRoute("/services/portable-toilet")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: Page,
});

const uses = [
  { icon: Calendar, title: "Events & Weddings" },
  { icon: Hammer, title: "Construction Sites" },
  { icon: Home, title: "Home Renovations" },
  { icon: Building, title: "Offices & Schools" },
  { icon: Users, title: "Festivals & Parties" },
  { icon: Truck, title: "Long-Term Rentals" },
];

const faqs = [
  { q: "Can I rent a unit for just one day?", a: "Yes. One-day rentals are standard — we simply ask for at least two days' notice so the unit can be prepped and dispatched. Same-day service is often possible when the fleet has capacity, so it's worth asking." },
  { q: "Will the units be clean for my event?", a: "Yes. Event units are reserved exclusively for special events, parties, and weddings — they are never rotated onto construction sites. When it arrives at your venue it is presented at event standard." },
  { q: "How much notice do you need for a booking?", a: "Two days is the working minimum for a standard rental. For large events with multiple units — corporate functions, festivals, weddings with big guest counts — book a week or more ahead so we can lock the fleet allocation." },
  { q: "How often are units serviced during a rental?", a: "Weekly servicing is standard: the unit is fully restocked, cleaned, and sanitised at each visit. More frequent servicing is available for high-traffic sites or extended events — just tell us the expected traffic when you book." },
  { q: "Where can the unit be placed on site?", a: "Wherever you'd like it. We follow your placement instructions on delivery. If we ever need to relocate a unit to service it safely, we notify you first — units are never moved without your knowledge." },
  { q: "How is odour controlled?", a: "Every service visit pumps out the holding tank, cleans the bowl, and completes a full interior and exterior janitorial. A sanitising, deodorising detergent is added to the flush water at each refill, so the unit stays fresh between visits." },
];

const related = [
  { title: "General Trash Collection", body: "Reliable household pickup on a schedule.", img: imgRel0, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Dumpster Rental", body: "Multiple sizes for projects and cleanups.", img: imgRel1, to: "/services/dumpster-rental", icon: Container },
  { title: "Septic Services", body: "Safe, efficient septic tank pumping.", img: imgRel2, to: "/services/septic-services", icon: Droplet },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The World Cup standard",
    heading: "Portable toilets that were built to an international specification — and still are",
    paragraphs: [
      "CEVONS's first portable toilets were specially imported for the ICC Cricket World Cup 2007, where they had to meet a set of luxurious standards agreed with the tournament organisers. Every unit added to the fleet since has been held to that same specification.",
      "That matters because \"portable toilet\" covers a huge range of quality. A CEVONS unit is at the top of that range: a properly finished interior, working fixtures, and the small details — hand towel dispenser, coat hanger, shelf for personal effects — that guests actually notice.",
    ],
    images: [
      { src: "/services/detail/toilet-servicing-1.webp", alt: "CEVONS portable toilet unit being serviced by a sealed vacuum tanker" },
    ],
  },
  {
    variant: "gallery",
    eyebrow: "Inside a CEVONS unit",
    heading: "Hygiene features you can actually see",
    paragraphs: [
      "Every unit in the fleet ships with the same hygiene package — designed so guests don't have to touch anything they don't want to, and so the unit stays clean between servicing visits.",
    ],
    bullets: [
      "Foot-button flushing — 100% hygienic, no hand contact",
      "Foot-operated hand-wash sink with clean water",
      "Soap dispenser refilled at every service",
      "Deodorisers replaced at every service",
      "Hand towel dispenser",
      "Coat hanger and personal effects shelf",
      "Optional interior lights",
      "Optional mirror",
    ],
    images: [
      { src: "/services/detail/toilet-interior.webp", alt: "Interior of a CEVONS portable toilet showing hygiene fixtures" },
      { src: "/services/detail/toilet-units-1.webp", alt: "CEVONS portable toilet unit exterior" },
      { src: "/services/detail/toilet-units-2.webp", alt: "Row of CEVONS portable toilet units delivered on site" },
      { src: "/services/detail/toilet-units-3.webp", alt: "CEVONS portable toilet units arranged for an outdoor event" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "EPA-compliant servicing",
    heading: "Sealed vacuum tankers, approved disposal, fresh water and enzymes every visit",
    paragraphs: [
      "Every CEVONS portable toilet is serviced by our sealed vacuum tanker trucks — the only way waste is transported from a unit. That satisfies Environmental Protection Agency requirements, and it's why event organisers and site managers who care about compliance choose our fleet.",
      "Waste is discarded only at approved locations by approved methods. Fresh water is supplied to the flush tank on every service. Enzymes and a fragranced sanitising agent are added at each refill so the unit is genuinely clean between visits — not just perfumed.",
    ],
    images: [
      { src: "/services/detail/toilet-servicing-2.webp", alt: "CEVONS technician servicing a portable toilet unit on site" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Events to job sites",
    heading: "One day to long-term — from weddings to construction",
    paragraphs: [
      "The fleet covers large events and festivals, parties and weddings, construction sites, offices and schools, and short or long-term rentals of every kind. Event stock and site stock are kept separate, so the unit arriving at your wedding is not the same unit that left a construction site last week.",
      "Tell us what you're planning and we'll match the right unit — and the right servicing frequency — to it.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Waves}
      eyebrowLabel="Sanitation"
      breadcrumb="Portable Toilet"
      h1="Portable Toilet Rental"
      subhead="Luxury-spec portable toilets, EPA-compliant servicing, and event-grade units for weddings, festivals, and worksites across Guyana."
      heroImage={imgHero}
      heroAlt="Row of CEVONS portable toilets set up at an outdoor event in Guyana"
      benefits={["World Cup spec since 2007","Foot-flush, foot-wash hygiene package","Separate event and site fleet","Sealed vacuum tanker servicing","EPA-compliant disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="portable-toilet"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
