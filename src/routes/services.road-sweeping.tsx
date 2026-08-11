import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Truck, Landmark, Building2, PartyPopper, Construction, Wind, Trash2, Container } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-commercial.jpg";
import imgRel0 from "@/assets/svc-industrial.jpg";
import imgRel1 from "@/assets/svc-garbage.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "Road Sweeping Services in Guyana | CEVONS";
const PAGE_DESC = "Mechanical road sweeper hire for municipalities, business frontages, and event sites — clean streets protect air, water, and public health.";
const PAGE_URL = "/services/road-sweeping";

export const Route = createFileRoute("/services/road-sweeping")({
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
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Road Sweeping", category: "Facilities", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: Landmark, title: "Municipal Streets" },
  { icon: Building2, title: "Commercial Properties" },
  { icon: PartyPopper, title: "Event Sites" },
  { icon: Construction, title: "Construction Frontages" },
  { icon: Truck, title: "Industrial Yards" },
  { icon: Wind, title: "Post-Storm Cleanup" },
];

const faqs = [
  { q: "Do you offer one-off sweeps or scheduled contracts?", a: "Both. Municipal routes and business frontages typically move to a scheduled cadence; event and post-storm cleanups are booked as one-off jobs. Same fleet, same standard, different rhythm." },
  { q: "What kind of surfaces and areas can the sweepers handle?", a: "Urban streets, commercial car parks, industrial yards, construction frontages, and open event grounds. If it's paved and someone needs it clean, the fleet can service it." },
  { q: "Can you handle post-event cleanups?", a: "Yes — venues and organisers routinely book a sweeper for the morning after. Bulk debris is cleared first, then the sweeper takes the fine material that would otherwise blow around or wash into drains." },
  { q: "Where does the swept debris go?", a: "Collected material is transported to an approved disposal site under the same tracked chain as our other waste operations." },
  { q: "How do I book?", a: "Send us the location, area size, and preferred timing — we'll confirm the fleet slot and price. WhatsApp or Request a Quote both work." },
];

const related = [
  { title: "General Waste Management", body: "Scheduled commercial waste programs.", img: imgRel0, to: "/services/general-waste-management", icon: Trash2 },
  { title: "General Trash Collection", body: "Reliable household waste pickup.", img: imgRel1, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for cleanups.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The fleet, for hire",
    heading: "Municipal routes, business frontages, and post-event cleanup — one fleet",
    paragraphs: [
      "CEVONS operates a fleet of mechanical road sweepers available for hire across Guyana. The same equipment that runs municipal routes cleans commercial frontages and event grounds — sized to the site and scheduled around the way each customer actually uses their space.",
      "For municipalities that means dependable route coverage. For businesses that means a clean approach to your building on the mornings that matter. For event organisers it means the venue looks the way it did before the event by the time the neighbours are up.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Public health infrastructure",
    heading: "Clean streets protect air quality, water quality, and community health",
    paragraphs: [
      "Street sweeping is not cosmetic. Fine debris and dust left on paved surfaces becomes airborne, washes into drains, and ends up in waterways — three separate public-health impacts that a well-run sweeping programme quietly prevents.",
      "That's why municipalities, businesses, and event organisers keep a sweeper on their calendar rather than waiting until the problem is visible.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Truck}
      eyebrowLabel="Facilities"
      breadcrumb="Road Sweeping"
      h1="Road Sweeping"
      subhead="Mechanical road sweeper hire for municipalities, business frontages, and event sites — because clean streets protect air quality, water quality, and community health."
      heroImage={imgHero}
      heroSlot="svc_road_sweeping_hero"
      heroAlt="CEVONS road sweeper cleaning a commercial street in Guyana"
      benefits={[
        "Fleet of road sweepers for hire",
        "Municipal, commercial, and event coverage",
        "Removes dust, debris, and pollutants",
        "Protects drains and waterways",
        "One-off or scheduled contracts",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="road-sweeping"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
