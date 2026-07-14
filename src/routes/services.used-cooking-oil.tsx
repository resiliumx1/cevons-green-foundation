import { createFileRoute } from "@tanstack/react-router";
import { Utensils, ChefHat, Hotel, Building2, Flame, Recycle, Container, Droplet } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
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

const faqs = [
  { q: "Who is this service for?", a: "Restaurants, hotels, cafeterias, and any commercial kitchen that produces used cooking oil on a regular basis." },
  { q: "Do you provide the containers?", a: "Yes — we help you choose the right receptacle size for your volume and set up a pickup schedule that fits your operation." },
  { q: "How often are pickups?", a: "Pickup frequency is set to match your usage — weekly, biweekly, or on-call. Adjust anytime as your volume changes." },
  { q: "What happens to the oil?", a: "Collected oil is transported for recycling rather than dumped into drains or the environment." },
  { q: "How do I sign up?", a: "WhatsApp us or use Request a Quote with your location and estimated monthly volume — we'll confirm containers and schedule." },
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
    />
  );
}
