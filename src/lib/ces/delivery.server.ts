/**
 * CES intake transport — SERVER ONLY.
 *
 * Signs every request with HMAC-SHA256 over `${timestamp}.${eventId}.${rawBody}`
 * using WEBSITE_INTAKE_SECRET. The secret, the signature and the payload never
 * leave this runtime: nothing here is returned to the browser and no credential
 * is logged.
 *
 * Transport safety rules (a captive portal, a login page or a proxy can all
 * answer HTTP 200 with HTML — that is NOT a delivery):
 *  - the configured endpoint must be an https origin;
 *  - redirects are never followed and never count as success;
 *  - every request is bounded by a timeout well inside the worker lease;
 *  - a send is only "sent" when CES answers 200/201 with JSON whose documented
 *    `status` is recorded/duplicate/replayed and whose echoed identifiers match
 *    what we sent;
 *  - nothing we return or store contains a raw response body or exception text:
 *    only short safe codes and validated field paths.
 */
import { MAX_BODY_BYTES, byteLength } from "./contract";

export const CES_DEFAULT_INTAKE_URL =
  "https://cevons-nexus-two.vercel.app/api/integrations/website/intake";
export const CES_DEFAULT_RECONCILE_URL =
  "https://cevons-nexus-two.vercel.app/api/integrations/website/reconcile";

/** Bounded request timeout. Well inside the 180s outbox lease. */
export const REQUEST_TIMEOUT_MS = 15_000;

export type CesConfig = { url: string; reconcileUrl: string; secret: string };

export type CesConfigStatus = {
  urlConfigured: boolean;
  secretConfigured: boolean;
  /** Host only — never the full URL with any token in it. */
  host: string | null;
  /** False when the configured endpoint is not a valid https origin. */
  secureOrigin: boolean;
  ready: boolean;
};

function intakeUrl(): string {
  return (process.env["CES_INTAKE_URL"] ?? "").trim() || CES_DEFAULT_INTAKE_URL;
}

/** Derive the reconcile endpoint from the configured intake endpoint. */
export function reconcileUrlFrom(url: string): string {
  return url.replace(/\/intake\/?$/, "/reconcile");
}

/** An intake endpoint must be https — plaintext would expose the payload. */
export function isSecureCesUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Read config at call time (env binds per request on the edge runtime). */
export function readCesConfig(): CesConfig | null {
  const url = intakeUrl();
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  if (!url || !secret || !isSecureCesUrl(url)) return null;
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
  const secureOrigin = !!url && isSecureCesUrl(url);
  return {
    urlConfigured: !!url,
    secretConfigured: !!secret,
    host,
    secureOrigin,
    ready: !!url && !!secret && secureOrigin,
  };
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
    accept: "application/json",
    "x-cevons-timestamp": timestamp,
    "x-cevons-event-id": eventId,
    "x-cevons-signature": `sha256=${signature}`,
  };
}

export type CesDeliveryResult = {
  ok: boolean;
  /** HTTP status, or null when the request never completed. */
  status: number | null;
  /** True when CES reported the event as duplicate/replayed. */
  duplicate: boolean;
  /** Short safe code for the admin screen. Never a response body or stack. */
  error?: string;
  /** Only network, timeout, 429, 500 and 503 are retried; 4xx needs diagnosis. */
  retryable: boolean;
};

const RETRYABLE_STATUS = new Set([429, 500, 503]);

/** Statuses CES documents for a successfully recorded delivery event. */
const SUCCESS_STATES = new Set(["recorded", "duplicate", "replayed"]);

export type ResponseValidation =
  | { ok: true; duplicate: boolean; state: string }
  | { ok: false; code: string };

function looksJson(contentType: string | null): boolean {
  return !!contentType && /application\/(problem\+)?json|\+json/i.test(contentType);
}

/**
 * Validate an intake reply. Pure so the HTML-200, wrong-JSON and mismatch
 * cases can be tested without a network.
 */
