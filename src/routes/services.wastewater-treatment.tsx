import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, Cylinder, Droplet, Factory, Recycle, Waves } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgWastewater from "@/assets/svc-wastewater.jpg";
import imgSeptic from "@/assets/svc-septic.jpg";
import imgOil from "@/assets/svc-oil.jpg";
import imgScrap from "@/assets/svc-scrap.jpg";

const TITLE = "Wastewater Treatment in Guyana | CEVON'S Environmental Services";
const DESC = "Wastewater treatment and disposal support from CEVON'S for industrial, commercial, and specialized waste needs across Guyana.";

export const Route = createFileRoute("/services/wastewater-treatment")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/wastewater-treatment" },
    ],
    links: [{ rel: "canonical", href: "/services/wastewater-treatment" }],
  }),
  component: WastewaterPage,
});

function WastewaterPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Waves}
      eyebrowLabel="Wastewater Treatment"
      breadcrumb="Wastewater Treatment"
      h1="Wastewater Treatment"
      subhead="Wastewater treatment and disposal support for industrial, commercial, and specialized waste needs across Guyana."
      heroImage={imgWastewater}
      heroAlt="Industrial wastewater treatment tanks"
      benefits={[
        "Industrial wastewater support",
        "Specialist review",
        "Compliance-conscious process",
        "Documentation support where required",
        "Safe handling procedures",
      ]}
      commonUses={[
        { icon: Factory, title: "Industrial Facilities" },
        { icon: Factory, title: "Manufacturing" },
        { icon: Building2, title: "Commercial Sites" },
        { icon: Container, title: "Specialized Waste Streams" },
      ]}
      faqs={[
        { q: "What kinds of wastewater do you handle?", a: "We support industrial, commercial, and specialized wastewater streams. Share the type and we'll review the right approach." },
        { q: "Can you support compliance requirements?", a: "Our process is compliance-conscious and documentation support is available where required by regulation." },
        { q: "Do you handle one-off and ongoing needs?", a: "Yes — both one-off projects and recurring service arrangements are supported." },
        { q: "Where do you operate?", a: "We serve Georgetown, Linden, Berbice and surrounding areas across Guyana." },
        { q: "How do I start?", a: "WhatsApp us or use Request a Quote with a short description of the waste stream and volume." },
      ]}
      related={[
        { title: "Septic Tank Clearance", body: "Safe and efficient septic tank clearance.", img: imgSeptic, to: "/services/septic-tank-clearance", icon: Droplet },
        { title: "Waste Oil Recycling", body: "Responsible waste oil collection and recycling.", img: imgOil, to: "/services/waste-oil-recycling", icon: Cylinder },
        { title: "Scrap Metal Collection", body: "Collection and recycling of all scrap metal.", img: imgScrap, to: "/services/scrap-metal-collection", icon: Recycle },
      ]}
    />
  );
}
