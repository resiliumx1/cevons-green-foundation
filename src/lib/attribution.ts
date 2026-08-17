/**
 * First-touch marketing attribution.
 *
 * The first page load of a session captures the UTM parameters, the external
 * referrer and the landing path. Those values are frozen in sessionStorage and
 * are never overwritten, so a visitor who lands on
 * /services?utm_campaign=skip-bins and submits ten minutes later from
 * /request-service still reports the original campaign and landing page.
 */

const STORAGE_KEY = "cev:attribution:v1";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
}

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  referrer: null,
  landing_page: null,
};

const clean = (v: string | null | undefined): string | null => {
  const s = (v ?? "").trim();
  return s.length ? s.slice(0, 500) : null;
};

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

/**
 * Records first-touch attribution once per session. Safe to call on every
 * page view — subsequent calls are a no-op.
 */
export function captureFirstTouch(): Attribution {
  if (typeof window === "undefined") return EMPTY;
  const existing = read();
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const ref = clean(typeof document !== "undefined" ? document.referrer : null);
  // Ignore self-referrals: they are internal navigations, not a traffic source.
  let referrer: string | null = ref;
  if (referrer) {
    try {
      if (new URL(referrer).host === window.location.host) referrer = null;
    } catch {
      /* keep raw value */
    }
  }

  const captured: Attribution = {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
    utm_term: clean(params.get("utm_term")),
    utm_content: clean(params.get("utm_content")),
    referrer,
    landing_page: clean(window.location.pathname + window.location.search),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    /* private mode — fall through with in-memory values */
  }
  return captured;
}

/** Attribution to attach to a submission. Captures on demand if needed. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;
  return read() ?? captureFirstTouch();
}
