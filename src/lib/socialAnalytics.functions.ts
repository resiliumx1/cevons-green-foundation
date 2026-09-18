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

    return { tiktok, facebook, instagram };
  });
