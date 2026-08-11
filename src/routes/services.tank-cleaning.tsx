import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { Beaker, Flame, Droplet, Factory, Anchor, Wrench, Waves, ShieldAlert } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-tank.jpg";
import imgRel0 from "@/assets/svc-oil.jpg";
import imgRel1 from "@/assets/svc-wastewater.jpg";
import imgRel2 from "@/assets/svc-hazardous.jpg";

const PAGE_TITLE = "Industrial Tank Cleaning in Guyana | CEVONS";
const PAGE_DESC = "Professional tank cleaning — inspection, high-pressure washing, and final rinse — delivered safe, compliant, and certified.";
const PAGE_URL = "/services/tank-cleaning";

export const Route = createFileRoute("/services/tank-cleaning")({
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
  { icon: Flame, title: "Fuel Storage Tanks" },
  { icon: Beaker, title: "Chemical Tanks" },
  { icon: Droplet, title: "Water & Process Tanks" },
  { icon: Factory, title: "Industrial Vessels" },
  { icon: Anchor, title: "Marine & Port Tanks" },
  { icon: Wrench, title: "Maintenance Shutdowns" },
];

const faqs = [
  { q: "Which tank types do you clean?", a: "Fuel storage, lubricant, chemical, process, and water tanks — plus marine and industrial vessels. Scope is confirmed at inspection, because the right approach depends as much on the last product stored as on the tank itself." },
  { q: "How much downtime should I plan for?", a: "The three-phase process — inspection and preparation, residue removal and high-pressure washing, final rinse and inspection — is scoped against your operating window. Turnarounds are the most common scheduling model; standalone cleans are booked around production wherever possible." },
  { q: "How is confined-space safety handled?", a: "Confined-space entry and continuous gas monitoring are part of every applicable job. The team, the equipment, and the permits arrive together — not the tank crew waiting on the safety kit." },
  { q: "What happens to the residues removed from the tank?", a: "Removed material is characterised and routed through the appropriate disposal or recycling pathway — the same tracked chain we use for wastewater and hazardous streams, with documentation attached." },
  { q: "What certification do I get at the end?", a: "A clean, inspected, and certified tank ready for return to service, backed by the inspection and disposal records. That's the whole reason for using a specialist crew instead of an in-house wash." },
];

const related = [
  { title: "Used Waste Oil", body: "Collection and recycling of waste oils.", img: imgRel0, to: "/services/used-waste-oil", icon: Flame },
  { title: "Wastewater", body: "Industrial wastewater collection and treatment.", img: imgRel1, to: "/services/wastewater", icon: Waves },
  { title: "Hazardous Waste", body: "Regulated hazardous waste handling and disposal.", img: imgRel2, to: "/services/hazardous-waste", icon: ShieldAlert },
];

const detailSections: DetailSection[] = [
  {
    variant: "gallery",
    eyebrow: "The three-phase process",
    heading: "How CEVONS turns a fouled tank into a certified, ready-for-service asset",
    paragraphs: [
      "Professional tank cleaning is a sequenced job — each phase depends on the one before it, and skipping steps is how tanks fail their next inspection. CEVONS runs the same three-phase process on every job, whether it's a fuel tank in a turnaround window or a chemical vessel between campaigns:",
    ],
    bullets: [
      "Phase 1 — Inspection and preparation: assess the tank, its last contents, and site access; set up isolation, permits, and confined-space controls",
      "Phase 2 — Residue removal and high-pressure washing: remove sludges and residues, then high-pressure wash the internal surfaces",
      "Phase 3 — Final rinse and inspection: rinse, verify surface condition, and hand the tank back ready for return to service",
    ],
    images: [
      { src: "/services/detail/tank-cleaning-inspection.webp", alt: "CEVONS crew during tank inspection and preparation phase", caption: "Phase 1 — Inspection & preparation" },
      { src: "/services/detail/tank-cleaning-washing.webp", alt: "High-pressure washing of an industrial tank interior", caption: "Phase 2 — Cleaning & high-pressure washing" },
      { src: "/services/detail/tank-cleaning-rinse.webp", alt: "Final rinse and inspection of an industrial tank", caption: "Phase 3 — Final rinse & inspection" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Safe, compliant, certified",
    heading: "On time, within budget, ready to trade",
    paragraphs: [
      "The commitment on every tank cleaning job is the same: a safe operation, a compliant paper trail, a certified outcome, and a schedule that matches your operating window. That's what CEVONS delivers — clean tanks, on time, within budget.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Beaker}
      eyebrowLabel="Industrial"
      breadcrumb="Tank Cleaning"
      h1="Industrial Tank Cleaning"
      subhead="Professional cleaning of fuel, chemical, water, and industrial tanks — inspection, high-pressure washing, and final rinse, delivered safe and certified."
      heroImage={imgHero}
      heroSlot="svc_tank_cleaning_hero"
      heroAlt="CEVONS industrial tank cleaning crew working at a fuel storage facility"
      benefits={["Three-phase certified process","Confined-space safety protocols","High-pressure washing systems","Documented residue disposal","Scheduled around your turnaround"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="specialist"
      serviceSlug="tank-cleaning"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
