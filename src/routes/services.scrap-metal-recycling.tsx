import { createFileRoute } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { serviceJsonLdScripts } from "@/lib/seo/jsonLd";
import { Recycle, HardHat, Wrench, Factory, Truck, BatteryCharging, Building2, Container, Trash2, Phone } from "lucide-react";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { cevonsContact, primaryTelHref, whatsappHref } from "@/data/cevonsContact";
import { ServicePageTemplate, type DetailSection } from "@/components/ServicePageTemplate";
import { SlotImage } from "@/components/media/SlotImage";
import imgHeroAsset from "@/assets/scrap-metal-bales.webp.asset.json";
const imgHero = imgHeroAsset.url;
import imgRel0 from "@/assets/svc-recovery.jpg";
import imgRel1 from "@/assets/svc-commercial.jpg";
import imgRel2 from "@/assets/svc-skip.jpg";

const PAGE_TITLE = "We Buy Scrap Metal in Guyana | CEVONS";
const PAGE_DESC = "CEVONS buys scrap metal in Guyana — ferrous, non-ferrous, scrap cable and lead batteries. Licensed scrap metal dealer and exporter. Contact us for rates.";
const PAGE_URL = "/services/scrap-metal-recycling";

export const Route = createFileRoute("/services/scrap-metal-recycling")({
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
    scripts: serviceJsonLdScripts({ name: PAGE_TITLE, description: PAGE_DESC, path: PAGE_URL, breadcrumb: "Scrap Metal Recycling", category: "Recycling", faqs }),
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
    eyebrow: "What We Buy",
    heading: "What we buy",
    paragraphs: [
      "CEVONS purchases scrap metal from construction sites, workshops, manufacturers, and facility cleanouts across Guyana. If you have material sitting on site, we're the buyer.",
    ],
    bullets: [
      "Ferrous metals — steel, iron",
      "Non-ferrous metals — copper, aluminium, brass",
      "Scrap cable",
      "Lead batteries",
    ],
  },
  {
    variant: "split-left",
    eyebrow: "Selling to CEVONS",
    heading: "How selling works",
    paragraphs: [
      "Selling your scrap is a short, straightforward process — and you deal with a licensed buyer the whole way through.",
    ],
    bullets: [
      "Bring your scrap to our Georgetown yard, or book a pickup",
      "We weigh and inspect the material",
      "You get an offer",
    ],
  },
  {
    variant: "split-right",
    eyebrow: "Licensed & Accountable",
    heading: "A licensed dealer and exporter — not an informal buyer",
    paragraphs: [
      "CEVONS is a licensed scrap metal dealer and exporter in Guyana. For sellers, that licence isn't a formality — it's what makes the sale defensible. It means honest weights on calibrated scales, proper paperwork on every load, and a legal chain of custody from your yard through to export.",
      "For construction firms, workshops, and manufacturers, selling to a licensed buyer protects the business. There's a documented buyer, a documented volume, and a documented destination — the kind of trail auditors, insurers, and clients expect to see when scrap leaves your site.",
    ],
  },
  {
    variant: "band",
    eyebrow: "See it in action",
    heading: "Recycling at CEVONS",
    paragraphs: [
      "A short look at how the material we buy moves through our recycling operation — from intake through the yard.",
    ],
    videoEmbed: { youtubeId: "tR3CBoB09qg", title: "Recycling at CEVONS", poster: "/assets/services/recycling-video-poster.webp" },
  },
  {
    variant: "band",
    bandEmphasis: true,
    eyebrow: "Turn Scrap Into Revenue",
    heading: "Your scrap is worth selling",
    paragraphs: [
      "Scrap piling up is stalled revenue and a site hazard. Sell it to a licensed buyer with calibrated weights and clear paperwork, and that pile turns into money back in the business — handled legitimately from the first weigh-in to the export container.",
    ],
  },
];

const faqs = [
  { q: "What metals do you buy?", a: "Ferrous metals such as steel and iron, plus non-ferrous streams including copper, aluminium, and brass. We also buy scrap cable and lead batteries." },
  { q: "Do you buy one-off loads or arrange recurring pickups?", a: "Both. One-off sales suit end-of-project cleanouts and site demobilizations. Recurring pickups work best for workshops, contractors, and manufacturers with steady scrap output." },
  { q: "Can I sell directly at the yard?", a: "Yes — our Georgetown scrap metal yard accepts drop-offs from sellers. Contact us ahead for hours, directions, and confirmation on your material." },
  { q: "How do you work out what you'll pay?", a: "We weigh the material on calibrated scales and inspect the grade, then make you an offer based on current market rates. Rates are updated every two weeks in line with the market — contact us for today's rates." },
  { q: "Why does the licence matter when I sell?", a: "A licensed dealer means legitimate weights, proper documentation, and a legal export chain. For your business, it's the audit trail that shows the material was sold through the right channels." },
];


