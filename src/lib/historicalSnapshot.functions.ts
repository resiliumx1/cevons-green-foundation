import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Fixed historical traffic snapshot (Lovable hosting analytics).
 *
 * This is a one-off set of figures captured on 11 September 2026 and stored
 * server-side. It is NOT live, NOT Google Analytics and NOT Google Search
 * data, and its counts must never be added to those reports. Only an owner or
 * admin can read it; the row itself is read-only from the website.
 */

export type SnapshotPoint = { date: string; value: number };
export type SnapshotBreakdown = { label: string; data: Array<{ label: string; value: number }> };

export type HostingSnapshot = {
  source: string;
  projectId: string;
  requestedStart: string;
  requestedEnd: string;
  totals: {
    visitors: number;
    pageviews: number;
    pageviewsPerVisit: number;
    sessionDuration: number;
    bounceRate: number;
  };
  dailyVisitors: SnapshotPoint[];
  dailyPageviews: SnapshotPoint[];
  breakdowns: Record<string, SnapshotBreakdown>;
};

export type HistoricalSnapshot = {
  fetchedAt: string;
  requestedStart: string;
  requestedEnd: string;
  /** First and last bucket the provider actually returned. */
  coverage: { firstBucket: string | null; lastBucket: string | null; buckets: number };
  payload: HostingSnapshot;
};

export const getHistoricalSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HistoricalSnapshot | null> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdmin) throw new Error("Only an owner or admin can view website analytics.");

    const { data, error } = await context.supabase
      .from("analytics_snapshots")
      .select("fetched_at, requested_start, requested_end, payload")
      .eq("source", "Lovable hosting analytics")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error("Could not load the stored snapshot.");
    if (!data) return null;

    const payload = data.payload as unknown as HostingSnapshot;
    const days = payload.dailyVisitors ?? [];
    return {
      fetchedAt: data.fetched_at,
      requestedStart: data.requested_start,
      requestedEnd: data.requested_end,
      coverage: {
        firstBucket: days[0]?.date ?? null,
        lastBucket: days[days.length - 1]?.date ?? null,
        buckets: days.length,
      },
      payload,
    };
  });
