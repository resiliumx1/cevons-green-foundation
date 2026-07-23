import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "./HeroSlideshow";

const AUTOPLAY_MS = 6000;
const FADE_MS = 700;

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(m.matches);
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, []);
  return isMobile;
}

export function HeroSlideshowCard() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>(() => HERO_SLIDES.map(() => false));
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const count = HERO_SLIDES.length;
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const markLoaded = (i: number) =>
    setLoaded((prev) => (prev[i] ? prev : prev.map((v, idx) => (idx === i ? true : v))));

  // Handle images already decoded (preloaded / cached) before onLoad fires.
  useEffect(() => {
    imgRefs.current.forEach((img, i) => {
      if (img && img.complete && img.naturalWidth > 0) markLoaded(i);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reduced, next]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[28px] bg-[color:var(--brand-grey-light,#f2f2f2)] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35),0_8px_24px_-12px_rgba(0,0,0,0.18)]"
      style={{ aspectRatio: isMobile ? "16 / 11" : "4 / 3" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="CEVONS environmental services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKey}
      tabIndex={0}
    >
      {HERO_SLIDES.map((s, i) => {
        const isActive = i === active;
        const visible = isActive && (i === 0 || loaded[i]);
        return (
          <div
            key={s.src}
            className="absolute inset-0 transition-opacity ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
              zIndex: isActive ? 2 : 1,
            }}
            aria-hidden={!isActive}
          >
            <img
              ref={(el) => { imgRefs.current[i] = el; }}
              src={s.src}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding={i === 0 ? "sync" : "async"}
              {...(i === 0 ? { fetchPriority: "high" as const } : {})}
              width={1920}
              height={1440}
              onLoad={() => markLoaded(i)}
              onError={() => markLoaded(i)}
              className="block h-full w-full object-cover"
              style={{ objectPosition: isMobile ? s.positionMobile : s.positionDesktop }}
            />
          </div>
        );
      })}

      {/* Prev / Next controls */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-charcoal,#1A1A1A)] shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] md:size-11"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-charcoal,#1A1A1A)] shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] md:size-11"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Indicators */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
        {HERO_SLIDES.map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              className="h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
              style={{
                width: isActive ? 28 : 8,
                background: isActive ? "var(--brand-orange)" : "rgba(255,255,255,0.75)",
                boxShadow: isActive ? "0 0 8px rgba(239,119,0,0.55)" : "0 1px 2px rgba(0,0,0,0.25)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
