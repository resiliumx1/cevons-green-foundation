import { createFileRoute } from "@tanstack/react-router";
import { Beaker, Flame, Droplet, Factory, Anchor, Wrench, Waves, ShieldAlert } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-industrial.jpg";
import imgRel0 from "@/assets/oil.jpg";
import imgRel1 from "@/assets/wastewater.jpg";
import imgRel2 from "@/assets/industrial.jpg";

const PAGE_TITLE = "Industrial Tank Cleaning in Guyana | CEVON'S";
const PAGE_DESC = "Industrial tank cleaning with safety controls and proper disposal of recovered material across Guyana.";
const PAGE_URL = "/services/tank-cleaning";

export const Route = createFileRoute("/services/tank-cleaning")({
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
  { icon: Flame, title: "Fuel Storage Tanks" },
  { icon: Beaker, title: "Chemical Tanks" },
  { icon: Droplet, title: "Water & Process Tanks" },
  { icon: Factory, title: "Industrial Vessels" },
  { icon: Anchor, title: "Marine & Port Tanks" },
  { icon: Wrench, title: "Maintenance Shutdowns" },
];

const faqs = [
  { q: "What tanks do you clean?", a: "Fuel storage, lubricant, chemical, water, and similar industrial tanks — scope confirmed during specialist review." },
  { q: "Do you follow confined-space procedures?", a: "Yes. Confined-space and gas-monitoring protocols are part of every applicable job." },
  { q: "Can you coordinate with shutdowns?", a: "Yes. Tank cleanings are commonly scheduled during plant turnarounds and shutdown windows." },
  { q: "What happens to the recovered material?", a: "It's classified and routed to the appropriate disposal or recycling pathway with proper documentation." },
  { q: "How do I start a project?", a: "Submit a specialist review request with tank details, contents, and access information." },
];

const related = [
  { title: "Used Waste Oil", body: "Collection and recycling of waste oils.", img: imgRel0, to: "/services/used-waste-oil", icon: Flame },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel1, to: "/services/wastewater", icon: Waves },
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel2, to: "/services/hazardous-waste", icon: ShieldAlert },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Beaker}
      eyebrowLabel="Industrial"
      breadcrumb="Tank Cleaning"
      h1="Industrial Tank Cleaning"
      subhead="Cleaning of fuel, oil, chemical, and water storage tanks with full safety controls and proper waste handling."
      heroImage={imgHero}
      heroAlt="CEVON'S industrial tank cleaning crew working at a fuel storage facility"
      benefits={["Confined-space safety protocols","Vacuum and pump systems","Trained, equipped crews","Proper disposal of residues","Specialist project review"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
    />
  );
}
