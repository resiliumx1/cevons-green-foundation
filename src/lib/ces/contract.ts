/**
 * CES Marketing Inbox — contract adapter (ISOLATED).
 *
 * This is the ONLY place that knows the shape CES expects. It is pure: no
 * secrets, no network, no environment reads, so it is safe to unit test and
 * safe to read from anywhere. When CES publishes its final schema, change
 * this file and nothing else.
 *
 * ── Fields that must be aligned once CES reports ──────────────────────────
 *  1. Endpoint path + HTTP method (currently: POST to CES_INTAKE_URL as-is).
 *  2. Signature header names and the exact signing base string
 *     (see delivery.server.ts — currently `X-Cevons-Signature`,
 *     `X-Cevons-Timestamp`, base = `${timestamp}.${rawBody}`).
 *  3. Field names below: external_id / event_id / occurred_at / source.
 *  4. Whether CES wants ISO timestamps or epoch seconds.
 *  5. The enum values for `type` (service_request | contact_message).
 *  6. Whether `backfill: true` is the agreed flag that suppresses CES
 *     notifications, or a header/`mode` field instead.
 *  7. Success criteria: which HTTP codes mean "accepted" vs "retry".
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

/** Stable, deterministic id — reruns and retries never create a duplicate. */
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

export type CesPayload = Record<string, unknown>;

/**
 * Map a website record to the CES intake payload.
 * Marked `backfill` for historical sends so CES does not notify for them.
 */
export function buildCesPayload(record: CesSourceRecord, mode: CesMode): CesPayload {
  const r = record as Record<string, any>;
  const landing = (r["landing_page"] ?? null) as string | null;

  const attribution = {
    utm_source: r["utm_source"] ?? null,
    utm_medium: r["utm_medium"] ?? null,
    utm_campaign: r["utm_campaign"] ?? null,
    utm_term: r["utm_term"] ?? null,
    utm_content: r["utm_content"] ?? null,
    referrer: r["referrer"] ?? null,
    // Full landing URL retained (query string + click ids intact).
    landing_page: landing,
    landing_path: landingPathname(landing),
    click_ids: clickIds(landing),
  };

  const base = {
    source: "cevons.com",
    event_id: cesEventId(record.entity_type, record.id),
    external_id: record.reference ?? record.id,
    type: record.entity_type,
    occurred_at: record.created_at,
    backfill: mode === "backfill",
    attribution,
  };

  if (record.entity_type === "service_request") {
    return {
      ...base,
      request: {
        reference: r["reference"] ?? null,
        category: r["category"] ?? null,
        service: r["service"] ?? null,
        customer_type: r["customer_type"] ?? null,
        details: r["details"] ?? {},
        preferred_date: r["preferred_date"] ?? null,
        preferred_time: r["preferred_time"] ?? null,
        region: r["region"] ?? null,
        service_branch: r["service_branch"] ?? null,
        status: r["status"] ?? null,
        message: r["message"] ?? null,
        file_urls: Array.isArray(r["file_urls"]) ? r["file_urls"] : [],
      },
      contact: {
        name: r["name"] ?? null,
        email: r["email"] ?? null,
        phone: r["phone"] ?? null,
        company: r["company"] ?? null,
        contact_method: r["contact_method"] ?? null,
      },
    };
  }

  return {
    ...base,
    message: {
      reference: r["reference"] ?? null,
      subject: r["subject"] ?? null,
      body: r["message"] ?? null,
      status: r["status"] ?? null,
      attachment_url: r["attachment_url"] ?? null,
    },
    contact: {
      name: r["name"] ?? null,
      email: r["email"] ?? null,
      phone: r["phone"] ?? null,
    },
  };
}
