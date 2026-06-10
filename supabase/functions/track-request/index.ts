// Public lookup for service request status.
// Verifies reference + contact (email or phone) match server-side; returns
// only safe customer-facing fields plus the status timeline.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizePhone(s: string): string {
  return s.replace(/[^\d]/g, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { reference?: string; contact?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const reference = (body.reference ?? "").trim().toUpperCase();
  const contact = (body.contact ?? "").trim();

  if (!reference || reference.length < 6 || reference.length > 32) {
    return json({ error: "Invalid reference" }, 400);
  }
  if (!contact || contact.length < 4 || contact.length > 320) {
    return json({ error: "Invalid contact" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: row, error } = await supabase
    .from("service_requests")
    .select("id, reference, service, category, status, region, created_at, preferred_date, preferred_time, email, phone")
    .eq("reference", reference)
    .maybeSingle();

  if (error) return json({ error: "Lookup failed" }, 500);
  if (!row) return json({ error: "not_found" }, 404);

  const isEmail = contact.includes("@");
  const matches = isEmail
    ? (row.email ?? "").toLowerCase() === contact.toLowerCase()
    : normalizePhone(row.phone ?? "") === normalizePhone(contact) &&
      normalizePhone(contact).length >= 6;

  if (!matches) return json({ error: "not_found" }, 404);

  const { data: events } = await supabase
    .from("request_status_events")
    .select("status, note, created_at")
    .eq("request_id", row.id)
    .order("created_at", { ascending: true });

  return json({
    request: {
      reference: row.reference,
      service: row.service,
      category: row.category,
      status: row.status,
      region: row.region,
      created_at: row.created_at,
      preferred_date: row.preferred_date,
      preferred_time: row.preferred_time,
    },
    events: events ?? [],
  });
});
