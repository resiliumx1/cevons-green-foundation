import { createFileRoute } from "@tanstack/react-router";
import { Sprout, Factory, Flame, Wrench, Truck, Building2, ShieldAlert, Waves, Mountain } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-soil.jpg";
import imgRel0 from "@/assets/svc-hazardous.jpg";
import imgRel1 from "@/assets/svc-wastewater.jpg";
import imgRel2 from "@/assets/svc-landfill.jpg";

const PAGE_TITLE = "Contaminated Soil Services in Guyana | CEVONS";
const PAGE_DESC = "Profiling, secure transport, and compliant disposal of petroleum-impacted and chemically contaminated soils.";
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
  { q: "How is contaminated soil profiled?", a: "Profiling identifies what's in the soil so we can route it through the right disposal pathway — samples, characterisation, and coordination with qualified parties. Nothing moves off site until the profile matches the destination." },
  { q: "How is the material transported?", a: "In covered, compliant equipment matched to the classification — the same tracked chain we use for other regulated streams. Contaminated soil never travels the way clean fill does." },
  { q: "What documentation do I get?", a: "Manifests and disposal records appropriate to the waste classification, so the environmental file on your project matches the physical work." },
  { q: "What kinds of projects use this service?", a: "Fuel and chemical spill responses, tank pulls, industrial and maintenance yard remediation, brownfield cleanups, and construction excavations that hit historically impacted ground." },
  { q: "How do I start?", a: "Submit a specialist review request with the site, suspected contaminants, and estimated volume — we'll come back with a profiling and disposal plan." },
];

const related = [
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel0, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel1, to: "/services/wastewater", icon: Waves },
  { title: "Landfill Operations", body: "Managed landfill with environmental safeguards.", img: imgRel2, to: "/services/landfill-operations", icon: Mountain },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "When soil becomes regulated waste",
    heading: "Spills, tank pulls, and remediation — the moment ordinary ground turns into a controlled stream",
    paragraphs: [
      "Soil is a construction material right up until something changes its status. A fuel spill, a leaking storage tank, an unlined maintenance yard, or a historically impacted site — any of those turn the ground underneath into a waste stream that has to be handled, transported, and disposed of under the same discipline as other regulated material.",
      "CEVONS handles contaminated solids as part of its industrial waste programme — profiled at the source, contained during loading, and moved on the same documented chain as our other regulated streams. That way the environmental exposure is measured, not assumed.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Profiled, transported, documented",
    heading: "One controlled chain from excavation to compliant disposal",
    paragraphs: [
      "Profile the soil, load it into the right containment, transport it in compliant equipment, dispose of it through an approved pathway, and file the paperwork that proves each step. That is the whole engagement — and it's the reason regulated soil belongs with a specialist rather than a general hauler.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Sprout}
      eyebrowLabel="Industrial"
      breadcrumb="Contaminated Soil"
      h1="Contaminated Soil Management"
      subhead="Profiling, secure transport, and compliant disposal for petroleum-impacted and chemically contaminated soils across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS crew loading contaminated soil into a covered transport at an industrial site"
      benefits={["Waste profiling & characterisation","Covered, compliant transport","Documented disposal chain","Coordinated with remediation teams","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="contaminated-soil"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
