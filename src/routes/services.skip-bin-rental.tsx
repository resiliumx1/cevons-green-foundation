import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, Hammer, Home, Leaf, Recycle, Trash2 } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgSkip from "@/assets/svc-skip.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgScrap from "@/assets/svc-scrap.jpg";

const TITLE = "Skip Bin Rental in Guyana | CEVON'S Environmental Services";
const DESC = "Flexible skip bin rental from CEVON'S for projects, commercial properties, construction sites, and large cleanups across Guyana.";

export const Route = createFileRoute("/services/skip-bin-rental")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/skip-bin-rental" },
    ],
    links: [{ rel: "canonical", href: "/services/skip-bin-rental" }],
  }),
  component: SkipBinPage,
});

function SkipBinPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Container}
      eyebrowLabel="Skip Bin Rental"
      breadcrumb="Skip Bin Rental"
      h1="Skip Bin Rental"
      subhead="Flexible skip bin rental for projects, commercial properties, construction sites, and large cleanups across Guyana."
      heroImage={imgSkip}
      heroAlt="CEVON'S skip bin on a Guyana construction site"
      benefits={[
        "Multiple skip bin options",
        "Convenient delivery and pickup",
        "Ideal for projects and cleanups",
        "Suitable for commercial and construction use",
        "Responsible handling and disposal",
      ]}
      commonUses={[
        { icon: Hammer, title: "Construction" },
        { icon: Home, title: "Renovation" },
        { icon: Building2, title: "Business Cleanouts" },
        { icon: Leaf, title: "Yard Waste" },
        { icon: Container, title: "Commercial Projects" },
      ]}
      faqs={[
        { q: "What sizes of skip bins are available?", a: "We offer a range of skip bin sizes for different project types. Share your job details and we'll recommend an option that fits." },
        { q: "How long can I keep a skip bin?", a: "Short and long-term rental periods are both available. Let us know your timeline when you request service." },
        { q: "What can I place in the skip bin?", a: "General construction, renovation, household, and commercial waste are typically accepted. Hazardous and regulated waste must be confirmed in advance." },
        { q: "Do you deliver across Guyana?", a: "Yes — CEVON'S serves Georgetown, Linden, Berbice and surrounding areas. Reach out to confirm delivery to your location." },
        { q: "How do I get pricing?", a: "WhatsApp us or use Request a Quote and we'll respond with the right option for your project." },
      ]}
      related={[
        { title: "Dumpster Rental", body: "Short or long term dumpster rental solutions.", img: imgDumpster, to: "/services/dumpster-rental", icon: Trash2 },
        { title: "Commercial Garbage Collection", body: "Scheduled waste collection for businesses.", img: imgGarbage, to: "/services/commercial-garbage-collection", icon: Trash2 },
        { title: "Scrap Metal Collection", body: "Collection and recycling of all scrap metal.", img: imgScrap, to: "/services/scrap-metal-collection", icon: Recycle },
      ]}
    />
  );
}
