import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePublishedMedia, focalPosition, isPortrait } from "@/lib/mediaPosts";
import { useSiteImage } from "@/lib/siteImages";

type Slide = {
  src: string;
  alt: string;
  position: string;
  pan: "left" | "right" | "up" | "down";
  width: number;
  height: number;
  portrait: boolean;
  /** Responsive candidates for the static slides (omitted for CRM uploads). */
  srcSet?: string;
  title?: string;
  caption?: string;
  /** True for a photo managed in the Media section. */
  managed?: boolean;
  fit?: "cover" | "contain" | "custom";
  zoom?: number;
  /** Spread onto the rendered <img> so the content editor can target it. */
  editorProps?: Record<string, string>;
};

/**
 * Pre-generated responsive WebP variants of the three static hero photos
 * (public/hero/*). Widths in each srcset are the REAL pixel widths of the
 * generated files — a photo narrower than 1920px is not upscaled, so the
 * browser is never told a candidate is bigger than it is.
 */
const HERO_VARIANTS = {
  skip: {
    src: "/hero/hero-skip-1920.webp",
    srcSet: "/hero/hero-skip-640.webp 640w, /hero/hero-skip-1024.webp 1024w, /hero/hero-skip-1920.webp 1920w",
    width: 1920,
    height: 1080,
  },
  septic: {
    src: "/hero/hero-septic-1920.webp",
    srcSet: "/hero/hero-septic-640.webp 640w, /hero/hero-septic-1024.webp 1024w, /hero/hero-septic-1920.webp 1800w",
    width: 1800,
    height: 1350,
  },
  shredTruck: {
    src: "/hero/hero-shred-truck-1920.webp",
    srcSet: "/hero/hero-shred-truck-640.webp 640w, /hero/hero-shred-truck-1920.webp 749w",
    width: 749,
    height: 500,
  },
} as const;

/**
 * Slide 1 (LCP) preload inputs, used by routes/index.tsx. The srcset and sizes
 * must stay identical to what the <img> below renders, otherwise the browser
 * preloads one candidate and then downloads a second one.
 */
export const HERO_SLIDE_1_SRC = HERO_VARIANTS.skip.src;
export const HERO_SLIDE_1_SRCSET = HERO_VARIANTS.skip.srcSet;
export const HERO_SLIDE_1_SIZES = "100vw";

/**
 * Permanent fallback: rendered whenever there are zero published `slide` rows
 * in the CRM. The hero must never be empty.
 */
