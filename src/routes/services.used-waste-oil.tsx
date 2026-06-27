import { createFileRoute } from "@tanstack/react-router";
import { Flame, Wrench, Factory, Truck, Anchor, Building2, Beaker, ShieldAlert, Droplet, PackageX } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-oil.jpg";
import imgRel0 from "@/assets/svc-tank.jpg";
import imgRel1 from "@/assets/svc-hazardous.jpg";
import imgRel2 from "@/assets/svc-septic.jpg";
import imgRel3 from "@/assets/svc-destruction.jpg";

const PAGE_TITLE = "Used Waste Oil Collection in Guyana | CEVONS";
const PAGE_DESC = "Compliant collection and responsible recycling of used waste oil for industrial, marine, and commercial operations across Guyana.";
const PAGE_URL = "/services/used-waste-oil";

export const Route = createFileRoute("/services/used-waste-oil")({
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
  { icon: Wrench, title: "Workshops & Garages" },
  { icon: Factory, title: "Manufacturing Plants" },
  { icon: Truck, title: "Fleet Operations" },
  { icon: Anchor, title: "Marine & Ports" },
  { icon: Building2, title: "Power Generation" },
  { icon: Flame, title: "Heavy Equipment" },
];

const faqs = [
  { q: "What oils are accepted?", a: "Used motor oil, hydraulic oil, lubricants, transmission fluid, and similar petroleum-based oils — confirmed during assessment." },
  { q: "Do you provide collection containers?", a: "Yes. Approved drums and totes can be supplied based on volume and frequency." },
  { q: "Can you set up recurring collection?", a: "Yes. Scheduled pickups can be arranged based on your generation rate and storage capacity." },
  { q: "Is the oil truly recycled?", a: "Collected oil is routed to authorized recycling pathways. Documentation can be provided on request." },
  { q: "How do I start service?", a: "Submit a specialist review request with your site, oil type, and estimated monthly volume." },
];

const related = [
  { title: "Tank Cleaning", body: "Industrial tank cleaning with safety controls.", img: imgRel0, to: "/services/tank-cleaning", icon: Beaker },
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel1, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Septic Tank Emptying", body: "Safe septic tank pumping and maintenance.", img: imgRel2, to: "/services/septic-services", icon: Droplet },
  { title: "Product Destruction & Recycling Services", body: "Secure disposal and material recovery for unusable or excess products.", img: imgRel3, to: "/services/product-destruction", icon: PackageX },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Flame}
      eyebrowLabel="Industrial"
      breadcrumb="Used Waste Oil"
      h1="Used Waste Oil Collection & Recycling"
      subhead="Compliant collection, transport, and responsible recycling of used motor, hydraulic, and industrial oils."
      heroImage={imgHero}
      heroAlt="CEVONS waste oil collection truck servicing an industrial workshop"
      benefits={["Closed-system pumping","Trained, equipped operators","Compliant transport","Routed to authorized recyclers","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
