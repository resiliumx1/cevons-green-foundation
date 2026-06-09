import { createFileRoute } from "@tanstack/react-router";
import { Building2, FileText, HeartPulse, Landmark, PackageX, School, ShieldCheck, Trash2 } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgShred from "@/assets/svc-shred.jpg";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";

const TITLE = "Document Shredding in Guyana | CEVON'S Environmental Services";
const DESC = "Secure document shredding from CEVON'S for businesses, offices, institutions, and organizations handling sensitive information across Guyana.";

export const Route = createFileRoute("/services/document-shredding")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/document-shredding" },
    ],
    links: [{ rel: "canonical", href: "/services/document-shredding" }],
  }),
  component: ShreddingPage,
});

function ShreddingPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={FileText}
      eyebrowLabel="Document Shredding"
      breadcrumb="Document Shredding"
      h1="Document Shredding"
      subhead="Secure document shredding for businesses, offices, institutions, and organizations handling sensitive information."
      heroImage={imgShred}
      heroAlt="Secure document shredding bins ready for collection"
      benefits={[
        "Secure document disposal",
        "Business and institutional support",
        "Confidential material handling",
        "Scheduled or one-time service",
        "Professional destruction process",
      ]}
      commonUses={[
        { icon: Building2, title: "Offices" },
        { icon: Landmark, title: "Banks" },
        { icon: School, title: "Schools" },
        { icon: Landmark, title: "Government Offices" },
        { icon: HeartPulse, title: "Healthcare Facilities" },
      ]}
      faqs={[
        { q: "Is the shredding process secure?", a: "Yes — confidential material is handled professionally throughout the process." },
        { q: "Do you offer one-time and scheduled service?", a: "Both options are available. One-off purges and ongoing scheduled service can be arranged." },
        { q: "Can you handle large volumes?", a: "Yes — we support volume jobs for offices, institutions, and facility cleanouts." },
        { q: "Do you provide collection?", a: "We can coordinate collection from your location. Contact us with your address and volume estimate." },
        { q: "How do I get started?", a: "WhatsApp us or use Request a Quote with the volume and frequency you need." },
      ]}
      related={[
        { title: "Product Destruction", body: "Controlled destruction of expired or recalled products.", img: imgShred, to: "/services/product-destruction", icon: PackageX },
        { title: "Commercial Garbage Collection", body: "Reliable waste collection for businesses.", img: imgCommercial, to: "/services/commercial-garbage-collection", icon: Trash2 },
        { title: "Dumpster Rental", body: "Dumpster rental for cleanouts and projects.", img: imgDumpster, to: "/services/dumpster-rental", icon: ShieldCheck },
      ]}
    />
  );
}