export function validateIntakeResponse(input: {
  status: number;
  contentType: string | null;
  text: string;
  eventId: string;
  externalId: string | null;
}): ResponseValidation {
  if (input.status !== 200 && input.status !== 201) return { ok: false, code: "unexpected_status" };
  if (!looksJson(input.contentType)) return { ok: false, code: "response.contentType:not_json" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.text);
  } catch {
    return { ok: false, code: "response.body:invalid_json" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, code: "response.body:not_object" };
  }

  const top = parsed as Record<string, unknown>;
  const nested =
    top["data"] && typeof top["data"] === "object" && !Array.isArray(top["data"])
      ? (top["data"] as Record<string, unknown>)
      : {};
  const pick = (key: string): unknown => top[key] ?? nested[key];

  const state = pick("status");
  if (typeof state !== "string") return { ok: false, code: "response.status:missing" };
  const normalized = state.trim().toLowerCase();
  if (!SUCCESS_STATES.has(normalized)) return { ok: false, code: "response.status:unrecognised" };

  const externalId = pick("externalId");
  if (typeof externalId === "string" && input.externalId && externalId !== input.externalId) {
    return { ok: false, code: "response.externalId:mismatch" };
  }
  const eventId = pick("eventId");
  if (typeof eventId === "string" && eventId !== input.eventId) {
    return { ok: false, code: "response.eventId:mismatch" };
  }

  return { ok: true, duplicate: normalized !== "recorded", state: normalized };
}

/** Read `externalId` out of the frozen body without trusting its shape. */
export function externalIdOf(rawBody: string): string | null {
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (parsed && typeof parsed === "object") {
      const value = (parsed as Record<string, unknown>)["externalId"];
      if (typeof value === "string") return value;
    }
  } catch {
    /* body validation happens elsewhere */
  }
  return null;
}

function isTimeout(err: unknown): boolean {
  return err instanceof Error && /abort|timeout/i.test(`${err.name} ${err.message}`);
}

async function signedFetch(
  url: string,
  secret: string,
  eventId: string,
  rawBody: string,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: await signedHeaders(secret, eventId, rawBody),
    body: rawBody,
    // A redirect is never a delivery: surface the 3xx instead of following it.
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

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
    const status = cesConfigStatus();
    return {
      ok: false,
      status: null,
      duplicate: false,
      error: status.urlConfigured && !status.secureOrigin ? "endpoint_not_https" : "not_configured",
      retryable: true,
    };
  }

  if (byteLength(rawBody) > MAX_BODY_BYTES) {
    return { ok: false, status: null, duplicate: false, error: "payload_too_large", retryable: false };
  }

  let res: Response;
  try {
    res = await signedFetch(config.url, config.secret, opts.eventId, rawBody);
  } catch (err) {
    return {
      ok: false,
      status: null,
      duplicate: false,
      error: isTimeout(err) ? "timeout" : "network_error",
      retryable: true,
    };
  }

  if (res.status >= 300 && res.status < 400) {
    return { ok: false, status: res.status, duplicate: false, error: "redirect_blocked", retryable: false };
  }

  if (res.status === 200 || res.status === 201) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      return { ok: false, status: res.status, duplicate: false, error: "response_unreadable", retryable: true };
    }
    const verdict = validateIntakeResponse({
      status: res.status,
      contentType: res.headers.get("content-type"),
      text,
      eventId: opts.eventId,
      externalId: externalIdOf(rawBody),
    });
    if (verdict.ok) {
      return { ok: true, status: res.status, duplicate: verdict.duplicate, retryable: false };
    }
    // A 200 that is not the documented JSON is an unverified delivery, not a
    // success — retry so a proxy/login page cannot silently swallow a request.
    return { ok: false, status: res.status, duplicate: false, error: verdict.code, retryable: true };
  }

  const retryable = RETRYABLE_STATUS.has(res.status) || res.status >= 500;
  return {
    ok: false,
    status: res.status,
    duplicate: false,
    error: `http_${res.status}${diagnosis(res.status) ? `:${diagnosis(res.status)}` : ""}`,
    retryable,
  };
}

