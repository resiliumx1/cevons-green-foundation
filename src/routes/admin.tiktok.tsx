import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link2,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { Panel, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
import { supabase } from "@/integrations/supabase/client";
import { GEORGETOWN_LABEL } from "@/lib/georgetown";
import { getSocialAnalytics } from "@/lib/socialAnalytics.functions";
import type { SocialPost as TikTokVideo } from "@/lib/analytics/social.server";

export const Route = createFileRoute("/admin/tiktok")({
  head: () => ({
    meta: [
      { title: "TikTok | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TikTokPage,
});

const nf = new Intl.NumberFormat("en-US");

type PlannedPost = {
  id: string;
  caption: string;
  platforms: string[];
  scheduled_at: string | null;
  status: string;
  posted_at: string | null;
  notes: string | null;
  tiktok_video_id: string | null;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  draft: "#64748B",
  scheduled: "#EA6A00",
  posted: "#15803D",
  cancelled: "#9CA3AF",
};

/** yyyy-mm-dd for a date, in the viewer's own zone. */
function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function TikTokPage() {
  const qc = useQueryClient();
  const fetchSocial = useServerFn(getSocialAnalytics);

  const analytics = useQuery({
    queryKey: ["admin-social-analytics"],
    queryFn: () => fetchSocial({ data: undefined as never }),
    staleTime: 5 * 60 * 1000,
  });

  const planned = useQuery({
    queryKey: ["admin-social-posts"],
    queryFn: async (): Promise<PlannedPost[]> => {
      const { data, error } = await supabase
        .from("social_posts")
        .select(
          "id, caption, platforms, scheduled_at, status, posted_at, notes, tiktok_video_id, created_at",
        )
        .contains("platforms", ["tiktok"])
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as PlannedPost[];
    },
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<PlannedPost> }) => {
      const { error } = await supabase.from("social_posts").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-social-posts"] }),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not save that change."),
  });

  const report = analytics.data?.tiktok;
  const profile = report?.state === "ok" ? report.data : undefined;
  const videos: TikTokVideo[] = profile?.insights?.videos ?? profile?.recent ?? [];
  const videoById = useMemo(
    () => new Map(videos.map((v) => [v.id, v])),
    [videos],
  );

  const posts = planned.data ?? [];

  const queue = posts
    .filter((p) => p.status === "draft" || p.status === "scheduled")
    .sort((a, b) => (a.scheduled_at ?? "9999").localeCompare(b.scheduled_at ?? "9999"));

  return (
    <CrmPage className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
            TikTok
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Plan videos on the calendar, watch the account live, and open the figures for any video
            you've posted. Times are {GEORGETOWN_LABEL}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="admin-btn-quiet"
            onClick={() => {
              void analytics.refetch();
              void planned.refetch();
            }}
            disabled={analytics.isFetching || planned.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${analytics.isFetching || planned.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            Refresh
          </button>
          {profile?.profileUrl && (
            <a className="admin-btn-quiet" href={profile.profileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden /> Open TikTok
            </a>
          )}
        </div>
      </div>

      <DocketStrip
        loading={analytics.isLoading}
        cells={[
          profile?.followers !== null && profile?.followers !== undefined
            ? { code: "TT-A", label: "Followers", value: nf.format(profile.followers) }
            : {
                code: "TT-A",
                label: "Followers",
                unavailable: report?.message ?? "TikTok isn't connected yet.",
              },
          profile?.posts !== null && profile?.posts !== undefined
            ? { code: "TT-B", label: "Videos posted", value: nf.format(profile.posts) }
            : { code: "TT-B", label: "Videos posted", unavailable: "Not available." },
          profile?.likes !== null && profile?.likes !== undefined
            ? { code: "TT-C", label: "Total likes", value: nf.format(profile.likes) }
            : { code: "TT-C", label: "Total likes", unavailable: "Not available." },
          { code: "TT-D", label: "Planned videos", value: queue.length },
        ]}
      />

      {analytics.isError && <PanelError what="the TikTok account" error={analytics.error} />}
      {report && report.state !== "ok" && (
        <div role="status" className="admin-state admin-state-empty items-start">
          <div>
            <p className="font-semibold">
              {report.state === "unconfigured"
                ? "TikTok isn't connected yet."
                : report.state === "permission"
                  ? "The TikTok account no longer allows reading these figures."
                  : "TikTok figures are temporarily unavailable."}
            </p>
            {report.message && <p className="admin-state-detail">{report.message}</p>}
          </div>
        </div>
      )}

      <FollowerRecord
        platform="tiktok"
        label="TikTok"
        code="TT-R"
        liveFollowers={profile?.followers ?? null}
      />

      <Calendar posts={posts} videos={videos} />


      <Panel title="Scheduling queue" code="TT-Q">
        {planned.isLoading ? (
          <PanelSkeleton rows={4} />
        ) : planned.isError ? (
          <PanelError what="planned videos" error={planned.error} />
        ) : queue.length === 0 ? (
          <div role="status" className="admin-state admin-state-empty items-start">
            <div>
              <p className="font-semibold">Nothing in the queue.</p>
              <p className="admin-state-detail">
                Add a video on the Social posts page and tick TikTok — it appears here and on the
                calendar.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {queue.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--crm-border)" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                    style={{ background: STATUS_TONE[p.status] ?? "#64748B", color: "#FFFFFF" }}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--crm-text-muted)" }}>
                    {p.scheduled_at
                      ? new Date(p.scheduled_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "No date set"}
                  </span>
                  <button
                    type="button"
                    className="admin-btn-quiet ml-auto"
                    disabled={patch.isPending}
                    onClick={() =>
                      patch.mutate({
                        id: p.id,
                        values: { status: "posted", posted_at: new Date().toISOString() },
                      })
                    }
                  >
                    <Send className="h-4 w-4" aria-hidden /> Mark as posted
                  </button>
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: "var(--crm-text)" }}>
                  {p.caption}
                </p>
                {p.notes && (
                  <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
                    Note: {p.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Posted videos — live figures" code="TT-F">
        {analytics.isLoading ? (
          <PanelSkeleton rows={5} />
        ) : videos.length === 0 ? (
          <div role="status" className="admin-state admin-state-empty items-start">
            <div>
              <p className="font-semibold">No videos to show.</p>
              <p className="admin-state-detail">
                Videos appear here as soon as the connected TikTok account reports them.
              </p>
            </div>
          </div>
        ) : (
          <ul className="admin-bars">
            {videos.slice(0, 30).map((v) => (
              <li key={v.id} className="admin-bar-row">
                <div className="admin-bar-copy admin-bar-copy--wide">
                  <span className="admin-bar-label" title={v.caption}>
                    {v.url ? (
                      <a href={v.url} target="_blank" rel="noreferrer noopener">
                        {v.caption}
                      </a>
                    ) : (
                      v.caption
                    )}
                  </span>
                  <strong className="admin-bar-value">
                    {v.views !== null ? `${nf.format(v.views)} views` : "Views not reported"}
                  </strong>
                </div>
                <div className="admin-bar-meta">
                  <span>
                    {nf.format(v.likes)} likes · {nf.format(v.comments)} comments
                    {v.shares !== null ? ` · ${nf.format(v.shares)} shares` : ""}
                  </span>
                  <span>{v.publishedAt ? v.publishedAt.slice(0, 10) : ""}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Posted plans and their figures" code="TT-L">
        {planned.isLoading ? (
          <PanelSkeleton rows={3} />
        ) : posts.filter((p) => p.status === "posted").length === 0 ? (
          <div role="status" className="admin-state admin-state-empty items-start">
            <div>
              <p className="font-semibold">No plans marked as posted yet.</p>
              <p className="admin-state-detail">
                Once a planned video is posted, link it to the video on TikTok to see its figures
                beside the plan.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {posts
              .filter((p) => p.status === "posted")
              .map((p) => {
                const linked = p.tiktok_video_id ? videoById.get(p.tiktok_video_id) : undefined;
                return (
                  <li
                    key={p.id}
                    className="rounded-lg border p-3"
                    style={{ borderColor: "var(--crm-border)" }}
                  >
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--crm-text)" }}>
                      {p.caption}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Link2 className="h-4 w-4" aria-hidden style={{ color: "var(--crm-text-muted)" }} />
                      <select
                        className="admin-select"
                        value={p.tiktok_video_id ?? ""}
                        disabled={videos.length === 0 || patch.isPending}
                        onChange={(e) =>
                          patch.mutate({
                            id: p.id,
                            values: { tiktok_video_id: e.target.value || null },
                          })
                        }
                        aria-label="Link this plan to a video on TikTok"
                      >
                        <option value="">
                          {videos.length === 0
                            ? "No videos available to link"
                            : "Not linked to a video"}
                        </option>
                        {videos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {(v.publishedAt ? `${v.publishedAt.slice(0, 10)} — ` : "") +
                              v.caption.slice(0, 60)}
                          </option>
                        ))}
                      </select>
                      {linked?.url && (
                        <a
                          className="admin-btn-quiet"
                          href={linked.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden /> Watch
                        </a>
                      )}
                    </div>
                    {linked ? (
                      <p className="text-xs mt-2" style={{ color: "var(--crm-text-muted)" }}>
                        {linked.views !== null ? `${nf.format(linked.views)} views · ` : ""}
                        {nf.format(linked.likes)} likes · {nf.format(linked.comments)} comments
                        {linked.shares !== null ? ` · ${nf.format(linked.shares)} shares` : ""}
                      </p>
                    ) : p.tiktok_video_id ? (
                      <p className="text-xs mt-2" style={{ color: "var(--crm-text-muted)" }}>
                        The linked video isn't in the figures TikTok returned.
                      </p>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        )}
      </Panel>
    </CrmPage>
  );
}

/* ── Calendar ─────────────────────────────────────────────────────────── */

function Calendar({ posts, videos }: { posts: PlannedPost[]; videos: TikTokVideo[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(dayKey(today));

  const plansByDay = useMemo(() => {
    const map = new Map<string, PlannedPost[]>();
    for (const p of posts) {
      const when = p.status === "posted" ? (p.posted_at ?? p.scheduled_at) : p.scheduled_at;
      if (!when) continue;
      const k = dayKey(new Date(when));
      map.set(k, [...(map.get(k) ?? []), p]);
    }
    return map;
  }, [posts]);

  const videosByDay = useMemo(() => {
    const map = new Map<string, TikTokVideo[]>();
    for (const v of videos) {
      if (!v.publishedAt) continue;
      const k = dayKey(new Date(v.publishedAt));
      map.set(k, [...(map.get(k) ?? []), v]);
    }
    return map;
  }, [videos]);

  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
    ),
  ];

  const selectedPlans = selected ? (plansByDay.get(selected) ?? []) : [];
  const selectedVideos = selected ? (videosByDay.get(selected) ?? []) : [];

  return (
    <Panel title="Video calendar" code="TT-C1">
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          className="admin-btn-quiet"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <strong style={{ color: "var(--crm-text)" }}>
          {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </strong>
        <button
          type="button"
          className="admin-btn-quiet"
          aria-label="Next month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[10px] font-bold uppercase"
            style={{ color: "var(--crm-text-muted)" }}
          >
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`blank-${i}`} />;
          const k = dayKey(d);
          const plans = plansByDay.get(k) ?? [];
          const vids = videosByDay.get(k) ?? [];
          const isToday = k === dayKey(today);
          const isSelected = k === selected;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelected(k)}
              aria-pressed={isSelected}
              className="min-h-14 rounded-lg p-1 text-left"
              style={{
                border: `1px solid ${isSelected ? "#EA6A00" : "var(--crm-border)"}`,
                background: isToday ? "var(--crm-surface-muted)" : "transparent",
              }}
            >
              <span className="text-xs font-semibold" style={{ color: "var(--crm-text)" }}>
                {d.getDate()}
              </span>
              <span className="flex flex-wrap gap-0.5 mt-1">
                {plans.map((p) => (
                  <span
                    key={p.id}
                    className="size-1.5 rounded-full"
                    style={{ background: STATUS_TONE[p.status] ?? "#64748B" }}
                    title={p.caption}
                  />
                ))}
                {vids.map((v) => (
                  <span
                    key={v.id}
                    className="size-1.5 rounded-full"
                    style={{ background: "#0EA5E9" }}
                    title={v.caption}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--crm-text-muted)" }}>
        Dots: orange scheduled · green posted · grey draft · blue a video live on TikTok.
      </p>

      {selected && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--crm-border)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--crm-text)" }}>
            <CalendarDays className="h-4 w-4 inline mr-2" aria-hidden />
            {new Date(selected).toLocaleDateString("en-GB", { dateStyle: "full" })}
          </p>
          {selectedPlans.length === 0 && selectedVideos.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
              Nothing planned or posted on this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedPlans.map((p) => (
                <li key={p.id} className="text-sm" style={{ color: "var(--crm-text)" }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5 mr-2"
                    style={{ background: STATUS_TONE[p.status] ?? "#64748B", color: "#FFFFFF" }}
                  >
                    {p.status}
                  </span>
                  {p.caption}
                </li>
              ))}
              {selectedVideos.map((v) => (
                <li key={v.id} className="text-sm" style={{ color: "var(--crm-text)" }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5 mr-2"
                    style={{ background: "#0EA5E9", color: "#FFFFFF" }}
                  >
                    live
                  </span>
                  {v.url ? (
                    <a href={v.url} target="_blank" rel="noreferrer noopener" className="underline">
                      {v.caption}
                    </a>
                  ) : (
                    v.caption
                  )}
                  <span className="ml-2 text-xs" style={{ color: "var(--crm-text-muted)" }}>
                    {v.views !== null ? `${nf.format(v.views)} views · ` : ""}
                    {nf.format(v.likes)} likes
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
