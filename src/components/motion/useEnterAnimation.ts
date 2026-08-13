import { useCallback, useEffect, useRef } from "react";

/**
 * When a page hydrates while the tab/iframe is hidden, requestAnimationFrame is
 * paused, so framer-motion entrance animations never start and elements stay
 * stuck at their `hidden` variant — the page looks blank.
 *
 * This hook hands back a ref. If the document is hidden at mount (or is still
 * hidden shortly after), it writes the final visible state straight to the DOM,
 * bypassing the paused animation loop. Once the tab becomes visible again
 * framer-motion resumes and takes ownership of the styles as usual.
 */
export function useRevealWhenHidden<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const reveal = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    el.style.transform = "none";
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.visibilityState !== "hidden") return;
    reveal();
    const t = setTimeout(reveal, 300);
    return () => clearTimeout(t);
  }, [reveal]);

  return ref;
}
