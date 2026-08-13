import { useCallback, useEffect, useRef } from "react";

/**
 * When a page hydrates while the tab/iframe is hidden, requestAnimationFrame is
 * paused, so framer-motion entrance animations never start and elements stay
 * stuck at their `hidden` variant — the page looks blank.
 *
 * This hook hands back a ref. If the document is hidden at mount (or is still
 * hidden shortly after), it writes the final visible state straight to the DOM
 * for the element and any descendant left at opacity 0, bypassing the paused
 * animation loop. Once the tab becomes visible framer-motion resumes and takes
 * ownership of the styles again.
 */
export function useRevealWhenHidden<T extends HTMLElement>(includeDescendants = false) {
  const ref = useRef<T | null>(null);

  const reveal = useCallback(() => {
    const root = ref.current;
    if (!root) return;

    const show = (el: HTMLElement) => {
      if (el.style.opacity === "0") el.style.opacity = "1";
      if (el.style.transform) el.style.transform = "none";
    };

    show(root);
    if (root.style.opacity === "") root.style.opacity = "1";
    if (includeDescendants) {
      root.querySelectorAll<HTMLElement>('[style*="opacity"]').forEach(show);
    }
  }, [includeDescendants]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.visibilityState !== "hidden") return;
    reveal();
    const t = setTimeout(reveal, 300);
    return () => clearTimeout(t);
  }, [reveal]);

  return ref;
}
