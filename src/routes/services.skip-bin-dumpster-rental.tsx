import { createFileRoute } from "@tanstack/react-router";
import { Container, Hammer, Building2, Wrench, Factory, Trees, Trash2, Recycle } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-skip.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-recovery.jpg";

const PAGE_TITLE = "Skip Bin & Dumpster Rental in Guyana | CEVONS";
const PAGE_DESC = "Skip bins and dumpsters for construction, renovation, and ongoing commercial site needs across Guyana.";
const PAGE_URL = "/services/skip-bin-dumpster-rental";

export const Route = createFileRoute("/services/skip-bin-dumpster-rental")({
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
  { icon: Hammer, title: "Construction Sites" },
  { icon: Building2, title: "Commercial Builds" },
  { icon: Wrench, title: "Renovations" },
  { icon: Factory, title: "Industrial Operations" },
  { icon: Trees, title: "Site Clearance" },
  { icon: Trash2, title: "Bulk Waste" },
];

const faqs = [
  { q: "What's the difference between a skip bin and a dumpster?", a: "Both are open-top containers for bulk waste. Skip bins are usually smaller and lifted onto a truck; dumpsters (roll-off) are larger and rolled on and off the trailer. We help you pick the right one." },
  { q: "Which size do I need?", a: "Small renovations often fit a 6–10 yard container; medium projects need 15–20 yard; major construction or commercial jobs typically use 30–40 yard." },
  { q: "Can you swap full bins on a recurring schedule?", a: "Yes. We provide recurring swap-out service for active sites and ongoing operations." },
  { q: "What can I put in the bin?", a: "General construction debris and commercial waste are accepted. Hazardous materials, liquids, and regulated waste are handled separately." },
  { q: "Do you deliver across Guyana?", a: "Yes — Georgetown, Linden, Berbice, and broader Guyana. Contact us to confirm your site." },
];

const related = [
  { title: "Dumpster Rental", body: "Flexible dumpster options for any project.", img: imgRel0, to: "/services/dumpster-rental", icon: Container },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Building2 },
  { title: "Material Recovery Facility", body: "Sorting and recovery that turns waste into resources.", img: imgRel2, to: "/services/material-recovery-facility", icon: Recycle },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Commercial"
      breadcrumb="Skip Bin & Dumpster Rental"
      h1="Skip Bin & Dumpster Rental"
      subhead="Right-sized skip bins and dumpsters for construction, renovation, commercial operations, and ongoing site needs."
      heroImage={imgHero}
      heroAlt="Skip bin and dumpster from CEVONS placed on a construction site in Guyana"
      benefits={["Multiple sizes available","Short and long-term rental","Timely delivery and swap-outs","Site-friendly placement","Responsible waste disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
