/**
 * Lazily loads the generated Supabase browser client.
 *
 * Public pages only talk to the backend *after* they have rendered (published
 * copy, image slots, promotions), so keeping this library out of the first
 * script the browser downloads makes pages appear noticeably sooner —
 * especially on phones. Behaviour of the calls themselves is unchanged.
 */
export async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}
