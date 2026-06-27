import { Calendar, ShieldCheck, Leaf, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useRef } from "react";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { HeroPartnerCarousel } from "@/components/home/HeroPartnerCarousel";
import { HeroSlideshowProvider, HeroSlideshowBackground, HeroSlideshowControls } from "@/components/home/HeroSlideshow";
import { useT } from "@/contexts/SettingsContext";



const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.05 * i },
  }),
};

export function HomeHero() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <HeroSlideshowProvider>
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col overflow-hidden bg-cevons-dark"
      style={{
        height: "calc(100vh - 73px)",
        maxHeight: "calc(100vh - 73px)",
        paddingBottom: "32px",
        ["--cevons-green" as any]: "#EF7700",
        ["--cevons-deep-green" as any]: "#1A1A1A",
        ["--cevons-yellow" as any]: "#FCE722",
      }}
      aria-labelledby="home-hero-title"
      data-hero-scope
    >
      {/* Cinematic 5-slide background slideshow */}
      <HeroSlideshowBackground />
      {/* Slide indicators + progress (above content + partner band) */}
      <HeroSlideshowControls className="absolute left-1/2 -translate-x-1/2 z-30 bottom-[170px] md:bottom-[160px] lg:bottom-[156px]" />




      {/* MAIN CONTENT GRID */}
      <div className="container-cevons relative z-10 grid min-h-0 flex-1 grid-cols-1 items-center gap-4 py-2 md:py-3 lg:grid-cols-12 lg:gap-6 lg:py-4" data-hero-content>
        {/* LEFT — text column */}
        <div className="max-w-2xl lg:col-span-7 pt-0">
          <motion.h1
            id="home-hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="hero-heading"
            style={{ fontSize: "clamp(1.75rem, 4.6vw, 4.25rem)", lineHeight: 1.04 }}

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
            className="hero-subhead-pro mt-2"
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
            className="mt-2 md:mt-3 max-w-lg text-sm leading-relaxed text-white/85 md:text-base"
          >
            {t("home.hero.lead")}{" "}
            <strong className="font-bold text-white">{t("home.hero.leadCountry")}</strong>
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-4 flex flex-wrap gap-3"
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

          {/* Trust badge row */}
          <motion.ul
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90"
            aria-label="Service guarantees"
          >
            {[
              { Icon: CheckCircle2, label: t("home.hero.trust.reliable") },
              { Icon: ShieldCheck, label: t("home.hero.trust.safe") },
              { Icon: Leaf, label: t("home.hero.trust.sustainable") },
            ].map(({ Icon, label }, i, arr) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4" style={{ color: "#2E7D32" }} aria-hidden="true" />
                <span className="font-medium">{label}</span>
                {i < arr.length - 1 && (
                  <span aria-hidden="true" className="ml-3 h-3 w-px bg-white/25" />
                )}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* RIGHT column intentionally empty — truck photo shows through background */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden />
      </div>

      {/* SLIM partner-logo carousel pinned to the bottom of the hero */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={6}
        className="relative z-10 w-full shrink-0"
        data-hero-banner
      >
        <HeroPartnerCarousel />
      </motion.div>
    </section>
    </HeroSlideshowProvider>
  );
}


