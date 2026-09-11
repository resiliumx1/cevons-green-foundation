/**
 * CES intake transport — SERVER ONLY.
 *
 * Signs each delivery with HMAC-SHA256 over `${timestamp}.${body}` using
 * WEBSITE_INTAKE_SECRET and posts it to CES_INTAKE_URL. The secret, the
 * signature and the payload never leave this runtime: nothing here is
 * returned to the browser and no credential is logged.
 */

export type CesConfig = { url: string; secret: string };

export type CesConfigStatus = {
  urlConfigured: boolean;
  secretConfigured: boolean;
  /** Host only — never the full URL with any token in it. */
  host: string | null;
  ready: boolean;
};

/** Read config at call time (env binds per request on the edge runtime). */
export function readCesConfig(): CesConfig | null {
  const url = (process.env["CES_INTAKE_URL"] ?? "").trim();
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  if (!url || !secret) return null;
  return { url, secret };
}

export function cesConfigStatus(): CesConfigStatus {
  const url = (process.env["CES_INTAKE_URL"] ?? "").trim();
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  let host: string | null = null;
  try {
    host = url ? new URL(url).host : null;
  } catch {
    host = null;
  }
  return {
    urlConfigured: !!url,
    secretConfigured: !!secret,
    host,
    ready: !!url && !!secret,
  };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type CesDeliveryResult = {
  ok: boolean;
  /** HTTP status, or null when the request never completed. */
  status: number | null;
  /** Safe, short reason for the admin screen. Never contains the payload. */
  error?: string;
  /** False for 4xx (other than 408/429): retrying will not help. */
  retryable: boolean;
};

/**
 * One attempt. Retry scheduling lives in the outbox, so a CES outage never
 * blocks the caller: we return the outcome and let the queue decide.
 */
export async function deliverToCes(
  payload: unknown,
  opts: { eventId: string; mode: "live" | "backfill" },
): Promise<CesDeliveryResult> {
  const config = readCesConfig();
  if (!config) {
    return { ok: false, status: null, error: "CES endpoint is not configured yet.", retryable: true };
  }

  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await hmacSha256Hex(config.secret, `${timestamp}.${body}`);

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Contract note: header names to be confirmed with CES.
        "x-cevons-timestamp": timestamp,
        "x-cevons-signature": `sha256=${signature}`,
        "x-cevons-event-id": opts.eventId,
        "x-cevons-delivery-mode": opts.mode,
        "idempotency-key": opts.eventId,
      },
      body,
    });

    if (res.ok) return { ok: true, status: res.status, retryable: false };

    // Read a short, non-sensitive slice of the provider's error for the admin UI.
    const text = await res.text().catch(() => "");
    const retryable = res.status >= 500 || res.status === 408 || res.status === 429;
    return {
      ok: false,
      status: res.status,
      error: `CES responded ${res.status}: ${text.slice(0, 200)}`,
      retryable,
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      error: err instanceof Error ? err.message.slice(0, 200) : "Network error",
      retryable: true,
    };
  }
}

/** Exponential backoff with a cap: 1m, 4m, 16m, 1h, 4h, then 6h. */
export function backoffSeconds(attempts: number): number {
  const base = 60 * Math.pow(4, Math.max(0, attempts - 1));
  return Math.min(base, 6 * 3600);
}
