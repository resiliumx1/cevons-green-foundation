/**
 * Server-only social analytics helpers.
 *
 * Reads real figures from TikTok (through the Lovable connector gateway) and
 * from Facebook / Instagram (Meta Graph API, using a page access token stored
 * as a secret). Credentials never leave this runtime: only aggregated counts
 * are returned to the browser.
 *
 * Nothing here invents numbers. When an account is not connected, the caller
 * gets an "unconfigured" state and the screen says so plainly.
 */

export class SocialConfigError extends Error {}
export class SocialPermissionError extends Error {}

const GATEWAY = "https://connector-gateway.lovable.dev";

export type SocialPost = {
  id: string;
  caption: string;
  url: string | null;
  publishedAt: string | null;
  views: number | null;
  likes: number;
  comments: number;
  shares: number | null;
};

export type SocialProfile = {
  platform: "tiktok" | "facebook" | "instagram";
  handle: string;
  profileUrl: string | null;
  followers: number | null;
  posts: number | null;
  /** Total likes on the account, when the platform reports it. */
  likes: number | null;
  recent: SocialPost[];
};

async function readJson(res: Response, what: string): Promise<unknown> {
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new SocialPermissionError(
        `${what} refused the request (${res.status}). The connected account may not have permission any more.`,
      );
    }
    throw new Error(`${what} request failed [${res.status}]: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${what} returned an unreadable response.`);
  }
}

/* ── TikTok ─────────────────────────────────────────────────────────────── */

export async function runTikTokReport(): Promise<SocialProfile> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const tiktokKey = process.env["TIKTOK_API_KEY"];
  if (!lovableKey || !tiktokKey) {
    throw new SocialConfigError("The TikTok account is not connected yet.");
  }
  const headers = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": tiktokKey,
  };

  const userFields =
    "open_id,display_name,profile_deep_link,follower_count,following_count,likes_count,video_count";
  const userRes = await fetch(`${GATEWAY}/tiktok/user/info/?fields=${userFields}`, { headers });
  const user = (await readJson(userRes, "TikTok")) as {
    data?: { user?: Record<string, unknown> };
    error?: { code?: string; message?: string };
  };
  if (user.error?.code && user.error.code !== "ok") {
    throw new Error(`TikTok: ${user.error.message ?? user.error.code}`);
  }
  const u = user.data?.user ?? {};

  let recent: SocialPost[] = [];
  try {
    const videoFields =
      "id,title,video_description,share_url,create_time,view_count,like_count,comment_count,share_count";
    const listRes = await fetch(`${GATEWAY}/tiktok/video/list/?fields=${videoFields}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ max_count: 10 }),
    });
    const list = (await readJson(listRes, "TikTok")) as {
      data?: { videos?: Array<Record<string, unknown>> };
    };
    recent = (list.data?.videos ?? []).map((v) => ({
      id: String(v.id ?? ""),
      caption: String(v.title || v.video_description || "Untitled video"),
      url: (v.share_url as string) ?? null,
      publishedAt: v.create_time ? new Date(Number(v.create_time) * 1000).toISOString() : null,
      views: typeof v.view_count === "number" ? v.view_count : null,
      likes: Number(v.like_count ?? 0),
      comments: Number(v.comment_count ?? 0),
      shares: typeof v.share_count === "number" ? v.share_count : null,
    }));
  } catch {
    // Video listing needs its own permission; profile figures still stand.
    recent = [];
  }

  return {
    platform: "tiktok",
    handle: String(u.display_name ?? "TikTok account"),
    profileUrl: (u.profile_deep_link as string) ?? null,
    followers: typeof u.follower_count === "number" ? u.follower_count : null,
    posts: typeof u.video_count === "number" ? u.video_count : null,
    likes: typeof u.likes_count === "number" ? u.likes_count : null,
    recent,
  };
}

/* ── Meta (Facebook Page + Instagram business account) ──────────────────── */

const GRAPH = "https://graph.facebook.com/v21.0";

function metaToken(): string {
  const token = process.env["META_PAGE_ACCESS_TOKEN"];
  if (!token) {
    throw new SocialConfigError(
      "Facebook and Instagram are not connected yet. A Meta app access token is needed.",
    );
  }
  return token;
}

export async function runFacebookReport(): Promise<SocialProfile> {
  const token = metaToken();
  const pageId = process.env["META_PAGE_ID"];
  if (!pageId) throw new SocialConfigError("No Facebook Page has been chosen yet.");

  const pageRes = await fetch(
    `${GRAPH}/${pageId}?fields=name,link,fan_count,followers_count&access_token=${encodeURIComponent(token)}`,
  );
  const page = (await readJson(pageRes, "Facebook")) as Record<string, unknown>;

  const postsRes = await fetch(
    `${GRAPH}/${pageId}/posts?fields=id,message,permalink_url,created_time,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${encodeURIComponent(token)}`,
  );
  const posts = (await readJson(postsRes, "Facebook")) as {
    data?: Array<Record<string, any>>;
  };

  return {
    platform: "facebook",
    handle: String(page.name ?? "Facebook Page"),
    profileUrl: (page.link as string) ?? null,
    followers:
      typeof page.followers_count === "number"
        ? page.followers_count
        : typeof page.fan_count === "number"
          ? page.fan_count
          : null,
    posts: null,
    likes: typeof page.fan_count === "number" ? page.fan_count : null,
    recent: (posts.data ?? []).map((p) => ({
      id: String(p.id),
      caption: String(p.message ?? "Post without text"),
      url: p.permalink_url ?? null,
      publishedAt: p.created_time ?? null,
      views: null,
      likes: Number(p.likes?.summary?.total_count ?? 0),
      comments: Number(p.comments?.summary?.total_count ?? 0),
      shares: typeof p.shares?.count === "number" ? p.shares.count : null,
    })),
  };
}

export async function runInstagramReport(): Promise<SocialProfile> {
  const token = metaToken();
  const igId = process.env["META_INSTAGRAM_USER_ID"];
  if (!igId) throw new SocialConfigError("No Instagram business account has been chosen yet.");

  const accRes = await fetch(
    `${GRAPH}/${igId}?fields=username,followers_count,media_count&access_token=${encodeURIComponent(token)}`,
  );
  const acc = (await readJson(accRes, "Instagram")) as Record<string, unknown>;

  const mediaRes = await fetch(
    `${GRAPH}/${igId}/media?fields=id,caption,permalink,timestamp,like_count,comments_count&limit=10&access_token=${encodeURIComponent(token)}`,
  );
  const media = (await readJson(mediaRes, "Instagram")) as {
    data?: Array<Record<string, any>>;
  };

  const username = String(acc.username ?? "Instagram account");
  return {
    platform: "instagram",
    handle: username,
    profileUrl: `https://www.instagram.com/${username}/`,
    followers: typeof acc.followers_count === "number" ? acc.followers_count : null,
    posts: typeof acc.media_count === "number" ? acc.media_count : null,
    likes: null,
    recent: (media.data ?? []).map((m) => ({
      id: String(m.id),
      caption: String(m.caption ?? "Post without a caption"),
      url: m.permalink ?? null,
      publishedAt: m.timestamp ?? null,
      views: null,
      likes: Number(m.like_count ?? 0),
      comments: Number(m.comments_count ?? 0),
      shares: null,
    })),
  };
}
