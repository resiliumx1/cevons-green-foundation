import { Calendar, ShieldCheck, Leaf, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { HeroSlideshowCard } from "@/components/home/HeroSlideshowCard";
import { useT } from "@/contexts/SettingsContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: 0.05 * i },
  }),
};

export function HomeHero() {
  const t = useT();

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background: "var(--surface-page, #ffffff)",
        ["--cevons-green" as any]: "var(--brand-orange)",
      }}
      aria-labelledby="home-hero-title"
    >
      <div className="container-cevons relative py-10 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* LEFT — editorial text column */}
          <div className="lg:col-span-6 xl:col-span-6">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] md:text-xs"
              style={{ color: "var(--brand-orange)" }}
            >
              Guyana&apos;s Trusted Waste Management Partner
            </motion.p>

            <motion.h1
              id="home-hero-title"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="hero-heading"
              style={{
                color: "var(--brand-charcoal, #1A1A1A)",
                textShadow: "none",
                fontSize: "clamp(2rem, 5vw, 4.25rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
              }}
            >
              <span className="hero-heading-line">{t("home.hero.lineA")}</span>
              <span className="hero-heading-line">
                <span className="eco-word growth-flow" aria-label={t("home.hero.lineB1")}>
                  {t("home.hero.lineB1")}
                </span>{" "}
                {t("home.hero.lineB2")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="hero-subhead-pro mt-5"
              style={{ color: "var(--brand-charcoal, #1A1A1A)" }}
            >
              <span>{t("home.hero.subFor")}</span>{" "}
              <span>{t("home.hero.subForB")}</span>{" "}
              <span className="for-guyana">{t("home.hero.subForC")}</span>
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-4 max-w-xl text-base leading-relaxed md:text-lg"
              style={{ color: "var(--brand-grey-dark, #4A4A4A)" }}
            >
              {t("home.hero.lead")}{" "}
              <strong style={{ color: "var(--brand-charcoal, #1A1A1A)", fontWeight: 700 }}>
                {t("home.hero.leadCountry")}
              </strong>
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-7 flex flex-wrap gap-3"
            >
              <a href="/contact" className="hero-cta hero-cta--whatsapp hero-cta--stacked group">
                <span className="hero-cta__icon">
                  <WhatsApp className="size-4" />
                </span>
                <span className="hero-cta__text">
                  <span className="hero-cta__label">{t("home.hero.ctaWhatsappLabel")}</span>
                  <span className="hero-cta__sub">{t("home.hero.ctaWhatsappSub")}</span>
                </span>
              </a>
              <a href="/request-service" className="hero-cta hero-cta--schedule hero-cta--stacked group">
                <Calendar className="size-5 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                <span className="hero-cta__text">
                  <span className="hero-cta__label">{t("home.hero.ctaScheduleLabel")}</span>
                  <span className="hero-cta__sub">{t("home.hero.ctaScheduleSub")}</span>
                </span>
              </a>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
              style={{ color: "var(--brand-charcoal, #1A1A1A)" }}
              aria-label="Service guarantees"
            >
              {[
                { Icon: CheckCircle2, label: t("home.hero.trust.reliable") },
                { Icon: ShieldCheck, label: t("home.hero.trust.safe") },
                { Icon: Leaf, label: t("home.hero.trust.sustainable") },
              ].map(({ Icon, label }, i, arr) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: "var(--brand-orange)" }} aria-hidden="true" />
                  <span className="font-semibold">{label}</span>
                  {i < arr.length - 1 && (
                    <span aria-hidden="true" className="ml-3 h-3 w-px" style={{ background: "rgba(0,0,0,0.15)" }} />
                  )}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* RIGHT — slideshow media card */}
          <div className="lg:col-span-6 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            >
              <HeroSlideshowCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
