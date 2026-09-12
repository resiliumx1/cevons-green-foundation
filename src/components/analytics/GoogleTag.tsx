import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Standard Google tag (GA4) for the public website.
 *
 * The measurement ID is public by design. The tag is loaded once, then a
 * page_view is sent on every client-side route change so the single-page
 * navigation is measured like normal page loads. Admin screens never mount
 * this component.
 */
const MEASUREMENT_ID = "G-RCKQCLT300";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Initializes window.dataLayer + window.gtag exactly once (survives remounts). */
function ensureTagInitialized() {
  if (typeof window === "undefined") return;

  window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  if (window.__cevonsGtagLoaded) return;
  window.__cevonsGtagLoaded = true;

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: true });

  // The commands above are already queued on dataLayer, so the loader itself
  // can wait for an idle moment — it never competes with first paint.
  const inject = () => {
    if (document.querySelector(`script[src*="gtag/js?id=${MEASUREMENT_ID}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };

  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void })
    .requestIdleCallback;
  if (typeof ric === "function") ric(inject, { timeout: 4000 });
  else window.setTimeout(inject, 1500);
}

declare global {
  interface Window {
    __cevonsGtagLoaded?: boolean;
  }
}

export function GoogleTag() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const firstView = useRef(true);

  useEffect(() => {
    ensureTagInitialized();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firstView.current) {
      firstView.current = false;
      return; // the config call above already counted the entry page
    }
    window.gtag?.("event", "page_view", {
      page_path: `${pathname}${search ?? ""}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
}
