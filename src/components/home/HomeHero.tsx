import { Calendar } from "lucide-react";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { ConveyorBand } from "@/components/home/ConveyorBand";

const heroBg = "/assets/heroes/hero-homepage.webp";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.05 * i },
  }),
};

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col overflow-hidden bg-cevons-dark"
      style={{
        minHeight: "min(760px, calc(100vh - 72px))",
        ["--cevons-green" as any]: "#EF7700",
        ["--cevons-deep-green" as any]: "#1A1A1A",
        ["--cevons-yellow" as any]: "#FCE722",
      }}
      aria-labelledby="home-hero-title"
      data-hero-scope
    >
      {/* Background photo — truck dominates right side */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: bgY }}>
        <img
          src={heroBg}
          alt="CEVON'S environmental services truck on a Guyanese road at golden hour"
          className="size-full object-cover object-right"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="sync"
        />
        {/* Charcoal wash so orange accents read cleanly over the photo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,15,15,.96) 0%, rgba(26,26,26,.92) 30%, rgba(26,26,26,.6) 52%, rgba(20,20,20,.15) 72%, rgba(0,0,0,.35) 100%)",
          }}
        />
        {/* Bottom depth */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,10,.7) 100%)",
          }}
        />
      </motion.div>

      {/* MAIN CONTENT GRID */}
      <div className="container-cevons relative z-10 grid flex-1 grid-cols-1 items-center gap-6 py-4 md:py-6 lg:grid-cols-12 lg:gap-6 lg:py-6">
        {/* LEFT — text column */}
        <div className="max-w-2xl lg:col-span-7 pt-0">
          <motion.h1
            id="home-hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="hero-heading"
            style={{ fontSize: "clamp(1.9rem, 4.6vw, 4.25rem)", lineHeight: 1.04 }}
          >
            <span className="hero-heading-line">Cleaner Today.</span>
            <span className="hero-heading-line">
              <span className="eco-word growth-flow" aria-label="Greener">
                Greener
                <span className="leaf-field" aria-hidden="true">
                  {[
                    { x: "8%",  s:  8, d: 18, dl: -2,  op: 0.28, c: "linear-gradient(135deg,#A8E6A0,#2E7D32 60%,#1F5130)" },
                    { x: "32%", s: 10, d: 16, dl: -7,  op: 0.32, c: "linear-gradient(135deg,#7BD389,#4CAF50 60%,#2E7D32)" },
                    { x: "64%", s:  7, d: 20, dl: -4,  op: 0.25, c: "linear-gradient(135deg,#9CE89E,#2E7D32 60%,#1F5130)" },
                    { x: "88%", s: 11, d: 17, dl: -11, op: 0.3,  c: "linear-gradient(135deg,#B6FF7A,#4CAF50 60%,#1F5130)" },
                  ].map((l, i) => (
                    <span
                      key={`lf-${i}`}
                      className="lf"
                      style={{
                        ["--x" as any]: l.x,
                        ["--size" as any]: `${l.s}px`,
                        ["--dur" as any]: `${l.d}s`,
                        ["--delay" as any]: `${l.dl}s`,
                        ["--op" as any]: l.op,
                        background: l.c,
                      }}
                    />
                  ))}
                </span>
              </span>{" "}
              Tomorrow.
            </span>
          </motion.h1>


          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="hero-subhead-pro mt-2"
          >
            <span>For Homes.</span>{" "}
            <span>For Businesses.</span>{" "}
            <span className="for-guyana">For Guyana.</span>
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 md:text-base"
          >
            From residential collection to industrial waste management, CEVON'S delivers
            reliable, safe, and sustainable environmental solutions across{" "}
            <strong className="font-bold text-white">Guyana.</strong>
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
                <span className="hero-cta__label">WhatsApp Us</span>
                <span className="hero-cta__sub">Chat with our team</span>
              </span>
            </a>
            <a href="/request-service" className="hero-cta hero-cta--schedule hero-cta--stacked group">
              <Calendar className="size-5 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <span className="hero-cta__text">
                <span className="hero-cta__label">Schedule a Service</span>
                <span className="hero-cta__sub">Fast &amp; easy booking</span>
              </span>
            </a>
          </motion.div>
        </div>

        {/* RIGHT column intentionally empty — truck photo shows through background */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden />
      </div>

      {/* FULL-WIDTH conveyor strip pinned to the bottom of the hero */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="relative z-10 mt-auto w-full"
      >
        <ConveyorBand variant="hero-bottom" />
      </motion.div>
    </section>
  );
}

