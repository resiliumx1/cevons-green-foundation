import { createFileRoute } from "@tanstack/react-router";
import { Truck, Landmark, Building2, PartyPopper, Construction, Wind, Trash2, Container } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-commercial.jpg";
import imgRel0 from "@/assets/svc-industrial.jpg";
import imgRel1 from "@/assets/svc-garbage.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "Road Sweeping Services in Guyana | CEVONS";
const PAGE_DESC = "CEVONS road sweeper hire keeps streets, sites, and event grounds clean across Guyana — protecting air quality, water quality, and community health.";
const PAGE_URL = "/services/road-sweeping";

export const Route = createFileRoute("/services/road-sweeping")({
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
  { icon: Landmark, title: "Municipal Streets" },
  { icon: Building2, title: "Commercial Properties" },
  { icon: PartyPopper, title: "Event Sites" },
  { icon: Construction, title: "Construction Zones" },
  { icon: Truck, title: "Logistics Yards" },
  { icon: Wind, title: "Post-Storm Cleanup" },
];

const faqs = [
  { q: "Who uses road sweeping services?", a: "Municipalities, businesses, property managers, and event organisers hire our sweepers to keep roads, lots, and grounds clean." },
  { q: "Why does street sweeping matter?", a: "Clean streets are essential to air quality, water quality, and community health — sweeping removes dust, debris, and pollutants before they reach drains and waterways." },
  { q: "What can your sweepers handle?", a: "Our fleet handles urban streets, commercial lots, industrial yards, construction dust, and post-event cleanup." },
  { q: "Is this a one-off or recurring service?", a: "Both. We offer one-off jobs for events and cleanups and recurring schedules for facilities and municipal contracts." },
  { q: "How do I book?", a: "WhatsApp us or use Request a Quote with the location, area size, and preferred timing." },
];

const related = [
  { title: "General Waste Management", body: "Scheduled commercial waste programs.", img: imgRel0, to: "/services/general-waste-management", icon: Trash2 },
  { title: "General Trash Collection", body: "Reliable household waste pickup.", img: imgRel1, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for cleanups.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Truck}
      eyebrowLabel="Facilities"
      breadcrumb="Road Sweeping"
      h1="Road Sweeping"
      subhead="Mechanical road sweeper hire for streets, sites, and events — because clean streets are essential to air quality, water quality, and community health."
      heroImage={imgHero}
      heroAlt="CEVONS road sweeper cleaning a commercial street in Guyana"
      benefits={[
        "Fleet of road sweepers for hire",
        "Municipal, commercial, and event coverage",
        "Removes dust, debris, and pollutants",
        "Protects drains and waterways",
        "One-off or scheduled contracts",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
    />
  );
}
