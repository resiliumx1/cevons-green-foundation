import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Droplet, Home, Building, AlertTriangle, Wrench, ClipboardCheck, Trash2, Waves } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHeroAsset from "@/assets/slide-septic.webp.asset.json";
const imgHero = (imgHeroAsset as { url: string }).url;
import imgRel0 from "@/assets/svc-garbage.jpg";
import imgRel1 from "@/assets/svc-toilet.jpg";
import imgRel2 from "@/assets/svc-grease.jpg";

const PAGE_TITLE = "Septic Services in Guyana | CEVONS";
const PAGE_DESC = "The most experienced septic team in Guyana — 8,500 to 10,500 litre trucks, licensed disposal, service in every region.";
const PAGE_URL = "/services/septic-services";

export const Route = createFileRoute("/services/septic-services")({
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
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Septic Services", category: "Residential", faqs }),
  }),
  component: Page,
});

const uses = [
  { icon: Home, title: "Single-Family Homes" },
  { icon: Building, title: "Small Apartments" },
  { icon: Droplet, title: "Routine Pumping" },
  { icon: AlertTriangle, title: "Overflow Response" },
  { icon: Wrench, title: "Maintenance Service" },
  { icon: ClipboardCheck, title: "Pre-Sale Inspections" },
];

const faqs = [
  { q: "What are the signs my septic tank needs emptying?", a: "The clearest signs are smells or wet patches around the tank and drainage field, drains that overflow or gurgle, and toilets or sinks that empty more slowly than usual. If any of those show up, book a service — waiting rarely makes it cheaper." },
  { q: "How often should I empty my septic tank?", a: "For a family of four, every three to four years is typical. Larger households should book at least every three years. Actual frequency depends on how much the tank is used, its capacity, and whether greywater is recycled — we'll advise once we've seen your setup." },
  { q: "Will you fully empty my tank?", a: "Yes. Our fleet runs from 8,500 to 10,500 litres, so we bring a truck sized to your tank and pump it out completely. Smaller operators often leave tanks half-done because their trucks fill up before the job does — that's not how we work." },
  { q: "How long does the job take?", a: "A straightforward empty takes around forty-five minutes from arrival to clean-up. Difficult access or unusually large tanks can extend that, but we'll flag it when we book." },
  { q: "How close does the truck need to get to the tank?", a: "Our trucks routinely carry around fifty metres of hose, so we can service most properties without driving onto sensitive ground. If your tank sits further from a hard road than that, tell us when you book and we'll bring extra hose." },
  { q: "Do your trucks leave a mess on my property?", a: "No. The fleet is modern and well-maintained, no oil drips, and the crew protects your driveway and lawn while they work. When we leave, the only sign we were there is a properly emptied tank." },
  { q: "What areas do you service?", a: "Every region of Guyana. Wherever your property is, we can get a truck to it." },
];

