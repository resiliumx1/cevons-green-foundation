import { createFileRoute } from "@tanstack/react-router";
import { Waves, Factory, Beaker, Droplet, Flame, Building2, Wrench, ShieldAlert } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-wastewater.jpg";
import imgRel0 from "@/assets/svc-hazardous.jpg";
import imgRel1 from "@/assets/svc-tank.jpg";
import imgRel2 from "@/assets/svc-oil.jpg";

const PAGE_TITLE = "Industrial Wastewater Services in Guyana | CEVONS";
const PAGE_DESC = "Treatment of metals, acids, bases, organics, cyanide, petroleum-contaminated water, latex, paints, and industrial process wastes.";
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
  { q: "Which wastewater streams do you accept?", a: "Streams containing metals, acids, bases, organics, cyanide, and suspended solids; petroleum-contaminated water; latex wastewater; water-based paints; general industrial process wastes; and tank rinse water. If your stream isn't listed, send us the profile — we assess case by case." },
  { q: "Do you sample and characterise before acceptance?", a: "Yes. Characterisation is part of the intake — it decides the treatment route, the transport arrangement, and the disposal pathway. It's also what keeps everyone on the right side of compliance." },
  { q: "How is collection organised?", a: "Volumes are collected by vacuum tanker, drum, or tote depending on the stream and the site. Ongoing generators move to a scheduled cadence; one-off events are handled on request." },
  { q: "Will the discharge meet compliance requirements?", a: "Every treated stream is discharged in line with Environmental Protection Agency requirements and disposed of via approved pathways. That's the whole reason for using a specialist rather than diluting to drain." },
  { q: "What documentation do I get?", a: "Waste transfer records and disposal documentation are provided for every job, so your environmental file matches the physical work." },
];

const related = [
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel0, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Tank Cleaning", body: "Industrial tank cleaning with safety controls.", img: imgRel1, to: "/services/tank-cleaning", icon: Beaker },
  { title: "Used Waste Oil", body: "Collection and responsible recycling of waste oil.", img: imgRel2, to: "/services/used-waste-oil", icon: Flame },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "What we treat",
    heading: "A wastewater programme built for the full range of industrial streams",
    paragraphs: [
      "Industrial wastewater rarely arrives clean-labelled. The CEVONS programme is built around that reality — one intake, one treatment platform, one disposal chain, across the streams industrial operators actually generate:",
    ],
    bullets: [
      "Metals, acids, and bases",
      "Organics and cyanide",
      "Suspended solids",
      "Petroleum-contaminated water",
      "Latex wastewater",
      "Water-based paints",
      "Industrial process wastes",
      "Tank rinse water",
    ],
    images: [
      { src: "/services/detail/wastewater-treatment-1.webp", alt: "CEVONS wastewater treatment operation at an industrial site" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Advanced technology, hands-on expertise",
    heading: "The equipment matters — the people running it matter more",
    paragraphs: [
      "The treatment platform pairs advanced wastewater technology with hands-on operational expertise. That combination is what turns a difficult stream into a safe, efficient, cost-effective outcome — instead of a hazard that keeps getting deferred.",
      "Every project runs through characterisation, treatment, and documented disposal. The result is a stream that leaves your site once, ends its journey in an approved pathway, and shows up cleanly in your environmental records.",
    ],
    images: [
      { src: "/services/detail/wastewater-treatment-2.webp", alt: "CEVONS wastewater treatment technology processing industrial effluent" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Safe, efficient, cost-effective",
    heading: "Industrial wastewater handled end to end",
    paragraphs: [
      "One provider from characterisation through treatment to disposal — no handoffs, no gaps in the paper trail, no surprise costs at the discharge point. That's the entire value of running wastewater through a specialist.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Waves}
      eyebrowLabel="Industrial"
      breadcrumb="Wastewater"
      h1="Industrial Wastewater Services"
      subhead="Collection, treatment, and compliant disposal for the full range of industrial wastewater streams — from acids and organics to latex, paints, and tank rinse water."
      heroImage={imgHero}
      heroAlt="CEVONS wastewater service vehicle at an industrial facility in Guyana"
      benefits={["Full contaminant range accepted","Advanced treatment technology","Hands-on operational expertise","Vacuum tankers, pumps, totes","Documented compliant disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="wastewater"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
