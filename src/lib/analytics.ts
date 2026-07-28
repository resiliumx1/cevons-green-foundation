/**
 * Lightweight, provider-agnostic analytics dispatcher.
 *
 * Fires the same event into whichever destinations are present at runtime:
 *  - Google Analytics / GTM  (window.gtag / window.dataLayer)
 *  - PostHog                 (window.posthog)
 *
 * If no provider is loaded the calls are silent no-ops, so instrumentation can
 * ship ahead of the analytics connector being linked. Never throws — analytics
 * must not be able to break a CTA or a form submission.
 */

type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture?: (event: string, props?: EventProps) => void };
  }
}

export function trackEvent(event: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  const payload: EventProps = { ...props };
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
    }
    window.posthog?.capture?.(event, payload);
    if (import.meta.env.DEV) {
      console.debug("[analytics]", event, payload);
    }
  } catch {
    /* analytics must never break the UI */
  }
}

/** A primary call-to-action was clicked. */
export function trackCtaClick(props: {
  label: string;
  placement: string;
  service?: string;
  destination?: string;
}): void {
  trackEvent("cta_click", {
    cta_label: props.label,
    cta_placement: props.placement,
    service: props.service ?? null,
    destination: props.destination ?? null,
  });
}

/** A booking-wizard step was completed and the user moved forward. */
export function trackWizardStep(props: {
  stepIndex: number;
  stepName: string;
  method: "next" | "auto" | "submit";
  service?: string;
  category?: string;
}): void {
  trackEvent("wizard_step_complete", {
    step_index: props.stepIndex + 1,
    step_name: props.stepName,
    advance_method: props.method,
    service: props.service || null,
    category: props.category || null,
  });
}
