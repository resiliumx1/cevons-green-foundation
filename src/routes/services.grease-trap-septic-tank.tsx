import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Utensils, Building, Building2, School, Hospital, Factory, Waves } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-grease.jpg";
import imgRel0 from "@/assets/svc-commercial.jpg";
import imgRel1 from "@/assets/svc-septic.jpg";
import imgRel2 from "@/assets/svc-wastewater.jpg";

const PAGE_TITLE = "Grease Trap & Septic Tank Services in Guyana | CEVONS";
const PAGE_DESC = "Scheduled grease trap servicing, septic tank emptying, and high-pressure jetting for restaurants and commercial facilities across Guyana.";
const PAGE_URL = "/services/grease-trap-septic-tank";

export const Route = createFileRoute("/services/grease-trap-septic-tank")({
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
  { icon: Utensils, title: "Restaurants" },
  { icon: Building, title: "Hotels" },
  { icon: Building2, title: "Office Cafeterias" },
  { icon: School, title: "Schools & Institutions" },
  { icon: Hospital, title: "Healthcare Facilities" },
  { icon: Factory, title: "Food Processing" },
];

const faqs = [
  { q: "How often should a restaurant grease trap be serviced?", a: "Most commercial kitchens need scheduled servicing every one to three months, depending on cover count and cuisine. High-volume kitchens and fry-heavy menus move to the shorter end of that range. We'll set a cadence after seeing the trap and the kitchen's throughput." },
  { q: "What happens if a grease trap overflows?", a: "An overflow means blocked drains, foul odours through the kitchen, and — if the discharge reaches the environment — an EPA incident that puts the operator on the hook. A scheduled servicing programme is dramatically cheaper than dealing with any of that reactively." },
  { q: "Do you provide service records for compliance?", a: "Yes. Every visit is documented and service records are provided so you can demonstrate compliance to inspectors, franchise auditors, or your management team." },
  { q: "Can you combine grease trap and septic service on one schedule?", a: "Yes, and most multi-site operators do exactly that. One provider, one calendar, one paper trail — traps, tanks, and jetting all coordinated to a single visit whenever possible." },
  { q: "Do you respond to emergency or blocked-drain calls?", a: "Yes. Our high-pressure jetting rigs are dispatched for blocked sewers, drains, pipes, and interceptors when the line has to be cleared before the next service can trade." },
];

const related = [
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel0, to: "/services/general-waste-management", icon: Building2 },
  { title: "Septic Services", body: "Residential septic pumping and clearance.", img: imgRel1, to: "/services/septic-services", icon: Droplet },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel2, to: "/services/wastewater", icon: Waves },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "For restaurants and commercial kitchens",
    heading: "A grease trap programme that protects the kitchen and the environment",
    paragraphs: [
      "A well-maintained grease trap is the difference between a kitchen that runs smoothly and one that periodically closes because the line's backed up. Regular cleaning and emptying keeps flow rates where they should be, kills the odour build-up that customers notice, and — critically — keeps fats and oils out of the wider drainage network where they cause environmental incidents.",
      "CEVONS runs scheduled servicing programmes for restaurants, hotels, cafeterias, and food processors right across Guyana. We take the trap on a fixed cadence, log each visit, and provide the compliance paperwork operators need for inspectors and auditors.",
    ],
    images: [
      { src: "/services/detail/grease-trap-cleaning.webp", alt: "CEVONS crew servicing a commercial grease trap at a restaurant kitchen" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "High-pressure jetting",
    heading: "Fast, effective clearance for sewers, drains, pipes, and interceptor tanks",
    paragraphs: [
      "When a line blocks — whether it's a kitchen drain, an interceptor tank, or a section of building sewer — our high-pressure water jetting rigs cut through the obstruction and restore full flow. It's the same equipment used to keep grease traps and interceptors in condition between empties, so the underlying network stays clear long after the visible symptom is gone.",
      "The service covers sewers, drains, pipes, interceptor tanks, and grease traps as a single line-of-work. If it moves wet waste, we can jet it.",
    ],
    images: [
      { src: "/services/detail/jetting-service.webp", alt: "CEVONS high-pressure jetting rig clearing a commercial drain line" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "One provider, the whole chain",
    heading: "Traps, tanks, jetting, and licensed disposal — under one contract",
    paragraphs: [
      "The same 8,500 to 10,500 litre tanker fleet that services residential septic works your commercial site — every load is transported in sealed vehicles and discharged at disposal locations licensed and approved by the Government of Guyana.",
      "That's why multi-site operators consolidate their wet-waste programme with CEVONS: one call, one schedule, one compliant paper trail, and coverage in every region of the country.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Commercial"
      breadcrumb="Grease Trap / Septic Tank"
      h1="Grease Trap & Septic Tank Services"
      subhead="Scheduled grease trap servicing, commercial septic emptying, and high-pressure jetting for restaurants and facilities across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS service vehicle performing grease trap cleaning at a commercial kitchen"
      benefits={["Scheduled grease trap programmes","High-pressure jetting rigs","8,500–10,500 L tanker fleet","Licensed government-approved disposal","Service records for compliance"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="grease-trap-septic-tank"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