const related = [
  { title: "General Trash Collection", body: "Reliable household pickup on a schedule.", img: imgRel0, to: "/services/general-trash-collection", icon: Trash2 },
  { title: "Portable Toilet", body: "Clean portable toilet rentals for events and projects.", img: imgRel1, to: "/services/portable-toilet", icon: Waves },
  { title: "Grease Trap / Septic Tank", body: "Commercial grease trap and septic servicing.", img: imgRel2, to: "/services/grease-trap-septic-tank", icon: Droplet },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "The most experienced team in Guyana",
    heading: "Thousands of tanks emptied, in every region of the country",
    paragraphs: [
      "CEVONS has emptied thousands of septic tanks across Guyana over the years, and the crews doing that work today are the most experienced and qualified septic staff in the country. That experience is what turns a septic call from a disruption into a routine forty-five-minute job.",
      "The service is clean and efficient — the truck arrives on time, the tank is emptied fully, the property is left the way it was found, and every load is taken to a licensed disposal site approved by the Government of Guyana. There is no shortcut on where the waste goes.",
      "Pricing is fixed and competitive. What we quote is what you pay — no hidden charges, no surprise add-ons after the truck is on your driveway.",
    ],
    images: [
      { src: "/services/detail/septic-emptying.webp", alt: "CEVONS septic team emptying a residential tank in Guyana" },
    ],
  },
  {
    variant: "split-left",
    eyebrow: "The fleet advantage",
    heading: "8,500 to 10,500 litre trucks — a truck suitable for every job",
    paragraphs: [
      "The fleet ranges from 8,500 up to 10,500 litres of capacity, so we can send a truck sized to your tank instead of asking your tank to fit the truck. That's the difference between a tank that's genuinely empty and one that's been drawn down to whatever the visiting truck could carry.",
      "Our trucks also carry around fifty metres of hose as standard, which means we can service most properties without needing to drive onto lawns or sensitive ground. Longer runs are handled by bringing extra hose to the job — tell us when you book.",
    ],
    images: [
      { src: "/services/detail/septic-fleet.webp", alt: "CEVONS septic tanker fleet lined up ready for dispatch" },
    ],
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Clean, compliant, complete",
    heading: "Licensed disposal, government-approved sites, every region of Guyana",
    paragraphs: [
      "Every load leaves your property in a sealed tanker and ends its journey at a disposal site licensed and approved by the Government of Guyana. That compliance is non-negotiable, and it's the reason municipal and commercial customers use us alongside residential clients.",
      "Wherever you are in the country, we can get a truck to you — cleanly, on schedule, at a fixed price.",
    ],
  },
];

function FleetSection() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-page)]" aria-labelledby="fleet-h">
      <div className="container-cevons">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">Our Fleet</p>
          <h2 id="fleet-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">The equipment we bring to your property</h2>
          <p className="mt-4 text-cevons-muted leading-relaxed">Purpose-built vacuum tankers and trained CEVONS crews, serving homes and businesses across Georgetown, Linden and Berbice.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <figure className="rounded-2xl overflow-hidden shadow-soft bg-white border border-cevons-border">
            <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 sm:p-6">
              <img
                src="/assets/services/septic-tanker-angle.webp"
                alt="CEVONS vacuum tanker truck used for septic tank emptying, front three-quarter view"
                width={1200}
                height={857}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
            <figcaption className="border-t border-cevons-border px-4 py-3 text-center text-sm font-semibold text-cevons-dark">
              Vacuum tanker — septic tank emptying
            </figcaption>
          </figure>

          <figure className="rounded-2xl overflow-hidden shadow-soft bg-white border border-cevons-border">
            <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 sm:p-6">
              <img
                src="/assets/services/septic-tanker-side.webp"
                alt="CEVONS vacuum tanker truck, side profile showing the tank and suction equipment"
                width={600}
                height={272}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
            <figcaption className="border-t border-cevons-border px-4 py-3 text-center text-sm font-semibold text-cevons-dark">
              Tanker side profile — tank and suction equipment
            </figcaption>
          </figure>

          <figure className="rounded-2xl overflow-hidden shadow-soft bg-white border border-cevons-border">
            <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 sm:p-6">
              <img
                src="/assets/services/septic-truck-onsite.webp"
                alt="A CEVONS vacuum tanker on site in Guyana with a CEVONS operator in high-visibility gear"
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
            <figcaption className="border-t border-cevons-border px-4 py-3 text-center text-sm font-semibold text-cevons-dark">
              On-site collection — tanker and CEVONS operator
            </figcaption>
          </figure>


        </div>

      </div>
    </section>
  );
}

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Droplet}
      eyebrowLabel="Residential"
      breadcrumb="Septic Services"
      h1="Septic Services for Homes"
      subhead="The most experienced septic team in Guyana — 8,500 to 10,500 litre trucks, licensed disposal, and service in every region."
      heroImage={imgHero}
      heroVariant="full-bleed"
      heroSlot="svc_septic_services_hero"
      heroAlt="CEVONS septic tanker performing a residential tank emptying in Guyana"
      benefits={["Most experienced crews in Guyana","8,500–10,500 L truck sizes","~50 m of hose carried","Licensed government-approved disposal","Fixed, competitive prices"]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      ctaVariant="routine"
      serviceSlug="septic-services"
      detailSections={detailSections}
      optionsSection={<FleetSection />}
      showAssistBand

    />
  );
}
