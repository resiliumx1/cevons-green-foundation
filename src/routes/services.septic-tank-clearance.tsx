import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, Cylinder, Droplet, Home, Trash2, Utensils, Waves } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgSeptic from "@/assets/svc-septic.jpg";
import imgWastewater from "@/assets/svc-wastewater.jpg";
import imgToilet from "@/assets/svc-toilet.jpg";
import imgOil from "@/assets/svc-oil.jpg";

const TITLE = "Septic Tank Clearance in Guyana | CEVON'S Environmental Services";
const DESC = "Safe, efficient septic tank clearance from CEVON'S for residential, commercial, and industrial customers across Guyana.";

export const Route = createFileRoute("/services/septic-tank-clearance")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/septic-tank-clearance" },
    ],
    links: [{ rel: "canonical", href: "/services/septic-tank-clearance" }],
  }),
  component: SepticPage,
});

function SepticPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Septic Tank Clearance"
      breadcrumb="Septic Tank Clearance"
      h1="Septic Tank Clearance"
      subhead="Safe and efficient septic tank clearance services for residential, commercial, and industrial customers."
      heroImage={imgSeptic}
      heroAlt="CEVON'S vacuum truck performing septic tank clearance"
      benefits={[
        "Professional septic pumping",
        "Safe handling",
        "Emergency support where available",
        "Residential and commercial service",
        "Proper disposal procedures",
      ]}
      commonUses={[
        { icon: Home, title: "Homes" },
        { icon: Utensils, title: "Restaurants" },
        { icon: Building2, title: "Commercial Buildings" },
        { icon: Building2, title: "Institutions" },
        { icon: Container, title: "Facilities" },
      ]}
      faqs={[
        { q: "How often should I clear my septic tank?", a: "Frequency depends on tank size and usage. Many homes need clearance every few years; commercial facilities often need it more often. We can advise based on your situation." },
        { q: "Do you handle emergency call-outs?", a: "We offer emergency support where available. Contact us as soon as possible if you have a backup or overflow." },
        { q: "Where is the waste disposed of?", a: "Waste is transported and disposed of through proper procedures consistent with environmental responsibility." },
        { q: "Do you serve commercial and industrial sites?", a: "Yes. We handle residential, commercial, and industrial septic clearance across Guyana." },
        { q: "How do I request service?", a: "WhatsApp us or use Request a Quote with your location and a short description of the issue." },
      ]}
      related={[
        { title: "Wastewater Treatment", body: "Treatment and disposal of industrial wastewater.", img: imgWastewater, to: "/services/wastewater-treatment", icon: Waves },
        { title: "Portable Toilet Rental", body: "Clean portable toilet rentals for any site.", img: imgToilet, to: "/services/portable-toilet-rental", icon: Droplet },
        { title: "Waste Oil Recycling", body: "Responsible collection and recycling of waste oil.", img: imgOil, to: "/services/waste-oil-recycling", icon: Cylinder },
      ]}
    />
  );
}
