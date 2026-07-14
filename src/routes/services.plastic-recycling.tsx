import { createFileRoute } from "@tanstack/react-router";
import { Recycle, Factory, Building2, ShoppingBag, Package, Trash2, Container, Sprout } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-recovery.jpg";
import imgRel0 from "@/assets/svc-scrap.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-industrial.jpg";

const PAGE_TITLE = "Plastic Recycling for Business in Guyana | CEVONS";
const PAGE_DESC = "CEVONS plastic recycling programs help businesses raise their recycling rate with a partner network offering verified, transparent end destinations for material.";
const PAGE_URL = "/services/plastic-recycling";

export const Route = createFileRoute("/services/plastic-recycling")({
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
  { icon: Factory, title: "Manufacturers" },
  { icon: Building2, title: "Offices & Institutions" },
  { icon: ShoppingBag, title: "Retail & Supermarkets" },
  { icon: Package, title: "Packaging Waste" },
  { icon: Trash2, title: "Back-of-House Streams" },
  { icon: Sprout, title: "Sustainability Programs" },
];

const faqs = [
  { q: "What kinds of plastic do you handle?", a: "We work across varied plastic waste streams. Share what your business produces and we'll confirm the right pathway during setup." },
  { q: "How does the recycling program work?", a: "We help you separate plastics at source, arrange collection, and route material through our partner network — with verified end destinations." },
  { q: "Can you help lift our recycling rate?", a: "Yes — that's the goal. We design programs that raise the share of plastic diverted from landfill for businesses of any size." },
  { q: "Do you provide transparency on where material goes?", a: "Yes. Our partner network provides verified, transparent end destinations so you know how your material is being handled." },
  { q: "How do I start?", a: "WhatsApp us or use Request a Quote with your industry, plastic types, and estimated volume." },
];

const related = [
  { title: "Scrap Metal Recycling", body: "Licensed scrap metal collection and export.", img: imgRel0, to: "/services/scrap-metal-recycling", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Container },
  { title: "Material Recovery Facility", body: "Industrial-scale sorting and recovery.", img: imgRel2, to: "/services/material-recovery-facility", icon: Factory },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Recycling"
      breadcrumb="Plastic Recycling"
      h1="Plastic Recycling"
      subhead="Business plastics programs designed to raise your recycling rate — backed by a partner network with verified, transparent end destinations."
      heroImage={imgHero}
      heroAlt="Sorted plastic material bales at a CEVONS recycling operation"
      benefits={[
        "Programs that raise your recycling rate",
        "Verified, transparent end destinations",
        "Partner network for downstream processing",
        "Covers varied plastic waste streams",
        "Tailored to your business",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
    />
  );
}
