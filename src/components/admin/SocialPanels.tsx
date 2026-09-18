import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";

import { Panel, PanelEmpty, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
import { SocialGlyph } from "@/components/icons/SocialGlyph";
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
          <Panel
            key={key}
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
        );
      })}
    </div>
  );
}
