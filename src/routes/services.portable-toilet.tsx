import { createFileRoute } from "@tanstack/react-router";
import { Waves, Calendar, Hammer, Home, Building, Users, Truck, Trash2, Container, Droplet } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-toilet.jpg";
import imgRel0 from "@/assets/svc-garbage.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-septic.jpg";

const PAGE_TITLE = "Portable Toilet Rental in Guyana | CEVON'S";
const PAGE_DESC = "Clean, hygienic portable toilet rentals for events, residential projects, and commercial sites across Guyana.";
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
  { icon: Building, title: "Commercial Projects" },
  { icon: Users, title: "Public Gatherings" },
  { icon: Truck, title: "Outdoor Worksites" },
];

const faqs = [
  { q: "How many portable toilets do I need?", a: "A common guideline is one unit per 50 guests for a 4-hour event. Worksites typically use one unit per 10 workers. We'll recommend the right number for your situation." },
  { q: "Do you service the units during long rentals?", a: "Yes. Regular servicing is available for long-term and high-traffic rentals — we'll set a schedule that fits your needs." },
  { q: "Are accessible units available?", a: "Yes. ADA-accessible portable toilets are available — let us know if you need them when requesting service." },
  { q: "How far in advance should I book?", a: "For events, 2–3 weeks is recommended. For job sites, we can often schedule delivery within a few business days." },
  { q: "What areas do you deliver to?", a: "CEVON'S delivers across Georgetown, Linden, Berbice, and broader Guyana." },
];

const related = [
  { title: "General Trash Collection", body: "Reliable household pickup on a schedule.", img: imgRel0, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Dumpster Rental", body: "Multiple sizes for projects and cleanups.", img: imgRel1, to: "/services/dumpster-rental", icon: Container },
  { title: "Septic Services", body: "Safe, efficient septic tank pumping.", img: imgRel2, to: "/services/septic-services", icon: Droplet },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Waves}
      eyebrowLabel="Sanitation"
      breadcrumb="Portable Toilet"
      h1="Portable Toilet Rental"
      subhead="Hygienic portable toilet rentals for events, residential projects, construction sites, and commercial properties."
      heroImage={imgHero}
      heroAlt="Row of CEVON'S portable toilets at an outdoor event in Guyana"
      benefits={["Clean, well-maintained units","Standard and ADA-accessible options","Short and long-term rentals","On-time delivery and pickup","Regular servicing available"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
