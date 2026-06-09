import { createFileRoute } from "@tanstack/react-router";
import { Building2, ShoppingBag, Utensils, School, Hospital, Warehouse, Container, FileText, Droplet } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-commercial.jpg";
import imgRel0 from "@/assets/skip.jpg";
import imgRel1 from "@/assets/shred.jpg";
import imgRel2 from "@/assets/septic.jpg";

const PAGE_TITLE = "Commercial Waste Management in Guyana | CEVON'S";
const PAGE_DESC = "Scheduled waste management for businesses, offices, retail, and commercial properties across Guyana.";
const PAGE_URL = "/services/general-waste-management";

export const Route = createFileRoute("/services/general-waste-management")({
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
  { icon: Building2, title: "Offices" },
  { icon: ShoppingBag, title: "Retail Stores" },
  { icon: Utensils, title: "Restaurants & Hotels" },
  { icon: School, title: "Schools & Institutions" },
  { icon: Hospital, title: "Clinics & Healthcare" },
  { icon: Warehouse, title: "Warehousing" },
];

const faqs = [
  { q: "How often will waste be collected?", a: "Schedules are tailored to your business — daily, weekly, or several times per week. We'll match collection frequency to your waste volume." },
  { q: "What container sizes do you offer?", a: "From small wheeled bins to large skip and roll-off containers. We'll recommend the right setup based on your space and waste generation." },
  { q: "Can you handle multiple locations?", a: "Yes. Multi-location businesses can be served with a single coordinated program and consolidated scheduling." },
  { q: "Do you offer recycling options?", a: "Yes. Source-separated recycling and waste diversion can be added to your program — ask our team for options." },
  { q: "How do I get started?", a: "Send us a WhatsApp message or quote request. We'll review your needs and propose a program that fits." },
];

const related = [
  { title: "Skip Bin & Dumpster Rental", body: "Multiple sizes for site, build, and operational needs.", img: imgRel0, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "Document Shredding", body: "Secure document destruction with chain-of-custody.", img: imgRel1, to: "/services/document-shredding", icon: FileText },
  { title: "Grease Trap / Septic Tank", body: "Grease trap and septic servicing for facilities.", img: imgRel2, to: "/services/grease-trap-septic-tank", icon: Droplet },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Building2}
      eyebrowLabel="Commercial"
      breadcrumb="General Waste Management"
      h1="Commercial Waste Management"
      subhead="Scheduled collection programs and waste solutions for offices, retail, hospitality, and multi-tenant properties."
      heroImage={imgHero}
      heroAlt="CEVON'S commercial waste collection at a Guyana business property"
      benefits={["Custom collection schedules","Right-sized containers","Reliable, professional crews","Reporting on request","Coverage across Guyana"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
