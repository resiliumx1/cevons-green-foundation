import { createFileRoute } from "@tanstack/react-router";
import { Recycle, Trash2, Factory, Building2, Truck, Leaf, Mountain, Container } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-recovery.jpg";
import imgRel0 from "@/assets/svc-landfill.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "Material Recovery Facility (MRF) | CEVONS Guyana";
const PAGE_DESC = "The sorting engine behind CEVONS's commercial recycling — cardboard, paper, plastics, and metals returned to productive use.";
const PAGE_URL = "/services/material-recovery-facility";

export const Route = createFileRoute("/services/material-recovery-facility")({
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
  { icon: Recycle, title: "Recyclables Recovery" },
  { icon: Trash2, title: "Mixed Waste Sorting" },
  { icon: Factory, title: "Industrial Diversion" },
  { icon: Building2, title: "Commercial Programs" },
  { icon: Truck, title: "Tipping & Intake" },
  { icon: Leaf, title: "Sustainability Reporting" },
];

const faqs = [
  { q: "What materials does the MRF accept?", a: "The recovery stream is built around cardboard, paper, plastics, and metals — the materials that have real end-markets when they're kept clean. Confirm your specific stream at intake and we'll tell you exactly what the facility can take." },
  { q: "How do businesses feed material into the MRF?", a: "Through source-separated commercial collections. The MRF is what makes those programmes transparent — instead of \"we hope this gets recycled\", clients know their material lands at a sorting facility with a documented destination." },
  { q: "What happens if a load is contaminated?", a: "Contamination is the biggest enemy of recovery. Loads with the wrong material mixed in either drop grade or get rejected outright — so the discipline sits at the source, on the containers we place and the guidance we give the site." },
  { q: "What happens to the sorted material after the MRF?", a: "Sorted material is baled and routed to end-users that turn it back into new packaging, products, and industrial feedstock — the reason source-separated recycling exists in the first place." },
  { q: "Can our organisation get diversion reporting for our sustainability goals?", a: "Yes. Tonnage and material-type reporting is available for businesses that need to demonstrate diversion outcomes to their own stakeholders." },
];

const related = [
  { title: "Landfill Operations", body: "Managed landfill with environmental safeguards.", img: imgRel0, to: "/services/landfill-operations", icon: Mountain },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Building2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "What an MRF actually does",
    heading: "The sorting engine behind every credible commercial recycling programme",
    paragraphs: [
      "A Material Recovery Facility is the intermediate step between a business's recycling bin and a genuine end-market. Mixed recoverable material comes in, gets sorted and processed by stream — cardboard, paper, plastics, metals — and leaves as baled feedstock that manufacturers can actually use.",
      "It's the reason a source-separated recycling programme means something. Without an MRF, everything collected as \"recyclable\" still has to be sorted by hand or ends up landfilled anyway. With one, there's a real destination and a real diversion outcome.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Diversion outcomes",
    heading: "Keeping recoverable material out of Guyana's landfills",
    paragraphs: [
      "The whole point of the MRF is to divert material that has residual value away from disposal. Every tonne sorted and shipped as feedstock is a tonne that doesn't need landfill volume — and a tonne that keeps producing value in the wider economy.",
      "That's what makes it worth running the facility, and what makes commercial recycling programmes that feed into it worth the effort at source.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Facilities"
      breadcrumb="Material Recovery Facility"
      h1="Material Recovery Facility"
      subhead="The sorting engine behind CEVONS's commercial recycling — cardboard, paper, plastics, and metals returned to productive use instead of landfill."
      heroImage={imgHero}
      heroSlot="svc_material_recovery_hero"
      heroAlt="Sorting lines and recovered materials inside the CEVONS material recovery facility"
      benefits={["Cardboard, paper, plastics & metals","Feeds source-separated collections","Transparent diversion outcomes","Tipping and intake support","Reporting for sustainability goals"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="material-recovery-facility"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
