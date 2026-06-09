import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, Cylinder, Factory, Hammer, Recycle, Trash2, Warehouse } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgScrap from "@/assets/svc-scrap.jpg";
import imgOil from "@/assets/svc-oil.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgSkip from "@/assets/svc-skip.jpg";

const TITLE = "Scrap Metal Collection in Guyana | CEVON'S Environmental Services";
const DESC = "Scrap metal collection and recycling from CEVON'S for businesses, construction sites, and industrial facilities across Guyana.";

export const Route = createFileRoute("/services/scrap-metal-collection")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/scrap-metal-collection" },
    ],
    links: [{ rel: "canonical", href: "/services/scrap-metal-collection" }],
  }),
  component: ScrapPage,
});

function ScrapPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Scrap Metal Collection"
      breadcrumb="Scrap Metal Collection"
      h1="Scrap Metal Collection"
      subhead="Scrap metal collection and recycling solutions for businesses, construction sites, and industrial facilities across Guyana."
      heroImage={imgScrap}
      heroAlt="Sorted scrap metal at a CEVON'S recycling yard"
      benefits={[
        "Collection and recycling",
        "Commercial and industrial support",
        "Helps recover value from materials",
        "Suitable for large quantities",
        "Pickup coordination",
      ]}
      commonUses={[
        { icon: Hammer, title: "Construction Sites" },
        { icon: Factory, title: "Factories" },
        { icon: Warehouse, title: "Warehouses" },
        { icon: Building2, title: "Commercial Cleanouts" },
        { icon: Container, title: "Industrial Yards" },
      ]}
      faqs={[
        { q: "What types of scrap metal do you accept?", a: "We accept a range of ferrous and non-ferrous scrap. Share details of what you have and we'll confirm." },
        { q: "Do you offer pickup for large quantities?", a: "Yes — pickup is coordinated for commercial and industrial volumes. We can plan recurring pickups for ongoing generators." },
        { q: "Do you buy scrap metal?", a: "We buy and recycle scrap metal. Contact us to discuss valuation for your materials." },
        { q: "Where do you operate?", a: "We serve Georgetown, Linden, Berbice and surrounding areas across Guyana." },
        { q: "How do I arrange a pickup?", a: "WhatsApp us or use Request a Quote with the type, approximate quantity, and your location." },
      ]}
      related={[
        { title: "Waste Oil Recycling", body: "Responsible waste oil collection and recycling.", img: imgOil, to: "/services/waste-oil-recycling", icon: Cylinder },
        { title: "Dumpster Rental", body: "Flexible dumpster rental for cleanouts and projects.", img: imgDumpster, to: "/services/dumpster-rental", icon: Trash2 },
        { title: "Skip Bin Rental", body: "Skip bins for commercial and construction sites.", img: imgSkip, to: "/services/skip-bin-rental", icon: Container },
      ]}
    />
  );
}
