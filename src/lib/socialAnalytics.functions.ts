import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SocialProfile } from "./analytics/social.server";

/**
 * Read-only social analytics for the protected admin area.
 *
 * Only an owner or admin can read it. Credentials stay server-side; only the
 * aggregated figures each platform actually returns cross back to the browser.
 */

export type SocialReportState = "ok" | "unconfigured" | "permission" | "error";

export type SocialReport = {
  state: SocialReportState;
  message?: string;
  data?: SocialProfile;
};

export type SocialAnalytics = {
  tiktok: SocialReport;
  facebook: SocialReport;
  instagram: SocialReport;
};

export const getSocialAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SocialAnalytics> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdmin) throw new Error("Only an owner or admin can view social analytics.");

    const mod = await import("./analytics/social.server");
    const { SocialConfigError, SocialPermissionError } = mod;

    const describe = (err: unknown): SocialReport => {
      if (err instanceof SocialConfigError) {
        return { state: "unconfigured", message: err.message };
      }
      if (err instanceof SocialPermissionError) {
        return { state: "permission", message: err.message };
      }
      return { state: "error", message: err instanceof Error ? err.message : "Unknown error" };
    };

    const ok = (data: SocialProfile): SocialReport => ({ state: "ok", data });

    const [tiktok, facebook, instagram] = await Promise.all([
      mod.runTikTokReport().then(ok).catch(describe),
      mod.runFacebookReport().then(ok).catch(describe),
      mod.runInstagramReport().then(ok).catch(describe),
    ]);

    // Keep a daily record of what each platform reports today, so reports can
    // show real growth from now on. A hand-typed entry is never overwritten.
    const today = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await Promise.all(
      ([["tiktok", tiktok], ["facebook", facebook], ["instagram", instagram]] as const).map(
        async ([platform, report]) => {
          const p = report.state === "ok" ? report.data : undefined;
          if (!p || p.followers === null || p.followers === undefined) return;
          const values = {
            platform,
            day: today,
            followers: p.followers,
            posts: p.posts,
            likes: p.likes,
            source: "auto" as const,
          };
          const { data: existing } = await context.supabase
            .from("social_daily_stats")
            .select("id, source")
            .eq("platform", platform)
            .eq("day", today)
            .maybeSingle();
          if (!existing) {
            await context.supabase.from("social_daily_stats").insert(values);
          } else if (existing.source === "auto") {
            await context.supabase.from("social_daily_stats").update(values).eq("id", existing.id);
          }
        },
      ),
    ).catch(() => {
      // Recording is a background courtesy; never block the figures on it.
    });

    return { tiktok, facebook, instagram };
  });

