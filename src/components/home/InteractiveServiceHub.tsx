import { motion, useReducedMotion } from "framer-motion";

const logo = "/assets/brand/cevons-logo-correct.webp";

const services = [
  { name: "Garbage\nCollection", img: "/assets/home/service-garbage-collection.webp", href: "/services/general-trash-collection", alt: "Garbage collection truck for CEVONS services" },
  { name: "Skip Bin\nRental", img: "/assets/home/service-skip-bin-rental.webp", href: "/services/skip-bin-dumpster-rental", alt: "Skip bin rental container for CEVONS services" },
  { name: "Portable\nToilets", img: "/assets/home/service-portable-toilets.webp", href: "/services/portable-toilet", alt: "Portable toilets for CEVONS services" },
  { name: "Septic\nServices", img: "/assets/home/service-septic-services.webp", href: "/services/septic-services", alt: "Septic service truck for CEVONS services" },
  { name: "Recycling\nSolutions", img: "/assets/home/service-recycling-solutions.webp", href: "/services/material-recovery-facility", alt: "Recycling solutions bin for CEVONS services" },
  { name: "Dumpster\nRental", img: "/assets/home/service-dumpster-rental.webp", href: "/services/dumpster-rental", alt: "Dumpster rental container for CEVONS services" },
];

export function InteractiveServiceHub() {
  const reduced = useReducedMotion();
  const orbitR = 42; // % of container
  const dotCount = 8;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Outer glow halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(15,163,74,.35) 0%, rgba(15,163,74,.12) 35%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* Rotating ring with dots */}
      <motion.div
        aria-hidden
        className="absolute inset-[6%]"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute inset-0 rounded-full border border-cevons-green/60"
          style={{ boxShadow: "0 0 30px rgba(15,163,74,.45), inset 0 0 30px rgba(15,163,74,.25)" }}
        />
        {Array.from({ length: dotCount }).map((_, i) => {
          const a = (i / dotCount) * Math.PI * 2;
          const x = 50 + 50 * Math.cos(a);
          const y = 50 + 50 * Math.sin(a);
          return (
            <span
              key={i}
              className="absolute size-2 rounded-full bg-cevons-yellow"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px rgba(255,210,0,.9), 0 0 20px rgba(255,210,0,.5)",
              }}
            />
          );
        })}
      </motion.div>

      {/* Inner faint ring */}
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full border border-cevons-green/40"
        style={{ boxShadow: "inset 0 0 25px rgba(15,163,74,.3)" }}
      />

      {/* Connecting spokes (SVG) */}
      <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 100 100">
        {services.map((_, i) => {
          const a = (i / services.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + orbitR * Math.cos(a);
          const y = 50 + orbitR * Math.sin(a);
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="rgba(15,163,74,.45)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          );
        })}
      </svg>

      {/* Center badge */}
      <motion.a
        href="/about"
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 group"
        aria-label="About CEVONS Environmental Services Inc."
        animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="flex size-[34%] aspect-square flex-col items-center justify-center rounded-full bg-cevons-dark/90 backdrop-blur"
          style={{
            width: "min(180px, 38%)",
            height: "min(180px, 38%)",
            boxShadow:
              "0 0 0 2px var(--cevons-green), 0 0 40px rgba(15,163,74,.7), inset 0 0 30px rgba(15,163,74,.35)",
          }}
        >
          <img src={logo} alt="" aria-hidden className="size-12 md:size-14 object-contain" />
          <p className="mt-1 text-[11px] md:text-sm font-extrabold tracking-wider text-white leading-none">CEVONS</p>
          <p className="mt-1 text-[8px] md:text-[10px] font-bold tracking-[0.18em] text-cevons-yellow leading-tight text-center">
            ENVIRONMENTAL<br/>SERVICES INC.
          </p>
        </div>
      </motion.a>

      {/* Service nodes */}
      {services.map((s, i) => {
        const a = (i / services.length) * Math.PI * 2 - Math.PI / 2;
        const cx = 50 + orbitR * Math.cos(a);
        const cy = 50 + orbitR * Math.sin(a);
        return (
          <a
            key={s.name}
            href={s.href}
            aria-label={s.name.replace("\n", " ")}
            className="group absolute z-20"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: "translate(-50%, -50%)",
              width: "26%",
              maxWidth: 140,
            }}
          >
            <div
              className="relative aspect-square overflow-hidden rounded-full border-2 border-cevons-green/70 bg-cevons-dark transition-all duration-200 group-hover:scale-105 group-hover:border-cevons-yellow"
              style={{ boxShadow: "0 0 18px rgba(15,163,74,.55)" }}
            >
              <img src={s.img} alt={s.alt} loading="lazy" className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent pt-3 pb-1.5">
                <p className="text-center text-[9px] md:text-[10px] font-extrabold uppercase leading-tight tracking-wide text-white whitespace-pre-line">
                  {s.name}
                </p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
