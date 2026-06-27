import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Slide = {
  src: string;
  alt: string;
  position: string;
  pan: "left" | "right" | "up" | "down";
};

const SLIDES: Slide[] = [
  { src: "/hero-slides/slide-1.jpg", alt: "CEVONS environmental services truck in Guyana's lush rainforest near a waterfall", position: "right center", pan: "left" },
  { src: "/hero-slides/slide-2.jpg", alt: "CEVONS recycling facility at sunset with sorted bins for glass, paper, plastic and metal", position: "70% center", pan: "left" },
  { src: "/hero-slides/slide-3.jpg", alt: "CEVONS crew in orange hi-vis and hard hats standing in front of a collection truck", position: "75% center", pan: "left" },
  { src: "/hero-slides/slide-4.jpg", alt: "CEVONS depot at sunset with orange truck and skip bins on wet reflective ground", position: "65% center", pan: "down" },
  { src: "/hero-slides/slide-5.jpg", alt: "CEVONS truck passing a calm community street with gazebo, benches and palm trees", position: "75% center", pan: "up" },
  { src: "/hero-slides/slide-6.jpg", alt: "CEVONS operations collage — branded skip trucks, hi-vis crew with clipboard, recycling line and color-sorted bins against an industrial Guyana skyline", position: "center", pan: "left" },
  { src: "/hero-slides/slide-7.jpg", alt: "CEVONS service collage — branded collection truck on a Guyanese street, smiling supervisor on radio, skip bin pickup and orange/green CEVONS wheelie bins at a recycling facility", position: "center", pan: "right" },
];

const DURATION_MS = 6000;
const FADE_MS = 1200;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(m.matches);
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, []);
  return reduced;
}

type Ctx = {
  active: number;
  progress: number;
  reduced: boolean;
  goTo: (i: number) => void;
  setPaused: (v: boolean) => void;
  count: number;
};
const SlideshowCtx = createContext<Ctx | null>(null);

export function HeroSlideshowProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const progressRef = useRef(0);

  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Preload every slide image immediately so a blank frame never shows
  // when the carousel advances. The first slide also renders eagerly in
  // the <img> below, so this mainly warms slides 2..N.
  useEffect(() => {
    const imgs = SLIDES.map((s) => {
      const img = new Image();
      img.decoding = "async";
      img.src = s.src;
      return img;
    });
    return () => { imgs.forEach((i) => { i.src = ""; }); };
  }, []);


  useEffect(() => {
    if (reduced) { setProgress(0); return; }
    startRef.current = performance.now() - progressRef.current * DURATION_MS;
    const tick = (t: number) => {
      if (!paused) {
        const elapsed = t - startRef.current;
        const p = Math.min(1, elapsed / DURATION_MS);
        setProgress(p);
        if (p >= 1) {
          setActive((a) => (a + 1) % SLIDES.length);
          startRef.current = performance.now();
          setProgress(0);
        }
      } else {
        startRef.current = t - progressRef.current * DURATION_MS;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, paused, reduced]);

  const value = useMemo<Ctx>(() => ({
    active, progress, reduced, count: SLIDES.length,
    goTo: (i) => { setActive(i); setProgress(0); startRef.current = performance.now(); },
    setPaused,
  }), [active, progress, reduced]);

  return <SlideshowCtx.Provider value={value}>{children}</SlideshowCtx.Provider>;
}

function useSlideshow() {
  const c = useContext(SlideshowCtx);
  if (!c) throw new Error("HeroSlideshow* must be used inside HeroSlideshowProvider");
  return c;
}

export function HeroSlideshowBackground() {
  const { active, reduced, setPaused } = useSlideshow();
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden bg-cevons-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="CEVONS environmental services"
    >
      {SLIDES.map((s, i) => {
        const isActive = i === active;
        return (
          <div
            key={s.src}
            className="absolute inset-0 transition-opacity ease-out"
            style={{ opacity: isActive ? 1 : 0, transitionDuration: `${FADE_MS}ms`, zIndex: isActive ? 2 : 1 }}
            aria-hidden={!isActive}
          >
            <img
              src={s.src}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding={i === 0 ? "sync" : "async"}
              {...(i === 0 ? { fetchPriority: "high" as const } : {})}
              width={1920}
              height={1080}
              className={`size-full object-cover ${isActive && !reduced ? `hero-kenburns hero-kenburns-${s.pan}` : ""}`}
              style={{ objectPosition: s.position }}
            />
          </div>
        );
      })}

      <div
        key={`tint-${active}`}
        aria-hidden
        className="absolute inset-0 z-[3] pointer-events-none hero-tint-flash"
        style={{ background: "radial-gradient(60% 70% at 50% 50%, rgba(239,119,0,0.18), rgba(239,119,0,0) 70%)" }}
      />
      <div
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(15,15,15,.96) 0%, rgba(26,26,26,.92) 30%, rgba(26,26,26,.6) 52%, rgba(20,20,20,.18) 72%, rgba(0,0,0,.38) 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 z-[4] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,10,.7) 100%)" }}
      />
    </div>
  );
}

export function HeroSlideshowControls({ className = "" }: { className?: string }) {
  const { active, progress, reduced, count, goTo, setPaused } = useSlideshow();
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo((active + 1) % count); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goTo((active - 1 + count) % count); }
  };
  return (
    <div
      role="group"
      aria-label="Slide controls"
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={className}
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              className="group relative h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF7700] focus-visible:ring-offset-2 focus-visible:ring-offset-black overflow-hidden"
              style={{ width: isActive ? 40 : 12, background: "rgba(255,255,255,0.32)" }}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${(reduced ? 1 : progress) * 100}%`,
                    background: "#EF7700",
                    transition: reduced ? "none" : "width 80ms linear",
                    boxShadow: "0 0 8px rgba(239,119,0,0.55)",
                  }}
                />
              )}
              {!isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(239,119,0,0.6)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
