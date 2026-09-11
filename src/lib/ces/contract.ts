/**
 * CES Marketing Inbox — contract adapter (ISOLATED, pure).
 *
 * Implements the published CES intake contract exactly:
 *   POST {CES_INTAKE_URL}
 *   headers: x-cevons-timestamp (unix seconds), x-cevons-event-id,
 *            x-cevons-signature: sha256=<hex HMAC-SHA256>
 *   signing base: `${timestamp}.${eventId}.${rawBody}`
 *
 * Body is strict camelCase with NO unknown keys. Oversized values are
 * truncated for transport only and reported as issues — the website record
 * itself is never modified.
 */

export type CesEntityType = "service_request" | "contact_message";
export type CesMode = "live" | "backfill";

/** Row shape we read out of the website database (subset we forward). */
export type CesSourceRecord = {
  id: string;
  reference: string | null;
  created_at: string;
  entity_type: CesEntityType;
  [key: string]: unknown;
};

/** Deterministic dedupe key for the outbox — one queue row per website record. */
export function cesEventId(entityType: CesEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

/** Query strings/click ids are kept for attribution; grouping uses the path. */
export function landingPathname(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(value, "https://cevons.com");
    const path = url.pathname.replace(/\/+$/, "");
    return path === "" ? "/" : path;
  } catch {
    const path = value.split("?")[0]!.split("#")[0]!.replace(/\/+$/, "");
    return path === "" ? "/" : path || null;
  }
}

const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "li_fat_id"];

/** Ad click identifiers pulled out of the stored landing page, for attribution. */
export function clickIds(raw: string | null | undefined): Record<string, string> {
  const value = (raw ?? "").trim();
  if (!value) return {};
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(value, "https://cevons.com");
    const out: Record<string, string> = {};
    for (const key of CLICK_ID_KEYS) {
      const v = url.searchParams.get(key);
      if (v) out[key] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export type CesUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type CesPipeline = "residential" | "commercial" | "industrial" | "specialty";

/** Exactly the keys CES accepts. Unknown keys are rejected by CES with 422. */
export type CesBody = {
  externalId: string;
  name: string;
  submittedAt: string;
  reference?: string;
  email?: string;
  phone?: string;
  service?: string;
  region?: string;
  address?: string;
  message?: string;
  landingPage?: string;
  referrer?: string;
  sourceUrl?: string;
  status?: string;
  utm?: CesUtm;
  pipeline?: CesPipeline;
  branchCode?: string;
  backfill?: boolean;
};

export const MAX_BODY_BYTES = 64 * 1024;

const LIMITS = {
  externalId: 200,
  name: 200,
  reference: 100,
  email: 320,
  phone: 50,
  service: 200,
  region: 200,
  address: 500,
  message: 5000,
  landingPage: 1000,
  referrer: 1000,
  sourceUrl: 1000,
  status: 100,
  utm: 200,
} as const;

export type BuildIssue = { field: string; reason: string };

export type BuildResult = {
  body: CesBody;
  issues: BuildIssue[];
  /** Byte length of JSON.stringify(body). */
  bytes: number;
};

function text(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
}

function clamp(
  value: unknown,
  field: string,
  max: number,
  issues: BuildIssue[],
): string | undefined {
  const s = text(value);
  if (s === undefined) return undefined;
  if (s.length <= max) return s;
  issues.push({ field, reason: `truncated from ${s.length} to ${max} characters for delivery` });
  return s.slice(0, max);
}

function httpUrl(value: unknown, field: string, issues: BuildIssue[]): string | undefined {
  const s = clamp(value, field, LIMITS.sourceUrl, issues);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      issues.push({ field, reason: "omitted: not an http/https URL" });
      return undefined;
    }
    return s;
  } catch {
    issues.push({ field, reason: "omitted: not an absolute URL" });
    return undefined;
  }
}

export function toIsoOffset(value: unknown): string {
  const d = value ? new Date(String(value)) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString();
}

const PIPELINES: CesPipeline[] = ["residential", "commercial", "industrial", "specialty"];

