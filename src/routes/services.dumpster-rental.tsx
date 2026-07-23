import { createFileRoute } from "@tanstack/react-router";
import { Container, Home, Hammer, Leaf, Truck, Trees, Trash2, Building2, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-dumpster.jpg";
import imgRel0 from "@/assets/svc-skip.jpg";
import imgRel1 from "@/assets/svc-garbage.jpg";
import imgRel2 from "@/assets/svc-commercial.jpg";
import imgBin240 from "@/assets/bin-240l.webp.asset.json";
import imgBin660 from "@/assets/bin-660l.webp.asset.json";
import imgBin1100 from "@/assets/bin-1100l.webp.asset.json";
import imgSkip10a from "@/assets/skip-10yd-a.webp.asset.json";
import imgDumpster20 from "@/assets/dumpster-20yd.webp.asset.json";

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
  { q: "Which size do I need for a home renovation?", a: "For most home renovations the 10 cubic yard skip is the workhorse — small enough to fit on a driveway, big enough to hold roughly sixty domestic garbage bags. Full home cleanouts with furniture and bulky items usually step up to the 40 yard. If you're unsure, tell us the rooms involved and we'll recommend the right size." },
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

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The 10-yard workhorse",
    heading: "The builder's waste bin — for the small job that still generates real waste",
    paragraphs: [
      "Whether you're tackling a small clean-up or a major home renovation, CEVONS supplies the right size bin at competitive pricing. The 10 cubic yard skip is the one we drop off most: about the size of a small car, roughly 12 ft long by 6 ft wide by 4 ft high — enough capacity to swallow the equivalent of around sixty domestic garbage bags.",
      "It fits neatly on a standard driveway, doesn't dominate the front of your property, and handles the mixed load of bagged waste, timber, and small bulky items that a home clean-up or minor renovation produces.",
      "As the preferred waste service provider in Guyana, we've placed thousands of these bins on residential drives and back yards — and we know which projects genuinely need something bigger before we drop one off.",
    ],
    images: [
      { src: "/services/detail/skip-bin-10yd-1.webp", alt: "CEVONS 10 cubic yard skip bin loaded and ready for collection" },
      { src: "/services/detail/skip-bin-10yd-2.webp", alt: "Second view of the CEVONS 10 cubic yard skip bin on-site" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Sizing up",
    heading: "When the 10 yard isn't enough — the 30 and 40 cubic yard roll-offs",
    paragraphs: [
      "The 30 cubic yard bin — 22 ft long by 8 ft wide by 4.5 ft high — swallows roughly ten pickup-truck loads. It's the most popular size in our line-up because it hits the sweet spot between price, footprint, and capacity: big enough for a serious renovation, small enough to stage on most residential lots.",
      "When the job includes a complete cleanout — furniture, appliances, room contents, or the aftermath of a full renovation — the 40 cubic yard steps in. Same 22 ft × 8 ft footprint as the 30, but 6 ft high, giving you an extra 10 cubic yards of overhead capacity for bulky items that would otherwise stack awkwardly.",
    ],
    images: [
      { src: "/services/detail/dumpster-30yd.webp", alt: "CEVONS 30 cubic yard roll-off dumpster on a residential renovation site" },
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
      heroAlt="Green CEVONS dumpster ready for rental on a residential Guyana driveway"
      benefits={["10, 30, 40 & 52 cubic yard sizes", "Only 10–52 yd range in Guyana", "Short and long-term rental", "Timely delivery and pickup", "EPA-aligned disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="dumpster-rental"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
