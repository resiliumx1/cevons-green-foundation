// Public submit endpoint for the service request form.
// Performs server-side validation and inserts via service_role, so the
// underlying SECURITY DEFINER RPC no longer needs to be callable by
// anon/authenticated users.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const message = String(payload.message ?? "");

  if (!name || name.length > 200) return json({ error: "Invalid name" }, 400);
  if (!phone || phone.length > 40) return json({ error: "Invalid phone" }, 400);
  if (email && (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return json({ error: "Invalid email" }, 400);
  if (message.length > 5000) return json({ error: "Message too long" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Delegate to the existing SQL function via service_role (bypasses revoked grants).
  const { data, error } = await supabase.rpc("submit_service_request", { payload: payload as never });
  if (error) {
    console.error("submit_service_request error", error);
    return json({ error: "Failed to submit request" }, 500);
  }
  return json({ reference: data });
});
