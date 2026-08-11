import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { Container, Hammer, Building2, Wrench, Factory, Trees, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import { BinSizeSelector, type BinSizeOption } from "@/components/services/BinSizeSelector";
import imgHero from "@/assets/svc-skip.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";
import imgSkip10Asset from "@/assets/skip-10yd-diagram.png.asset.json";
import imgDumpster20Asset from "@/assets/dumpster-20yd-diagram.png.asset.json";
import imgDumpster40Asset from "@/assets/commercial-orange-dumpster.png.asset.json";
import imgDumpster52Asset from "@/assets/dumpster-20yd.webp.asset.json";

const imgSkip10 = imgSkip10Asset as { url: string };
const imgDumpster20 = imgDumpster20Asset as { url: string };
const imgDumpster40 = imgDumpster40Asset as { url: string };
const imgDumpster52 = imgDumpster52Asset as { url: string };

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
      { property: "og:url", content: absUrl(PAGE_URL) },
    ],
    links: [{ rel: "canonical", href: absUrl(PAGE_URL) }],
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

const sizeOptions: BinSizeOption[] = [
  {
    id: "skip-10",
    label: "10 cu yd Skip Bin",
    tagline: "The builders waste bin — small clean-ups and home renovations",
    dimensions: "12 ft L × 5.6 ft W × 4 ft H",
    capacity: "≈ 60 domestic garbage bags",
    bestFor: [
      "Small clean-up jobs and home renovations",
      "Tight driveways where footprint matters",
      "Short-term drops on residential streets",
    ],
    image: imgSkip10.url,
    imageAlt: "CEVONS 10 cubic yard orange skip bin with dimensions labelled",
  },
  {
    id: "dumpster-30",
    label: "30 cu yd Roll-off",
    tagline: "The commercial workhorse — price, footprint, and capacity in balance",
    dimensions: "22 ft L × 8 ft W × 4.5 ft H",
    capacity: "≈ 10 pickup-truck loads",
    bestFor: [
      "Medium commercial builds and ongoing renovations",
      "Steady weekly waste streams on active sites",
      "Tight sites needing a compact 22 ft footprint",
    ],
    image: imgDumpster20.url,
    imageAlt: "CEVONS 30 cubic yard orange roll-off dumpster with dimensions labelled",
  },
  {
    id: "dumpster-40",
    label: "40 cu yd Roll-off",
    tagline: "The tall-load option — extra headroom for bulky material",
    dimensions: "22 ft L × 8 ft W × 6 ft H",
    capacity: "10 additional cu yd of overhead vs the 30",
    bestFor: [
      "Complete site cleanups and full clear-outs",
      "Bulky items — furniture, cabinetry, demolition debris",
      "Jobs where material stacks tall rather than heavy",
    ],
    image: imgDumpster40.url,
    imageAlt: "CEVONS 40 cubic yard commercial roll-off dumpster",
  },
  {
    id: "dumpster-52",
    label: "52 cu yd Roll-off",
    tagline: "The Mother of all Bins — the largest roll-off in Guyana",
    dimensions: "22 ft L × 8 ft W × 9 ft H",
    capacity: "Fewer swap-outs on high-volume jobs",
    bestFor: [
      "Demolition and industrial-scale clearances",
      "Full commercial cleanups and large residential projects",
      "Sites where a smaller bin would mean back-to-back swap-outs",
    ],
    image: imgDumpster52.url,
    imageAlt: "CEVONS 52 cubic yard roll-off — the largest dumpster in Guyana",
  },
];

const detailSections: DetailSection[] = [
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
      heroSlot="svc_skip_bin_hero"
      heroAlt="CEVONS commercial roll-off dumpster placed on a construction site in Guyana"
      benefits={["10, 30, 40 & 52 cubic yard sizes","Only 10–52 yd fleet in Guyana","Short and long-term rental","On-schedule swap-outs","EPA-aligned disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="skip-bin-dumpster-rental"
      optionsSection={
        <BinSizeSelector
          eyebrow="Size selector"
          heading="Pick the roll-off that matches your site"
          intro="Tap a size to see dimensions, capacity, and the projects it handles best. Not sure? Choose the closest fit and we'll confirm on the site walk-through."
          options={sizeOptions}
        />
      }
      detailSections={detailSections}
      showAssistBand
      hideHeroImage

    />
  );
}
