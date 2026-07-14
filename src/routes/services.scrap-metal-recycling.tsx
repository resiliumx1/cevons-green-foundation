import { createFileRoute } from "@tanstack/react-router";
import { Recycle, HardHat, Wrench, Factory, Truck, BatteryCharging, Building2, Container, Trash2 } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-scrap.jpg";
import imgRel0 from "@/assets/svc-recovery.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "Scrap Metal Recycling in Guyana | CEVONS";
const PAGE_DESC = "Licensed scrap metal collection, processing, and export from CEVONS. Ferrous and non-ferrous metals, scrap cable, and lead batteries across Guyana.";
const PAGE_URL = "/services/scrap-metal-recycling";

export const Route = createFileRoute("/services/scrap-metal-recycling")({
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
  { icon: HardHat, title: "Construction Sites" },
  { icon: Wrench, title: "Workshops & Garages" },
  { icon: Factory, title: "Manufacturing" },
  { icon: BatteryCharging, title: "Lead Batteries" },
  { icon: Truck, title: "Scrap Cable" },
  { icon: Building2, title: "Facility Cleanouts" },
];

const faqs = [
  { q: "Is CEVONS a licensed scrap metal dealer?", a: "Yes — CEVONS is a licensed scrap metal dealer and exporter in Guyana, operating a scrap metal yard in Georgetown." },
  { q: "What metals do you accept?", a: "We handle ferrous and non-ferrous metals, scrap cable, and lead batteries. Contact us to confirm your material." },
  { q: "Do you offer one-off or recurring pickups?", a: "Both. We arrange one-off collections for cleanouts and recurring pickups for workshops, contractors, and manufacturers." },
  { q: "Can I drop off scrap at the yard?", a: "Yes — our Georgetown scrap metal yard accepts drop-offs. Contact us for hours and directions." },
  { q: "How do I request a collection?", a: "WhatsApp us or use Request a Quote with your location, material type, and estimated volume." },
];

const related = [
  { title: "Material Recovery Facility", body: "Industrial-scale sorting and recovery.", img: imgRel0, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Recycling"
      breadcrumb="Scrap Metal Recycling"
      h1="Scrap Metal Recycling"
      subhead="Licensed scrap metal collection, processing, and export for ferrous and non-ferrous streams — one-off cleanouts or recurring pickups across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS scrap metal yard with ferrous and non-ferrous material sorted for export"
      benefits={[
        "Licensed scrap metal dealer and exporter",
        "Ferrous and non-ferrous metals accepted",
        "Scrap cable and lead batteries handled",
        "One-off and recurring collections",
        "Georgetown scrap metal yard",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
    />
  );
}
