import { Calendar, ShieldCheck, Leaf, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useRef } from "react";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { HeroSlideshowProvider, HeroSlideshowBackground, HeroSlideshowControls, HeroSlideCaption } from "@/components/home/HeroSlideshow";
import { useT } from "@/contexts/SettingsContext";
import { Editable, useEditableText } from "@/components/Editable";




const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.05 * i },
  }),
};

/** Optional CRM-managed copy overrides. Anything omitted falls back to i18n. */
export type HeroContent = Partial<{
  lineA: string;
  lineB1: string;
  lineB2: string;
  lead: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}>;

export function HomeHero({ content }: { content?: HeroContent } = {}) {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const c = (key: keyof HeroContent, fallback: string) => {
    const v = content?.[key];
    return v && v.trim() ? v : fallback;
  };
  // Highlight word is used twice (aria-label + text), so resolve it as a string.
  const lineB1 = useEditableText("home.hero.lineB1", c("lineB1", t("home.hero.lineB1")));
  const trust = [
    { Icon: CheckCircle2, id: "home.hero.trust.reliable", label: t("home.hero.trust.reliable") },
    { Icon: ShieldCheck, id: "home.hero.trust.safe", label: t("home.hero.trust.safe") },
    { Icon: Leaf, id: "home.hero.trust.sustainable", label: t("home.hero.trust.sustainable") },
  ];



  return (
    <HeroSlideshowProvider>
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col overflow-hidden bg-cevons-dark"
      style={{
        minHeight: "calc(100vh - 73px)",
        paddingBottom: "0px",
        ["--cevons-green" as any]: "var(--brand-orange)",
        ["--cevons-deep-green" as any]: "#1A1A1A",
        ["--cevons-yellow" as any]: "#FCE722",
      }}
      aria-labelledby="home-hero-title"
      data-hero-scope
    >
      {/* Cinematic 5-slide background slideshow */}
      <HeroSlideshowBackground />
      {/* Slide indicators + progress */}
      <HeroSlideshowControls className="absolute left-1/2 -translate-x-1/2 z-30 bottom-6" />
      {/* CRM-managed slide text (renders nothing for the static fallback slides) */}
      <HeroSlideCaption className="absolute right-6 bottom-16 z-30 hidden md:block" />





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
            <Editable id="home.hero.lineA" label="Hero headline line 1" as="span" className="hero-heading-line">
              {c("lineA", t("home.hero.lineA"))}
            </Editable>
            <span className="hero-heading-line">
              <span className="eco-word growth-flow" aria-label={lineB1}>
                {lineB1}
              </span>{" "}
              <Editable id="home.hero.lineB2" label="Hero headline line 2 remainder" as="span">
                {c("lineB2", t("home.hero.lineB2"))}
              </Editable>
            </span>

          </motion.h1>


          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="hero-subhead-pro mt-2"
          >
            <Editable id="home.hero.subFor" label="Hero subhead part 1" as="span" className="for-amber">
              {t("home.hero.subFor")}
            </Editable>{" "}
            <Editable id="home.hero.subForB" label="Hero subhead part 2" as="span" className="for-amber">
              {t("home.hero.subForB")}
            </Editable>{" "}
            <Editable id="home.hero.subForC" label="Hero subhead part 3" as="span" className="for-guyana">
              {t("home.hero.subForC")}
            </Editable>
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-2 md:mt-3 max-w-lg text-sm leading-relaxed text-white/85 md:text-base"
          >
            <Editable id="home.hero.lead" label="Hero paragraph" as="span">
              {c("lead", t("home.hero.lead"))}
            </Editable>{" "}

            <strong className="font-bold text-white">{t("home.hero.leadCountry")}</strong>
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-3 md:mt-4 flex flex-wrap gap-3"
          >
            <a href="/contact" className="hero-cta hero-cta--whatsapp hero-cta--stacked group">
              <span className="hero-cta__icon">
                <WhatsApp className="size-4" />
              </span>
              <span className="hero-cta__text">
                <span className="hero-cta__label">{c("ctaPrimaryLabel", t("home.hero.ctaWhatsappLabel"))}</span>
                <span className="hero-cta__sub">{t("home.hero.ctaWhatsappSub")}</span>
              </span>
            </a>
            <a href="/request-service" className="hero-cta hero-cta--schedule hero-cta--stacked group">
              <Calendar className="size-5 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <span className="hero-cta__text">
                <span className="hero-cta__label">{c("ctaSecondaryLabel", t("home.hero.ctaScheduleLabel"))}</span>
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
            className="mt-3 md:mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90"
            aria-label="Service guarantees"
          >
            {trust.map(({ Icon, id, label }, i, arr) => (
              <li key={id} className="flex items-center gap-2">
                <Icon className="size-4" style={{ color: "var(--brand-orange)" }} aria-hidden="true" />
                <Editable id={id} label="Trust label" as="span" className="font-medium">
                  {label}
                </Editable>

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
    </section>
    </HeroSlideshowProvider>
  );
}


