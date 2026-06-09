import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Home, Building, AlertTriangle, Wrench, ClipboardCheck, Trash2, Waves } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-septic.jpg";
import imgRel0 from "@/assets/svc-garbage.jpg";
import imgRel1 from "@/assets/svc-toilet.jpg";
import imgRel2 from "@/assets/svc-grease.jpg";

const PAGE_TITLE = "Septic Services in Guyana | CEVON'S";
const PAGE_DESC = "Septic tank pumping, clearance, and maintenance for homes across Guyana — safe handling and responsible disposal every visit.";
const PAGE_URL = "/services/septic-services";

export const Route = createFileRoute("/services/septic-services")({
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
  { icon: Home, title: "Single-Family Homes" },
  { icon: Building, title: "Small Apartments" },
  { icon: Droplet, title: "Routine Pumping" },
  { icon: AlertTriangle, title: "Overflow Response" },
  { icon: Wrench, title: "Maintenance Service" },
  { icon: ClipboardCheck, title: "Pre-Sale Inspections" },
];

const faqs = [
  { q: "How often should I pump my septic tank?", a: "Most homes benefit from septic pumping every 2–3 years depending on household size and tank capacity. Heavy use may require more frequent service." },
  { q: "What are the signs my tank needs service?", a: "Slow drains, odors near the tank, lush patches over the drain field, or backups inside the home are common signs that pumping is needed." },
  { q: "How long does septic pumping take?", a: "Most residential pumping is completed within 1–2 hours, depending on tank size and access." },
  { q: "Is the waste disposed of safely?", a: "Yes. All collected waste is transported and disposed of through approved channels." },
  { q: "Do you service emergency overflows?", a: "Yes. Contact us as soon as possible — we'll prioritize urgent septic situations to minimize damage." },
];

const related = [
  { title: "General Trash Collection", body: "Reliable household pickup on a schedule.", img: imgRel0, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Portable Toilet", body: "Clean portable toilet rentals for events and projects.", img: imgRel1, to: "/services/portable-toilet", icon: Waves },
  { title: "Grease Trap / Septic Tank", body: "Commercial grease trap and septic servicing.", img: imgRel2, to: "/services/grease-trap-septic-tank", icon: Droplet },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Residential"
      breadcrumb="Septic Services"
      h1="Septic Services for Homes"
      subhead="Professional septic tank pumping, clearance, and maintenance with safe handling and proper disposal."
      heroImage={imgHero}
      heroAlt="CEVON'S septic service truck performing residential tank pumping"
      benefits={["Trained, experienced crews","Modern vacuum equipment","Safe waste handling","Discreet, clean service","Coverage across Guyana"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
