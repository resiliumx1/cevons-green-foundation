import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

const SmoothScrollContext = createContext<Lenis | null>(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

// Ease-out-expo: fast start, ultra-gentle deceleration
const EASE_OUT_EXPO = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: EASE_OUT_EXPO,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let rafId: number;

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

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
