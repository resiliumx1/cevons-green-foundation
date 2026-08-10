import { createFileRoute } from "@tanstack/react-router";
import { FileText, Factory, PackageX, ShoppingBag, Store, Trash2, Truck, Warehouse } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-destruction.jpg";
import imgRel0 from "@/assets/svc-shred.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-commercial.jpg";

const TITLE = "Product Destruction in Guyana | CEVONS Environmental Services";
const DESC = "Verified destruction of expired food, beverages, and pharmaceuticals — with a Certificate of Destruction on every job.";
const PAGE_URL = "/services/product-destruction";

export const Route = createFileRoute("/services/product-destruction")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: ProductDestructionPage,
});

const uses = [
  { icon: Factory, title: "Manufacturers" },
  { icon: Truck, title: "Distributors" },
  { icon: Store, title: "Retailers" },
  { icon: Warehouse, title: "Warehouses" },
  { icon: ShoppingBag, title: "Food & Beverage" },
  { icon: PackageX, title: "Pharmaceutical" },
];

const faqs = [
  { q: "Which products qualify for destruction?", a: "Expired food items and beverages, pharmaceuticals, damaged goods, and recalled stock are the most common. Anything a brand needs verifiably taken out of circulation is a candidate — tell us what's on the pallets and we'll confirm the right process." },
  { q: "Can we witness the destruction?", a: "Yes. Brand representatives, auditors, and regulators are welcome to attend and witness the process. For many product categories, witnessing is exactly why organisations use a third-party destruction service." },
  { q: "What does the Certificate of Destruction cover?", a: "The certificate identifies the organisation, the product destroyed, the quantity, the date, and the disposal outcome — the record your compliance team, insurer, or brand office needs on file." },
  { q: "How does this protect the brand from counterfeit or diversion?", a: "Verified destruction closes the loop on recalled or expired stock so it cannot re-enter the supply chain via dumpsters, secondary markets, or diversion. That's a materially different outcome from throwing product in a skip." },
  { q: "Where is the destroyed material disposed?", a: "After destruction, material is hauled to an approved landfill for special disposal — the same tracked, compliant chain we use for regulated waste streams." },
];

const related = [
  { title: "Document Shredding", body: "Secure destruction of sensitive documents.", img: imgRel0, to: "/services/document-shredding", icon: FileText },
  { title: "Dumpster Rental", body: "Roll-off bins for cleanouts and site clearances.", img: imgRel1, to: "/services/dumpster-rental", icon: Trash2 },
  { title: "General Waste Management", body: "Scheduled commercial waste collection programs.", img: imgRel2, to: "/services/general-waste-management", icon: Trash2 },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "What we destroy — and why verification matters",
    heading: "From expired food and beverages to pharmaceuticals — taken out of circulation for good",
    paragraphs: [
      "CEVONS has the experience and the equipment to effectively destroy products before they're hauled to an approved landfill for special disposal. The scope covers expired food items and beverages, out-of-date or recalled pharmaceuticals, and any commercial stock a brand needs verifiably gone.",
      "Verified destruction is different from ordinary disposal. It's the difference between hoping recalled product doesn't resurface and knowing it can't — because there's a documented outcome the brand office can point to.",
    ],
    images: [
      { src: "/services/detail/product-destruction-depackaging.webp", alt: "CEVONS depackaging and product destruction operation" },
    ],
  },
  {
    variant: "gallery",
    eyebrow: "Destruction in practice",
    heading: "How the process actually looks on the ground",
    paragraphs: [
      "Whether it's palletised beverages coming back from distribution or pharmaceutical stock past expiry, the operation follows the same discipline: controlled destruction on our equipment, then transport to the approved disposal site.",
    ],
    images: [
      { src: "/services/detail/product-destruction-beverage.webp", alt: "Expired beverage product staged for CEVONS destruction" },
      { src: "/services/detail/product-destruction-pharma.webp", alt: "Pharmaceutical stock prepared for verified destruction" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "The paperwork that matters",
    heading: "A Certificate of Destruction with every job",
    paragraphs: [
      "Every destruction project closes with a Certificate of Destruction issued to the organisation. That certificate is the piece of paper your compliance team, brand office, insurer, or auditor is actually looking for — and CEVONS provides it as a matter of course, not as an upsell.",
    ],
  },
];

function ProductDestructionPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={PackageX}
      eyebrowLabel="Product Destruction"
      breadcrumb="Product Destruction"
      h1="Product Destruction"
      subhead="Verified destruction of expired food and beverages, pharmaceuticals, and recalled stock — with a Certificate of Destruction on every job."
      heroImage={imgHero}
      heroSlot="svc_product_destruction_hero"
      heroAlt="Secure product destruction handled by CEVONS"
      benefits={[
        "Food, beverage & pharmaceutical",
        "Witnessing welcomed",
        "Certificate of Destruction issued",
        "Approved landfill disposal",
        "Documented chain-of-custody",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="product-destruction"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
