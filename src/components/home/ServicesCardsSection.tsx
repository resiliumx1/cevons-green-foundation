import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type ServiceCard = {
  tag: string;
  tagColor: "green" | "orange";
  title: string;
  desc: string;
  img: string;
  to: string;
};

const cards: ServiceCard[] = [
  {
    tag: "INDUSTRIAL",
    tagColor: "orange",
    title: "Industrial Waste",
    desc: "Safe handling of hazardous and industrial-scale waste streams.",
    img: "/services/svc-industrial.webp",
    to: "/services/hazardous-waste",
  },
  {
    tag: "RECYCLABLES",
    tagColor: "green",
    title: "Recyclables Collection",
    desc: "Material recovery that turns waste into reusable resources.",
    img: "/services/svc-recycling.webp",
    to: "/services/material-recovery-facility",
  },
  {
    tag: "RESIDENTIAL",
    tagColor: "green",
    title: "Residential Collection",
    desc: "Reliable home pickups across Georgetown, Linden and Berbice.",
    img: "/services/svc-residential.webp",
    to: "/services/general-trash-collection",
  },
  {
    tag: "COMMERCIAL",
    tagColor: "orange",
    title: "Commercial Solutions",
    desc: "Tailored waste programmes for businesses and properties.",
    img: "/services/svc-commercial.webp",
    to: "/services/general-waste-management",
  },
  {
    tag: "SPECIALISED",
    tagColor: "orange",
    title: "Specialised Services",
    desc: "Biohazardous, medical and sensitive-stream disposal you can trust.",
    img: "/services/svc-industrial.webp",
    to: "/services/biohazardous-disposal",
  },
];

export function ServicesCardsSection() {
  return (
    <section
      id="services"
      className="relative bg-cevons-dark py-16 md:py-20"
      aria-labelledby="services-heading"
    >
      <div className="container-cevons">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cevons-green mb-3">
              What We Offer
            </p>
            <h2
              id="services-heading"
              className="text-white font-extrabold text-3xl md:text-5xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Our <span style={{ color: "#2E7D32" }}>Services</span>
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-cevons-green hover:gap-3 transition-all"
          >
            View all services <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
            >
              <Link
                to={c.to}
                className="group relative block overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span
                    className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white shadow ${
                      c.tagColor === "green" ? "bg-[#2E7D32]" : "bg-cevons-green"
                    }`}
                  >
                    {c.tag}
                  </span>
                </div>
                <div className="p-5 pr-14 relative">
                  <h3 className="text-base font-bold text-cevons-dark leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-cevons-muted leading-relaxed">
                    {c.desc}
                  </p>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-4 right-4 grid place-items-center size-10 rounded-full bg-cevons-green text-white shadow-md transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesCardsSection;
