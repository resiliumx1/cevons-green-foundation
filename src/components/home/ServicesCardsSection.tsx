import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/contexts/SettingsContext";

type ServiceCard = {
  key: "industrial" | "recyclables" | "residential" | "commercial" | "specialised";
  tagColor: "green" | "orange";
  img: string;
  to: string;
};

const cards: ServiceCard[] = [
  { key: "industrial", tagColor: "orange", img: "/services/svc-industrial.webp", to: "/services/hazardous-waste" },
  { key: "recyclables", tagColor: "green", img: "/services/svc-recycling.webp", to: "/services/material-recovery-facility" },
  { key: "residential", tagColor: "green", img: "/services/svc-residential.webp", to: "/services/general-trash-collection" },
  { key: "commercial", tagColor: "orange", img: "/services/svc-commercial.webp", to: "/services/general-waste-management" },
  { key: "specialised", tagColor: "orange", img: "/services/svc-industrial.webp", to: "/services/biohazardous-disposal" },
];

export function ServicesCardsSection() {
  const t = useT();
  return (
    <section
      id="services"
      className="relative bg-white py-16 md:py-20"
      aria-labelledby="services-heading"
    >
      <div className="container-cevons">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#EF7700] mb-3">
              {t("home.services.eyebrow")}
            </p>
            <h2
              id="services-heading"
              className="text-[#1A1A1A] font-extrabold text-3xl md:text-5xl font-display"
            >
              {t("home.services.title1")}{" "}
              <span style={{ color: "#2E7D32" }}>{t("home.services.title2")}</span>
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#EF7700] hover:gap-3 transition-all"
          >
            {t("home.services.viewAll")} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {cards.map((c, i) => {
            const title = t(`home.services.cards.${c.key}.title`);
            const desc = t(`home.services.cards.${c.key}.desc`);
            const tag = t(`home.services.cards.${c.key}.tag`);
            return (
              <motion.div
                key={c.key}
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
                      alt={title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white shadow ${
                        c.tagColor === "green" ? "bg-[#2E7D32]" : "bg-cevons-green"
                      }`}
                    >
                      {tag}
                    </span>
                  </div>
                  <div className="p-5 pr-14 relative">
                    <h3 className="text-base font-bold text-cevons-dark leading-snug">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-xs text-cevons-muted leading-relaxed">
                      {desc}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesCardsSection;
