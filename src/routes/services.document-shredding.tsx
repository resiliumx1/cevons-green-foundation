import { createFileRoute } from "@tanstack/react-router";
import { Building2, FileText, HeartPulse, Landmark, PackageX, School, ShieldCheck, Trash2 } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-shred.jpg";
import imgRel0 from "@/assets/svc-destruction.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-commercial.jpg";

const TITLE = "Document Shredding in Guyana | CEVONS Environmental Services";
const DESC = "Ongoing and one-time verified document destruction — secure, convenient, environmentally friendly, and open to witnessing.";
const PAGE_URL = "/services/document-shredding";

export const Route = createFileRoute("/services/document-shredding")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: ShreddingPage,
});

const uses = [
  { icon: Building2, title: "Offices" },
  { icon: Landmark, title: "Banks" },
  { icon: School, title: "Schools" },
  { icon: Landmark, title: "Government Offices" },
  { icon: HeartPulse, title: "Healthcare Facilities" },
  { icon: ShieldCheck, title: "Legal & Professional" },
];

const faqs = [
  { q: "Can we watch our documents being shredded?", a: "Yes. Clients are always welcome to witness the shredding of their documents. Witnessed destruction is one of the reasons organisations move from in-office shredders to a service — it removes any ambiguity about the outcome." },
  { q: "What console sizes do you offer, and where do they go?", a: "Consoles are sized to your generation rate and placed where staff already dispose of paper — beside printers, in file rooms, at reception. You get the right number and the right size after we've seen the site." },
  { q: "What happens to the shredded paper?", a: "It's routed to recycling — the environmentally friendly side of the service, and part of why organisations pick shredding over throwing paper in the general waste stream." },
  { q: "How do one-time purges work?", a: "For file-room clearouts, office moves, or periodic purges, we schedule a one-off destruction project sized to the volume. No console programme required — just the one job, done properly, with the same verified destruction as the ongoing service." },
  { q: "Do you provide certificates of destruction?", a: "Yes. Destruction records are provided so the compliance file matches the physical work — the same discipline we apply to product destruction." },
];

const related = [
  { title: "Product Destruction", body: "Controlled destruction of expired or recalled products.", img: imgRel0, to: "/services/product-destruction", icon: PackageX },
  { title: "General Waste Management", body: "Reliable commercial waste collection.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Dumpster Rental", body: "Dumpster rental for cleanouts and projects.", img: imgRel2, to: "/services/dumpster-rental", icon: Trash2 },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Verified destruction",
    heading: "Secure, convenient, environmentally friendly — and you can watch it happen",
    paragraphs: [
      "CEVONS document shredding is the right service for any organisation that needs ongoing or bulk verified destruction of sensitive documents. It's secure by design, convenient enough that staff actually use it, and environmentally friendly because the paper ends up recycled rather than in landfill.",
      "Clients are always welcome to witness the shredding of their own documents. That option is the whole point of using a service rather than a corner shredder — the outcome is verifiable, not assumed.",
    ],
    images: [
      { src: "/services/detail/shredding-operation.webp", alt: "CEVONS document shredding operation in progress" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Two ways to run the service",
    heading: "Ongoing consoles, one-time purges — no contracts, no long-term obligation",
    paragraphs: [
      "Ongoing service is built for continuous destruction. We supply collection consoles sized to your needs, placed where staff already handle paper, and rotated on a cadence that matches your generation rate. There is no contract and no long-term obligation at any point — the service earns its place by working, not by locking you in.",
      "One-time service handles the other half of the picture: special-project destruction for one-off purges, office moves, and file-room clearouts. Same verified destruction, same optional witnessing, just scoped as a single job.",
    ],
    images: [
      { src: "/services/detail/shredding-consoles.webp", alt: "CEVONS document shredding collection console" },
      { src: "/services/detail/shredding-onetime.webp", alt: "CEVONS one-time document destruction purge" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Why organisations shred",
    heading: "Protect your customers, your employees, and your reputation",
    paragraphs: [
      "Every business holds customer lists, confidential client information, credit card and sales receipts, personnel and payroll records. Customers hand over that information under an implied contract that it will be protected — and shredding is how that contract is honoured when the paperwork's useful life ends.",
      "Employees, past and present, have a legal right to protection of insurance records, employment applications, time cards, health records, and accident and attendance reports. And a dumpster of unshredded paper behind a building is one of the easiest sources of a sensational headline any organisation can leave for itself.",
      "A shredding programme closes all of that down — quietly, verifiably, on a cadence that fits.",
    ],
  },
];

function ShreddingPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={FileText}
      eyebrowLabel="Document Shredding"
      breadcrumb="Document Shredding"
      h1="Document Shredding"
      subhead="Ongoing and one-time verified document destruction — secure, convenient, environmentally friendly, and open to witnessing at any time."
      heroImage={imgHero}
      heroAlt="Secure document shredding bins ready for collection"
      benefits={[
        "Ongoing or one-time service",
        "Witnessing always welcomed",
        "Consoles sized to your site",
        "No contracts, no lock-in",
        "Shredded paper is recycled",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="document-shredding"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
