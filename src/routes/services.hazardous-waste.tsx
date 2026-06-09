import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Factory, Beaker, Wrench, Hospital, Flame, Building2, Waves, Sprout, Biohazard } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-industrial.jpg";
import imgRel0 from "@/assets/wastewater.jpg";
import imgRel1 from "@/assets/industrial.jpg";
import imgRel2 from "@/assets/industrial.jpg";

const PAGE_TITLE = "Hazardous Waste Disposal in Guyana | CEVON'S";
const PAGE_DESC = "Regulated handling, transport, and disposal of hazardous waste streams for industrial clients across Guyana.";
const PAGE_URL = "/services/hazardous-waste";

export const Route = createFileRoute("/services/hazardous-waste")({
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
  { icon: Factory, title: "Manufacturing" },
  { icon: Beaker, title: "Chemical Industry" },
  { icon: Wrench, title: "Workshops & MRO" },
  { icon: Hospital, title: "Healthcare Waste" },
  { icon: Flame, title: "Energy Sector" },
  { icon: Building2, title: "Industrial Facilities" },
];

const faqs = [
  { q: "What qualifies as hazardous waste?", a: "Materials that are flammable, corrosive, reactive, or toxic — including many solvents, certain chemicals, contaminated materials, and regulated industrial residues." },
  { q: "Do you provide documentation?", a: "Yes. Waste manifests and chain-of-custody documentation are part of every hazardous waste project." },
  { q: "Can you assess a site before pickup?", a: "Yes. Our specialist team will review your waste streams, classification, packaging, and access before scheduling." },
  { q: "Do you provide containers and labeling?", a: "Yes. We can supply approved containers, labels, and guidance on safe accumulation." },
  { q: "How do I start a project?", a: "Submit a specialist review request — share your waste types, quantities, and site details. We'll confirm next steps." },
];

const related = [
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel0, to: "/services/wastewater", icon: Waves },
  { title: "Contaminated Soil", body: "Excavation, transport, and treatment of contaminated solids.", img: imgRel1, to: "/services/contaminated-soil", icon: Sprout },
  { title: "Biohazardous Disposal", body: "Safe biohazardous collection and disposal.", img: imgRel2, to: "/services/biohazardous-disposal", icon: Biohazard },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={ShieldAlert}
      eyebrowLabel="Industrial"
      breadcrumb="Hazardous Waste"
      h1="Hazardous Waste Management"
      subhead="Responsible collection, transport, and disposal of regulated hazardous waste streams for industrial operations."
      heroImage={imgHero}
      heroAlt="CEVON'S team handling labeled hazardous waste drums at an industrial site"
      benefits={["Proper classification and labeling","Trained, equipped crews","Documented chain-of-custody","Compliant transport","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
