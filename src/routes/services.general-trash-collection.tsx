import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Home, Building, Users, Trees, Recycle, Container, Droplet, Waves } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-garbage.jpg";
import imgRel0 from "@/assets/dumpster.jpg";
import imgRel1 from "@/assets/septic.jpg";
import imgRel2 from "@/assets/toilet.jpg";

const PAGE_TITLE = "General Trash Collection in Guyana | CEVON'S";
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
  { q: "How often is trash collected?", a: "Most residential routes are serviced weekly. Pickup days depend on your area — contact us to confirm your schedule." },
  { q: "What types of waste are included?", a: "Standard household trash, kitchen waste, and bagged yard waste are included. Bulky items, hazardous materials, and construction debris are handled separately." },
  { q: "Do I need to provide my own bin?", a: "You can use your own bins or ask about CEVON'S collection containers. We'll recommend the right setup for your household." },
  { q: "What areas do you serve?", a: "CEVON'S serves Georgetown, Linden, and Berbice, with coverage across Guyana. Reach out to confirm service in your community." },
  { q: "How do I sign up?", a: "Send us a WhatsApp message or submit a request. We'll confirm your address, schedule, and start your service." },
];

const related = [
  { title: "Dumpster Rental", body: "Short or long term dumpsters for home cleanouts.", img: imgRel0, to: "/services/dumpster-rental", icon: Container },
  { title: "Septic Services", body: "Safe, efficient septic tank pumping for homes.", img: imgRel1, to: "/services/septic-services", icon: Droplet },
  { title: "Portable Toilet", body: "Clean portable toilet rentals for events and projects.", img: imgRel2, to: "/services/portable-toilet", icon: Waves },
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
      heroAlt="CEVON'S residential garbage collection truck on a Guyana street"
      benefits={["Scheduled weekly pickup","Friendly, uniformed crews","Modern collection vehicles","Coverage across Guyana","Clean, professional service"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
    />
  );
}