/** Plain-language cause code for the statuses CES documents as non-retryable. */
export function diagnosis(status: number): string {
  switch (status) {
    case 400:
      return "malformed_request";
    case 401:
      return "signature_rejected";
    case 413:
      return "payload_too_large";
    case 422:
      return "field_validation_failed";
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

export type ReconcileValidation =
  | { ok: true; data: ReconcileResponse }
  | { ok: false; code: string };

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Validate the documented reconcile shape. Pure and testable. */
export function validateReconcileResponse(input: {
  status: number;
  contentType: string | null;
  text: string;
}): ReconcileValidation {
  if (input.status !== 200) return { ok: false, code: "unexpected_status" };
  if (!looksJson(input.contentType)) return { ok: false, code: "response.contentType:not_json" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.text);
  } catch {
    return { ok: false, code: "response.body:invalid_json" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, code: "response.body:not_object" };
  }

  const top = parsed as Record<string, unknown>;
  if (!Array.isArray(top["enquiries"])) return { ok: false, code: "response.enquiries:not_array" };
  if (top["missing"] !== undefined && !Array.isArray(top["missing"])) {
    return { ok: false, code: "response.missing:not_array" };
  }
  if (top["count"] !== undefined && typeof top["count"] !== "number") {
    return { ok: false, code: "response.count:not_number" };
  }

  const enquiries: ReconcileResponse["enquiries"] = [];
  for (let i = 0; i < (top["enquiries"] as unknown[]).length; i++) {
    const raw = (top["enquiries"] as unknown[])[i];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { ok: false, code: `response.enquiries[${i}]:not_object` };
    }
    const e = raw as Record<string, unknown>;
    if (typeof e["externalId"] !== "string" || !e["externalId"]) {
      return { ok: false, code: `response.enquiries[${i}].externalId:missing` };
    }
    enquiries.push({
      externalId: e["externalId"],
      reference: optionalString(e["reference"]),
      leadId: optionalString(e["leadId"]),
      submittedAt: optionalString(e["submittedAt"]),
      receivedAt: optionalString(e["receivedAt"]),
      stage: optionalString(e["stage"]),
    });
  }

  const missing = ((top["missing"] as unknown[]) ?? []).filter(
    (m): m is string => typeof m === "string",
  );

  return {
    ok: true,
    data: {
      count: typeof top["count"] === "number" ? top["count"] : enquiries.length,
      enquiries,
      missing,
      nextCursor: optionalString(top["nextCursor"]),
    },
  };
}

export async function reconcileWithCes(request: {
  externalIds?: string[];
  since?: string;
  until?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ ok: boolean; status: number | null; error?: string; data?: ReconcileResponse }> {
  const config = readCesConfig();
  if (!config) {
    const status = cesConfigStatus();
    return {
      ok: false,
      status: null,
      error: status.urlConfigured && !status.secureOrigin ? "endpoint_not_https" : "not_configured",
    };
  }

  const rawBody = JSON.stringify(request);
  const eventId = `reconcile:${crypto.randomUUID()}`;

  let res: Response;
  try {
    res = await signedFetch(config.reconcileUrl, config.secret, eventId, rawBody);
  } catch (err) {
    return { ok: false, status: null, error: isTimeout(err) ? "timeout" : "network_error" };
  }

  if (res.status >= 300 && res.status < 400) {
    return { ok: false, status: res.status, error: "redirect_blocked" };
  }
  if (res.status !== 200) {
    const cause = diagnosis(res.status);
    return { ok: false, status: res.status, error: `http_${res.status}${cause ? `:${cause}` : ""}` };
  }

  let text = "";
  try {
    text = await res.text();
  } catch {
    return { ok: false, status: res.status, error: "response_unreadable" };
  }

  const verdict = validateReconcileResponse({
    status: res.status,
    contentType: res.headers.get("content-type"),
    text,
  });
  if (!verdict.ok) return { ok: false, status: res.status, error: verdict.code };
  return { ok: true, status: res.status, data: verdict.data };
}

/** Exponential backoff with a cap: 1m, 4m, 16m, 1h, 4h, then 6h. */
export function backoffSeconds(attempts: number): number {
  const base = 60 * Math.pow(4, Math.max(0, attempts - 1));
  return Math.min(base, 6 * 3600);
}
