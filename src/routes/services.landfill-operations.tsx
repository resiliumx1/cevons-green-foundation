import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Mountain, Truck, Factory, Trash2, Hammer, Building2, Leaf, Recycle, Container, Sprout } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-landfill.jpg";
import imgRel0 from "@/assets/svc-recovery.jpg";
import imgRel1 from "@/assets/svc-skip.jpg";
import imgRel2 from "@/assets/svc-soil.jpg";

const PAGE_TITLE = "Landfill Operations | CEVONS Guyana";
const PAGE_DESC = "Operators of Haag Bosch Sanitary Landfill, Esplanade, and De Kora — non-hazardous landfill managed to strict EPA parameters.";
const PAGE_URL = "/services/landfill-operations";

export const Route = createFileRoute("/services/landfill-operations")({
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
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Landfill Operations", category: "Facilities", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: Truck, title: "Commercial Tipping" },
  { icon: Factory, title: "Industrial Disposal" },
  { icon: Trash2, title: "Bulk Waste" },
  { icon: Hammer, title: "Construction & Demolition" },
  { icon: Building2, title: "Municipal Programs" },
  { icon: Leaf, title: "Special Waste" },
];

const faqs = [
  { q: "What is a Certificate of Disposal and how do I request one?", a: "It's a document certifying that your waste was responsibly and properly disposed of in accordance with the Laws of Guyana. Many bids, contracts, and regulatory filings require one. Request it ahead of time — before or at the point of tipping — and we'll issue it promptly." },
  { q: "What qualifies as special waste?", a: "Any stream that requires waste profiling, customised handling, heightened safety measures, or unique disposal practices — beyond what standard non-hazardous intake covers. Send us the profile and we'll confirm the right pathway before anything arrives at the gate." },
  { q: "How does daily cover actually work?", a: "CEVONS and its partners invested in a tarp deployment system that lays EPA-approved tarps over the working face at the end of each operating day. The tarps control odour, vectors, and litter, and they save landfill space that would otherwise be consumed by non-reusable soil cover." },
  { q: "Which site serves my region?", a: "Haag Bosch serves the City of Georgetown and 15 NDCs. Esplanade serves the New Amsterdam Municipality and surrounding East Berbice-Corentyne communities. De Kora is the primary disposal point for the Linden Municipality and surrounding Region 10 communities." },
  { q: "Can a business tip directly at the landfill?", a: "Yes. Commercial and industrial tipping is coordinated through our intake process — share the waste type, volume, and frequency and we'll confirm acceptance and the right site." },
];

const related = [
  { title: "Material Recovery Facility", body: "Sorting and recovery infrastructure for diverted material.", img: imgRel0, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel1, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "Contaminated Soil", body: "Excavation, transport, and treatment of contaminated solids.", img: imgRel2, to: "/services/contaminated-soil", icon: Sprout },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Operators, not just users",
    heading: "A properly run landfill is a public asset — that is the standard we operate to",
    paragraphs: [
      "Landfill sites play a vital role for governments, businesses, and individuals. As operators, CEVONS's job is to make sure every landfill under our responsibility is managed and run correctly, so it stays a genuine asset to its community — backed by a positive environmental record instead of a growing list of problems for the people who live nearby.",
      "The sites we operate are non-hazardous landfills, carefully maintained to contain waste and keep toxins from leaching into the surrounding environment. Every operational decision — from where the working face sits to how cover is applied — is made inside the strict parameters established by the Environmental Protection Agency. That's the difference between a landfill and a dump.",
    ],
    images: [
      { src: "/services/detail/landfill-site.webp", alt: "CEVONS-operated sanitary landfill site" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "How we run the sites",
    heading: "EPA parameters, daily tarp cover, Certificates of Disposal, and a route for special waste",
    paragraphs: [
      "Every operating day ends with the working face covered. CEVONS and its partners invested in a tarp deployment system — easy-to-lay, EPA-approved tarps that go down over the day's face to control odour, vectors, and litter. It's a step up from soil cover, and it protects landfill volume that would otherwise be filled with non-reusable material.",
      "For clients whose bids, contracts, or regulatory obligations depend on it, we issue a Certificate of Disposal certifying that the waste was responsibly and properly disposed of in accordance with the Laws of Guyana. Request it ahead of time and it's ready when you need it.",
      "For customers generating streams that need waste profiling, customised handling, heightened safety measures, or unique disposal practices, our special waste route runs alongside the general intake — a separate, controlled pathway for material that doesn't belong in the standard flow.",
    ],
    images: [
      { src: "/services/detail/landfill-daily-cover.webp", alt: "CEVONS EPA-approved tarp daily cover system on landfill working face" },
    ],
  },
  {
    variant: "gallery",
    eyebrow: "The three sites we operate",
    heading: "Sanitary landfill infrastructure serving three regions of Guyana",
    paragraphs: [
      "CEVONS operates three landfill sites across the country — the largest network of managed disposal infrastructure in Guyana, covering the capital, East Berbice-Corentyne, and Upper Demerara-Berbice under a single operational standard.",
    ],
    bullets: [
      "Haag Bosch Sanitary Landfill Site — services the City of Georgetown and 15 NDCs. The largest landfill in the country and the only sanitary landfill site. Operated by CEVONS since April 1, 2018.",
      "Esplanade Landfill Site — located at Esplanade, New Amsterdam, serving the New Amsterdam Municipality and surrounding communities in the East Berbice-Corentyne Region. Operated by CEVONS since November 1, 2019.",
      "De Kora Landfill Site — located in Linden, Region 10 (Upper Demerara-Berbice). The primary waste disposal point for the Linden Municipality and surrounding communities, handling residential and commercial waste to environmental standards.",
    ],
    images: [
      { src: "/services/detail/landfill-ops-1.webp", alt: "CEVONS landfill operations in progress" },
      { src: "/services/detail/landfill-ops-2.webp", alt: "CEVONS landfill site operations detail" },
      { src: "/services/detail/landfill-ops-3.webp", alt: "CEVONS landfill site operations detail" },
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Mountain}
      eyebrowLabel="Facilities"
      breadcrumb="Landfill Operations"
      h1="Landfill Operations"
      subhead="Operators of Haag Bosch, Esplanade, and De Kora — non-hazardous sanitary landfill managed to strict EPA parameters."
      heroImage={imgHero}
      heroSlot="svc_landfill_operations_hero"
      heroAlt="Aerial view of the CEVONS-operated Haag Bosch Sanitary Landfill"
      benefits={["Three sanitary landfill sites","Only sanitary landfill in Guyana","EPA-approved daily tarp cover","Certificate of Disposal on request","Special waste pathway"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="landfill-operations"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
