import { Award, Calendar, Leaf, MapPin, Star, Target, Trophy, Users } from "lucide-react";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { WhatsApp } from "@/components/icons/WhatsApp";


const heroBg = "/assets/heroes/hero-homepage.webp";

const stats = [
  { icon: Award, value: "29+", label: "Years of Excellence" },
  { icon: Users, value: "5000+", label: "Customers" },
  { icon: MapPin, value: "3", label: "Regions Served" },
  { icon: Leaf, value: "1 Goal", label: "A Cleaner Guyana" },
];

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
        minHeight: "calc(100vh - 72px)",
        // Preserve hero's original green color treatment after global
        // re-skin to orange-primary. Per Brand Guideline Step 4, the hero
        // is font-swap only — colors stay as previously designed.
        ["--cevons-green" as any]: "#006B35",
        ["--cevons-deep-green" as any]: "#003F27",
        ["--cevons-yellow" as any]: "#FFD200",
      }}
      aria-labelledby="home-hero-title"
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
        {/* Left-to-right dark fade so text sits on solid dark */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,24,15,.96) 0%, rgba(0,40,25,.92) 30%, rgba(0,50,32,.6) 52%, rgba(0,20,15,.15) 72%, rgba(0,0,0,.35) 100%)",
          }}
        />
        {/* Bottom depth */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,20,12,.7) 100%)",
          }}
        />
      </motion.div>

      {/* MAIN CONTENT GRID */}
      <div className="container-cevons relative z-10 grid grid-cols-1 items-center gap-8 py-8 md:py-10 lg:grid-cols-12 lg:gap-6 lg:py-12">
        {/* LEFT — text column */}
        <div className="max-w-2xl lg:col-span-7 pt-2 md:pt-4">
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
            className="hero-subhead-pro mt-3"
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
            className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 md:text-base"
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
            className="mt-5 flex flex-wrap gap-3"
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

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-5 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[
                "from-emerald-600 to-emerald-800",
                "from-yellow-500 to-amber-700",
                "from-red-500 to-red-800",
                "from-emerald-500 to-teal-700",
              ].map((g, i) => (
                <span
                  key={i}
                  className={`grid size-10 place-items-center rounded-full bg-gradient-to-br ${g} ring-2 ring-cevons-dark text-[11px] font-bold text-white`}
                  aria-hidden
                >
                  {["GA", "RP", "SK", "MD"][i]}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">5000+ Customers</p>
              <p className="text-white/70 text-xs md:text-sm">Across Georgetown, Linden &amp; Berbice</p>
              <div className="mt-1 flex items-center gap-0.5" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-cevons-yellow text-cevons-yellow" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* STATS PILL — sits inside content column so flag wave below stays clear */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="mt-5 rounded-full border border-cevons-green/30 bg-cevons-deep-green/75 px-4 py-2.5 backdrop-blur md:px-6 md:py-3"
            style={{ boxShadow: "0 10px 40px -12px rgba(15,163,74,.5)" }}
          >
            <ul className="grid grid-cols-2 gap-y-2.5 md:flex md:items-center md:justify-between md:gap-3">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <li
                  key={label}
                  className={
                    "flex items-center gap-2.5 px-1.5 md:flex-1 md:justify-center " +
                    (i > 0 ? "md:border-l md:border-white/15" : "")
                  }
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-cevons-yellow/60 text-cevons-yellow">
                    <Icon className="size-3.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-tight text-white md:text-base">{value}</p>
                    <p className="text-[10px] font-medium leading-tight text-white/75 md:text-[10.5px]">
                      {label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* RIGHT column intentionally empty — truck photo shows through background */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden />
      </div>



      {/* Flag wave accent — animated tri-color silk ribbons (in flow, above cert panel) */}
      <div
        aria-hidden
        className="hero-wave pointer-events-none relative z-[5] mt-auto h-[70px] w-full md:h-[90px]"
      >
        <div className="hero-wave__drift">
          {/* GREEN — widest, bottom-most */}
          <svg
            className="hero-wave__ribbon hero-wave__ribbon--green"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
          >
            <path d="M0,92 C360,70 720,58 1080,54 C1440,50 1800,58 2160,72 C2520,84 2700,88 2880,90 L2880,120 L0,120 Z" />
          </svg>
          {/* GOLD — mid accent band */}
          <svg
            className="hero-wave__ribbon hero-wave__ribbon--gold"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
          >
            <path d="M0,80 C420,50 880,38 1320,34 C1760,30 2200,42 2520,58 C2700,66 2820,70 2880,72 L2880,96 C2520,82 1760,70 1320,72 C880,74 420,84 0,104 Z" />
          </svg>
          {/* RED — top accent band */}
          <svg
            className="hero-wave__ribbon hero-wave__ribbon--red"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
          >
            <path d="M0,62 C480,28 960,16 1440,14 C1920,12 2400,24 2880,46 L2880,68 C2400,50 1920,40 1440,42 C960,44 480,56 0,84 Z" />
          </svg>
          {/* GEM SHEEN — diagonal light sweep */}
          <div className="hero-wave__sheen" />
        </div>
      </div>

      {/* CERTIFICATION PANEL */}
      <div className="container-cevons relative z-10 -mt-2 pb-5">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
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
                          "linear-gradient(135deg,#003F27 0%,#006B35 55%,#003F27 100%)",
                        boxShadow: "0 8px 22px -8px rgba(0,107,53,.5)",
                      }
                    : undefined
                }
              >
                <span
                  className={
                    "grid h-12 w-12 shrink-0 place-items-center rounded-full p-1.5 md:h-[52px] md:w-[52px] md:p-2 " +
                    (accent
                      ? "bg-cevons-deep-green/60 ring-2 ring-cevons-yellow/60"
                      : "bg-white ring-1 ring-cevons-border")
                  }
                >
                  {icon === "trophy" ? (
                    <Trophy className="h-full w-full text-cevons-yellow" strokeWidth={2} aria-hidden />
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
                      (accent ? "text-cevons-yellow" : "text-cevons-muted")
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
                {accent && <Target className="ml-auto size-5 shrink-0 text-cevons-yellow/70" aria-hidden />}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
