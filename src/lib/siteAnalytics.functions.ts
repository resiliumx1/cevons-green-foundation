import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Read-only website analytics for the protected admin area.
 *
 * The Google credentials stay on the server: only aggregated report figures
 * ever cross back to the browser. Every call verifies that the signed-in
 * person is an owner or admin through their own RLS-scoped session.
 */

export type ReportState = "ok" | "unconfigured" | "permission" | "error";

export type SiteAnalytics = {
  days: number;
  ga: {
    state: ReportState;
    message?: string;
    data?: Awaited<ReturnType<typeof import("./analytics/google.server").runGa4Report>>;
  };
  search: {
    state: ReportState;
    message?: string;
    data?: Awaited<
      ReturnType<typeof import("./analytics/google.server").runSearchConsoleReport>
    >;
  };
};

export const getSiteAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number }) => {
    const days = Number(input?.days ?? 28);
    return { days: [7, 28, 90].includes(days) ? days : 28 };
  })
  .handler(async ({ data, context }): Promise<SiteAnalytics> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdmin) throw new Error("Only an owner or admin can view website analytics.");

    const mod = await import("./analytics/google.server");
    const { AnalyticsConfigError, AnalyticsPermissionError } = mod;

    const describe = (err: unknown): { state: ReportState; message: string } => {
      if (err instanceof AnalyticsConfigError) {
        return { state: "unconfigured", message: err.message };
      }
      if (err instanceof AnalyticsPermissionError) {
        return { state: "permission", message: err.message };
      }
      return {
        state: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      };
    };

    const [ga, search] = await Promise.all([
      mod
        .runGa4Report(data.days)
        .then((d) => ({ state: "ok" as ReportState, data: d }))
        .catch(describe),
      mod
        .runSearchConsoleReport(data.days)
        .then((d) => ({ state: "ok" as ReportState, data: d }))
        .catch(describe),
    ]);

    return { days: data.days, ga, search } as SiteAnalytics;
  });
