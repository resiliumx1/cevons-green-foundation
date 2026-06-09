import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Utensils, Building, Building2, School, Hospital, Factory, Waves } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-septic.jpg";
import imgRel0 from "@/assets/commercial.jpg";
import imgRel1 from "@/assets/septic.jpg";
import imgRel2 from "@/assets/wastewater.jpg";

const PAGE_TITLE = "Grease Trap & Septic Tank Services in Guyana | CEVON'S";
const PAGE_DESC = "Grease trap cleaning and septic tank servicing for restaurants, hotels, and commercial facilities across Guyana.";
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
  { q: "How often should grease traps be cleaned?", a: "Most commercial kitchens need service every 1–3 months, depending on volume. Heavy-use kitchens may require more frequent cleaning." },
  { q: "Can you service after hours?", a: "Yes. After-hours service is available so we don't disrupt your operations." },
  { q: "Do you provide service records?", a: "Yes. Service documentation can be provided on request for compliance and recordkeeping." },
  { q: "What's included in commercial septic service?", a: "Inspection, pumping, and proper transport and disposal of collected waste." },
  { q: "How do I set up a recurring service plan?", a: "Contact us — we'll review your facility's needs and propose a schedule that fits your operation." },
];

const related = [
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel0, to: "/services/general-waste-management", icon: Building2 },
  { title: "Septic Services", body: "Residential septic pumping and clearance.", img: imgRel1, to: "/services/septic-services", icon: Droplet },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel2, to: "/services/wastewater", icon: Waves },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Commercial"
      breadcrumb="Grease Trap / Septic Tank"
      h1="Grease Trap & Septic Tank Services"
      subhead="Professional grease trap cleaning and septic tank servicing for restaurants, hotels, food service, and commercial facilities."
      heroImage={imgHero}
      heroAlt="CEVON'S service vehicle performing grease trap cleaning at a commercial kitchen"
      benefits={["Scheduled or on-demand service","Trained, professional crews","Discreet after-hours options","Safe handling and disposal","Service documentation on request"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
