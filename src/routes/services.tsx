import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Trash2, Factory, FileText, Droplet, Recycle, Cylinder, Leaf } from "lucide-react";
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
import imgRecycling from "@/assets/svc-residential.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services — CEVON'S Environmental Services" },
      { name: "description", content: "Complete waste management and environmental solutions: garbage collection, skip bins, dumpsters, portable toilets, septic clearance and recycling across Guyana." },
      { property: "og:title", content: "Our Services — CEVON'S" },
      { property: "og:description", content: "Complete waste management and environmental solutions across Guyana." },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

type Cat = "All" | "Residential" | "Commercial" | "Industrial" | "Recycling & Facilities";
const cats: Cat[] = ["All Services" as Cat, "Residential", "Commercial", "Industrial", "Recycling & Facilities"];

const services: { title: string; body: string; icon: React.ComponentType<{ className?: string }>; img: string; cat: Exclude<Cat, "All"> }[] = [
  { title: "Garbage Collection", body: "Reliable collection for homes and businesses.", icon: Trash2, img: imgGarbage, cat: "Residential" },
  { title: "Skip Bin Rental", body: "Various sizes for different types of projects.", icon: Trash2, img: imgSkip, cat: "Commercial" },
  { title: "Dumpster Rental", body: "Short or long term dumpster rental solutions.", icon: Trash2, img: imgDumpster, cat: "Commercial" },
  { title: "Portable Toilet Rental", body: "Clean, reliable and hygienic portable toilets.", icon: Droplet, img: imgToilet, cat: "Commercial" },
  { title: "Septic Tank Clearance", body: "Safe and efficient septic tank pumping.", icon: Droplet, img: imgSeptic, cat: "Residential" },
  { title: "Waste Oil Recycling", body: "Environmentally responsible waste oil collection.", icon: Cylinder, img: imgOil, cat: "Industrial" },
  { title: "Wastewater Treatment", body: "Treatment and disposal of industrial wastewater.", icon: Factory, img: imgWastewater, cat: "Industrial" },
  { title: "Scrap Metal Collection", body: "We buy and recycle all types of scrap metal.", icon: Recycle, img: imgScrap, cat: "Recycling & Facilities" },
  { title: "Document Shredding", body: "Secure shredding of sensitive documents.", icon: FileText, img: imgShred, cat: "Commercial" },
];

function ServicesPage() {
  const [active, setActive] = useState<string>("All Services");
  const filtered = active === "All Services" ? services : services.filter((s) => s.cat === active);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={forestBg} alt="" className="size-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-cevons-deep-green/90 via-cevons-deep-green/80 to-cevons-deep-green/60" />
        </div>
        <div className="container-cevons relative py-20 md:py-28">
          <p className="text-cevons-yellow text-xs font-bold uppercase tracking-[0.2em] mb-4">What We Do</p>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl">Our Services</h1>
          <p className="mt-4 text-white/80 text-base md:text-lg max-w-xl">
            Complete waste management and environmental solutions.
          </p>
        </div>
        <div className="brand-ribbon" aria-hidden="true" />
      </section>

      {/* Filter tabs */}
      <section className="border-b border-cevons-border bg-white sticky top-20 z-30">
        <div className="container-cevons py-4 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                active === c
                  ? "bg-cevons-green text-white border-cevons-green"
                  : "bg-white text-cevons-dark border-cevons-border hover:border-cevons-green hover:text-cevons-green"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(({ title, body, icon: Icon, img }, i) => (
              <article key={title} className="card-cevons group reveal" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={img} alt={title} loading="lazy" className="size-full object-cover transition-transform duration-500" />
                  <span className="absolute -bottom-5 left-5 size-12 rounded-full bg-cevons-green text-white border-4 border-white flex items-center justify-center shadow-soft">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="p-6 pt-8">
                  <h3 className="text-lg font-bold text-cevons-dark">{title}</h3>
                  <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                  <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
                    Learn More <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-base btn-outline-green px-6 py-3">View All Services <ArrowRight className="size-4" /></button>
          </div>
        </div>
      </section>

      {/* Sustainability banner */}
      <section className="bg-cevons-cream">
        <div className="container-cevons py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-xl overflow-hidden aspect-[16/10]">
            <img src={imgRecycling} alt="Sustainable waste collection" loading="lazy" className="size-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3 inline-flex items-center gap-2">
              <Leaf className="size-4" /> Sustainability
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
              Sustainable Today,<br />Better Tomorrow
            </h2>
            <p className="mt-4 text-cevons-muted leading-relaxed max-w-lg">
              We are committed to protecting our environment through responsible waste
              management and sustainable practices.
            </p>
            <a href="#" className="mt-6 inline-flex btn-base btn-yellow px-5 py-3">Learn More <ArrowRight className="size-4" /></a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