const related = [
  { title: "Material Recovery Facility", body: "Industrial-scale sorting and recovery.", img: imgRel0, to: "/services/material-recovery-facility", icon: Recycle },
  { title: "General Waste Management", body: "Scheduled commercial collection programs.", img: imgRel1, to: "/services/general-waste-management", icon: Trash2 },
  { title: "Skip Bin & Dumpster Rental", body: "Right-sized containers for projects and sites.", img: imgRel2, to: "/services/skip-bin-dumpster-rental", icon: Container },
];

const galleryImages = [
  { slot: "svc_scrap_gallery_1", src: "/assets/services/scrap-metal-loading.webp", alt: "A CEVONS worker loading scrap steel into the baling press at the CEVONS recycling facility", w: 800, h: 1200 },
  { slot: "svc_scrap_gallery_2", src: "/assets/services/scrap-metal-yard.webp", alt: "CEVONS crew feeding scrap metal into the baler beside stacked IBC cages at the recycling yard", w: 1200, h: 800 },
  { slot: "svc_scrap_gallery_3", src: "/assets/services/scrap-metal-bales.webp", alt: "Compressed scrap metal bales at the CEVONS recycling facility, ready for export", w: 800, h: 1200 },
  { slot: "svc_scrap_gallery_4", src: "/assets/services/scrap-metal-shear.webp", alt: "The CEVONS baling press with its jaw raised, being loaded with scrap metal", w: 800, h: 1200 },
];

function GallerySection() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-page)]" aria-labelledby="gallery-h">
      <div className="container-cevons">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">On the Ground</p>
          <h2 id="gallery-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Inside our recycling operation</h2>
          <p className="mt-4 text-cevons-muted leading-relaxed">Real photos from the CEVONS scrap yard — the crew, the equipment, and the bales headed for export.</p>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {galleryImages.map((img) => (
            <SlotImage
              key={img.src}
              slot={img.slot}
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

function RatesPanel() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-page)]" aria-labelledby="rates-h">
      <div className="container-cevons">
        <div
          className="relative overflow-hidden rounded-[28px] p-8 sm:p-10 md:p-12 shadow-[0_24px_60px_-28px_rgba(0,0,64,0.55)] ring-1 ring-black/5"
          style={{ backgroundColor: "var(--brand-navy)" }}
        >
          <svg aria-hidden="true" className="absolute -bottom-24 -right-24 w-[360px] h-[360px] pointer-events-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="100" fill="var(--brand-orange)" opacity="0.18" />
          </svg>
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--brand-yellow)" }}>
              Current Rates
            </p>
            <h2 id="rates-h" className="text-2xl md:text-3xl font-extrabold" style={{ color: "#FFFFFF" }}>
              Scrap metal rates are updated every two weeks in line with the market.
            </h2>
            <p className="mt-3 text-base md:text-lg" style={{ color: "var(--brand-grey-light, #E8EAED)" }}>
              Contact us for today&rsquo;s rates.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="cta-btn-wa">
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
              <a href={primaryTelHref} className="cta-btn-primary">
                <Phone className="size-5" /> {cevonsContact.primaryPhone}
              </a>
            </div>
          </div>
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
      h1="We Buy Scrap Metal"
      subhead="CEVONS pays for ferrous and non-ferrous metals, scrap cable, and lead batteries — a licensed scrap metal dealer and exporter in Guyana. Sell a one-off load or set up recurring pickups."
      heroImage={imgHero}
      heroSlot="svc_scrap_metal_hero"
      heroAlt="CEVONS scrap metal yard with ferrous and non-ferrous material sorted for export"
      benefits={[
        "We buy — you get paid for your scrap",
        "Licensed scrap metal dealer and exporter",
        "Ferrous and non-ferrous metals purchased",
        "Scrap cable and lead batteries bought",
        "Sell at our Georgetown yard or book a pickup",
      ]}
      commonUses={uses}
      faqs={faqs}
      related={related}
      serviceSlug="scrap-metal-recycling"
      ctaLabel="Sell Your Scrap Metal"
      helpHeading="Ready to Sell?"
      helpBody="Tell us what you have and how much, and our buying team will weigh, inspect, and make you an offer."
      detailSections={detailSections}
      optionsSection={<><RatesPanel /><GallerySection /></>}
      showAssistBand
    />

  );
}
