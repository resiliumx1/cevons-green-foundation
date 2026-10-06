/**
 * CES Sales inbox delivery — SERVER ONLY.
 *
 * Independent second delivery of live service requests. Uses only the
 * `sales_*` columns of ces_outbox; the Marketing columns are never touched.
 * Every write is conditional on still holding `sales_lease_token`.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { clickIds } from "./contract";
import { REQUEST_TIMEOUT_MS, backoffSeconds, signedHeaders } from "./delivery.server";
import { MAX_ATTEMPTS } from "./engine";

export const CES_SALES_URL = "https://cevons-nexus-two.vercel.app/api/integrations/sales-request";
const LEASE_SECONDS = 180;

export type SalesDrainResult = {
  configured: boolean;
  attempted: number;
  sent: number;
  failed: number;
  dead: number;
};

type Row = {
  id: string;
  entity_id: string;
  sales_attempts: number;
  sales_request_body: string | null;
  sales_lease_token: string | null;
};

function put(out: Record<string, unknown>, key: string, value: unknown) {
  if (value === null || value === undefined) return;
  const s = typeof value === "string" ? value.trim() : String(value);
  if (s) out[key] = s;
}

async function buildSalesBody(row: Row): Promise<string | null> {
  const { data: r } = await supabaseAdmin
    .from("service_requests")
    .select(
      "created_at, name, company, email, phone, service, category, message, details, region, preferred_date, landing_page, referrer, source_channel, utm_source, utm_medium, utm_campaign, utm_content, utm_term",
    )
    .eq("id", row.entity_id)
    .maybeSingle();
  if (!r) return null;
  const details = (r.details ?? {}) as Record<string, unknown>;
  const body: Record<string, unknown> = {};
  put(body, "externalId", row.id);
  put(body, "submittedAt", r.created_at ? new Date(r.created_at).toISOString() : null);
  put(body, "name", r.name);
  put(body, "company", r.company);
  put(body, "email", r.email);
  put(body, "phone", r.phone);
  put(body, "service", (r.service ?? "").trim() || r.category);
  put(body, "message", r.message);
  put(body, "address", typeof details["location"] === "string" ? details["location"] : null);
  put(body, "area", r.region);
  put(body, "preferredDate", r.preferred_date ? String(r.preferred_date).slice(0, 10) : null);
  put(body, "landingPage", r.landing_page);
  put(body, "referrer", r.referrer);
  put(body, "form", (r.source_channel ?? "").trim() || "request-service");
  const utm: Record<string, unknown> = {};
  put(utm, "source", r.utm_source);
  put(utm, "medium", r.utm_medium);
  put(utm, "campaign", r.utm_campaign);
  put(utm, "content", r.utm_content);
  put(utm, "term", r.utm_term);
  if (Object.keys(utm).length) body["utm"] = utm;
  const ids = clickIds(r.landing_page);
  for (const k of ["gclid", "fbclid", "ttclid"]) put(body, k, ids[k]);
  return JSON.stringify(body);
}

async function write(row: Row, patch: Record<string, unknown>) {
  await supabaseAdmin
    .from("ces_outbox")
    .update(patch as never)
    .eq("id", row.id)
    .eq("sales_lease_token", row.sales_lease_token as string);
}

type Outcome = "sent" | "failed" | "dead";

async function deliverOne(row: Row, secret: string): Promise<Outcome> {
  let raw = row.sales_request_body;
  if (!raw) {
    raw = await buildSalesBody(row);
    if (!raw) {
      await write(row, { sales_status: "dead", sales_last_error: "source_missing", sales_lease_token: null, sales_lease_expires_at: null });
      return "dead";
    }
    await write(row, { sales_request_body: raw });
  }

  let status: number | null = null;
  let error = "";
  try {
    const res = await fetch(CES_SALES_URL, {
      method: "POST",
      headers: await signedHeaders(secret, row.id, raw),
      body: raw,
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    status = res.status;
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
  } catch (err) {
    error = err instanceof Error && /abort|timeout/i.test(`${err.name} ${err.message}`) ? "timeout" : "network_error";
  }

  if (status === 200 || status === 201) {
    await write(row, {
      sales_status: "sent",
      sales_sent_at: new Date().toISOString(),
      sales_last_status_code: status,
      sales_last_error: null,
      sales_lease_token: null,
      sales_lease_expires_at: null,
    });
    return "sent";
  }
  if (status === 401 || status === 422) {
    await write(row, {
      sales_status: "dead",
      sales_last_status_code: status,
      sales_last_error: status === 401 ? "http_401:signature_rejected" : "http_422:payload_rejected",
      sales_lease_token: null,
      sales_lease_expires_at: null,
    });
    return "dead";
  }
  const attempts = (row.sales_attempts ?? 0) + 1;
  const dead = attempts >= MAX_ATTEMPTS;
  if (status !== null) error = status >= 300 && status < 400 ? `http_${status}:redirect` : `http_${status}`;
  await write(row, {
    sales_status: dead ? "dead" : "failed",
    sales_attempts: attempts,
    sales_last_status_code: status,
    sales_last_error: error,
    sales_next_attempt_at: new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString(),
    sales_lease_token: null,
    sales_lease_expires_at: null,
  });
  return dead ? "dead" : "failed";
}

export async function drainSalesOutbox(limit = 25): Promise<SalesDrainResult> {
  const result: SalesDrainResult = { configured: false, attempted: 0, sent: 0, failed: 0, dead: 0 };
  const secret = (process.env["WEBSITE_INTAKE_SECRET"] ?? "").trim();
  if (!secret) return result;
  result.configured = true;
  const { data, error } = await supabaseAdmin.rpc("ces_sales_claim" as never, {
    _limit: limit,
    _lease_seconds: LEASE_SECONDS,
  } as never);
  if (error) throw new Error("sales_claim_failed");
  for (const row of ((data ?? []) as Row[])) {
    result.attempted++;
    try {
      const o = await deliverOne(row, secret);
      result[o]++;
    } catch {
      result.failed++;
    }
  }
  return result;
}
