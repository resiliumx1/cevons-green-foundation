import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import septicAsset from "@/assets/slide-septic.webp.asset.json";
import skipAsset from "@/assets/slide-skip-hi.webp.asset.json";
import shredAsset from "@/assets/slide-shred.webp.asset.json";
import shredTruckAsset from "@/assets/slide-shred-truck.webp.asset.json";
import { usePublishedMedia, isPortrait } from "@/lib/mediaPosts";

type Slide = {
  src: string;
  alt: string;
  position: string;
  pan: "left" | "right" | "up" | "down";
  width: number;
  height: number;
  portrait: boolean;
  title?: string;
  caption?: string;
};

/**
 * Permanent fallback: rendered whenever there are zero published `slide` rows
 * in the CRM. The hero must never be empty.
 */
const SLIDES: Slide[] = [
  // Dimensions below are the MEASURED natural sizes of the bundled files, so
  // the width/height attributes prevent layout shift and `portrait` is derived
  // (h > w) rather than assumed — portrait photos need the blurred-fill guard.
  { src: skipAsset.url, alt: "CEVONS red Sinotruk Howo skip bin truck loaded with waste on site in Guyana", position: "center", pan: "right", width: 1920, height: 2560, portrait: 2560 > 1920 },
  { src: septicAsset.url, alt: "CEVONS red septic service vacuum truck parked at the Georgetown yard", position: "center", pan: "left", width: 1800, height: 1350, portrait: 1350 > 1800 },
  { src: shredTruckAsset.url, alt: "CEVONS orange and white SHRED secure document destruction truck parked on a Georgetown street", position: "center", pan: "right", width: 749, height: 500, portrait: 500 > 749 },
];

// Per-slide object-position for the framed card layout. Desktop crop favors
// full-truck composition; mobile crop shifts slightly up to keep the cab and
// CEVONS branding visible in a shorter landscape card.
export const HERO_SLIDES = SLIDES.map((s, i) => ({
  src: s.src,
  alt: s.alt,
  positionDesktop: ["50% 55%", "50% 50%", "50% 45%"][i] ?? s.position,
  positionMobile: ["55% 55%", "50% 50%", "50% 45%"][i] ?? s.position,
}));


const DURATION_MS = 6000;
const FADE_MS = 1200;

/**
 * Published CRM slides, falling back to the static slides above when the CRM
 * has none (or the read fails).
 */
function useHeroSlides(): Slide[] {
  const { data } = usePublishedMedia("slide");
  return useMemo(() => {
    const rows = (data ?? []).filter((r) => !!r.url);
    if (rows.length === 0) return SLIDES;
    return rows.map((r, i) => ({
      src: r.url as string,
      alt: r.title || "CEVONS environmental services in Guyana",
      position: "center",
      pan: (i % 2 === 0 ? "right" : "left") as Slide["pan"],
      width: r.image_w ?? 1920,
      height: r.image_h ?? 1080,
      portrait: isPortrait(r.image_w, r.image_h),
      title: r.title || undefined,
      caption: r.caption || undefined,
    }));
  }, [data]);
}


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
  slides: Slide[];
};
const SlideshowCtx = createContext<Ctx | null>(null);

