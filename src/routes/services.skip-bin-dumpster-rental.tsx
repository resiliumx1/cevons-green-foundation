import { createFileRoute } from "@tanstack/react-router";
import { Container, Hammer, Building2, Wrench, Factory, Trees, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-skip.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";
import imgBin660 from "@/assets/bin-660l.webp.asset.json";
import imgBin1100 from "@/assets/bin-1100l.webp.asset.json";
import imgSkip10b from "@/assets/skip-10yd-b.webp.asset.json";
import imgDumpster20 from "@/assets/dumpster-20yd.webp.asset.json";

const PAGE_TITLE = "Skip Bin & Dumpster Rental in Guyana | CEVONS";
const PAGE_DESC = "Commercial roll-off dumpsters from 10 to 52 cubic yards for construction, demolition, and industrial cleanups across Guyana.";
const PAGE_URL = "/services/skip-bin-dumpster-rental";

export const Route = createFileRoute("/services/skip-bin-dumpster-rental")({
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
  { icon: Hammer, title: "Construction Sites" },
  { icon: Building2, title: "Commercial Builds" },
  { icon: Wrench, title: "Demolition Projects" },
  { icon: Factory, title: "Industrial Cleanups" },
  { icon: Trees, title: "Site Clearance" },
  { icon: Trash2, title: "Bulk Waste" },
];

const faqs = [
  { q: "Do you do one-time construction rentals or ongoing commercial contracts?", a: "Both. We drop off a single bin for a one-off demolition or cleanup and we run standing contracts for active sites that need bins swapped on a fixed cadence. Tell us the duration when you request the service and we'll structure the rental accordingly." },
  { q: "Can you swap out full bins during a long project?", a: "Yes. Swap-out service is one of the reasons commercial clients stay with us — full bin off, empty bin on, same visit, no site downtime. We'll set the swap frequency to your build schedule." },
  { q: "Which size fits which type of project?", a: "The 10 yard suits small clean-ups and home renovations. The 30 yard is the workhorse for medium commercial builds and steady renovation output. The 40 yard suits complete site cleanups and bulky material. The 52 yard is built for demolition and industrial-scale clearances where anything smaller would mean back-to-back swap-outs." },
  { q: "Are there weight or fill limits I should know about?", a: "Every roll-off has a safe transport weight, and fill must sit at or below the top rail. Heavy loads like concrete and soil are best matched to the correct size — flag the material when you book and we'll advise so the truck leaves site legally and safely." },
  { q: "Can you deliver and collect around site working hours?", a: "Yes. Deliveries, swaps, and final collections are scheduled around your site hours so the truck isn't in the way of trades. Give us the site's access window when you book." },
];

const related = [
  { title: "Dumpster Rental", body: "Residential roll-off bins from 10 to 52 yards.", img: imgRel0, to: "/services/dumpster-rental", icon: Container },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Building2 },
  { title: "Material Recovery Facility", body: "Sorting and recovery that turns waste into resources.", img: imgRel2, to: "/services/material-recovery-facility", icon: Recycle },
];

const detailSections: DetailSection[] = [
  {
    variant: "specGrid",
    eyebrow: "Size guide",
    heading: "Bin sizes and types at a glance — dimensions before you book",
    paragraphs: [
      "Every CEVONS container is dimensioned so site managers and facility teams can plan access, placement, and swap-out cadence before the truck rolls. From wheeled commercial bins to the flagship 52 cu yd roll-off, the range is built to match how sites actually generate waste.",
    ],
    images: [
      { src: imgBin660.url, alt: "660 L CEVONS wheeled commercial bin — 4 ft tall, 4.1 ft × 2.4 ft footprint", caption: "660 L Wheeled Bin — 4 × 4.1 × 2.4 ft" },
      { src: imgBin1100.url, alt: "1100 L CEVONS wheeled commercial bin — 4.9 ft tall, 4.55 ft × 3.65 ft footprint", caption: "1100 L Wheeled Bin — 4.9 × 4.55 × 3.65 ft" },
      { src: imgSkip10b.url, alt: "10 cubic yard CEVONS skip bin — 12 ft long, 5.6 ft wide, 4 ft high", caption: "10 cu yd Skip Bin — 12 × 5.6 × 4 ft" },
      { src: imgDumpster20.url, alt: "20 cubic yard CEVONS roll-off dumpster — 22 ft long, 8 ft wide, 4.6 ft high", caption: "20 cu yd Roll-off — 22 × 8 × 4.6 ft" },
    ],
  },
  {
    variant: "band",
    eyebrow: "The builders waste bin",
    heading: "The 10 cubic yard — the most commonly used skip bin",
    paragraphs: [
      "Twelve feet long, six feet wide, four feet high — about the size of a small car, and equivalent to roughly 60 domestic garbage bags of waste. The 10 cubic yard is the most commonly used skip bin, also known as the builders waste bin.",
      "It's the right size for small clean-up jobs and home renovations, where a larger container would sit half-empty and take up more of the driveway than the job needs.",
    ],
  },
  {
    variant: "split-right",
    eyebrow: "The commercial range",
    heading: "30 and 40 cubic yard roll-offs — sized for the way sites actually generate waste",
    paragraphs: [
      "The 30 cubic yard is one of the most popular sizes — price, compact footprint and capacity together. Twenty-two feet long, eight feet wide, four and a half feet high — enough capacity to absorb roughly ten pickup-truck loads while keeping a compact footprint on tight sites. A strong fit for medium commercial builds, ongoing renovations, and steady weekly waste streams.",
      "The 40 cubic yard uses the same 22 ft × 8 ft footprint but climbs to six feet high, delivering an extra ten cubic yards of overhead. That headroom is why it's the right choice for complete site cleanups and jobs producing bulky items like furniture, cabinetry, and demolition debris that stack tall rather than heavy.",
    ],
    images: [
      { src: "/services/detail/rolloff-truck-side.webp", alt: "CEVONS roll-off truck with a loaded roll-off container on the road in Guyana", width: 1448, height: 1086 },
      { src: "/services/detail/dumpster-40yd.webp", alt: "CEVONS 40 cubic yard roll-off dumpster on a commercial cleanup" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "The flagship",
    heading: "The 52 cubic yard — the Mother of all Bins",
    paragraphs: [
      "The 52 cubic yard is the largest container CEVONS runs — CEVONS is the only company in Guyana offering roll-off containers from 10 to 52 cubic yards. Twenty-two feet long, eight feet wide, and nine feet tall — a scale that makes it the right tool for large residential projects, full commercial cleanups, demolition, and industrial applications where a smaller bin would mean back-to-back swap-outs.",
      "When the material volume is genuinely large, the 52 keeps a site moving with fewer swap-outs.",
    ],
    images: [
      { src: "/services/detail/dumpster-52yd.webp", alt: "CEVONS 52 cubic yard roll-off — the largest dumpster in Guyana" },
      { src: "/services/detail/rolloff-container-loaded.webp", alt: "CEVONS roll-off container loaded with construction and demolition debris at the CEVONS yard", width: 1086, height: 1448 },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Short-term or long-term",
    heading: "The only 10 to 52 cubic yard fleet in Guyana — from the industry leader",
    paragraphs: [
      "Whether the bin is on site for a few days or several months, the service is the same: timely delivery, timely collection, timely swap-outs, and hassle-free coordination with your site manager.",
      "No other operator in the country covers the full 10 to 52 cubic yard range.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Commercial"
      breadcrumb="Skip Bin & Dumpster Rental"
      h1="Skip Bin & Dumpster Rental"
      subhead="Commercial roll-off dumpsters from 10 to 52 cubic yards for construction, demolition, and industrial cleanups across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS commercial roll-off dumpster placed on a construction site in Guyana"
      benefits={["10, 30, 40 & 52 cubic yard sizes","Only 10–52 yd fleet in Guyana","Short and long-term rental","On-schedule swap-outs","EPA-aligned disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="skip-bin-dumpster-rental"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
