import { createFileRoute } from "@tanstack/react-router";
import { Mountain, Truck, Factory, Trash2, Hammer, Building2, Leaf, Recycle, Container, Sprout } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-landfill.jpg";
import imgRel0 from "@/assets/svc-recovery.jpg";
import imgRel1 from "@/assets/svc-skip.jpg";
import imgRel2 from "@/assets/svc-soil.jpg";

const PAGE_TITLE = "Landfill Operations | CEVONS Guyana";
const PAGE_DESC = "Managed landfill operations with environmental safeguards and structured intake for commercial and industrial clients.";
const PAGE_URL = "/services/landfill-operations";

export const Route = createFileRoute("/services/landfill-operations")({
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
  { icon: Truck, title: "Commercial Tipping" },
  { icon: Factory, title: "Industrial Disposal" },
  { icon: Trash2, title: "Bulk Waste" },
  { icon: Hammer, title: "Construction & Demolition" },
  { icon: Building2, title: "Municipal Programs" },
  { icon: Leaf, title: "Closure & Cover" },
];

const faqs = [
  { q: "Who can use the landfill?", a: "Commercial and industrial clients with approved waste types. All intake is coordinated through specialist review." },
  { q: "What waste is accepted?", a: "Accepted streams are confirmed during intake review. Hazardous, biohazardous, and other regulated waste are handled through dedicated channels — not general landfill." },
  { q: "Do you weigh incoming loads?", a: "Yes. Loads are weighed and recorded as part of standard intake procedure." },
  { q: "Are environmental safeguards in place?", a: "Yes. The site is operated with environmental controls appropriate to managed landfill operations." },
  { q: "How do I arrange intake?", a: "Submit a specialist review request — share your waste type, estimated volume, and frequency." },
];

const related = [
  { title: "Material Recovery Facility", body: "Sorting and recovery infrastructure for diverted material.", img: imgRel0, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel1, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "Contaminated Soil", body: "Excavation, transport, and treatment of contaminated solids.", img: imgRel2, to: "/services/contaminated-soil", icon: Sprout },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Mountain}
      eyebrowLabel="Facilities"
      breadcrumb="Landfill Operations"
      h1="Landfill Operations"
      subhead="Managed landfill operations with environmental safeguards, controlled intake, and structured handling for commercial and industrial clients."
      heroImage={imgHero}
      heroAlt="Aerial view of CEVONS managed landfill operation with active working face"
      benefits={["Controlled intake and weighing","Trained site operators","Environmental safeguards","Compatibility screening","Specialist intake coordination"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
