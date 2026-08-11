import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { ShieldAlert, Factory, Beaker, Wrench, Hospital, Flame, Building2, Waves, Sprout, Biohazard } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHeroAsset from "@/assets/hazardous-waste-drums.webp.asset.json";
const imgHero = imgHeroAsset.url;

import imgRel0 from "@/assets/svc-wastewater.jpg";
import imgRel1 from "@/assets/svc-soil.jpg";
import imgRel2 from "@/assets/svc-biohazard.jpg";

const PAGE_TITLE = "Hazardous Waste Disposal in Guyana | CEVONS";
const PAGE_DESC = "High-temperature incineration, barrel incineration for oil & gas PPE, and universal waste handling for industrial clients across Guyana.";
const PAGE_URL = "/services/hazardous-waste";

export const Route = createFileRoute("/services/hazardous-waste")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: absUrl(PAGE_URL) },
    ],
    links: [{ rel: "canonical", href: absUrl(PAGE_URL) }],
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Hazardous Waste", category: "Industrial", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: Factory, title: "Manufacturing" },
  { icon: Beaker, title: "Chemical Industry" },
  { icon: Wrench, title: "Workshops & MRO" },
  { icon: Hospital, title: "Healthcare Waste" },
  { icon: Flame, title: "Oil & Gas Sector" },
  { icon: Building2, title: "Industrial Facilities" },
];

const faqs = [
  { q: "What counts as hazardous waste?", a: "Materials that are flammable, corrosive, reactive, toxic, or otherwise regulated — incinerable liquids and solids, oily rags, contaminated PPE, spent chemicals, and the universal waste streams (batteries, pesticides, mercury-containing equipment, lamps, aerosol cans). If you're unsure whether a stream qualifies, send it to us for review." },
  { q: "How is destruction verified?", a: "Every load routed through our high-temperature incinerator is logged, and the residue chain is documented from your gate to final ash disposal. Ashes from the barrel incinerator are disposed at the Haag Bosch Sanitary Landfill under the same tracked process." },
  { q: "Do you run programs for oil & gas contractors?", a: "Yes. The barrel incinerator was built for this exact use case — oily rags, gloves, used PPE, and spent filters generated on rigs and by service contractors. It burns cleanly with no smoke or smell and leaves roughly 3% ash, which is why oil & gas clients standardise on it." },
  { q: "Do I have to bring universal waste to you, or do you collect?", a: "Both work. Small volumes are often dropped off; ongoing generators arrange scheduled collection with proper labelling and containers. We'll match the model to your generation rate." },
  { q: "What documentation do you provide for compliance?", a: "Waste manifests and chain-of-custody paperwork accompany every hazardous project, and the same records are available on request for universal waste and incineration jobs." },
];

const related = [
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel0, to: "/services/wastewater", icon: Waves },
  { title: "Contaminated Soil", body: "Excavation, transport, and treatment of contaminated solids.", img: imgRel1, to: "/services/contaminated-soil", icon: Sprout },
  { title: "Biohazardous Disposal", body: "Safe biohazardous collection and disposal.", img: imgRel2, to: "/services/biohazardous-disposal", icon: Biohazard },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The incineration capability",
    heading: "High-tech, high-temperature destruction for the wastes nothing else will take",
    paragraphs: [
      "CEVONS operates a high-temperature incinerator built specifically for hazardous and industrial waste destruction. The system pairs a rotary kiln with a custom-designed main chamber — a combination that gives us the flexibility to handle even the most difficult-to-manage streams without splitting them across multiple providers.",
      "That configuration lets a single facility incinerate incinerable liquids, incinerable solids, and oily rags in one controlled process. When a waste stream is genuinely hard to destroy, this is the equipment that destroys it.",
    ],
    images: [
      { src: "/services/detail/oily-rags-incinerator.webp", alt: "CEVONS high-temperature incinerator processing hazardous industrial waste" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "For oil & gas contractors",
    heading: "The barrel incinerator — a whirlwind of fire, 3% ash, no smoke, no smell",
    paragraphs: [
      "The barrel incinerator is a purpose-built unit for the PPE and consumables generated on oil & gas operations. Inside the drum, an engineered airflow creates a whirlwind of fire and intense heat — refuse burns to complete combustion with no smoke and no smell, and what remains is roughly 3% ash.",
      "It's the right tool for oily rags, gloves, used PPE, and spent filters. Ashes are disposed at the Haag Bosch Sanitary Landfill under the same tracked chain of custody as every other hazardous stream we handle.",
    ],
    images: [
      { src: "/services/detail/portable-incinerator-1.webp", alt: "CEVONS barrel incinerator in operation on an industrial site" },
      { src: "/services/detail/portable-incinerator-2.webp", alt: "Second view of the CEVONS barrel incinerator burning oily rags and PPE" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Universal waste",
    heading: "The five streams that quietly build up in every facility — safely handled end to end",
    paragraphs: [
      "Batteries, pesticides, mercury-containing equipment, lamps, and aerosol cans accumulate in almost every industrial site, and each one has specific handling requirements. CEVONS collects, transports, and disposes of all five under one program, so nothing gets left in a corner because it doesn't fit a normal waste route.",
      "One provider for the awkward streams, one paper trail, one compliant outcome.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={ShieldAlert}
      eyebrowLabel="Industrial"
      breadcrumb="Hazardous Waste"
      h1="Hazardous Waste Management"
      subhead="High-temperature incineration, barrel incineration for oil & gas PPE, and universal waste handling for industrial operators across Guyana."
      heroImage={imgHero}
      heroSlot="svc_hazardous_waste_hero"
      heroAlt="CEVONS crew handling labelled hazardous waste drums at an industrial site"
      benefits={["Rotary kiln + custom main chamber","Barrel incinerator for oil & gas","~3% ash, no smoke, no smell","Universal waste program","Documented chain-of-custody"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="hazardous-waste"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
