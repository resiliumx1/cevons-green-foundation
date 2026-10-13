import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

// Best-effort per-IP limit (per worker instance): 20 lookups / 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const win = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  win.push(now);
  hits.set(ip, win);
  if (hits.size > 5000) hits.clear();
  return win.length > 20;
}

const digits = (s: string) => s.replace(/[^\d]/g, "");

export const trackRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { reference: string; contact: string }) => ({
    reference: String(d?.reference ?? ""),
    contact: String(d?.contact ?? ""),
  }))
  .handler(async ({ data }) => {
    const ip = (getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || "unknown").split(",")[0]!.trim();
    if (limited(ip)) return { error: "rate_limited" as const };

    const reference = data.reference.trim().toUpperCase();
    const contact = data.contact.trim();
    if (reference.length < 6 || reference.length > 32) return { error: "not_found" as const };
    if (contact.length < 4 || contact.length > 320) return { error: "not_found" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("service_requests")
      .select("id, reference, service, category, status, region, created_at, preferred_date, preferred_time, email, phone")
      .eq("reference", reference)
      .maybeSingle();
    if (!row) return { error: "not_found" as const };
    const matches = contact.includes("@")
      ? (row.email ?? "").toLowerCase() === contact.toLowerCase()
      : digits(row.phone ?? "") === digits(contact) && digits(contact).length >= 6;
    if (!matches) return { error: "not_found" as const };

    const request = {
      reference: row.reference as string,
      service: row.service,
      category: row.category,
      status: row.status as string,
      region: row.region,
      created_at: row.created_at as string,
      preferred_date: row.preferred_date as string | null,
      preferred_time: row.preferred_time as string | null,
    };

    try {
      const { data: outbox } = await supabaseAdmin
        .from("ces_outbox")
        .select("id")
        .eq("entity_type", "service_request")
        .eq("entity_id", row.id);
      const { askCesStatus } = await import("@/lib/ces/status.server");
      const ces = await askCesStatus({ externalId: row.id, salesExternalIds: (outbox ?? []).map((o) => o.id as string) });
      if (ces?.found) {
        return {
          request: { ...request, status: ces.stage ?? request.status },
          events: ces.events.map((e) => ({ status: e.stage as string, note: null as string | null, created_at: e.at })),
          visit: ces.visit,
          source: "ces" as const,
        };
      }
    } catch {
      /* fall back to website status */
    }

    const { data: events } = await supabaseAdmin
      .from("request_status_events")
      .select("status, note, created_at")
      .eq("request_id", row.id)
      .order("created_at", { ascending: true });
    return {
      request,
      events: (events ?? []) as { status: string; note: string | null; created_at: string }[],
      visit: null,
      source: "website" as const,
    };
  });
