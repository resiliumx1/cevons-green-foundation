import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.05 * i },
  }),
};

const items = [
  { img: "/assets/social-proof/epa-logo.webp", t: "EPA Certified", s: "Environmental Compliance" },
  { img: "/assets/social-proof/iso-logo.webp", t: "ISO 9001:2015", s: "Quality Management" },
  { img: "/assets/social-proof/gcci-logo.webp", t: "GCCI Member", s: "Private Sector Commission" },
];

export function CertificationPanel() {
  return (
    <section className="relative z-10 w-full bg-white py-6 md:py-8">
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {items.map(({ img, t, s }) => (
              <li
                key={t}
                className="flex items-center gap-3 rounded-xl border border-cevons-border bg-white px-3 py-2.5 md:px-4 md:py-3"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white p-1.5 ring-1 ring-cevons-border md:h-[52px] md:w-[52px] md:p-2">
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cevons-muted">
                    {t}
                  </p>
                  <p className="text-sm font-semibold leading-tight text-cevons-dark">
                    {s}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

export default CertificationPanel;