/** Map the website's customer type / category onto the CES pipeline enum. */
export function toPipeline(...candidates: unknown[]): CesPipeline | undefined {
  for (const c of candidates) {
    const s = text(c)?.toLowerCase();
    if (!s) continue;
    const hit = PIPELINES.find((p) => s.includes(p));
    if (hit) return hit;
    if (s.includes("home") || s.includes("household")) return "residential";
    if (s.includes("business") || s.includes("office") || s.includes("retail")) return "commercial";
    if (s.includes("factory") || s.includes("plant") || s.includes("mining")) return "industrial";
  }
  return undefined;
}

/** CES accepts /^[A-Z]{2,8}$/ only; anything else is dropped and reported. */
export function toBranchCode(value: unknown, issues: BuildIssue[] = []): string | undefined {
  const s = text(value);
  if (!s) return undefined;
  const code = s.toUpperCase().replace(/[^A-Z]/g, "");
  if (/^[A-Z]{2,8}$/.test(code)) return code;
  issues.push({ field: "branchCode", reason: `omitted: "${s}" is not a 2-8 letter code` });
  return undefined;
}

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/**
 * Map a committed website record to the CES intake body.
 * `backfill: true` tells CES not to raise alerts or email the customer.
 */
export function buildCesBody(record: CesSourceRecord, mode: CesMode): BuildResult {
  const r = record as Record<string, any>;
  const issues: BuildIssue[] = [];

  const utmEntries: Array<[keyof CesUtm, unknown]> = [
    ["source", r["utm_source"]],
    ["medium", r["utm_medium"]],
    ["campaign", r["utm_campaign"]],
    ["content", r["utm_content"]],
    ["term", r["utm_term"]],
  ];
  const utm: CesUtm = {};
  for (const [key, value] of utmEntries) {
    const v = clamp(value, `utm.${key}`, LIMITS.utm, issues);
    if (v) utm[key] = v;
  }

  const landing = clamp(r["landing_page"], "landingPage", LIMITS.landingPage, issues);

  const body: CesBody = {
    externalId: clamp(record.id, "externalId", LIMITS.externalId, issues) ?? String(record.id),
    name: clamp(r["name"], "name", LIMITS.name, issues) ?? "Website enquiry",
    submittedAt: toIsoOffset(record.created_at),
  };

  const optional: Array<[keyof CesBody, string | undefined]> = [
    ["reference", clamp(record.reference, "reference", LIMITS.reference, issues)],
    ["email", clamp(r["email"], "email", LIMITS.email, issues)],
    ["phone", clamp(r["phone"], "phone", LIMITS.phone, issues)],
    [
      "service",
      clamp(r["service"] ?? r["subject"] ?? r["category"], "service", LIMITS.service, issues),
    ],
    ["region", clamp(r["region"], "region", LIMITS.region, issues)],
    ["address", clamp(r["address"], "address", LIMITS.address, issues)],
    ["message", clamp(r["message"], "message", LIMITS.message, issues)],
    ["landingPage", landing],
    ["referrer", clamp(r["referrer"], "referrer", LIMITS.referrer, issues)],
    ["sourceUrl", httpUrl(r["landing_page"], "sourceUrl", issues)],
    ["status", clamp(r["status"], "status", LIMITS.status, issues)],
  ];
  for (const [key, value] of optional) {
    if (value !== undefined) (body as Record<string, unknown>)[key] = value;
  }

  if (Object.keys(utm).length > 0) body.utm = utm;

  const pipeline = toPipeline(r["customer_type"], r["category"]);
  if (pipeline) body.pipeline = pipeline;

  const branchCode = toBranchCode(r["service_branch"], issues);
  if (branchCode) body.branchCode = branchCode;

  if (mode === "backfill") body.backfill = true;

  // Hard transport ceiling: shrink the free-text field rather than fail.
  let bytes = byteLength(JSON.stringify(body));
  if (bytes > MAX_BODY_BYTES && body.message) {
    const overflow = bytes - MAX_BODY_BYTES;
    const keep = Math.max(0, body.message.length - overflow - 64);
    body.message = body.message.slice(0, keep);
    issues.push({ field: "message", reason: "shortened to keep the delivery under 64 kB" });
    bytes = byteLength(JSON.stringify(body));
  }

  return { body, issues, bytes };
}
