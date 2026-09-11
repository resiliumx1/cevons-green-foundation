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

export function GoogleTag() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const loaded = useRef(false);
  const firstView = useRef(true);

  useEffect(() => {
    if (loaded.current || typeof window === "undefined") return;
    loaded.current = true;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    }
    window.gtag = window.gtag ?? (gtag as typeof window.gtag);
    window.gtag?.("js", new Date());
    window.gtag?.("config", MEASUREMENT_ID, { send_page_view: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
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
