import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { Recycle, Factory, Building2, ShoppingBag, Package, Trash2, Container, Sprout } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHeroAsset from "@/assets/plastic-recycling-hero.jpg.asset.json";
const imgHero = (imgHeroAsset as { url: string }).url;
import imgRel0 from "@/assets/svc-scrap.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-industrial.jpg";

const PAGE_TITLE = "Plastic Recycling for Business in Guyana | CEVONS";
const PAGE_DESC = "CEVONS plastic recycling programs help businesses raise their recycling rate with a partner network offering verified, transparent end destinations for material.";
const PAGE_URL = "/services/plastic-recycling";

export const Route = createFileRoute("/services/plastic-recycling")({
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
  }),
  component: Page,
});

const uses = [
  { icon: Factory, title: "Manufacturers" },
  { icon: Building2, title: "Offices & Institutions" },
  { icon: ShoppingBag, title: "Retail & Supermarkets" },
  { icon: Package, title: "Packaging Waste" },
  { icon: Trash2, title: "Back-of-House Streams" },
  { icon: Sprout, title: "Sustainability Programs" },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "A Program, Not a Bin-Drop",
    heading: "Raising your recycling rate — measurably",
    paragraphs: [
      "Setting a recycling bin at the back door is not a recycling program. CEVONS builds actual programs — source separation designed for how your team already works, collection matched to your volume, and reporting that shows the rate moving in the right direction over time.",
      "The goal is a bigger share of your plastic diverted from the landfill month over month. That takes design, not just containers. We start by understanding the streams your operation produces, then structure the program around what will actually get sorted correctly on the floor.",
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Verified End Destinations",
    heading: "You can say where your plastic actually went",
    paragraphs: [
      "One of the hardest questions in corporate sustainability is a simple one: where did the plastic go? Too often the honest answer is \"we don't know.\" A CEVONS program answers that question with verified end destinations through a vetted partner network — not assumptions, not brochures, but a documented downstream path.",
      "That's what turns a recycling program from a claim into a credential — reporting that stands up to scrutiny from clients, auditors, and sustainability teams.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Varied Streams, One Program",
    heading: "One accountable partner across your plastic streams",
    paragraphs: [
      "Business plastic isn't one material — it's shrink wrap, rigid containers, packaging, back-of-house film, and more. A CEVONS program covers varied streams under one accountable partner, so your team isn't juggling multiple vendors to hit a single recycling target.",
    ],
  },
];

const faqs = [
  { q: "Which plastic types and streams do you handle?", a: "We work across varied plastic waste streams typical of commercial operations — packaging, film, and rigid containers among them. Share what your business produces and we'll confirm the pathway for each stream during setup." },
  { q: "How does a program get started?", a: "We look at your current waste flow, identify the streams worth separating, and design a source-separation and collection setup that fits how your team already works. Roll-out follows, with training if needed." },
  { q: "How do we keep contamination down?", a: "Contamination is the single biggest reason recyclables end up in landfill. We size bins, place them where the material is actually produced, and provide clear guidance so the right thing lands in the right container." },
  { q: "Do you provide reporting for sustainability goals?", a: "Yes — verified end destinations through our partner network mean you can report where your material went, backed by documentation rather than assumption. That's what corporate sustainability reporting requires." },
  { q: "How does this connect to the Material Recovery Facility?", a: "The Material Recovery Facility provides the industrial-scale sorting and recovery infrastructure behind the program — so material collected from your site has a real place to go." },
];

const related = [
  { title: "Scrap Metal Recycling", body: "Licensed scrap metal collection and export.", img: imgRel0, to: "/services/scrap-metal-recycling", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Container },
  { title: "Material Recovery Facility", body: "Industrial-scale sorting and recovery.", img: imgRel2, to: "/services/material-recovery-facility", icon: Factory },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Recycling"
      breadcrumb="Plastic Recycling"
      h1="Plastic Recycling"
      subhead="Business plastics programs designed to raise your recycling rate — backed by a partner network with verified, transparent end destinations."
      heroImage={imgHero}
      heroSlot="svc_plastic_recycling_hero"
      heroAlt="CEVONS crew in high-visibility PPE sorting baled plastic containers for recycling"
      benefits={[
        "Programs that raise your recycling rate",
        "Verified, transparent end destinations",
        "Partner network for downstream processing",
        "Covers varied plastic waste streams",
        "Tailored to your business",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="plastic-recycling"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
