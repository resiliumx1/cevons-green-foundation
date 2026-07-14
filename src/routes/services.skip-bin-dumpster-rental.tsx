import { createFileRoute } from "@tanstack/react-router";
import { Container, Hammer, Building2, Wrench, Factory, Trees, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-skip.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";

const PAGE_TITLE = "Skip Bin & Dumpster Rental in Guyana | CEVONS";
const PAGE_DESC = "Commercial roll-off dumpsters from 30 to 52 cubic yards for construction, demolition, and industrial cleanups across Guyana.";
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
  { q: "Which size fits which type of project?", a: "The 30 yard is the workhorse for medium commercial builds and steady renovation output. The 40 yard suits complete site cleanups and bulky material. The 52 yard is built for demolition and industrial-scale clearances where anything smaller would be wasted trips." },
  { q: "Are there weight or fill limits I should know about?", a: "Every roll-off has a safe transport weight, and fill must sit at or below the top rail. Heavy loads like concrete and soil are best matched to the correct size — flag the material when you book and we'll advise so the truck leaves site legally and safely." },
  { q: "Can you deliver and collect around site working hours?", a: "Yes. Deliveries, swaps, and final collections are scheduled around your site hours so the truck isn't in the way of trades. Give us the site's access window when you book." },
];

const related = [
  { title: "Dumpster Rental", body: "Residential roll-off bins from 10 to 40 yards.", img: imgRel0, to: "/services/dumpster-rental", icon: Container },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Building2 },
  { title: "Material Recovery Facility", body: "Sorting and recovery that turns waste into resources.", img: imgRel2, to: "/services/material-recovery-facility", icon: Recycle },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The commercial range",
    heading: "30 and 40 cubic yard roll-offs — sized for the way sites actually generate waste",
    paragraphs: [
      "The 30 cubic yard is the most-requested container in the CEVONS commercial fleet. Twenty-two feet long, eight feet wide, four and a half feet high — enough capacity to absorb roughly ten pickup-truck loads while keeping a compact footprint on tight sites. It's the size we recommend by default for medium commercial builds, ongoing renovations, and steady weekly waste streams.",
      "The 40 cubic yard uses the same 22 ft × 8 ft footprint but climbs to six feet high, delivering an extra ten cubic yards of overhead. That headroom is why it's the right choice for complete site cleanups and jobs producing bulky items like furniture, cabinetry, and demolition debris that stack tall rather than heavy.",
    ],
    images: [
      { src: "/services/detail/dumpster-30yd.webp", alt: "CEVONS 30 cubic yard roll-off dumpster staged on a commercial job site" },
      { src: "/services/detail/dumpster-40yd.webp", alt: "CEVONS 40 cubic yard roll-off dumpster on a commercial cleanup" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "The flagship",
    heading: "The 52 cubic yard — the Mother of all Bins",
    paragraphs: [
      "The 52 cubic yard is the largest roll-off container on the road in Guyana. Twenty-two feet long, eight feet wide, and nine feet tall — a scale that makes it the right tool for large residential projects, full commercial cleanups, demolition, and industrial applications where a smaller bin would mean back-to-back swap-outs.",
      "One 52 yard bin does the work of two 30 yards, without the second delivery fee or the wait for a truck to return. When the material volume is genuinely large, this is the container that keeps the site moving.",
    ],
    images: [
      { src: "/services/detail/dumpster-52yd.webp", alt: "CEVONS 52 cubic yard roll-off — the largest dumpster in Guyana" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Short-term or long-term",
    heading: "The only 10 to 52 cubic yard fleet in Guyana — from the industry leader",
    paragraphs: [
      "Whether the bin is on site for two days or two years, the service is the same: timely delivery, timely collection, timely swap-outs, and hassle-free coordination with your site manager.",
      "No other operator in the country covers the full 10 to 52 cubic yard range. That's why site managers looking for a single provider across residential offshoots, commercial builds, and industrial contracts consolidate with CEVONS.",
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
      subhead="Commercial roll-off dumpsters from 30 to 52 cubic yards for construction, demolition, and industrial cleanups across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS commercial roll-off dumpster placed on a construction site in Guyana"
      benefits={["30, 40 & 52 cubic yard sizes","Only 10–52 yd fleet in Guyana","Short and long-term rental","On-schedule swap-outs","EPA-aligned disposal"]}
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
