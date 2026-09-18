import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Panel, PanelError, PanelSkeleton } from "@/components/admin/Manifest";
import { supabase } from "@/integrations/supabase/client";

/**
 * Daily record of what a platform reports. Every figure here is either read
 * live from the account or typed in by the team — nothing is estimated, and
 * days before recording started stay empty rather than being guessed.
 */

export type DailyStat = {
  id: string;
  platform: string;
  day: string;
  followers: number | null;
  posts: number | null;
  likes: number | null;
  profile_views: number | null;
  source: string;
  note: string | null;
};

const nf = new Intl.NumberFormat("en-US");

/** Today in Georgetown (UTC−4), as yyyy-mm-dd. */
function georgetownToday(): string {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function toInt(value: string): number | null {
  const n = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function FollowerRecord({
  platform,
  label,
  code = "TT-R",
  liveFollowers,
}: {
  platform: "tiktok" | "facebook" | "instagram";
  label: string;
  code?: string;
  liveFollowers?: number | null;
}) {
  const qc = useQueryClient();
  const queryKey = ["admin-social-daily", platform];

  const rows = useQuery({
    queryKey,
    queryFn: async (): Promise<DailyStat[]> => {
      const { data, error } = await supabase
        .from("social_daily_stats")
        .select("id, platform, day, followers, posts, likes, profile_views, source, note")
        .eq("platform", platform)
        .order("day", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as DailyStat[];
    },
  });

  const [day, setDay] = useState(georgetownToday());
  const [followers, setFollowers] = useState("");
  const [profileViews, setProfileViews] = useState("");
  const [note, setNote] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const f = toInt(followers);
      if (f === null) throw new Error("Type the follower count for that day.");
      const { error } = await supabase.from("social_daily_stats").upsert(
        {
          platform,
          day,
          followers: f,
          profile_views: toInt(profileViews),
          note: note.trim() || null,
          source: "manual",
        },
        { onConflict: "platform,day" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved today's figures.");
      setFollowers("");
      setProfileViews("");
      setNote("");
      void qc.invalidateQueries({ queryKey });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not save those figures."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_daily_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey }),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not remove that entry."),
  });

  const list = rows.data ?? [];

  const growth = useMemo(() => {
    const withFollowers = list.filter((r) => typeof r.followers === "number");
    if (withFollowers.length < 2) return null;
    const newest = withFollowers[0]!;
    const oldest = withFollowers[withFollowers.length - 1]!;
    return {
      change: (newest.followers ?? 0) - (oldest.followers ?? 0),
      from: oldest.day,
      to: newest.day,
      days: withFollowers.length,
    };
  }, [list]);

  return (
    <Panel title={`${label} daily record`} code={code}>
      <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
        The follower count is saved automatically each time this page loads figures from{" "}
        {label}. You can also type a day's figures in by hand — useful for profile views, which{" "}
        {label} doesn't share here. Growth in reports is measured only from recorded days.
      </p>

      <div className="admin-toolbar mt-3 flex-wrap items-end gap-2">
        <label className="text-xs font-semibold">
          <span className="block mb-1">Day</span>
          <input
            type="date"
            className="admin-select"
            value={day}
            max={georgetownToday()}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">
          <span className="block mb-1">Followers</span>
          <input
            type="number"
            inputMode="numeric"
            className="admin-select"
            placeholder={
              liveFollowers !== null && liveFollowers !== undefined ? nf.format(liveFollowers) : ""
            }
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">
          <span className="block mb-1">Profile views (optional)</span>
          <input
            type="number"
            inputMode="numeric"
            className="admin-select"
            value={profileViews}
            onChange={(e) => setProfileViews(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold grow">
          <span className="block mb-1">Note (optional)</span>
          <input
            type="text"
            className="admin-select w-full"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Where the figure came from"
          />
        </label>
        <button
          type="button"
          className="admin-btn-quiet"
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          <Save className="h-4 w-4" aria-hidden /> Save day
        </button>
      </div>

      {growth && (
        <p className="text-sm mt-3" style={{ color: "var(--crm-text)" }}>
          <strong>
            {growth.change >= 0 ? "+" : ""}
            {nf.format(growth.change)} followers
          </strong>{" "}
          between {growth.from} and {growth.to}, across {growth.days} recorded days.
        </p>
      )}

      <div className="mt-3">
        {rows.isLoading ? (
          <PanelSkeleton rows={3} />
        ) : rows.isError ? (
          <PanelError what="the daily record" error={rows.error} />
        ) : list.length === 0 ? (
          <div role="status" className="admin-state admin-state-empty items-start">
            <div>
              <p className="font-semibold">Nothing recorded yet.</p>
              <p className="admin-state-detail">
                Recording starts today. Earlier dates can't be filled in, because {label} doesn't
                share past daily figures.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {list.map((r, i) => {
              const prev = list[i + 1];
              const delta =
                typeof r.followers === "number" && typeof prev?.followers === "number"
                  ? r.followers - prev.followers
                  : null;
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2"
                  style={{ background: "var(--crm-surface-2, rgba(0,0,0,0.03))" }}
                >
                  <span className="admin-mono text-xs">{r.day}</span>
                  <span className="text-sm">
                    {typeof r.followers === "number" ? nf.format(r.followers) : "—"} followers
                    {delta !== null && (
                      <span
                        className="ml-2 text-xs"
                        style={{ color: delta >= 0 ? "#15803D" : "#DC2626" }}
                      >
                        {delta >= 0 ? "+" : ""}
                        {nf.format(delta)}
                      </span>
                    )}
                  </span>
                  <span className="text-xs" style={{ color: "var(--crm-text-muted)" }}>
                    {typeof r.profile_views === "number"
                      ? `${nf.format(r.profile_views)} profile views · `
                      : ""}
                    {r.source === "auto" ? "recorded automatically" : "typed in"}
                    {r.note ? ` · ${r.note}` : ""}
                  </span>
                  <button
                    type="button"
                    className="admin-btn-quiet"
                    onClick={() => remove.mutate(r.id)}
                    aria-label={`Remove the entry for ${r.day}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
