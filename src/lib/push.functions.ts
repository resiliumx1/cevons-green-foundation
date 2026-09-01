import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Remember this device so the server can push alerts to it. */
export const registerPushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { token: string; userAgent?: string }) => {
    const token = String(input?.token ?? "").trim();
    if (token.length < 20 || token.length > 4096) throw new Error("Invalid push token");
    return { token, userAgent: String(input?.userAgent ?? "").slice(0, 300) };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("admin_push_tokens").upsert(
      {
        user_id: context.userId,
        token: data.token,
        user_agent: data.userAgent || null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Forget this device. */
export const unregisterPushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { token: string }) => ({ token: String(input?.token ?? "").trim() }))
  .handler(async ({ data, context }) => {
    if (!data.token) return { ok: true };
    const { error } = await context.supabase
      .from("admin_push_tokens")
      .delete()
      .eq("token", data.token)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** How many devices the signed-in admin currently receives push alerts on. */
export const countMyPushDevices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("admin_push_tokens")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { devices: count ?? 0 };
  });
