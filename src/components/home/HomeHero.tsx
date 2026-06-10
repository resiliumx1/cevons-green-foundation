import { Award, Calendar, Leaf, MapPin, Star, Target, Users } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { WhatsApp } from "@/components/icons/WhatsApp";

const heroBg = "/assets/heroes/hero-homepage.webp";

const stats = [
  { icon: Award, value: "29+", label: "Years of Excellence" },
  { icon: Users, value: "1000+", label: "Happy Clients" },
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
  return (
    <section
      className="relative isolate flex flex-col overflow-hidden bg-cevons-dark"
      style={{ minHeight: "calc(100vh - 72px)" }}
      aria-labelledby="home-hero-title"
    >
      {/* Background photo — truck dominates right side */}
      <div className="absolute inset-0 -z-10">
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
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="container-cevons relative z-10 grid flex-1 grid-cols-1 items-center gap-8 py-8 md:py-10 lg:grid-cols-12 lg:gap-6 lg:py-12">
        {/* LEFT — text column */}
        <div className="max-w-2xl lg:col-span-7">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cevons-green md:text-xs"
          >
            <Leaf className="size-4" />
            One Partner. Total Solutions.
          </motion.p>

          <motion.h1
            id="home-hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="hero-heading mt-3"
            style={{ fontSize: "clamp(1.9rem, 4.6vw, 4.25rem)", lineHeight: 1.04 }}
          >
            <span className="hero-heading-line">Cleaner Today.</span>
            <span className="hero-heading-line">
              <span className="eco-word growth-flow" aria-label="Greener">
                Greener
                <span className="leaf-field" aria-hidden="true">
                  {[
                    { x: "4%",  s: 14, d: 12, dl: -1,  op: 0.6,  c: "linear-gradient(135deg,#7BD389,#4CAF50 60%,#2E7D32)" },
                    { x: "14%", s: 10, d: 14, dl: -5,  op: 0.45, c: "linear-gradient(135deg,#A8E6A0,#2E7D32 60%,#1F5130)" },
                    { x: "24%", s: 16, d: 11, dl: -8,  op: 0.55, c: "linear-gradient(135deg,#B6FF7A,#4CAF50 60%,#1F5130)" },
                    { x: "34%", s:  9, d: 16, dl: -3,  op: 0.4,  c: "linear-gradient(135deg,#8FE89A,#2E7D32 60%,#1F5130)" },
                    { x: "44%", s: 12, d: 13, dl: -10, op: 0.5,  c: "linear-gradient(135deg,#9CE89E,#4CAF50 60%,#2E7D32)" },
                    { x: "54%", s: 15, d: 10, dl: -6,  op: 0.55, c: "linear-gradient(135deg,#FFE789,#F5C518 60%,#B8860B)", gold: true },
                    { x: "62%", s:  8, d: 15, dl: -12, op: 0.35, c: "linear-gradient(135deg,#A8E6A0,#2E7D32 60%,#1F5130)" },
                    { x: "70%", s: 13, d: 12, dl: -2,  op: 0.5,  c: "linear-gradient(135deg,#B6FF7A,#4CAF50 60%,#2E7D32)" },
                    { x: "78%", s: 11, d: 14, dl: -7,  op: 0.45, c: "linear-gradient(135deg,#7BD389,#2E7D32 60%,#1F5130)" },
                    { x: "86%", s: 17, d: 11, dl: -4,  op: 0.55, c: "linear-gradient(135deg,#FFE789,#F5C518 60%,#B8860B)", gold: true },
                    { x: "92%", s:  9, d: 13, dl: -9,  op: 0.4,  c: "linear-gradient(135deg,#9CE89E,#4CAF50 60%,#1F5130)" },
                    { x: "50%", s: 12, d: 16, dl: -11, op: 0.45, c: "linear-gradient(135deg,#B6FF7A,#2E7D32 60%,#1F5130)" },
                  ].map((l, i) => (
                    <span
                      key={`lf-${i}`}
                      className={`lf${l.gold ? " gold" : ""}`}
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
                  {[
                    { x: "10%", y: "20%", d: 4.2, dl: -0.5 },
                    { x: "28%", y: "60%", d: 5.1, dl: -2 },
                    { x: "46%", y: "15%", d: 3.8, dl: -1.2 },
                    { x: "60%", y: "70%", d: 4.6, dl: -3.1 },
                    { x: "78%", y: "30%", d: 5.4, dl: -0.8 },
                    { x: "90%", y: "55%", d: 4.0, dl: -2.6 },
                  ].map((s, i) => (
                    <span
                      key={`sp-${i}`}
                      className="sp"
                      style={{
                        ["--x" as any]: s.x,
                        ["--y" as any]: s.y,
                        ["--dur" as any]: `${s.d}s`,
                        ["--delay" as any]: `${s.dl}s`,
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
              <p className="font-bold text-white">1000+ Happy Clients</p>
              <p className="text-white/70 text-xs md:text-sm">Across Georgetown, Linden &amp; Berbice</p>
              <div className="mt-1 flex items-center gap-0.5" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-cevons-yellow text-cevons-yellow" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT column intentionally empty — truck photo shows through background */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden />
      </div>

      {/* STATS PILL */}
      <div className="container-cevons relative z-10 pb-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-full border border-cevons-green/30 bg-cevons-deep-green/75 px-5 py-3 backdrop-blur md:px-8 md:py-4"
          style={{ boxShadow: "0 10px 40px -12px rgba(15,163,74,.5)" }}
        >
          <ul className="grid grid-cols-2 gap-y-3 md:flex md:items-center md:justify-between md:gap-4">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <li
                key={label}
                className={
                  "flex items-center gap-3 px-2 md:flex-1 md:justify-center " +
                  (i > 0 ? "md:border-l md:border-white/15" : "")
                }
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-cevons-yellow/60 text-cevons-yellow">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold leading-tight text-white md:text-lg">{value}</p>
                  <p className="text-[10.5px] font-medium leading-tight text-white/75 md:text-[11px]">
                    {label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Flag wave accent (behind cert panel) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[110px] z-0 h-[60px] w-full md:bottom-[130px] md:h-[80px]"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path d="M0,60 C520,10 980,4 1440,2 L1440,30 C980,40 520,55 0,78 Z" fill="#E31B23" opacity="0.95" />
        <path d="M0,68 C520,28 980,20 1440,16 L1440,48 C980,56 520,70 0,80 Z" fill="#FFD200" opacity="0.95" />
        <path d="M0,76 C520,52 980,46 1440,42 L1440,80 L0,80 Z" fill="#003F27" />
      </svg>

      {/* CERTIFICATION PANEL */}
      <div className="container-cevons relative z-10 pb-5">
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
                img: "/assets/social-proof/market-leader-trophy.webp",
                t: "Market Leader",
                s: "Since 1997",
                note: "Delivering trusted environmental solutions for a cleaner, healthier Guyana.",
                accent: true,
              },
            ].map(({ img, t, s, note, accent }) => (
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
                    "grid size-11 shrink-0 place-items-center rounded-full overflow-hidden " +
                    (accent
                      ? "bg-cevons-deep-green/50 ring-2 ring-cevons-yellow/50"
                      : "bg-white ring-1 ring-cevons-border")
                  }
                >
                  <img src={img} alt="" loading="lazy" decoding="async" className="size-9 object-contain" />
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
