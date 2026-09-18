import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportSource } from "./shared";

/**
 * Real figures a report may quote.
 *
 * Every block is either available with numbers that came from a live source,
 * or unavailable with a plain reason. Nothing here is estimated or invented:
 * the AI writer is given only this object and told it may not add figures.
 */

export type FactBlock<T> = { available: true; data: T } | { available: false; note: string };

export type Pair = { key: string; value: number };

export type RequestFacts = {
  total: number;
  byStatus: Pair[];
  byService: Pair[];
  byRegion: Pair[];
  byMonth: Pair[];
};

export type MessageFacts = {
  total: number;
  byStatus: Pair[];
  byMonth: Pair[];
};

export type TrafficFacts = {
  coverage: string;
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
  channels: Pair[];
  pages: Pair[];
  devices: Pair[];
};

/**
 * Growth measured from our own daily record of what the platform reported.
 * It only covers days on which a figure was recorded — never estimated.
 */
export type FollowerGrowth = {
  firstDay: string;
  firstFollowers: number;
  lastDay: string;
  lastFollowers: number;
  change: number;
  daysRecorded: number;
  series: Pair[];
  /** Profile views, only for days where a figure was recorded or imported. */
  profileViewsTotal?: number;
  profileViewsDays?: number;
};

export type TikTokFacts = {
  followers: number | null;
  posts: number | null;
  likes: number | null;
  videosAnalyzed: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageViews: number;
  engagementRate: number | null;
  topByViews: Array<{ caption: string; views: number | null }>;
  followerGrowth?: FollowerGrowth;
  followerGrowthNote?: string;
};

export type PageFacts = {
  followers: number | null;
  posts: number | null;
  likes: number | null;
  followerGrowth?: FollowerGrowth;
  followerGrowthNote?: string;
};


export type ReportFacts = {
  periodStart: string;
  periodEnd: string;
  requests?: FactBlock<RequestFacts>;
  messages?: FactBlock<MessageFacts>;
  traffic?: FactBlock<TrafficFacts>;
  tiktok?: FactBlock<TikTokFacts>;
  facebook?: FactBlock<PageFacts>;
  instagram?: FactBlock<PageFacts>;
};

export { REPORT_SOURCES, type ReportSource } from "./shared";

function tally(rows: Array<Record<string, unknown>>, field: string, limit = 10): Pair[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = row[field];
    const key = typeof raw === "string" && raw.trim() ? raw.trim() : "Not stated";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function byMonth(rows: Array<{ created_at: string }>): Pair[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = row.created_at.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => ({ key, value }));
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : "This source could not be read.";
}

