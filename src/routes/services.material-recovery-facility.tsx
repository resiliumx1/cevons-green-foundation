import { createFileRoute } from "@tanstack/react-router";
import { Recycle, Trash2, Factory, Building2, Truck, Leaf, Mountain, Container } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-recovery.jpg";
import imgRel0 from "@/assets/industrial.jpg";
import imgRel1 from "@/assets/commercial.jpg";
import imgRel2 from "@/assets/skip.jpg";

const PAGE_TITLE = "Material Recovery Facility (MRF) | CEVON'S Guyana";
const PAGE_DESC = "CEVON'S material recovery facility sorts, separates, and recovers materials from the waste stream — turning waste into resources.";
const PAGE_URL = "/services/material-recovery-facility";

export const Route = createFileRoute("/services/material-recovery-facility")({
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
  { icon: Recycle, title: "Recyclables Recovery" },
  { icon: Trash2, title: "Mixed Waste Sorting" },
  { icon: Factory, title: "Industrial Diversion" },
  { icon: Building2, title: "Commercial Programs" },
  { icon: Truck, title: "Tipping & Intake" },
  { icon: Leaf, title: "Sustainability Goals" },
];

const faqs = [
  { q: "What does an MRF do?", a: "A Material Recovery Facility receives waste, sorts and separates materials, and recovers recyclables and reusable streams before residual goes to disposal." },
  { q: "Can my business tip at the facility?", a: "Commercial intake can be arranged following a specialist review of your material type and volume." },
  { q: "Do you provide diversion reporting?", a: "Yes. Reporting on diverted tonnage and material types is available for businesses with sustainability goals." },
  { q: "What materials are recovered?", a: "Common recoverable streams include cardboard, plastics, metals, and other clean recyclables — confirmed during intake review." },
  { q: "How do I start?", a: "Submit a specialist review request — share your material type, volume, and frequency." },
];

const related = [
  { title: "Landfill Operations", body: "Managed landfill with environmental safeguards.", img: imgRel0, to: "/services/landfill-operations", icon: Mountain },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Building2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Facilities"
      breadcrumb="Material Recovery Facility"
      h1="Material Recovery Facility"
      subhead="Sorting, separation, and recovery infrastructure that diverts materials from landfill and returns value to the supply chain."
      heroImage={imgHero}
      heroAlt="Sorting lines and recovered materials inside the CEVON'S material recovery facility"
      benefits={["Industrial-scale sorting","Material recovery and baling","Waste diversion reporting","Tipping and intake support","Specialist intake coordination"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
