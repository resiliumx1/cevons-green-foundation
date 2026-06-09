import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Trash2, FileText, Droplet, Recycle, Cylinder, Leaf, Container, Waves, ChevronRight, Home, Building2, Flame, Brush, PackageX, Scissors } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import forestBg from "@/assets/forest-bg.jpg";
import imgGarbage from "@/assets/svc-garbage.jpg";
import imgSkip from "@/assets/svc-skip.jpg";
import imgDumpster from "@/assets/svc-dumpster.jpg";
import imgToilet from "@/assets/svc-toilet.jpg";
import imgSeptic from "@/assets/svc-septic.jpg";
import imgOil from "@/assets/svc-oil.jpg";
import imgWastewater from "@/assets/svc-wastewater.jpg";
import imgScrap from "@/assets/svc-scrap.jpg";
import imgShred from "@/assets/svc-shred.jpg";
import imgRecovery from "@/assets/svc-recovery.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "CEVON'S Services | Waste Management & Environmental Services in Guyana" },
      { name: "description", content: "Explore CEVON'S residential, commercial, industrial, recycling, and environmental services across Georgetown, Linden, and Berbice." },
      { property: "og:title", content: "CEVON'S Services | Waste Management & Environmental Services in Guyana" },
      { property: "og:description", content: "Explore CEVON'S residential, commercial, industrial, recycling, and environmental services across Georgetown, Linden, and Berbice." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

type Category = "All Services" | "Residential" | "Commercial" | "Industrial" | "Recycling & Facilities";
const categories: Category[] = ["All Services", "Residential", "Commercial", "Industrial", "Recycling & Facilities"];

type Service = {
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  img: string;
  cats: Exclude<Category, "All Services">[];
  alt: string;
};

const services: Service[] = [
  { title: "Residential Garbage Collection", body: "Reliable household waste collection across Guyana.", icon: Home, img: imgGarbage, alt: "CEVON'S residential garbage collection truck on a Guyanese street", cats: ["Residential"] },
  { title: "Commercial Garbage Collection", body: "Scheduled waste collection for businesses and properties.", icon: Building2, img: imgGarbage, alt: "Commercial garbage collection at a Guyana business", cats: ["Commercial"] },
  { title: "Skip Bin Rental", body: "Various sizes for different types of projects.", icon: Container, img: imgSkip, alt: "Industrial skip bin on a construction site in Guyana", cats: ["Commercial", "Industrial"] },
  { title: "Dumpster Rental", body: "Short or long term dumpster rental solutions.", icon: Trash2, img: imgDumpster, alt: "Green commercial dumpster ready for rental", cats: ["Residential", "Commercial"] },
  { title: "Portable Toilet Rental", body: "Clean, reliable and hygienic portable toilets.", icon: Droplet, img: imgToilet, alt: "Row of clean portable toilets at an event site", cats: ["Commercial"] },
  { title: "Septic Tank Clearance", body: "Safe and efficient septic tank pumping.", icon: Droplet, img: imgSeptic, alt: "Vacuum truck performing septic tank clearance", cats: ["Residential", "Commercial"] },
  { title: "Waste Oil Recycling", body: "Environmentally responsible waste oil collection.", icon: Cylinder, img: imgOil, alt: "Stacked waste oil barrels at a recycling facility", cats: ["Industrial", "Recycling & Facilities"] },
  { title: "Lube Oil Disposal", body: "Safe disposal of used lubricating oils for industry.", icon: Cylinder, img: imgOil, alt: "Used lube oil barrels prepared for safe disposal", cats: ["Industrial"] },
  { title: "Cooking Oil Recycling", body: "Collection and recycling of used cooking oil.", icon: Droplet, img: imgOil, alt: "Used cooking oil containers ready for recycling", cats: ["Commercial", "Recycling & Facilities"] },
  { title: "Wastewater Treatment", body: "Treatment and disposal of industrial wastewater.", icon: Waves, img: imgWastewater, alt: "Industrial wastewater treatment tanks", cats: ["Industrial"] },
  { title: "Scrap Metal", body: "We buy and recycle all types of scrap metal.", icon: Recycle, img: imgScrap, alt: "Sorted scrap metal at a recycling yard", cats: ["Recycling & Facilities", "Industrial"] },
  { title: "Document Shredding", body: "Secure shredding of sensitive documents.", icon: FileText, img: imgShred, alt: "Secure document shredding bins", cats: ["Commercial"] },
  { title: "Product Destruction", body: "Certified destruction of expired or recalled products.", icon: PackageX, img: imgShred, alt: "Secure product destruction facility", cats: ["Commercial", "Industrial"] },
  { title: "Plastic Shredding", body: "On-site plastic shredding to support recycling.", icon: Scissors, img: imgScrap, alt: "Plastic shredding equipment processing waste plastic", cats: ["Recycling & Facilities", "Industrial"] },
  { title: "Road Sweeping", body: "Mechanical road and lot sweeping for clean roadways.", icon: Brush, img: imgGarbage, alt: "Road sweeping truck cleaning a Guyana roadway", cats: ["Commercial", "Industrial"] },
  { title: "Compactor Rental", body: "Compactor rental for high-volume waste sites.", icon: Container, img: imgDumpster, alt: "Industrial waste compactor on site", cats: ["Commercial", "Industrial"] },
  { title: "Incineration", body: "Safe incineration for regulated waste streams.", icon: Flame, img: imgWastewater, alt: "Industrial incineration facility", cats: ["Industrial", "Recycling & Facilities"] },
];

function ServicesPage() {
  const [active, setActive] = useState<Category>("All Services");
  const filtered = active === "All Services" ? services : services.filter((s) => s.cats.includes(active));

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="services-h1">
        <div className="absolute inset-0">
          <img src={forestBg} alt="" aria-hidden="true" className="size-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-cevons-deep-green/95 via-cevons-deep-green/85 to-cevons-deep-green/60" />
        </div>
        <div className="container-cevons relative min-h-[320px] md:min-h-[400px] flex flex-col justify-center py-16 md:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="reveal mb-5">
            <ol className="flex items-center gap-1.5 text-xs md:text-sm text-white/80">
              <li><Link to="/" className="hover:text-cevons-yellow transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-cevons-yellow font-semibold">Services</li>
            </ol>
          </nav>
          <h1 id="services-h1" className="reveal text-white text-4xl md:text-6xl font-extrabold tracking-tight" style={{ animationDelay: "80ms" }}>
            Our Services
          </h1>
          <p className="reveal mt-4 text-white/85 text-base md:text-xl max-w-2xl" style={{ animationDelay: "160ms" }}>
            Complete waste management and environmental solutions.
          </p>
        </div>
        <div className="brand-ribbon" aria-hidden="true" />
      </section>

      {/* Filter tabs */}
      <section aria-label="Filter services by category" className="border-b border-cevons-border bg-white sticky top-[72px] z-30">
        <div className="container-cevons py-4 flex flex-wrap gap-2 reveal">
          {categories.map((c) => {
            const isActive = active === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={isActive}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-cevons-green text-white border-cevons-green shadow-soft"
                    : "bg-white text-cevons-dark border-cevons-border hover:border-cevons-green hover:text-cevons-green"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Services grid */}
      <section className="section-y bg-white" aria-label="Service offerings">
        <div className="container-cevons">
          <h2 className="sr-only">All CEVON'S Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map(({ title, body, icon: Icon, img, alt }, i) => (
              <article
                key={title}
                className="group relative bg-white rounded-xl border border-cevons-border overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-cevons-green reveal"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cevons-cream">
                  <img
                    src={img}
                    alt={alt}
                    loading="lazy"
                    width={800}
                    height={500}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute -bottom-5 left-5 size-12 rounded-full bg-cevons-green text-white border-4 border-white flex items-center justify-center shadow-soft">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-6 pt-8">
                  <h3 className="text-lg font-bold text-cevons-dark">{title}</h3>
                  <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                  {title === "Dumpster Rental" ? (
                    <Link
                      to="/services/dumpster-rental"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green rounded"
                      aria-label={`Learn more about ${title}`}
                    >
                      Learn More <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <a
                      href="#"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green rounded"
                      aria-label={`Learn more about ${title}`}
                    >
                      Learn More <ArrowRight className="size-4" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border-2 border-cevons-green text-cevons-green bg-white hover:bg-cevons-green hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green focus-visible:ring-offset-2"
            >
              View All Services <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Sustainability / Brand story banner */}
      <section className="bg-cevons-cream" aria-labelledby="sustainability-heading">
        <div className="container-cevons py-12 md:py-20">
          <div className="rounded-2xl overflow-hidden shadow-soft grid md:grid-cols-2 bg-white">
            <div className="relative min-h-[280px] md:min-h-[420px] overflow-hidden group">
              <img
                src={imgRecovery}
                alt="CEVON'S team supporting sustainable environmental recovery in Guyana"
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="bg-cevons-deep-green text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
              <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-cevons-green/30 blur-3xl" />
              <p className="text-cevons-yellow text-xs font-bold uppercase tracking-[0.2em] inline-flex items-center gap-2 mb-3 relative">
                <Leaf className="size-4" /> Sustainability
              </p>
              <h2 id="sustainability-heading" className="text-3xl md:text-4xl font-extrabold leading-tight relative">
                Sustainable Today,<br />Better Tomorrow
              </h2>
              <p className="mt-4 text-white/85 leading-relaxed max-w-md relative">
                We are committed to protecting our environment through responsible waste
                management and sustainable practices across Guyana.
              </p>
              <div className="mt-7 relative">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-cevons-yellow text-cevons-dark hover:brightness-95 transition-all shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-cevons-deep-green"
                >
                  Learn More <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
