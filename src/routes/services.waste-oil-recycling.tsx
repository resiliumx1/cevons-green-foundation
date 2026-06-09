import { createFileRoute } from "@tanstack/react-router";
import { Cylinder, Droplet, Factory, Recycle, Truck, Utensils, Waves, Wrench } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgOil from "@/assets/svc-oil.jpg";
import imgScrap from "@/assets/svc-scrap.jpg";
import imgWastewater from "@/assets/svc-wastewater.jpg";
import imgRecovery from "@/assets/svc-recovery.jpg";

const TITLE = "Waste Oil Recycling in Guyana | CEVON'S Environmental Services";
const DESC = "Responsible waste oil collection and recycling from CEVON'S for businesses, facilities, and industrial customers across Guyana.";

export const Route = createFileRoute("/services/waste-oil-recycling")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/waste-oil-recycling" },
    ],
    links: [{ rel: "canonical", href: "/services/waste-oil-recycling" }],
  }),
  component: WasteOilPage,
});

function WasteOilPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Cylinder}
      eyebrowLabel="Waste Oil Recycling"
      breadcrumb="Waste Oil Recycling"
      h1="Waste Oil Recycling"
      subhead="Responsible waste oil collection and recycling for businesses, facilities, and industrial customers across Guyana."
      heroImage={imgOil}
      heroAlt="Stacked waste oil barrels at a CEVON'S recycling facility"
      benefits={[
        "Waste oil collection",
        "Responsible recycling",
        "Commercial and industrial support",
        "Documentation where required",
        "Environmentally focused handling",
      ]}
      commonUses={[
        { icon: Utensils, title: "Restaurants" },
        { icon: Wrench, title: "Workshops" },
        { icon: Factory, title: "Industrial Facilities" },
        { icon: Utensils, title: "Food Service" },
        { icon: Truck, title: "Logistics" },
      ]}
      faqs={[
        { q: "What types of waste oil do you collect?", a: "We collect used lubricating oils, hydraulic fluids, and similar industrial oils. For cooking oil please ask about our cooking oil recycling service." },
        { q: "Do you provide collection containers?", a: "We can discuss storage and containment options when you contact us. Site setup varies based on volume and frequency." },
        { q: "Do you offer collection documentation?", a: "Yes — documentation is available where required by your operation or regulator." },
        { q: "How frequently can you collect?", a: "Collection schedules are flexible — one-off or recurring — based on your generation volume." },
        { q: "How do I arrange collection?", a: "WhatsApp us or use Request a Quote with your location and approximate volume." },
      ]}
      related={[
        { title: "Scrap Metal Collection", body: "Collection and recycling of all scrap metal.", img: imgScrap, to: "/services/scrap-metal-collection", icon: Recycle },
        { title: "Wastewater Treatment", body: "Industrial wastewater treatment and disposal.", img: imgWastewater, to: "/services/wastewater-treatment", icon: Waves },
        { title: "Septic Tank Clearance", body: "Professional septic clearance service.", img: imgRecovery, to: "/services/septic-tank-clearance", icon: Droplet },
      ]}
    />
  );
}
