import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

const SmoothScrollContext = createContext<Lenis | null>(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

// Ease-out-expo: fast start, ultra-gentle deceleration
const EASE_OUT_EXPO = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function SmoothScrollProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !enabled) return;

    let cancelled = false;
    let rafId = 0;
    let cleanupClick: (() => void) | undefined;

    // The scrolling library is loaded after first paint so it never delays the
    // page appearing — native scrolling works in the meantime.
    const start = () => {
      if (cancelled) return;
      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;

        const lenis = new Lenis({
          duration: 1.1,
          easing: EASE_OUT_EXPO,
          smoothWheel: true,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        // Smooth-scroll hash anchors (e.g. <a href="#section"> or <Link to="/#section">)
        const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest("a");
          if (!anchor) return;

          const hash = anchor.hash;
          if (!hash || !hash.startsWith("#")) return;

          const el = document.querySelector(hash);
          if (!el) return;

          // Only intercept if this is a same-page hash link
          const samePage =
            !anchor.pathname ||
            anchor.pathname === window.location.pathname ||
            anchor.pathname === `${window.location.pathname}/`;

          if (samePage) {
            e.preventDefault();
            lenis.scrollTo(hash, { offset: -80 }); // offset for sticky header
          }
        };

        document.addEventListener("click", handleClick);
        cleanupClick = () => {
          document.removeEventListener("click", handleClick);
          cancelAnimationFrame(rafId);
          lenis.destroy();
          lenisRef.current = null;
        };
      });
    };

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void })
      .requestIdleCallback;
    if (typeof ric === "function") ric(start, { timeout: 2000 });
    else window.setTimeout(start, 400);

    return () => {
      cancelled = true;
      cleanupClick?.();
    };
  }, [reduceMotion, enabled]);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
