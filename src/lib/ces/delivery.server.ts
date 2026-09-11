/**
 * CES intake transport — SERVER ONLY.
 *
 * Signs every request with HMAC-SHA256 over `${timestamp}.${eventId}.${rawBody}`
 * using WEBSITE_INTAKE_SECRET. The secret, the signature and the payload never
 * leave this runtime: nothing here is returned to the browser and no credential
 * is logged.
 */
import { MAX_BODY_BYTES, byteLength } from "./contract";

export const CES_DEFAULT_INTAKE_URL =
  "https://cevons-nexus-two.vercel.app/api/integrations/website/intake";
export const CES_DEFAULT_RECONCILE_URL =
  "https://cevons-nexus-two.vercel.app/api/integrations/website/reconcile";

export type CesConfig = { url: string; reconcileUrl: string; secret: string };

export type CesConfigStatus = {
  urlConfigured: boolean;
  secretConfigured: boolean;
  /** Host only — never the full URL with any token in it. */
  host: string | null;
  ready: boolean;
};

function intakeUrl(): string {
  return (process.env["CES_INTAKE_URL"] ?? "").trim() || CES_DEFAULT_INTAKE_URL;
}

/** Derive the reconcile endpoint from the configured intake endpoint. */
export function reconcileUrlFrom(url: string): string {
  return url.replace(/\/intake\/?$/, "/reconcile");
}

/** Read config at call time (env binds per request on the edge runtime). */
export function readCesConfig(): CesConfig | null {
  const url = intakeUrl();
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  if (!url || !secret) return null;
  return { url, reconcileUrl: reconcileUrlFrom(url), secret };
}

export function cesConfigStatus(): CesConfigStatus {
  const url = intakeUrl();
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  let host: string | null = null;
  try {
    host = url ? new URL(url).host : null;
  } catch {
    host = null;
  }
  return { urlConfigured: !!url, secretConfigured: !!secret, host, ready: !!url && !!secret };
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
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

/** The exact base string CES verifies. Kept pure so it can be unit tested. */
export function signingBase(timestamp: string, eventId: string, rawBody: string): string {
  return `${timestamp}.${eventId}.${rawBody}`;
}

export async function signedHeaders(
  secret: string,
  eventId: string,
  rawBody: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<Record<string, string>> {
  const timestamp = String(nowSeconds);
  const signature = await hmacSha256Hex(secret, signingBase(timestamp, eventId, rawBody));
  return {
    "content-type": "application/json",
    "x-cevons-timestamp": timestamp,
    "x-cevons-event-id": eventId,
    "x-cevons-signature": `sha256=${signature}`,
  };
}

export type CesDeliveryResult = {
  ok: boolean;
  /** HTTP status, or null when the request never completed. */
  status: number | null;
  /** True when CES answered 200 (already recorded / replayed). */
  duplicate: boolean;
  /** Safe, short reason for the admin screen. Never contains the payload. */
  error?: string;
  /** Only network, 429, 500 and 503 are retried; 4xx needs diagnosis. */
  retryable: boolean;
};

const RETRYABLE_STATUS = new Set([429, 500, 503]);

/**
 * One attempt. Retry scheduling lives in the outbox, so a CES outage never
 * blocks the caller: we return the outcome and let the queue decide.
 */
export async function deliverToCes(
  rawBody: string,
  opts: { eventId: string },
): Promise<CesDeliveryResult> {
  const config = readCesConfig();
  if (!config) {
    return {
      ok: false,
      status: null,
      duplicate: false,
      error: "CES endpoint or shared key is not configured yet.",
      retryable: true,
    };
  }

  if (byteLength(rawBody) > MAX_BODY_BYTES) {
    return {
      ok: false,
      status: null,
      duplicate: false,
      error: "Payload exceeds the 64 kB CES limit.",
      retryable: false,
    };
  }

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: await signedHeaders(config.secret, opts.eventId, rawBody),
      body: rawBody,
    });

    if (res.status === 201 || res.status === 200) {
      return { ok: true, status: res.status, duplicate: res.status === 200, retryable: false };
    }

    const body = await res.text().catch(() => "");
    const retryable = RETRYABLE_STATUS.has(res.status) || res.status >= 500;
    return {
      ok: false,
      status: res.status,
      duplicate: false,
      error: `${diagnosis(res.status)} CES responded ${res.status}: ${body.slice(0, 200)}`,
      retryable,
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      duplicate: false,
      error: err instanceof Error ? err.message.slice(0, 200) : "Network error",
      retryable: true,
    };
  }
}

/** Plain-language cause for the statuses CES documents as non-retryable. */
export function diagnosis(status: number): string {
  switch (status) {
    case 400:
      return "Malformed request body.";
    case 401:
      return "Signature or shared key rejected.";
    case 413:
      return "Payload too large.";
    case 422:
      return "Field failed CES validation.";
    default:
      return "";
  }
}

/** POST the reconcile endpoint with the same signing scheme. */
export type ReconcileResponse = {
  count: number;
  enquiries: Array<{
    externalId: string;
    reference: string | null;
    leadId: string | null;
    submittedAt: string | null;
    receivedAt: string | null;
    stage: string | null;
  }>;
  missing: string[];
  nextCursor: string | null;
};

export async function reconcileWithCes(request: {
  externalIds?: string[];
  since?: string;
  until?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ ok: boolean; status: number | null; error?: string; data?: ReconcileResponse }> {
  const config = readCesConfig();
  if (!config) {
    return { ok: false, status: null, error: "CES endpoint or shared key is not configured yet." };
  }

  const rawBody = JSON.stringify(request);
  const eventId = `reconcile:${crypto.randomUUID()}`;

  try {
    const res = await fetch(config.reconcileUrl, {
      method: "POST",
      headers: await signedHeaders(config.secret, eventId, rawBody),
      body: rawBody,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        error: `${diagnosis(res.status)} CES responded ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, status: res.status, data: (await res.json()) as ReconcileResponse };
  } catch (err) {
    return {
      ok: false,
      status: null,
      error: err instanceof Error ? err.message.slice(0, 200) : "Network error",
    };
  }
}

/** Exponential backoff with a cap: 1m, 4m, 16m, 1h, 4h, then 6h. */
export function backoffSeconds(attempts: number): number {
  const base = 60 * Math.pow(4, Math.max(0, attempts - 1));
  return Math.min(base, 6 * 3600);
}
