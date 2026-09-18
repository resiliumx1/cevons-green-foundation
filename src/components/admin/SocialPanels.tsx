import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, ExternalLink, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { Panel, PanelEmpty, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
import { Portal } from "@/components/admin/Portal";
import { SocialGlyph } from "@/components/icons/SocialGlyph";
import type { SocialPost, TikTokInsights } from "@/lib/analytics/social.server";
import {
  getSocialAnalytics,
  type SocialReport,
} from "@/lib/socialAnalytics.functions";

/**
 * Social accounts on the Traffic page.
 *
 * Every figure is read live from the platform itself. When an account is not
 * connected, the panel says so instead of showing a number.
 */

const nf = new Intl.NumberFormat("en-US");

const PLATFORMS = [
  { key: "tiktok", title: "TikTok", code: "SOC-01" },
  { key: "facebook", title: "Facebook", code: "SOC-02" },
  { key: "instagram", title: "Instagram", code: "SOC-03" },
] as const;

function NotConnected({ report, title }: { report: SocialReport; title: string }) {
  const headline =
    report.state === "unconfigured"
      ? `${title} isn't connected yet.`
      : report.state === "permission"
        ? `The ${title} account no longer allows reading these figures.`
        : `${title} figures are temporarily unavailable.`;
  return (
    <div role="status" className="admin-state admin-state-empty items-start">
      <div>
        <p className="font-semibold">{headline}</p>
        {report.message && <p className="admin-state-detail">{report.message}</p>}
      </div>
    </div>
  );
}

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

function VideoList({ posts, metric }: { posts: SocialPost[]; metric: "views" | "engagement" }) {
  return (
    <ul className="admin-bars">
      {posts.map((post) => {
        const engagement = post.likes + post.comments + (post.shares ?? 0);
        return (
          <li key={`${metric}-${post.id}`} className="admin-bar-row">
            <div className="admin-bar-copy admin-bar-copy--wide">
              <span className="admin-bar-label" title={post.caption}>
                {post.url ? (
                  <a href={post.url} target="_blank" rel="noreferrer noopener">
                    {post.caption}
                  </a>
                ) : (
                  post.caption
                )}
              </span>
              <strong className="admin-bar-value">
                {metric === "views" && post.views !== null
                  ? `${nf.format(post.views)} views`
                  : `${nf.format(engagement)} interactions`}
              </strong>
            </div>
            <div className="admin-bar-meta">
              <span>
                {nf.format(post.likes)} likes · {nf.format(post.comments)} comments
                {post.shares !== null ? ` · ${nf.format(post.shares)} shares` : ""}
              </span>
              <span>{post.publishedAt ? post.publishedAt.slice(0, 10) : ""}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type Detail =
  | { kind: "all" }
  | { kind: "month"; key: string }
  | { kind: "top" };

function DetailWindow({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 grid place-items-center p-4"
        style={{ background: "rgba(0,0,0,0.55)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border p-5"
          style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: "var(--crm-text)" }}>
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-h-11 min-w-11 grid place-items-center rounded-lg"
              style={{ color: "var(--crm-text-muted)" }}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}

/** TikTok-only sections, all worked out from the videos TikTok returns. */
function TikTokSections({ insights }: { insights: TikTokInsights }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const months = insights.monthly.slice(-12);
  const peak = Math.max(1, ...months.map((m) => m.views));
  const period =
    insights.firstPublished && insights.lastPublished
      ? `${insights.firstPublished.slice(0, 10)} – ${insights.lastPublished.slice(0, 10)}`
      : undefined;

  const detailsButton = (next: Detail, label = "View details") => (
    <button type="button" className="admin-link-btn" onClick={() => setDetail(next)}>
      {label} <ChevronRight className="h-3.5 w-3.5" aria-hidden />
    </button>
  );

  const monthVideos = (key: string) =>
    insights.videos.filter((v) => (v.publishedAt ?? "").startsWith(key));

  return (
    <>
      <Panel
        title="TikTok — video performance"
        code="SOC-01A"
        action={detailsButton({ kind: "all" }, "See every video")}
      >
        <DocketStrip
          cells={[
            { code: "VWS", label: "Views", value: nf.format(insights.totalViews) },
            { code: "LIK", label: "Likes", value: nf.format(insights.totalLikes) },
            { code: "CMT", label: "Comments", value: nf.format(insights.totalComments) },
            { code: "SHR", label: "Shares", value: nf.format(insights.totalShares) },
          ]}
        />
        <DocketStrip
          cells={[
            { code: "AVG", label: "Average views per video", value: nf.format(insights.averageViews) },
            { code: "MED", label: "Typical (median) views", value: nf.format(insights.medianViews) },
            { code: "TOP", label: "Best video views", value: nf.format(insights.bestViews) },
            {
              code: "ENG",
              label: "Engagement rate",
              value:
                insights.engagementRate === null
                  ? "—"
                  : `${(insights.engagementRate * 100).toFixed(1)}%`,
              unavailable:
                insights.engagementRate === null
                  ? "TikTok returned no view counts, so a rate can't be worked out."
                  : undefined,
            },
          ]}
        />
        <p className="admin-state-detail">
          Based on {nf.format(insights.videosAnalyzed)} videos
          {period ? ` published between ${period.replace(" – ", " and ")}` : ""}
          . Follower growth and profile-view trends aren't part of what this TikTok connection
          returns, so they're not shown.
        </p>
      </Panel>

      <Panel
        title="TikTok — month by month"
        code="SOC-01B"
        action={months.length ? detailsButton({ kind: "all" }, "See every video") : undefined}
      >
        {months.length === 0 ? (
          <PanelEmpty headline="TikTok returned no publishing dates for these videos." />
        ) : (
          <>
            <ul className="admin-bars">
              {months.map((m) => (
                <li key={m.key} className="admin-bar-row">
                  <button
                    type="button"
                    className="admin-bar-button"
                    onClick={() => setDetail({ kind: "month", key: m.key })}
                    aria-label={`See the ${monthLabel(m.key)} videos`}
                  >
                    <div className="admin-bar-copy admin-bar-copy--wide">
                      <span className="admin-bar-label">{monthLabel(m.key)}</span>
                      <strong className="admin-bar-value">{nf.format(m.views)} views</strong>
                    </div>
                    <div className="admin-bar-track" aria-hidden>
                      <span
                        className="admin-bar-fill"
                        style={{
                          width: `${Math.max(Math.round((m.views / peak) * 100), m.views > 0 ? 3 : 0)}%`,
                        }}
                      />
                    </div>
                    <div className="admin-bar-meta">
                      <span>
                        {nf.format(m.videos)} {m.videos === 1 ? "video" : "videos"} ·{" "}
                        {nf.format(m.likes)} likes · {nf.format(m.comments)} comments ·{" "}
                        {nf.format(m.shares)} shares
                      </span>
                      <span aria-hidden>View</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <p className="admin-state-detail">Tap a month to see the videos posted in it.</p>
          </>
        )}
      </Panel>

      <Panel
        title="TikTok — top videos"
        code="SOC-01C"
        action={detailsButton({ kind: "top" }, "See full ranking")}
      >
        <div className="admin-subhead">Most viewed</div>
        {insights.topByViews.length === 0 ? (
          <PanelEmpty headline="TikTok returned no view counts for these videos." />
        ) : (
          <VideoList posts={insights.topByViews} metric="views" />
        )}
        <div className="admin-subhead">Most interactions</div>
        <VideoList posts={insights.topByEngagement} metric="engagement" />
      </Panel>

      {detail?.kind === "all" && (
        <DetailWindow
          title="Every TikTok video"
          subtitle={`${nf.format(insights.videos.length)} videos${period ? `, ${period}` : ""} — newest first.`}
          onClose={() => setDetail(null)}
        >
          <VideoList posts={insights.videos} metric="views" />
        </DetailWindow>
      )}

      {detail?.kind === "month" && (
        <DetailWindow
          title={`TikTok — ${monthLabel(detail.key)}`}
          subtitle="Every video posted in this month, with the figures TikTok reports."
          onClose={() => setDetail(null)}
        >
          {monthVideos(detail.key).length === 0 ? (
            <PanelEmpty headline="No videos were returned for this month." />
          ) : (
            <VideoList posts={monthVideos(detail.key)} metric="views" />
          )}
        </DetailWindow>
      )}

      {detail?.kind === "top" && (
        <DetailWindow
          title="TikTok — full ranking"
          subtitle="All videos ranked by views, then by total interactions."
          onClose={() => setDetail(null)}
        >
          <div className="admin-subhead">By views</div>
          <VideoList
            posts={[...insights.videos].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))}
            metric="views"
          />
          <div className="admin-subhead">By interactions</div>
          <VideoList
            posts={[...insights.videos].sort(
              (a, b) =>
                b.likes + b.comments + (b.shares ?? 0) - (a.likes + a.comments + (a.shares ?? 0)),
            )}
            metric="engagement"
          />
        </DetailWindow>
      )}
    </>
  );
}

export function SocialPanels() {
  const fetchSocial = useServerFn(getSocialAnalytics);
  const social = useQuery({
    queryKey: ["admin-social-analytics"],
    queryFn: () => fetchSocial({ data: undefined as never }),
    staleTime: 10 * 60_000,
  });

  const scrollTo = (key: string) => {
    const el = document.getElementById(`social-section-${key}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="admin-stack-lg">
      <nav className="admin-social-jump" aria-label="Jump to a social account section">
        {PLATFORMS.map(({ key, title }) => (
          <button
            key={key}
            type="button"
            className="admin-social-jump-btn"
            onClick={() => scrollTo(key)}
            aria-label={`Jump to ${title} analytics`}
          >
            <span className="admin-social-jump-icon">
              <SocialGlyph platform={key} className="h-5 w-5" />
            </span>
            <span className="admin-social-jump-label">{title}</span>
          </button>
        ))}
      </nav>
      {PLATFORMS.map(({ key, title, code }) => {
        const report = social.data?.[key];
        const profile = report?.state === "ok" ? report.data : undefined;
        return (
          <Fragment key={key}>
          <div id={`social-section-${key}`} className="admin-social-anchor">
          <Panel
            title={title}
            code={code}
            action={
              profile?.profileUrl ? (
                <a
                  className="admin-link-btn"
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open profile <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : undefined
            }
          >
            <div className="admin-subhead">
              <SocialGlyph platform={key} className="h-4 w-4" /> {profile?.handle ?? title}
            </div>

            {social.isLoading ? (
              <PanelSkeleton rows={2} />
            ) : social.isError ? (
              <PanelError what={`${title} figures`} error={social.error} />
            ) : !profile ? (
              <NotConnected report={report ?? { state: "error" }} title={title} />
            ) : (
              <>
                <DocketStrip
                  cells={[
                    {
                      code: "FLW",
                      label: "Followers",
                      value: profile.followers === null ? "—" : nf.format(profile.followers),
                      unavailable:
                        profile.followers === null
                          ? `${title} doesn't report a follower count for this account.`
                          : undefined,
                    },
                    {
                      code: "PST",
                      label: "Posts",
                      value: profile.posts === null ? "—" : nf.format(profile.posts),
                      unavailable:
                        profile.posts === null
                          ? `${title} doesn't report a post count for this account.`
                          : undefined,
                    },
                    {
                      code: "LIK",
                      label: "Total likes",
                      value: profile.likes === null ? "—" : nf.format(profile.likes),
                      unavailable:
                        profile.likes === null
                          ? `${title} doesn't report total likes for this account.`
                          : undefined,
                    },
                  ]}
                />
                {profile.recent.length === 0 ? (
                  <PanelEmpty headline={`No recent ${title} posts were returned for this account.`} />
                ) : (
                  <>
                    <div className="admin-subhead">Recent posts</div>
                    <ul className="admin-bars">
                      {profile.recent.map((post) => (
                        <li key={post.id} className="admin-bar-row">
                          <div className="admin-bar-copy admin-bar-copy--wide">
                            <span className="admin-bar-label" title={post.caption}>
                              {post.url ? (
                                <a href={post.url} target="_blank" rel="noreferrer noopener">
                                  {post.caption}
                                </a>
                              ) : (
                                post.caption
                              )}
                            </span>
                            <strong className="admin-bar-value">
                              {post.views !== null
                                ? `${nf.format(post.views)} views`
                                : `${nf.format(post.likes)} likes`}
                            </strong>
                          </div>
                          <div className="admin-bar-meta">
                            <span>
                              {nf.format(post.likes)} likes · {nf.format(post.comments)} comments
                              {post.shares !== null ? ` · ${nf.format(post.shares)} shares` : ""}
                            </span>
                            <span>
                              {post.publishedAt ? post.publishedAt.slice(0, 10) : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </Panel>
          {key === "tiktok" && profile?.insights ? (
            <TikTokSections insights={profile.insights} />
          ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
