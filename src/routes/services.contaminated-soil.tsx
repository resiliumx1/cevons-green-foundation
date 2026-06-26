import { createFileRoute } from "@tanstack/react-router";
import { Sprout, Factory, Flame, Wrench, Truck, Building2, ShieldAlert, Waves, Mountain } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-soil.jpg";
import imgRel0 from "@/assets/svc-hazardous.jpg";
import imgRel1 from "@/assets/svc-wastewater.jpg";
import imgRel2 from "@/assets/svc-landfill.jpg";

const PAGE_TITLE = "Contaminated Soil Services in Guyana | CEVONS";
const PAGE_DESC = "Excavation, transport, and treatment coordination for contaminated soil and solid waste across Guyana.";
const PAGE_URL = "/services/contaminated-soil";

export const Route = createFileRoute("/services/contaminated-soil")({
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
  { icon: Factory, title: "Industrial Sites" },
  { icon: Flame, title: "Fuel Spill Sites" },
  { icon: Wrench, title: "Maintenance Yards" },
  { icon: Truck, title: "Logistics Facilities" },
  { icon: Building2, title: "Construction Remediation" },
  { icon: Sprout, title: "Brownfield Cleanup" },
];

const faqs = [
  { q: "What kind of contamination do you handle?", a: "Hydrocarbon-impacted soil, chemically contaminated solids, and similar regulated material — confirmed during specialist review." },
  { q: "Do you provide site assessment?", a: "We support assessment and coordinate with qualified parties for sampling, characterization, and disposal pathways." },
  { q: "How is the material transported?", a: "In covered, compliant equipment with appropriate documentation for the waste type." },
  { q: "What documentation is provided?", a: "Manifests and disposal documentation appropriate to the waste classification." },
  { q: "How do I start?", a: "Submit a specialist review request with the site, suspected contaminants, and estimated volume." },
];

const related = [
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel0, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel1, to: "/services/wastewater", icon: Waves },
  { title: "Landfill Operations", body: "Managed landfill with environmental safeguards.", img: imgRel2, to: "/services/landfill-operations", icon: Mountain },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Sprout}
      eyebrowLabel="Industrial"
      breadcrumb="Contaminated Soil"
      h1="Contaminated Soil Management"
      subhead="Excavation, secure transport, and treatment coordination for impacted soils and contaminated solid waste."
      heroImage={imgHero}
      heroAlt="CEVONS crew loading contaminated soil into a covered transport at an industrial site"
      benefits={["Site assessment support","Proper containment & loading","Covered, compliant transport","Treatment & disposal coordination","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