const SLIDES: Slide[] = [
  // Dimensions below are the MEASURED natural sizes of the bundled files, so
  // the width/height attributes prevent layout shift and `portrait` is derived
  // (h > w) rather than assumed — portrait photos need the blurred-fill guard.
  { ...HERO_VARIANTS.skip, alt: "CEVONS red Sinotruk Howo skip bin truck loaded with waste on site in Guyana", position: "center", pan: "right", portrait: 1080 > 1920 },
  { ...HERO_VARIANTS.septic, alt: "CEVONS red septic service vacuum truck parked at the Georgetown yard", position: "center", pan: "left", portrait: 1350 > 1800 },
  { ...HERO_VARIANTS.shredTruck, alt: "CEVONS orange and white SHRED secure document destruction truck parked on a Georgetown street", position: "center", pan: "right", portrait: 500 > 749 },
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
  // One named slot per fallback slide, so every hero photo is replaceable from
  // the on-page editor (and from /admin/images). Identical to SLIDES until set.
  const slide1 = useSiteImage("home_hero_slide_1", SLIDES[0].src, SLIDES[0].alt);
  const slide2 = useSiteImage("home_hero_slide_2", SLIDES[1].src, SLIDES[1].alt);
  const slide3 = useSiteImage("home_hero_slide_3", SLIDES[2].src, SLIDES[2].alt);
  const resolved = [slide1, slide2, slide3];
  const editorKey = resolved.map((r) => Object.keys(r.editorProps).join()).join("|");
  const srcKey = resolved.map((r) => `${r.src}|${r.alt}|${r.width}|${r.height}`).join("~");
  return useMemo(() => {
    const rows = (data ?? []).filter((r) => !!r.url);
    if (rows.length === 0) {
      return SLIDES.map((s, i) => {
        const r = resolved[i];
        if (!r) return s;
        const width = r.width ?? s.width;
        const height = r.height ?? s.height;
        return {
          ...s,
          src: r.src,
          alt: r.alt,
          // An editor override replaces the file, so the pre-generated
          // responsive candidates no longer describe it — drop them.
          srcSet: r.src === s.src ? s.srcSet : undefined,
          width,
          height,
          portrait: height > width,
          editorProps: r.editorProps,
        };

      });
    }
    return rows.map((r, i) => ({
      src: r.url as string,
      alt: r.title || "CEVONS environmental services in Guyana",
      position: focalPosition(r.focal_x, r.focal_y),
      pan: (i % 2 === 0 ? "right" : "left") as Slide["pan"],
      width: r.image_w ?? 1920,
      height: r.image_h ?? 1080,
      portrait: isPortrait(r.image_w, r.image_h),
      title: r.title || undefined,
      caption: r.caption || undefined,
      managed: true,
      fit: r.image_fit,
      zoom: r.image_zoom,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, srcKey, editorKey]);
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
  /** Bumps on manual navigation so the progress bar restarts. */
  cycle: number;
  paused: boolean;
  reduced: boolean;
  goTo: (i: number) => void;
  setPaused: (v: boolean) => void;
  count: number;
  slides: Slide[];
};
const SlideshowCtx = createContext<Ctx | null>(null);

/**
 * Auto-advance runs on a single timeout per slide instead of a per-frame
 * React state update, so consumers re-render only when the slide or pause
 * state changes. The progress bar is a CSS animation kept in step with the
 * timer (paused/resumed together).
 */
export function HeroSlideshowProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const reduced = usePrefersReducedMotion();
  const slides = useHeroSlides();
  const count = slides.length;
  const remainingRef = useRef(DURATION_MS);
  const startedRef = useRef(0);

  // If the CRM slide set changes (or arrives after first paint), keep the
  // active index in range.
  useEffect(() => {
    setActive((a) => (a < count ? a : 0));
  }, [count]);

  // A new slide (or a manual restart) gets the full duration again.
  useEffect(() => {
    remainingRef.current = DURATION_MS;
  }, [active, cycle]);

  useEffect(() => {
    if (reduced || paused || count < 2) return;
    startedRef.current = performance.now();
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), remainingRef.current);
    return () => {
      window.clearTimeout(id);
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - startedRef.current));
    };
  }, [active, cycle, paused, reduced, count]);

  const value = useMemo<Ctx>(() => ({
    active, cycle, paused, reduced, count, slides,
    goTo: (i) => { setActive(i); setCycle((c) => c + 1); },
    setPaused,
  }), [active, cycle, paused, reduced, count, slides]);

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

  // Only the first (LCP) slide is requested up front. The next slide is
  // fetched once the first has loaded and the browser is idle, and from then
  // on each slide pulls in the one after it just ahead of use. Manual
  // navigation loads the chosen slide immediately.
  const [eager, setEager] = useState<Set<number>>(() => new Set([0]));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

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

  const firstLoaded = !!(slides[0] && loaded[slides[0].src]);

  useEffect(() => {
    if (!firstLoaded || slides.length < 2) return;
    const next = (active + 1) % slides.length;
    const add = () => setEager((prev) => {
      if (prev.has(active) && prev.has(next)) return prev;
      return new Set(prev).add(active).add(next);
    });
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(add, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(add, 300);
    return () => window.clearTimeout(id);
  }, [firstLoaded, active, slides.length]);

  // Safety net: a slide chosen by a dot click is needed now, not at idle.
  useEffect(() => {
    setEager((prev) => (prev.has(active) ? prev : new Set(prev).add(active)));
  }, [active]);

  // Scroll parallax: translate the slideshow layer at ~30% of scroll for
  // a subtle depth effect, written straight to the element so scrolling
  // never re-renders React. Disabled when user prefers reduced motion.
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (reduced) { el.style.transform = ""; return; }
    let raf = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const activeSlide = slides[active];
  const showPlaceholder = !activeSlide || !loaded[activeSlide.src];

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
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduced ? undefined : "transform" }}
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
                  {s.portrait || s.fit === "contain" ? (
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
                        {...(s.srcSet ? { srcSet: s.srcSet, sizes: "100vw" } : {})}
                        alt={s.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding={i === 0 ? "sync" : "async"}
                        {...(i === 0 ? { fetchPriority: "high" as const } : {})}

                        
                        width={s.width}
                        height={s.height}
                        onLoad={() => markLoaded(s.src)}
                        onError={() => markLoaded(s.src)}
                        className="relative size-full object-contain"
                        style={{ objectPosition: s.position }}
                        data-slide={i}
                        {...(s.editorProps ?? {})}
                      />
                    </div>
                  ) : (
                    <img
                      ref={(el) => { imgRefs.current[i] = el; }}
                      src={s.src}
                      {...(s.srcSet ? { srcSet: s.srcSet, sizes: "100vw" } : {})}
                      alt={s.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding={i === 0 ? "sync" : "async"}
                      {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                      width={s.width}
                      height={s.height}
                      onLoad={() => markLoaded(s.src)}
                      onError={() => markLoaded(s.src)}
                      className={`hero-slide-img size-full object-cover ${animate && s.fit !== "custom" ? `hero-kenburns hero-kenburns-${s.pan}` : ""}`}
                      data-slide={i}
                      {...(s.managed ? { "data-focal": "true" } : {})}
                      style={{
                        objectPosition: s.position,
                        transform: s.fit === "custom" ? `scale(${Math.max(100, Math.min(200, s.zoom ?? 100)) / 100})` : undefined,
                        transformOrigin: s.position,
                      }}
                      {...(s.editorProps ?? {})}
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
  const { active, cycle, paused, reduced, count, goTo, setPaused } = useSlideshow();
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
                  key={`${active}-${cycle}`}
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: "var(--brand-orange)",
                    boxShadow: "0 0 8px rgba(239,119,0,0.55)",
                    transformOrigin: "left center",
                    ...(reduced
                      ? {}
                      : {
                          animation: `hero-progress ${DURATION_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }),
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
