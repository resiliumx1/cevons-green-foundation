import { createFileRoute } from "@tanstack/react-router";
import { Container, ShoppingCart, Hotel, Factory, Building2, Warehouse, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-industrial.jpg";
import imgRel0 from "@/assets/svc-skip.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";

const PAGE_TITLE = "Commercial Compactor Rental in Guyana | CEVONS";
const PAGE_DESC = "CEVONS waste compactor rental for high-volume commercial and industrial sites — reduces waste volume, cuts collection frequency, and keeps loading areas tidy.";
const PAGE_URL = "/services/compactor-rental";

export const Route = createFileRoute("/services/compactor-rental")({
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
  { icon: ShoppingCart, title: "Supermarkets" },
  { icon: Hotel, title: "Hotels & Resorts" },
  { icon: Factory, title: "Manufacturing Plants" },
  { icon: Warehouse, title: "Distribution Centres" },
  { icon: Building2, title: "Large Facilities" },
  { icon: Container, title: "High-Volume Sites" },
];

const faqs = [
  { q: "What is a waste compactor?", a: "A stationary unit that compresses waste on-site so more material fits into every container — reducing volume and collection frequency." },
  { q: "Who benefits most?", a: "High-volume sites like supermarkets, hotels, manufacturing plants, and distribution centres where trips to empty bins are a real operational cost." },
  { q: "Do you handle installation?", a: "Yes — we coordinate placement, power connection, and hauling schedules to fit your site." },
  { q: "How does this cut costs?", a: "Fewer pickups, less loose waste, and a cleaner loading area — you pay for hauling, not for air." },
  { q: "How do I request one?", a: "WhatsApp us or use Request a Quote with your site type, waste stream, and estimated volume." },
];

const related = [
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel0, to: "/services/skip-bin-dumpster-rental", icon: Container },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Material Recovery Facility", body: "Sorting and recovery infrastructure.", img: imgRel2, to: "/services/material-recovery-facility", icon: Recycle },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Commercial"
      breadcrumb="Compactor Rental"
      h1="Commercial Compactor Rental"
      subhead="On-site waste compactors that shrink volume, cut collection frequency, and keep high-volume loading areas tidy."
      heroImage={imgHero}
      heroAlt="Commercial waste compactor installed at a CEVONS client loading dock"
      benefits={[
        "Reduces waste volume on-site",
        "Cuts collection frequency and hauling cost",
        "Keeps loading areas clean and safe",
        "Sized for supermarkets, hotels, and plants",
        "Installation and scheduling handled",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
    />
  );
}
