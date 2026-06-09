import { createFileRoute } from "@tanstack/react-router";
import { Building2, FileText, Factory, PackageX, ShoppingBag, Store, Trash2, Truck, Warehouse } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgRel0 from "@/assets/svc-destruction.jpg";
import imgRel0 from "@/assets/svc-shred.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-destruction.jpg";

const TITLE = "Product Destruction in Guyana | CEVON'S Environmental Services";
const DESC = "Controlled product destruction from CEVON'S for businesses that need secure, documented disposal across Guyana.";

export const Route = createFileRoute("/services/product-destruction")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/product-destruction" },
    ],
    links: [{ rel: "canonical", href: "/services/product-destruction" }],
  }),
  component: ProductDestructionPage,
});

function ProductDestructionPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={PackageX}
      eyebrowLabel="Product Destruction"
      breadcrumb="Product Destruction"
      h1="Product Destruction"
      subhead="Controlled product destruction services for businesses that need secure, documented disposal."
      heroImage={imgRel0}
      heroAlt="Secure product destruction handled by CEVON'S"
      benefits={[
        "Secure destruction process",
        "Business and industrial support",
        "Useful for damaged, expired, or recalled products",
        "Documentation support where required",
        "Professional handling",
      ]}
      commonUses={[
        { icon: Factory, title: "Manufacturers" },
        { icon: Truck, title: "Distributors" },
        { icon: Store, title: "Retailers" },
        { icon: Warehouse, title: "Warehouses" },
        { icon: ShoppingBag, title: "Food & Product Businesses" },
      ]}
      faqs={[
        { q: "What types of products do you destroy?", a: "Common cases include expired stock, damaged goods, and recalled items. Share the product type and we'll confirm the right approach." },
        { q: "Is documentation provided?", a: "Documentation support is available where required to evidence destruction for your records or regulator." },
        { q: "Is the process secure?", a: "Yes — products are handled professionally throughout the destruction process." },
        { q: "Can you support large quantities?", a: "Yes — we can plan logistics and destruction for volume jobs." },
        { q: "How do I start?", a: "WhatsApp us or use Request a Quote with the product type and volume." },
      ]}
      related={[
        { title: "Document Shredding", body: "Secure shredding of sensitive documents.", img: imgRel0, to: "/services/document-shredding", icon: FileText },
        { title: "Commercial Garbage Collection", body: "Reliable waste collection for businesses.", img: imgRel1, to: "/services/commercial-garbage-collection", icon: Trash2 },
        { title: "Dumpster Rental", body: "Dumpster rental for cleanouts and projects.", img: imgRel2, to: "/services/dumpster-rental", icon: Building2 },
      ]}
    />
  );
}
