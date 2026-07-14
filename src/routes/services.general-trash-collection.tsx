import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Home, Building, Users, Trees, Recycle, Container, Droplet, Waves } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-garbage.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-septic.jpg";
import imgRel2 from "@/assets/svc-toilet.jpg";

const PAGE_TITLE = "General Trash Collection in Guyana | CEVONS";
const PAGE_DESC = "Reliable household trash collection across Georgetown, Linden, and Berbice — scheduled pickup that keeps your community clean.";
const PAGE_URL = "/services/general-trash-collection";

export const Route = createFileRoute("/services/general-trash-collection")({
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
  { icon: Home, title: "Single-Family Homes" },
  { icon: Building, title: "Apartments & Condos" },
  { icon: Users, title: "Neighborhoods & HOAs" },
  { icon: Trees, title: "Yard Waste" },
  { icon: Trash2, title: "Household Waste" },
  { icon: Recycle, title: "Recyclables" },
];

const faqs = [
  { q: "How often is my trash collected?", a: "Most residential customers are on a weekly service, though many neighborhoods and HOAs opt for twice-weekly collection. Your pickup day is confirmed when your account is set up and stays consistent week to week." },
  { q: "What bin sizes do you offer?", a: "We supply 120L wheelie bins for smaller households, 240L bins for the typical family home, and 360L bins for larger households or shared premises. During your waste audit we recommend the size that fits your household output and storage space." },
  { q: "Which areas do you currently service?", a: "Residential routes run across Georgetown, Linden, Berbice (both West Coast and East Coast), East Coast Demerara, and East Bank Demerara. New subscriptions in adjacent communities are added as routes are extended." },
  { q: "What if my collection is missed?", a: "Missed pickups are rare, but if it happens please contact us the same day via WhatsApp or phone. We dispatch a return trip promptly and log the incident to prevent recurrence." },
  { q: "How do bulky items and yard waste work?", a: "Bagged yard waste can go out with your normal pickup. Bulky items — furniture, appliances, large garden clearances — are booked as a separate on-demand pickup so the crew arrives with the right vehicle." },
  { q: "How do I sign up for residential service?", a: "Submit a service request or WhatsApp our team with your address. We confirm coverage, agree on bin size and pickup day, and start service on the next available route." },
];

const related = [
  { title: "Dumpster Rental", body: "Short or long term dumpsters for home cleanouts.", img: imgRel0, to: "/services/dumpster-rental", icon: Container },
  { title: "Septic Services", body: "Safe, efficient septic tank pumping for homes.", img: imgRel1, to: "/services/septic-services", icon: Droplet },
  { title: "Portable Toilet", body: "Clean portable toilet rentals for events and projects.", img: imgRel2, to: "/services/portable-toilet", icon: Waves },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Built around your household",
    heading: "Waste solutions tailored to you",
    paragraphs: [
      "Every home generates waste differently. Before we set your schedule, a CEVONS advisor walks through a short waste audit with you — how many people live in the home, where the bin is stored, how much yard waste you produce, and how often you'd like the truck to come.",
      "From that assessment we recommend the right wheelie bin size and the right pickup frequency, so you're never crowding the bin between visits or paying for capacity you don't use.",
      "Every collection is performed by highly trained CEVONS drivers operating the largest waste-collection fleet in Guyana — a level of coverage that lets us hold reliable schedules week after week.",
    ],
    images: [
      { src: "/services/detail/residential-collection-3.webp", alt: "CEVONS crew servicing a residential wheelie bin" },
    ],
  },
  {
    variant: "gallery",
    eyebrow: "Residential Garbage Collection",
    heading: "Quality, cost-effective pickup for the communities we serve",
    paragraphs: [
      "CEVONS provides residential collection for municipalities, Neighborhood Democratic Councils (NDCs), single-family homes, individual subscription customers, and homeowner associations across the coast.",
      "Whether we're servicing an entire ward on a municipal contract or a single household on subscription, the standard is the same: uniformed crews, clean vehicles, and consistent pickup days you can plan around.",
    ],
    bullets: [
      "Georgetown",
      "Linden",
      "Berbice — West Coast & East Coast",
      "East Coast Demerara",
      "East Bank Demerara",
    ],
    images: [
      { src: "/services/detail/residential-collection-1.webp", alt: "CEVONS residential collection truck on a Guyana street" },
      { src: "/services/detail/residential-collection-2.webp", alt: "CEVONS collection crew emptying household bins" },
      { src: "/services/detail/residential-collection-3.webp", alt: "Wheelie bin serviced at a single-family home" },
      { src: "/services/detail/residential-collection-4.webp", alt: "CEVONS route vehicle in a residential neighborhood" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "The CEVONS Difference",
    heading: "The market leader for residential waste in Guyana since 1997",
    paragraphs: [
      "For nearly three decades, homes and communities across Guyana have relied on CEVONS to keep their neighborhoods clean. That track record is built on dependable schedules, professional crews, and EPA-aligned disposal at licensed sites — not shortcuts.",
      "When you subscribe to residential collection with CEVONS, you're choosing the operator that municipalities, NDCs, and homeowner associations already trust to run their routes.",
    ],
  },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Trash2}
      eyebrowLabel="Residential"
      breadcrumb="General Trash Collection"
      h1="General Trash Collection"
      subhead="Dependable household waste pickup on a schedule that fits your home and community across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS residential garbage collection truck on a Guyana street"
      benefits={["Scheduled weekly pickup", "Friendly, uniformed crews", "Modern collection vehicles", "Coverage across Guyana", "EPA-aligned disposal"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="general-trash-collection"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
