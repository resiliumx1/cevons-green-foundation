import { createFileRoute } from "@tanstack/react-router";
import { Recycle, HardHat, Wrench, Factory, Truck, BatteryCharging, Building2, Container, Trash2 } from "lucide-react";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import imgHero from "@/assets/svc-scrap.jpg";
import imgRel0 from "@/assets/svc-recovery.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "Scrap Metal Recycling in Guyana | CEVONS";
const PAGE_DESC = "Licensed scrap metal collection, processing, and export from CEVONS. Ferrous and non-ferrous metals, scrap cable, and lead batteries across Guyana.";
const PAGE_URL = "/services/scrap-metal-recycling";

export const Route = createFileRoute("/services/scrap-metal-recycling")({
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
  { icon: HardHat, title: "Construction Sites" },
  { icon: Wrench, title: "Workshops & Garages" },
  { icon: Factory, title: "Manufacturing" },
  { icon: BatteryCharging, title: "Lead Batteries" },
  { icon: Truck, title: "Scrap Cable" },
  { icon: Building2, title: "Facility Cleanouts" },
];

const detailSections: DetailSection[] = [
  {
    variant: "split-right",
    eyebrow: "Licensed & Accountable",
    heading: "A licensed dealer and exporter — not an informal buyer",
    paragraphs: [
      "CEVONS is a licensed scrap metal dealer and exporter in Guyana. For sellers, that licence isn't a formality — it's what makes the transaction defensible. It means honest weights on calibrated scales, proper paperwork on every load, and a legal chain of custody from your yard through to export.",
      "For construction firms, workshops, and manufacturers, working with a licensed partner protects the business. There's a documented buyer, a documented volume, and a documented destination — the kind of trail auditors, insurers, and clients expect to see when scrap leaves your site.",
    ],
  },
  {
    variant: "split-left",
    eyebrow: "What We Handle",
    heading: "What we buy and collect",
    paragraphs: [
      "We handle the full spread of scrap streams a working site produces, from mixed steel off a job to end-of-life batteries out of a fleet workshop.",
    ],
    bullets: [
      "Ferrous metals — steel, iron, rebar, structural offcuts",
      "Non-ferrous metals — copper, aluminium, brass, stainless",
      "Scrap cable — insulated and bare",
      "Lead batteries — automotive and industrial",
      "Construction sites, workshops, manufacturers",
      "One-off collections or recurring pickups",
    ],
  },
  {
    variant: "band",
    eyebrow: "See it in action",
    heading: "Recycling at CEVONS",
    paragraphs: [
      "A short look at how material moves through our recycling operation — from collection through the yard.",
    ],
    videoEmbed: { youtubeId: "tR3CBoB09qg", title: "Recycling at CEVONS", poster: "/assets/services/recycling-video-poster.webp" },
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Turn Scrap Into Revenue",
    heading: "A licensed partner for material that has value",
    paragraphs: [
      "Scrap piling up is stalled revenue and a site hazard. With a licensed buyer, calibrated weights, and clear paperwork, that pile becomes cash back to the business — handled legitimately from the first weigh-in to the export container.",
    ],
  },
];

const faqs = [
  { q: "What metals do you accept?", a: "Ferrous metals such as steel, iron, and rebar, plus non-ferrous streams including copper, aluminium, brass, and stainless. We also collect scrap cable and lead batteries." },
  { q: "Do you offer one-off or recurring collections?", a: "Both. One-off pickups suit end-of-project cleanouts and site demobilizations. Recurring pickups work best for workshops, contractors, and manufacturers with steady scrap output." },
  { q: "Can I deliver directly to the yard?", a: "Yes — our Georgetown scrap metal yard accepts drop-offs. Contact us ahead for hours, directions, and confirmation on your material." },
  { q: "How does pricing work?", a: "Pricing is by weight and depends on the metal grade and current market rates. Weights are taken on calibrated scales and confirmed with paperwork at the point of sale." },
  { q: "Why does the licence matter?", a: "A licensed dealer means legitimate weights, proper documentation, and a legal export chain. For your business, it's the audit trail that shows the material was handled through the right channels." },
];

const related = [
  { title: "Material Recovery Facility", body: "Industrial-scale sorting and recovery.", img: imgRel0, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

const galleryImages = [
  { src: "/assets/services/scrap-metal-loading.webp", alt: "A CEVONS worker loading scrap steel into the baling press at the CEVONS recycling facility", w: 800, h: 1200 },
  { src: "/assets/services/scrap-metal-yard.webp", alt: "CEVONS crew feeding scrap metal into the baler beside stacked IBC cages at the recycling yard", w: 1200, h: 800 },
  { src: "/assets/services/scrap-metal-bales.webp", alt: "Compressed scrap metal bales at the CEVONS recycling facility, ready for export", w: 800, h: 1200 },
  { src: "/assets/services/scrap-metal-shear.webp", alt: "The CEVONS baling press with its jaw raised, being loaded with scrap metal", w: 800, h: 1200 },
];

function GallerySection() {
  return (
    <section className="section-y bg-[var(--surface-page)]" aria-labelledby="gallery-h">
      <div className="container-cevons">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">On the Ground</p>
          <h2 id="gallery-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Inside our recycling operation</h2>
          <p className="mt-4 text-cevons-muted leading-relaxed">Real photos from the CEVONS scrap yard — the crew, the equipment, and the bales headed for export.</p>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {galleryImages.map((img) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={img.w}
              height={img.h}
              loading="lazy"
              decoding="async"
              className="w-full mb-4 break-inside-avoid rounded-xl shadow-soft"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Page() {
  return (
    <ServicePageTemplate
      eyebrowIcon={Recycle}
      eyebrowLabel="Recycling"
      breadcrumb="Scrap Metal Recycling"
      h1="Scrap Metal Recycling"
      subhead="Licensed scrap metal collection, processing, and export for ferrous and non-ferrous streams — one-off cleanouts or recurring pickups across Guyana."
      heroImage={imgHero}
      heroAlt="CEVONS scrap metal yard with ferrous and non-ferrous material sorted for export"
      benefits={[
        "Licensed scrap metal dealer and exporter",
        "Ferrous and non-ferrous metals accepted",
        "Scrap cable and lead batteries handled",
        "One-off and recurring collections",
        "Georgetown scrap metal yard",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="scrap-metal-recycling"
      detailSections={detailSections}
      optionsSection={<GallerySection />}
      showAssistBand
    />
  );
}
