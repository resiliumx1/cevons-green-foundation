import { createFileRoute } from "@tanstack/react-router";
import { Building2, Calendar, Container, Droplet, Hammer, MapPin, Trash2, Users } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgToilet from "@/assets/svc-toilet.jpg";
import imgSkip from "@/assets/svc-skip.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgSeptic from "@/assets/svc-septic.jpg";

const TITLE = "Portable Toilet Rental in Guyana | CEVON'S Environmental Services";
const DESC = "Clean, reliable portable toilet rentals from CEVON'S for events, construction sites, businesses, and public facilities across Guyana.";

export const Route = createFileRoute("/services/portable-toilet-rental")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/portable-toilet-rental" },
    ],
    links: [{ rel: "canonical", href: "/services/portable-toilet-rental" }],
  }),
  component: PortableToiletPage,
});

function PortableToiletPage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Portable Toilet Rental"
      breadcrumb="Portable Toilet Rental"
      h1="Portable Toilet Rental"
      subhead="Clean and reliable portable toilet rentals for events, construction sites, businesses, and public facilities across Guyana."
      heroImage={imgToilet}
      heroAlt="Clean portable toilets supplied by CEVON'S"
      benefits={[
        "Clean portable units",
        "Delivery and setup",
        "Servicing options",
        "Event and construction use",
        "Reliable scheduling",
      ]}
      commonUses={[
        { icon: Hammer, title: "Construction Sites" },
        { icon: Users, title: "Events" },
        { icon: Users, title: "Public Gatherings" },
        { icon: MapPin, title: "Remote Sites" },
        { icon: Building2, title: "Commercial Locations" },
      ]}
      faqs={[
        { q: "How many portable toilets do I need?", a: "It depends on attendance, event duration, and site type. Share your details and we'll recommend a suitable number of units." },
        { q: "Do you handle delivery and setup?", a: "Yes — our team delivers, positions, and sets up units, and collects them at the end of your rental." },
        { q: "Is servicing available during the rental?", a: "Yes. For longer rentals and events we can schedule servicing to keep units clean throughout the period." },
        { q: "Do you supply toilets across Guyana?", a: "We serve Georgetown, Linden, Berbice and surrounding areas. Contact us to confirm delivery for your location." },
        { q: "How do I book?", a: "WhatsApp us or use Request a Quote with your dates, location, and expected attendance." },
      ]}
      related={[
        { title: "Skip Bin Rental", body: "Skip bins for events, projects, and cleanups.", img: imgSkip, to: "/services/skip-bin-rental", icon: Container },
        { title: "Dumpster Rental", body: "Flexible dumpster rental for all project types.", img: imgDumpster, to: "/services/dumpster-rental", icon: Trash2 },
        { title: "Septic Tank Clearance", body: "Safe and efficient septic clearance service.", img: imgSeptic, to: "/services/septic-tank-clearance", icon: Calendar },
      ]}
    />
  );
}