/** Inclusive end: the period end date counts as a whole day. */
function endExclusive(periodEnd: string): string {
  const d = new Date(`${periodEnd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/**
 * Follower growth from our own daily record. Returns the growth when at least
 * two days were recorded inside the period, otherwise a plain reason.
 */
async function readFollowerGrowth(
  supabase: SupabaseClient,
  platform: "tiktok" | "facebook" | "instagram",
  periodStart: string,
  periodEnd: string,
): Promise<{ growth?: FollowerGrowth; note?: string }> {
  const { data, error } = await supabase
    .from("social_daily_stats")
    .select("day, followers")
    .eq("platform", platform)
    .gte("day", periodStart)
    .lte("day", periodEnd)
    .not("followers", "is", null)
    .order("day", { ascending: true });
  if (error) return { note: "The daily follower record could not be read." };
  const rows = (data ?? []) as Array<{ day: string; followers: number }>;
  if (rows.length < 2) {
    return {
      note:
        rows.length === 0
          ? "No follower figures were recorded for these dates. Daily recording began recently, so earlier dates cannot be shown."
          : "Only one day's follower figure was recorded in this period, so growth cannot be measured yet.",
    };
  }
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  return {
    growth: {
      firstDay: first.day,
      firstFollowers: first.followers,
      lastDay: last.day,
      lastFollowers: last.followers,
      change: last.followers - first.followers,
      daysRecorded: rows.length,
      series: rows.map((r) => ({ key: r.day, value: r.followers })),
    },
  };
}


export async function collectFacts(
  supabase: SupabaseClient,
  sources: readonly string[],
  periodStart: string,
  periodEnd: string,
): Promise<ReportFacts> {
  const facts: ReportFacts = { periodStart, periodEnd };
  const from = `${periodStart}T00:00:00Z`;
  const to = endExclusive(periodEnd);
  const want = (s: ReportSource) => sources.includes(s);

  if (want("requests")) {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("created_at, status, service, region")
        .gte("created_at", from)
        .lt("created_at", to);
      if (error) throw new Error(error.message);
      const rows = data ?? [];
      facts.requests = {
        available: true,
        data: {
          total: rows.length,
          byStatus: tally(rows, "status"),
          byService: tally(rows, "service"),
          byRegion: tally(rows, "region"),
          byMonth: byMonth(rows as Array<{ created_at: string }>),
        },
      };
    } catch (err) {
      facts.requests = { available: false, note: describe(err) };
    }
  }

  if (want("messages")) {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("created_at, status")
        .gte("created_at", from)
        .lt("created_at", to);
      if (error) throw new Error(error.message);
      const rows = data ?? [];
      facts.messages = {
        available: true,
        data: {
          total: rows.length,
          byStatus: tally(rows, "status"),
          byMonth: byMonth(rows as Array<{ created_at: string }>),
        },
      };
    } catch (err) {
      facts.messages = { available: false, note: describe(err) };
    }
  }

  if (want("traffic")) {
    try {
      const { runGa4Report } = await import("@/lib/analytics/google.server");
      const startMs = new Date(from).getTime();
      const days = Math.max(1, Math.min(365, Math.ceil((Date.now() - startMs) / 86_400_000)));
      const ga = await runGa4Report(days);
      facts.traffic = {
        available: true,
        data: {
          coverage: `Google Analytics figures cover the last ${days} days up to today, the shortest window that contains the report period.`,
          sessions: ga.totals.sessions,
          users: ga.totals.users,
          pageViews: ga.totals.pageViews,
          bounceRate: ga.totals.bounceRate,
          channels: ga.channels.map((r) => ({ key: r.key, value: r.value })),
          pages: ga.pages.map((r) => ({ key: r.key, value: r.value })),
          devices: ga.devices.map((r) => ({ key: r.key, value: r.value })),
        },
      };
    } catch (err) {
      facts.traffic = { available: false, note: describe(err) };
    }
  }

  if (want("tiktok")) {
    try {
      const { runTikTokReport } = await import("@/lib/analytics/social.server");
      const profile = await runTikTokReport();
      const i = profile.insights;
      const g = await readFollowerGrowth(supabase, "tiktok", periodStart, periodEnd);
      facts.tiktok = i
        ? {
            available: true,
            data: {
              followers: profile.followers ?? null,
              posts: profile.posts ?? null,
              likes: profile.likes ?? null,
              videosAnalyzed: i.videosAnalyzed,
              totalViews: i.totalViews,
              totalLikes: i.totalLikes,
              totalComments: i.totalComments,
              totalShares: i.totalShares,
              averageViews: i.averageViews,
              engagementRate: i.engagementRate,
              topByViews: i.topByViews.slice(0, 5).map((p) => ({
                caption: p.caption ?? "Untitled",
                views: p.views ?? null,
              })),
              ...(g.growth ? { followerGrowth: g.growth } : {}),
              ...(g.note ? { followerGrowthNote: g.note } : {}),
            },
          }
        : { available: false, note: "TikTok returned no video figures." };
    } catch (err) {
      facts.tiktok = { available: false, note: describe(err) };
    }
  }

  for (const platform of ["facebook", "instagram"] as const) {
    if (!want(platform)) continue;
    try {
      const mod = await import("@/lib/analytics/social.server");
      const run = platform === "facebook" ? mod.runFacebookReport : mod.runInstagramReport;
      const profile = await run();
      const g = await readFollowerGrowth(supabase, platform, periodStart, periodEnd);
      facts[platform] = {
        available: true,
        data: {
          followers: profile.followers ?? null,
          posts: profile.posts ?? null,
          likes: profile.likes ?? null,
          ...(g.growth ? { followerGrowth: g.growth } : {}),
          ...(g.note ? { followerGrowthNote: g.note } : {}),
        },
      };
    } catch (err) {
      facts[platform] = { available: false, note: describe(err) };
    }

  }

  return facts;
}
