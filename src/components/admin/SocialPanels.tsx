import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { Fragment } from "react";

import { Panel, PanelEmpty, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
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
            <div className="admin-bar-copy">
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

/** TikTok-only sections, all worked out from the videos TikTok returns. */
function TikTokSections({ insights }: { insights: TikTokInsights }) {
  const months = insights.monthly.slice(-12);
  const peak = Math.max(1, ...months.map((m) => m.views));
  return (
    <>
      <Panel title="TikTok — video performance" code="SOC-01A">
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
          {insights.firstPublished && insights.lastPublished
            ? ` published between ${insights.firstPublished.slice(0, 10)} and ${insights.lastPublished.slice(0, 10)}`
            : ""}
          . Follower growth and profile-view trends aren't part of what this TikTok connection
          returns, so they're not shown.
        </p>
      </Panel>

      <Panel title="TikTok — month by month" code="SOC-01B">
        {months.length === 0 ? (
          <PanelEmpty headline="TikTok returned no publishing dates for these videos." />
        ) : (
          <ul className="admin-bars">
            {months.map((m) => (
              <li key={m.key} className="admin-bar-row">
                <div className="admin-bar-copy">
                  <span className="admin-bar-label">{monthLabel(m.key)}</span>
                  <strong className="admin-bar-value">{nf.format(m.views)} views</strong>
                </div>
                <div className="admin-bar-track" aria-hidden>
                  <span
                    className="admin-bar-fill"
                    style={{ width: `${Math.max(Math.round((m.views / peak) * 100), m.views > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <div className="admin-bar-meta">
                  <span>
                    {nf.format(m.videos)} videos · {nf.format(m.likes)} likes ·{" "}
                    {nf.format(m.comments)} comments · {nf.format(m.shares)} shares
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="TikTok — top videos" code="SOC-01C">
        <div className="admin-subhead">Most viewed</div>
        {insights.topByViews.length === 0 ? (
          <PanelEmpty headline="TikTok returned no view counts for these videos." />
        ) : (
          <VideoList posts={insights.topByViews} metric="views" />
        )}
        <div className="admin-subhead">Most interactions</div>
        <VideoList posts={insights.topByEngagement} metric="engagement" />
      </Panel>
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

  return (
    <div className="admin-stack-lg">
      {PLATFORMS.map(({ key, title, code }) => {
        const report = social.data?.[key];
        const profile = report?.state === "ok" ? report.data : undefined;
        return (
          <Fragment key={key}>
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
                          <div className="admin-bar-copy">
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
