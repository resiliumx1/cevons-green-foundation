import { createFileRoute } from "@tanstack/react-router";
import { Flame, Wrench, Factory, Truck, Anchor, Building2, Droplet, ShieldAlert, Recycle } from "lucide-react";
import { ServicePageTemplate, type DetailSection, type RelatedService } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-oil.jpg";
import imgRel0 from "@/assets/svc-grease.jpg";
import imgRel1 from "@/assets/svc-hazardous.jpg";
import imgRel2 from "@/assets/svc-oil.jpg";

const PAGE_TITLE = "Used Waste Oil Collection in Guyana | CEVONS";
const PAGE_DESC = "Collection of used engine, transmission, and hydraulic oils, plus used oil filter recycling for garages, dealerships, and industry.";
const PAGE_URL = "/services/used-waste-oil";

export const Route = createFileRoute("/services/used-waste-oil")({
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
  { icon: Wrench, title: "Workshops & Garages" },
  { icon: Factory, title: "Manufacturing Plants" },
  { icon: Truck, title: "Fleet Operations" },
  { icon: Anchor, title: "Marine & Ports" },
  { icon: Building2, title: "Auto Dealerships" },
  { icon: Flame, title: "Heavy Equipment" },
];

const faqs = [
  { q: "Who typically uses this service?", a: "Auto dealerships, independent garages and workshops, fleet operators, industrial plants running hydraulic equipment, and marine operations — anywhere used lube oil or filters accumulate in meaningful volume." },
  { q: "Do you supply the storage containers?", a: "Yes. We supply containers sized to your workshop for safe on-site storage of used motor oil, along with totes for used oil filters collected during oil changes and specialised drums for fuel filters that still contain fluid." },
  { q: "Scheduled collection or call-in?", a: "Either. Steady generators — dealerships, fleets, larger workshops — usually run a scheduled cadence. Smaller shops call in when their drum's full. Both models are supported." },
  { q: "Can I mix used engine, transmission, and hydraulic oil in one container?", a: "Used lube oils — engine, transmission, hydraulic — can be consolidated for collection in most cases. Anything else (solvents, coolant, fuel, water) should be kept out of the used-oil container. Ask us if you're unsure what's in a drum." },
  { q: "What happens to the oil after collection?", a: "Collected oil is transported in our vehicles and routed through the compliant disposal and recycling chain — the same tracked chain we use for every hazardous stream." },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Used motor oil collection",
    heading: "Engine, transmission, hydraulic — collected safely, stored properly",
    paragraphs: [
      "CEVONS collects and safely disposes of used lube oils from workshops, plants, and fleet operations across Guyana — engine oil, transmission fluid, and hydraulic oil, from routine oil changes through to plant maintenance drain-downs.",
      "The service starts before the first collection: we supply the containers you need for safe on-site storage of used motor oil, so the workshop isn't relying on repurposed drums that leak or mislabel. When the container's full, we take it away and leave you set up for the next cycle.",
    ],
    images: [
      { src: "/services/detail/motor-oil-collection-1.webp", alt: "CEVONS used motor oil collection at an automotive workshop" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Oil filter recycling",
    heading: "The filter that comes off with the oil change deserves the same discipline",
    paragraphs: [
      "Used oil filters are collected and recycled from dealerships, automotive repair shops, and industrial processes. We supply totes for the filters coming off routine oil changes and specialised drums for fuel filters that still contain fluid — the two waste streams that need different handling and usually end up mixed together.",
      "Collection runs on a scheduled cadence for steady generators or on a call-in basis for lower volumes. Either way, the filters leave your shop the right way — properly contained, properly transported, properly routed.",
    ],
    images: [
      { src: "/services/detail/motor-oil-collection-2.webp", alt: "CEVONS used oil filter collection totes at a dealership service bay" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "One compliant chain",
    heading: "From the workshop drain pan to safe, tracked disposal",
    paragraphs: [
      "One provider supplies the containers, runs the collection, transports the material, and closes out the compliant disposal — the whole loop, so the shop's environmental obligations don't get stuck in the workshop.",
    ],
  },
];

const related: RelatedService[] = [
  { title: "Hazardous Waste", body: "Compliant handling of regulated waste streams.", img: imgRel1, to: "/services/hazardous-waste", icon: ShieldAlert },
  { title: "Used Cooking Oil", body: "Scheduled collection from restaurants and kitchens.", img: imgRel2, to: "/services/used-cooking-oil", icon: Droplet },
  { title: "Grease Trap / Septic Tank", body: "Servicing for kitchens and facilities.", img: imgRel0, to: "/services/grease-trap-septic-tank", icon: Recycle },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Flame}
      eyebrowLabel="Industrial"
      breadcrumb="Used Waste Oil"
      h1="Used Waste Oil Collection & Filter Recycling"
      subhead="Collection of used engine, transmission, and hydraulic oils, plus used oil filter recycling for garages, dealerships, and industrial operations."
      heroImage={imgHero}
      heroAlt="CEVONS waste oil collection truck servicing an industrial workshop"
      benefits={["Engine, transmission & hydraulic oils","Storage containers supplied","Filter totes and fuel-filter drums","Scheduled or call-in service","Compliant transport and disposal"]}
      commonUses={uses}
      faqs={faqs}
      ctaVariant="specialist"
      serviceSlug="used-waste-oil"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
