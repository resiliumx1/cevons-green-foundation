/**
 * Verifies the bearer used by database-triggered calls (CES drain, push fan-out).
 * Accepts the dedicated drain key (checked inside the database, never stored in code),
 * plus the legacy service-role / NOTIFY_DISPATCH_SECRET bearers.
 */
export async function isAuthorizedDispatchCaller(request: Request): Promise<boolean> {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return false;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const dispatchSecret = process.env["NOTIFY_DISPATCH_SECRET"];
  if (serviceKey && token === serviceKey) return true;
  if (dispatchSecret && token === dispatchSecret) return true;
  if (token.length < 32) return false;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("check_ces_drain_token", { _token: token });
    return !error && data === true;
  } catch {
    return false;
  }
}
