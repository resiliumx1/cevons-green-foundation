import { createFileRoute } from "@tanstack/react-router";
import { Waves, Factory, Beaker, Droplet, Flame, Building2, Wrench, ShieldAlert } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-wastewater.jpg";
import imgRel0 from "@/assets/svc-hazardous.jpg";
import imgRel1 from "@/assets/svc-tank.jpg";
import imgRel2 from "@/assets/svc-oil.jpg";

const PAGE_TITLE = "Industrial Wastewater Services in Guyana | CEVON'S";
const PAGE_DESC = "Industrial wastewater collection, transport, and treatment coordination for facilities across Guyana.";
const PAGE_URL = "/services/wastewater";

export const Route = createFileRoute("/services/wastewater")({
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
  { icon: Factory, title: "Industrial Plants" },
  { icon: Beaker, title: "Process Water" },
  { icon: Droplet, title: "Storage Pits & Sumps" },
  { icon: Flame, title: "Energy Operations" },
  { icon: Building2, title: "Commercial Facilities" },
  { icon: Wrench, title: "Maintenance Shutdowns" },
];

const faqs = [
  { q: "What types of wastewater do you handle?", a: "Industrial process water, contaminated water, sump water, washdown water, and similar regulated streams — assessed case-by-case." },
  { q: "Do you provide equipment for large volumes?", a: "Yes. Vacuum tankers, pumps, and tanks can be mobilized for high-volume jobs." },
  { q: "Can you handle scheduled shutdowns?", a: "Yes. Plant turnarounds and shutdown cleanouts are a common engagement — we plan capacity around your schedule." },
  { q: "Is documentation provided?", a: "Yes. Waste transfer and disposal documentation is provided for compliance recordkeeping." },
  { q: "How do I scope a project?", a: "Submit a specialist review request with your facility details and waste stream description." },
];

const related = [
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel0, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Tank Cleaning", body: "Industrial tank cleaning with safety controls.", img: imgRel1, to: "/services/tank-cleaning", icon: Beaker },
  { title: "Used Waste Oil", body: "Collection and responsible recycling of waste oil.", img: imgRel2, to: "/services/used-waste-oil", icon: Flame },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Waves}
      eyebrowLabel="Industrial"
      breadcrumb="Wastewater"
      h1="Industrial Wastewater Services"
      subhead="Collection, transport, and treatment coordination for industrial wastewater and process water streams."
      heroImage={imgHero}
      heroAlt="CEVON'S wastewater service vehicle at an industrial facility in Guyana"
      benefits={["Vacuum tankers and pumps","Trained operators","Proper transport and handling","Treatment coordination","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
