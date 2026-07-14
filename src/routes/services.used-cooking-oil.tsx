import { createFileRoute } from "@tanstack/react-router";
import { Utensils, ChefHat, Hotel, Building2, Flame, Recycle, Container, Droplet } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-oil.jpg";
import imgRel0 from "@/assets/svc-grease.jpg";
import imgRel1 from "@/assets/svc-recovery.jpg";
import imgRel2 from "@/assets/svc-commercial.jpg";

const PAGE_TITLE = "Used Cooking Oil Collection in Guyana | CEVONS";
const PAGE_DESC = "Scheduled used cooking oil collection from CEVONS for restaurants, hotels, and commercial kitchens across Guyana. Right-sized receptacles and reliable pickups.";
const PAGE_URL = "/services/used-cooking-oil";

export const Route = createFileRoute("/services/used-cooking-oil")({
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
  { icon: Utensils, title: "Restaurants" },
  { icon: ChefHat, title: "Commercial Kitchens" },
  { icon: Hotel, title: "Hotels & Resorts" },
  { icon: Building2, title: "Cafeterias" },
  { icon: Flame, title: "Fry Shops" },
  { icon: Recycle, title: "Institutional Kitchens" },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The Collection Program",
    heading: "Right-sized receptacle, right schedule — oil out before it becomes a problem",
    paragraphs: [
      "Used cooking oil is one of the easiest kitchen streams to get wrong. Too small a container and it overflows between pickups; too infrequent a schedule and staff start looking for shortcuts. CEVONS sets both up correctly from day one — a receptacle sized to your actual fry volume and a pickup schedule matched to how fast you fill it.",
      "Once the program is running, oil leaves the kitchen the same way every week: sealed, contained, and on a route. No overflowing drums by the back door, no drums doubling as prep-line hazards, and no last-minute calls when a fryer needs to be changed out.",
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Fryer to Recycling — Not Down the Drain",
    heading: "The wrong destination costs more than the right one",
    paragraphs: [
      "Cooking oil poured down a sink hardens into the pipes, chokes grease traps, and backs up the whole kitchen at the worst possible moment. A scheduled collection program routes the oil out of the building for recycling instead — protecting your plumbing, your grease trap, and your compliance record in one move.",
    ],
  },
];

const faqs = [
  { q: "Who is this service for?", a: "Restaurants, hotels, cafeterias, resorts, and any commercial kitchen producing used cooking oil on a regular basis." },
  { q: "How is the receptacle chosen?", a: "We look at your fryer setup and typical output, then recommend a container size that holds comfortably between scheduled pickups — no overflow, no wasted capacity." },
  { q: "How often are pickups?", a: "Frequency is matched to your volume. Higher-output kitchens are on shorter cycles; lower-volume sites go on a longer schedule. It's adjusted anytime your operation changes." },
  { q: "Does this help with grease trap issues?", a: "Yes — pulling used oil out of the kitchen through a proper container is the single biggest thing you can do to protect the grease trap and drainage lines. It's often the root cause behind repeat grease trap problems." },
  { q: "What happens to the oil?", a: "Collected oil is transported for recycling rather than dumped into drains, waste bins, or the environment." },
];

const related = [
  { title: "Grease Trap / Septic Tank", body: "Grease trap and septic servicing for kitchens.", img: imgRel0, to: "/services/grease-trap-septic-tank", icon: Droplet },
  { title: "Material Recovery Facility", body: "Sorting and recovery infrastructure.", img: imgRel1, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel2, to: "/services/general-waste-management", icon: Container },
];

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Utensils}
      eyebrowLabel="Recycling"
      breadcrumb="Used Cooking Oil"
      h1="Used Cooking Oil Collection"
      subhead="Scheduled collection of used cooking oil from restaurants, hotels, and commercial kitchens — right-sized receptacles, reliable pickups, responsible recycling."
      heroImage={imgHero}
      heroAlt="CEVONS used cooking oil collection service at a commercial restaurant kitchen"
      benefits={[
        "Right-sized receptacles for your kitchen",
        "Scheduled or on-call collection",
        "Reliable, discreet pickups",
        "Kept out of drains and the environment",
        "Transported for recycling",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="used-cooking-oil"
      detailSections={detailSections}
      showAssistBand
    />
  );
}
