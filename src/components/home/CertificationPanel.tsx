import { motion, type Variants } from "framer-motion";
import { Target, Trophy } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.05 * i },
  }),
};

export function CertificationPanel() {
  return (
    <section className="relative z-10 -mt-8 w-full bg-white py-6 md:-mt-12 md:py-8">
      <div className="container-cevons">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          custom={1}
          className="rounded-2xl bg-white p-3 shadow-2xl md:p-4"
          style={{ boxShadow: "0 22px 60px -20px rgba(0,0,0,.55)" }}
        >
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { img: "/assets/social-proof/epa-logo.webp", t: "EPA Certified", s: "Environmental Compliance" },
              { img: "/assets/social-proof/iso-logo.webp", t: "ISO 9001:2015", s: "Quality Management" },
              { img: "/assets/social-proof/gcci-logo.webp", t: "GCCI Member", s: "Private Sector Commission" },
              {
                icon: "trophy" as const,
                t: "Market Leader",
                s: "Since 1997",
                note: "Delivering trusted environmental solutions for a cleaner, healthier Guyana.",
                accent: true,
              },
            ].map(({ img, icon, t, s, note, accent }) => (
              <li
                key={t}
                className={
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 md:px-4 md:py-3 " +
                  (accent ? "text-white" : "border border-cevons-border bg-white")
                }
                style={
                  accent
                    ? {
                        background:
                          "linear-gradient(135deg,#1A1A1A 0%,#262626 55%,#1A1A1A 100%)",
                        boxShadow: "0 8px 22px -8px rgba(239,119,0,.45)",
                        border: "1px solid rgba(239,119,0,.55)",
                      }
                    : undefined
                }
              >
                <span
                  className={
                    "grid h-12 w-12 shrink-0 place-items-center rounded-full p-1.5 md:h-[52px] md:w-[52px] md:p-2 " +
                    (accent
                      ? "bg-cevons-deep-green/60 ring-2 ring-cevons-green/70"
                      : "bg-white ring-1 ring-cevons-border")
                  }
                >
                  {icon === "trophy" ? (
                    <Trophy className="h-full w-full text-cevons-green" strokeWidth={2} aria-hidden />
                  ) : (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={
                      "text-[11px] font-bold uppercase tracking-wider " +
                      (accent ? "text-cevons-green" : "text-cevons-muted")
                    }
                  >
                    {t}
                  </p>
                  <p
                    className={
                      "text-sm font-semibold leading-tight " +
                      (accent ? "text-white" : "text-cevons-dark")
                    }
                  >
                    {s}
                  </p>
                  {note && (
                    <p className="mt-1 hidden text-[10.5px] leading-snug text-white/80 lg:block">
                      {note}
                    </p>
                  )}
                </div>
                {accent && <Target className="ml-auto size-5 shrink-0 text-cevons-green/80" aria-hidden />}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

export default CertificationPanel;
