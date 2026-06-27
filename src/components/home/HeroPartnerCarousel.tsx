import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const partners = [
  { src: "/partners/saipem.webp", alt: "Saipem" },
  { src: "/partners/ramps-logistics.webp", alt: "Ramps Logistics" },
  { src: "/partners/gysbi.webp", alt: "GYSBI" },
  { src: "/partners/baker-hughes.webp", alt: "Baker Hughes" },
  { src: "/partners/edison-chouest-offshore.webp", alt: "Edison Chouest Offshore" },
  { src: "/partners/halliburton.jpg", alt: "Halliburton" },
  { src: "/partners/agm-inc.jpg", alt: "AGM Inc." },
  { src: "/partners/gtt.jpg", alt: "GT&T" },
  { src: "/partners/british-high-commission.jpg", alt: "British High Commission" },
  { src: "/partners/us-embassy.jpg", alt: "United States Embassy" },
  { src: "/partners/united-nations.jpg", alt: "United Nations" },
  { src: "/partners/caricom.jpg", alt: "CARICOM" },
  { src: "/partners/pegasus-hotel-guyana.jpg", alt: "Pegasus Hotel Guyana" },
  { src: "/partners/marriott.jpg", alt: "Marriott" },
  { src: "/partners/kfc.jpg", alt: "KFC" },
  { src: "/partners/churchs-chicken.jpg", alt: "Church's Chicken" },
];

export function HeroPartnerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      if (!paused && el) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 0.6;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const updateProgress = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  };

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div
      className="hpc-carousel relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #faf7f1 100%)",
        padding: "22px 0 24px",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: 0,
        zIndex: 3,
      }}
    >
      <div className="container-cevons">
        <p
          className="text-center font-bold uppercase mx-auto"
          style={{
            color: "#1F2937",
            fontSize: 12,
            letterSpacing: "0.22em",
            maxWidth: 340,
          }}
        >
          Trusted by leading organisations across Guyana
        </p>
        <div
          aria-hidden
          className="mx-auto"
          style={{
            width: 72,
            height: 3,
            background: "#EF7700",
            borderRadius: 999,
            margin: "12px auto 22px",
          }}
        />

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous partners"
            onClick={() => page(-1)}
            className="shrink-0 grid place-items-center size-9 rounded-full bg-[#1F2937] text-white hover:bg-[#EF7700] transition shadow-sm"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div
            ref={trackRef}
            onScroll={updateProgress}
            className="flex-1 flex gap-3 overflow-x-auto scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            {[...partners, ...partners].map((p, i) => (
              <div
                key={`hp-${i}`}
                className="shrink-0 flex items-center justify-center"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(31,41,55,0.08)",
                  borderRadius: 18,
                  boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
                  height: 96,
                  width: 148,
                  padding: 20,
                }}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="block h-full w-full object-contain object-center"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next partners"
            onClick={() => page(1)}
            className="shrink-0 grid place-items-center size-9 rounded-full bg-[#1F2937] text-white hover:bg-[#EF7700] transition shadow-sm"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[3px] w-full bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress)}%`, background: "#EF7700" }}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroPartnerCarousel;
