import { Award, BadgeCheck, Calendar, Leaf, MapPin, ShieldCheck, Target, Trophy, Users } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { InteractiveServiceHub } from "./InteractiveServiceHub";

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
    <>
      {/* HERO */}
      <section
        className="relative isolate overflow-hidden bg-cevons-dark"
        style={{ minHeight: "min(960px, calc(100vh - 80px))" }}
        aria-labelledby="home-hero-title"
      >
        {/* Background photo */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBg}
            alt="CEVON'S environmental services truck and worker in Guyana"
            className="size-full object-cover"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="sync"
          />
          {/* Left readability overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,24,15,.92) 0%, rgba(0,63,39,.78) 38%, rgba(0,20,15,.45) 68%, rgba(0,0,0,.65) 100%)",
            }}
          />
          {/* Bottom depth overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,24,15,.72) 100%)",
            }}
          />
          {/* Subtle green glow behind hub */}
          <div
            aria-hidden
            className="absolute right-[-6%] top-1/2 hidden h-[600px] w-[600px] -translate-y-1/2 rounded-full lg:block"
            style={{
              background: "radial-gradient(circle, rgba(15,163,74,.28) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="container-cevons relative z-10 grid grid-cols-1 items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
          {/* LEFT */}
          <div className="max-w-xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cevons-green"
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
              className="mt-5 font-extrabold tracking-tight text-white"
              style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)", lineHeight: 0.98 }}
            >
              Cleaner Today.
              <br />
              <span className="text-[#22c55e]" style={{ textShadow: "0 0 30px rgba(34,197,94,.5)" }}>
                Greener
              </span>{" "}
              Tomorrow.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-4 text-2xl md:text-3xl italic text-cevons-yellow"
              style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
            >
              For Homes. For Businesses. For Guyana.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg"
            >
              From residential collection to industrial waste management, CEVON'S delivers
              reliable, safe, and sustainable environmental solutions across Guyana.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-7 flex flex-wrap gap-3"
            >
              <a href="/contact" className="btn-base btn-green text-base px-6 py-3.5 shadow-lg shadow-cevons-green/30 transition-transform hover:-translate-y-0.5">
                <WhatsApp className="size-5" />
                WhatsApp Us
              </a>
              <a href="/request-service" className="btn-base btn-yellow text-base px-6 py-3.5 shadow-lg shadow-cevons-yellow/25 transition-transform hover:-translate-y-0.5">
                <Calendar className="size-5" />
                Schedule a Service
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="mt-7 flex items-center gap-4"
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
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={6}
              className="mt-8 rounded-2xl border border-cevons-green/40 bg-cevons-deep-green/60 p-4 backdrop-blur md:p-5"
              style={{ boxShadow: "0 10px 40px -10px rgba(15,163,74,.45)" }}
            >
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map(({ icon: Icon, value, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-cevons-yellow/50 text-cevons-yellow">
                      <Icon className="size-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-extrabold leading-tight text-white">{value}</p>
                      <p className="text-[11px] font-medium leading-tight text-white/75">{label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* RIGHT - hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <InteractiveServiceHub />
          </motion.div>
        </div>

        {/* Wave accent */}
        <svg
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-10 h-[70px] w-full md:h-[110px]"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
        >
          <path d="M0,95 C420,40 920,12 1440,2 L1440,40 C940,55 440,82 0,110 Z" fill="#E31B23" />
          <path d="M0,100 C420,55 920,30 1440,18 L1440,60 C940,72 440,92 0,110 Z" fill="#FFD200" />
          <path d="M0,108 C420,80 920,65 1440,52 L1440,110 L0,110 Z" fill="#003F27" />
        </svg>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-white border-b border-cevons-border">
        <div className="container-cevons py-6">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "EPA Certified", s: "Environmental Compliance" },
              { icon: Award, t: "ISO 9001:2015", s: "Quality Management" },
              { icon: BadgeCheck, t: "GCCI Member", s: "Private Sector Commission" },
              { icon: Trophy, t: "Market Leader", s: "Since 1997", accent: true },
            ].map(({ icon: Icon, t, s, accent }) => (
              <li
                key={t}
                className={
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-shadow hover:shadow-md " +
                  (accent
                    ? "border-transparent text-white"
                    : "border-cevons-border bg-white")
                }
                style={
                  accent
                    ? {
                        background:
                          "linear-gradient(135deg, #003F27 0%, #006B35 60%, #003F27 100%)",
                        boxShadow: "0 6px 24px -6px rgba(0,107,53,.45)",
                      }
                    : undefined
                }
              >
                <span
                  className={
                    "grid size-11 shrink-0 place-items-center rounded-full " +
                    (accent ? "bg-cevons-yellow text-cevons-deep-green" : "bg-cevons-green/10 text-cevons-green")
                  }
                  style={accent ? { boxShadow: "0 0 0 2px rgba(255,210,0,.35)" } : undefined}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className={"text-xs font-bold uppercase tracking-wider " + (accent ? "text-cevons-yellow" : "text-cevons-muted")}>
                    {t}
                  </p>
                  <p className={"text-sm font-semibold leading-tight " + (accent ? "text-white" : "text-cevons-dark")}>
                    {s}
                  </p>
                </div>
                {accent && <Target className="ml-auto size-5 text-cevons-yellow/70" aria-hidden />}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