export function HeroSlideshowProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();
  const slides = useHeroSlides();
  const count = slides.length;
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const progressRef = useRef(0);

  useEffect(() => { progressRef.current = progress; }, [progress]);

  // If the CRM slide set changes (or arrives after first paint), keep the
  // active index in range.
  useEffect(() => {
    setActive((a) => (a < count ? a : 0));
  }, [count]);

  useEffect(() => {
    if (reduced) { setProgress(0); return; }
    startRef.current = performance.now() - progressRef.current * DURATION_MS;
    const tick = (t: number) => {
      if (!paused) {
        const elapsed = t - startRef.current;
        const p = Math.min(1, elapsed / DURATION_MS);
        setProgress(p);
        if (p >= 1) {
          setActive((a) => (a + 1) % count);
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
  }, [active, paused, reduced, count]);

  const value = useMemo<Ctx>(() => ({
    active, progress, reduced, count, slides,
    goTo: (i) => { setActive(i); setProgress(0); startRef.current = performance.now(); },
    setPaused,
  }), [active, progress, reduced, count, slides]);

  return <SlideshowCtx.Provider value={value}>{children}</SlideshowCtx.Provider>;
}

function useSlideshow() {
  const c = useContext(SlideshowCtx);
  if (!c) throw new Error("HeroSlideshow* must be used inside HeroSlideshowProvider");
  return c;
}

export function HeroSlideshowBackground() {
  const { active, reduced, setPaused, slides } = useSlideshow();
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  // Slide 1 starts in the eager set so it loads immediately for LCP. Other
  // slides are added to this set only after the hero enters the viewport
  // (IntersectionObserver) or they become the active slide.
  const [eager, setEager] = useState<Set<number>>(() => new Set([0]));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [scrollY, setScrollY] = useState(0);

  const markLoaded = (src: string) =>
    setLoaded((prev) => (prev[src] ? prev : { ...prev, [src]: true }));

  // Cached/preloaded images (slide 1 via <link rel="preload">) often resolve
  // before React attaches onLoad. Check .complete on mount so we don't sit
  // on the placeholder while the decoded image is already in memory.
  useEffect(() => {
    imgRefs.current.forEach((img, i) => {
      const s = slides[i];
      if (s && img && img.complete && img.naturalWidth > 0) markLoaded(s.src);
    });
  }, [eager, slides]);

  // IntersectionObserver: once the hero is in (or near) the viewport,
  // warm the remaining slides. Saves bandwidth when a visitor never
  // scrolls to / sees the hero (or lands deep-linked elsewhere).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setEager(new Set(slides.map((_, i) => i)));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setEager(new Set(slides.map((_, i) => i)));
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [slides]);

  // Safety net: if the carousel advances to a slide we haven't loaded
  // yet (e.g. user clicked a dot before IO fired), pull that one in too.
  useEffect(() => {
    setEager((prev) => (prev.has(active) ? prev : new Set(prev).add(active)));
  }, [active]);

  // Scroll parallax: translate the slideshow layer at ~30% of scroll for
  // a subtle depth effect. Disabled when user prefers reduced motion.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrollY(window.scrollY);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const activeSlide = slides[active];
  const showPlaceholder = !activeSlide || !loaded[activeSlide.src];

  const parallaxY = reduced ? 0 : scrollY * 0.3;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 -z-10 overflow-hidden bg-cevons-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="CEVONS environmental services"
    >
      {/* Brand placeholder shown beneath every slide until that slide
          has finished loading. Stays under the image (z-0) so once the
          image fades in it covers the placeholder seamlessly. */}
      <div
        aria-hidden
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${showPlaceholder ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="size-full"
          style={{
            background:
              "radial-gradient(80% 60% at 30% 40%, #2a2622 0%, #1a1714 55%, #0e0c0a 100%)",
          }}
        />
        {!reduced && (
          <div
            className="absolute inset-0 hero-shimmer"
            style={{
              background:
                "linear-gradient(100deg, transparent 30%, rgba(239,119,0,0.10) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </div>

      {/* Parallax wrapper — translates the image stack on scroll while the
          tints/placeholder stay fixed to the viewport edge. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${parallaxY}px, 0)`,
          willChange: reduced ? undefined : "transform",
        }}
      >
        {slides.map((s, i) => {
          const isActive = i === active;
          const isLoaded = !!loaded[s.src];
          const shouldLoad = eager.has(i);
          // Slide 0 is preloaded + eager — don't gate its opacity on the
          // React onLoad event, which can fire after the image is already
          // decoded and waste 1.2s on a fade against the placeholder.
          const visible = isActive && (i === 0 || isLoaded);
          // `settleKey` bumps whenever this slide becomes active — the wrapper
          // remounts so the hero-scale settle animation re-runs on activation
          // (scale 1.08 → 1). Kenburns on the inner <img> starts at scale(1),
          // so the handoff is seamless.
          const settleKey = isActive ? `active-${active}` : `idle-${i}`;
          const animate = isActive && isLoaded && !reduced;
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
              {shouldLoad && (
                <div
                  key={settleKey}
                  className={animate && !s.portrait ? "size-full hero-slide-settle" : "size-full"}
                >
                  {s.portrait ? (
                    // Portrait upload: never cover-crop (that decapitates the
                    // subject). Contain it, centred, over a blurred copy of
                    // the same image filling the space either side.
                    <div className="relative size-full overflow-hidden">
                      <img
                        src={s.src}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover"
                        style={{ filter: "blur(28px) saturate(1.1)", transform: "scale(1.15)" }}
                      />
                      <img
                        ref={(el) => { imgRefs.current[i] = el; }}
                        src={s.src}
                        alt={s.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding={i === 0 ? "sync" : "async"}
                        {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                        width={s.width}
                        height={s.height}
                        onLoad={() => markLoaded(s.src)}
                        onError={() => markLoaded(s.src)}
                        className="relative size-full object-contain"
                        data-slide={i}
                      />
                    </div>
                  ) : (
                    <img
                      ref={(el) => { imgRefs.current[i] = el; }}
                      src={s.src}
                      alt={s.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding={i === 0 ? "sync" : "async"}
                      {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                      width={s.width}
                      height={s.height}
                      onLoad={() => markLoaded(s.src)}
                      onError={() => markLoaded(s.src)}
                      className={`hero-slide-img size-full object-cover ${animate ? `hero-kenburns hero-kenburns-${s.pan}` : ""}`}
                      data-slide={i}
                      style={{ objectPosition: s.position }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>

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
              className="group relative h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-black overflow-hidden"
              style={{ width: isActive ? 40 : 12, background: "rgba(255,255,255,0.32)" }}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${(reduced ? 1 : progress) * 100}%`,
                    background: "var(--brand-orange)",
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

/**
 * Optional per-slide text (CRM-managed slides only). Renders nothing when the
 * active slide has neither a title nor a caption, so the static fallback hero
 * stays exactly as it was. Fixed colours — this sits over a photo.
 */
export function HeroSlideCaption({ className = "" }: { className?: string }) {
  const { slides, active } = useSlideshow();
  const s = slides[active];
  if (!s || (!s.title && !s.caption)) return null;
  return (
    <div className={className}>
      <div
        className="max-w-sm rounded-xl px-4 py-3 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.55)" }}
      >
        {s.title && (
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{s.title}</p>
        )}
        {s.caption && (
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            {s.caption}
          </p>
        )}
      </div>
    </div>
  );
}
