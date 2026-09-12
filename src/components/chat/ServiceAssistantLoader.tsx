import { Suspense, lazy, useEffect, useState } from "react";

const ServiceAssistant = lazy(() =>
  import("./ServiceAssistant").then((m) => ({ default: m.ServiceAssistant })),
);

/**
 * The chat assistant is a large piece of the page that nobody needs in the
 * first moments of a visit, so it is fetched once the browser is idle (or as
 * soon as the visitor scrolls / taps, whichever comes first). Behaviour once
 * it appears is unchanged.
 */
export function ServiceAssistantLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      cleanup();
      setShow(true);
    };

    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, reveal));
    };
    events.forEach((e) => window.addEventListener(e, reveal, { once: true, passive: true }));

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    const timer = typeof ric === "function" ? ric(reveal, { timeout: 3500 }) : window.setTimeout(reveal, 2500);

    return () => {
      done = true;
      cleanup();
      if (typeof ric !== "function") window.clearTimeout(timer as number);
    };
  }, []);

  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <ServiceAssistant />
    </Suspense>
  );
}
