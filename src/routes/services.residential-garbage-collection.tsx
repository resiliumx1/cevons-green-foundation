import { createFileRoute } from "@tanstack/react-router";
import { Building2, Container, Droplet, Home, MapPin, Trash2, Users } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import imgResidential from "@/assets/svc-residential.jpg";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgSeptic from "@/assets/svc-septic.jpg";

const TITLE = "Residential Garbage Collection in Guyana | CEVON'S Environmental Services";
const DESC = "Reliable waste collection and environmental services from CEVON'S for homes and residential communities across Guyana.";

export const Route = createFileRoute("/services/residential-garbage-collection")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/residential-garbage-collection" },
    ],
    links: [{ rel: "canonical", href: "/services/residential-garbage-collection" }],
  }),
  component: ResidentialGarbagePage,
});

function ResidentialGarbagePage() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Home}
      eyebrowLabel="Residential Garbage Collection"
      breadcrumb="Residential Garbage Collection"
      h1="Residential Garbage Collection"
      subhead="Reliable waste collection and environmental services for homes and residential communities across Guyana."
      heroImage={imgResidential}
      heroAlt="CEVON'S residential garbage collection on a Guyana street"
      benefits={[
        "Regular collection support",
        "Residential service",
        "Clean community focus",
        "Easy inquiry process",
        "Reliable scheduling",
      ]}
      commonUses={[
        { icon: Home, title: "Homes" },
        { icon: Building2, title: "Apartments" },
        { icon: Users, title: "Residential Communities" },
        { icon: MapPin, title: "Private Properties" },
      ]}
      faqs={[
        { q: "Do you offer regular weekly pickup?", a: "Yes — regular collection schedules can be arranged. Contact us with your location to confirm options for your area." },
        { q: "Do you serve apartment complexes and communities?", a: "Yes. We support individual homes, apartments, and larger residential communities." },
        { q: "What areas do you cover?", a: "We serve Georgetown, Linden, Berbice and surrounding areas across Guyana." },
        { q: "How do I sign up for service?", a: "WhatsApp us or use Request a Quote with your address and preferred frequency." },
        { q: "Can I add extra pickups when needed?", a: "Yes — extra and one-off pickups can be coordinated alongside your regular schedule." },
      ]}
      related={[
        { title: "Commercial Garbage Collection", body: "Reliable waste collection for businesses.", img: imgCommercial, to: "/services/commercial-garbage-collection", icon: Building2 },
        { title: "Dumpster Rental", body: "Dumpster rental for home cleanouts and renovations.", img: imgDumpster, to: "/services/dumpster-rental", icon: Trash2 },
        { title: "Septic Tank Clearance", body: "Safe and efficient septic clearance.", img: imgSeptic, to: "/services/septic-tank-clearance", icon: Droplet },
      ]}
    />
  );
}

void Container;
