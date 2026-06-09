import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, FileText, Home, Hotel, School, ShoppingBag, Store, Trash2, Utensils } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgResidential from "@/assets/svc-residential.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgShred from "@/assets/svc-shred.jpg";

const TITLE = "Commercial Garbage Collection in Guyana | CEVON'S Environmental Services";
const DESC = "Reliable commercial waste collection from CEVON'S for businesses, institutions, and organizations across Guyana.";

export const Route = createFileRoute("/services/commercial-garbage-collection")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/commercial-garbage-collection" },
    ],
    links: [{ rel: "canonical", href: "/services/commercial-garbage-collection" }],
  }),
  component: CommercialGarbagePage,
});

function CommercialGarbagePage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Building2}
      eyebrowLabel="Commercial Garbage Collection"
      breadcrumb="Commercial Garbage Collection"
      h1="Commercial Garbage Collection"
      subhead="Reliable waste collection for businesses, commercial properties, institutions, and organizations across Guyana."
      heroImage={imgCommercial}
      heroAlt="CEVON'S commercial garbage collection serving a Guyana business"
      benefits={[
        "Scheduled collection",
        "Business-focused support",
        "Suitable for multiple industries",
        "Reliable service coordination",
        "Scalable solutions",
      ]}
      commonUses={[
        { icon: Utensils, title: "Restaurants" },
        { icon: Hotel, title: "Hotels" },
        { icon: Building2, title: "Offices" },
        { icon: School, title: "Schools" },
        { icon: Store, title: "Commercial Properties" },
        { icon: ShoppingBag, title: "Retail Centers" },
      ]}
      faqs={[
        { q: "How often can you collect?", a: "We coordinate collection schedules based on your operation — daily, weekly, or custom frequencies are supported." },
        { q: "Do you serve specific industries?", a: "Yes — restaurants, hotels, offices, schools, retail, and other commercial operations are all supported." },
        { q: "Can you scale as we grow?", a: "Yes. Our service plans can expand with your operation as volume or locations grow." },
        { q: "Where do you operate?", a: "We serve Georgetown, Linden, Berbice and surrounding areas across Guyana." },
        { q: "How do I set up a service plan?", a: "WhatsApp us or use Request a Quote with your business type, location, and approximate volume." },
      ]}
      related={[
        { title: "Residential Garbage Collection", body: "Reliable waste collection for homes and communities.", img: imgResidential, to: "/services/residential-garbage-collection", icon: Home },
        { title: "Dumpster Rental", body: "Dumpster rental for commercial cleanouts and projects.", img: imgDumpster, to: "/services/dumpster-rental", icon: Trash2 },
        { title: "Document Shredding", body: "Secure shredding for offices and institutions.", img: imgShred, to: "/services/document-shredding", icon: FileText },
      ]}
    />
  );
}

void Container;
