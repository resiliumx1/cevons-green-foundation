import { createFileRoute } from "@tanstack/react-router";
import { Container, Home, Hammer, Leaf, Truck, Trees, Trash2, Building2 } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import { BinSizeSelector, type BinSizeOption } from "@/components/services/BinSizeSelector";
import imgHero from "@/assets/svc-dumpster.jpg";
import imgRel0 from "@/assets/svc-skip.jpg";
import imgRel1 from "@/assets/svc-garbage.jpg";
import imgRel2 from "@/assets/svc-commercial.jpg";
import imgSkip10Asset from "@/assets/skip-10yd-diagram.png.asset.json";
import imgDumpster20Asset from "@/assets/dumpster-20yd-diagram.png.asset.json";

const imgSkip10 = imgSkip10Asset as { url: string };
const imgDumpster20 = imgDumpster20Asset as { url: string };

const PAGE_TITLE = "Dumpster Rental in Guyana | CEVONS Environmental Services";
const PAGE_DESC =
  "Roll-off dumpsters from 10 to 52 cubic yards for home clean-ups, renovations, and yard clearances — the only 10–52 yard range in Guyana.";
const PAGE_URL = "/services/dumpster-rental";

export const Route = createFileRoute("/services/dumpster-rental")({
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
  { icon: Home, title: "Home Renovations" },
  { icon: Hammer, title: "Construction Debris" },
  { icon: Trees, title: "Yard Clearances" },
  { icon: Leaf, title: "Garden Waste" },
  { icon: Truck, title: "Bulky Item Removal" },
  { icon: Trash2, title: "Household Clean-Ups" },
];

const faqs = [
  { q: "Which size do I need for a home renovation?", a: "For most home renovations the 10 cubic yard skip is the workhorse — small enough to fit on a driveway, big enough to hold roughly sixty domestic garbage bags. When the job includes bulky items, furniture, or a full room strip-out, step up to the 20 cubic yard dumpster. If you're unsure, tell us the rooms involved and we'll recommend the right size." },
  { q: "How long can I keep the bin?", a: "Both short-term and long-term hires are arranged. Set the dates when you request the bin and we'll build the rental period around your project — one day, one week, or the length of your renovation." },
  { q: "What can't go in the bin?", a: "The bin takes general household, renovation and yard waste. Hazardous materials, liquid waste, chemicals, and regulated items must be handled separately — flag anything unusual when you book and we'll advise the correct disposal route." },
  { q: "Can you place the bin on my driveway without damaging it?", a: "Yes. Our drivers place the roll-off carefully and can use timber boards under the rollers on softer surfaces. Let us know where you'd like it and any access constraints when the truck arrives." },
  { q: "How fast can you deliver?", a: "Bins are typically delivered within a couple of business days of confirmation, and often sooner depending on route availability. Tell us your target delivery date when you request the bin." },
];

const related = [
  { title: "Skip Bin & Dumpster Rental", body: "Commercial roll-off service for job sites.", img: imgRel0, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "General Trash Collection", body: "Reliable household pickup on a schedule.", img: imgRel1, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel2, to: "/services/general-waste-management", icon: Building2 },
];

const sizeOptions: BinSizeOption[] = [
  {
    id: "skip-10",
    label: "10 cu yd Skip Bin",
    tagline: "The driveway workhorse for small clean-ups and home renovations",
    dimensions: "12 ft L × 5.6 ft W × 4 ft H",
    capacity: "≈ 60 domestic garbage bags",
    bestFor: [
      "Single-room renovations and small clean-outs",
      "Yard clearances and green waste",
      "Driveways where footprint matters",
    ],
    image: imgSkip10.url,
    imageAlt: "CEVONS 10 cubic yard orange skip bin, front three-quarter view",
  },
  {
    id: "dumpster-20",
    label: "20 cu yd Dumpster",
    tagline: "The step-up for bigger loads that still need a manageable footprint",
    dimensions: "22 ft L × 8 ft W × 4.6 ft H",
    capacity: "≈ 120 domestic garbage bags",
    bestFor: [
      "Multi-room renovations and full clean-outs",
      "Bulky items, furniture, and appliances",
      "Extended projects with sustained waste output",
    ],
    image: imgDumpster20.url,
    imageAlt: "CEVONS 20 cubic yard orange roll-off dumpster, side three-quarter view",
  },
];

const detailSections: DetailSection[] = [
  {
    variant: "band",
    eyebrow: "The right bin, first time",
    heading: "Two orange containers cover the bulk of residential clean-ups and renovations",
    paragraphs: [
      "The 10 cubic yard skip and the 20 cubic yard dumpster are the two bins CEVONS drops most on residential streets. The skip fits neatly on a standard driveway and handles bagged waste, timber, and small bulky items. The dumpster steps in when the job runs longer, the load runs heavier, or the material stacks bulkier than the skip can hold.",
      "As the preferred waste service provider in Guyana, we've placed thousands of these bins across Georgetown, Linden, and Berbice — and we know which projects genuinely need something bigger before we drop one off.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "The CEVONS Range",
    heading: "The only 10 to 52 cubic yard roll-off fleet in Guyana",
    paragraphs: [
      "No other operator in the country carries the full 10 to 52 cubic yard range. That matters, because getting the size right on the first drop-off saves you money on rental days and saves you the hassle of a second bin arriving mid-project.",
      "Tell us what you're clearing and we'll match the bin to the job — no upsell, no undersell.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Residential"
      breadcrumb="Dumpster Rental"
      h1="Dumpster Rental"
      subhead="Roll-off bins from 10 to 52 cubic yards for household clean-ups, home renovations, and yard waste across Guyana."
      heroImage={imgHero}
      heroSlot="svc_dumpster_rental_hero"
      heroAlt="Green CEVONS dumpster ready for rental on a residential Guyana driveway"
      benefits={["10 & 20 cu yd residential bins", "Only 10–52 yd range in Guyana", "Short and long-term rental", "Timely delivery and pickup", "EPA-aligned disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="dumpster-rental"
      optionsSection={
        <BinSizeSelector
          eyebrow="Size selector"
          heading="Pick the bin that matches your job"
          intro="Tap a size to see dimensions, capacity, and the projects it handles best. Not sure? Choose either and we'll confirm the fit when you book."
          options={sizeOptions}
        />
      }
      detailSections={detailSections}
      showAssistBand
      hideHeroImage
    />
  );
}
