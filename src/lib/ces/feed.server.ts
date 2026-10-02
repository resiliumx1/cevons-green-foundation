/**
 * CES feed (TikTok daily figures, newsletter sign-ups) — SERVER ONLY.
 * Same signing as the enquiry outbox, different path: /api/integrations/website/feed.
 * The enquiry outbox, its payload and its HMAC are untouched.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { readCesConfig, signedHeaders, backoffSeconds, REQUEST_TIMEOUT_MS } from "./delivery.server";

const MAX_FEED_ATTEMPTS = 10;
const MAX_FEED_BYTES = 32 * 1024;

export function feedUrl(intakeUrl: string): string {
  const u = new URL(intakeUrl);
  u.pathname = "/api/integrations/website/feed";
  u.search = "";
  return u.toString();
}

export type FeedDrainResult = { configured: boolean; attempted: number; sent: number; retrying: number; failed: number };

export async function drainCesFeed(limit = 50): Promise<FeedDrainResult> {
  const cfg = readCesConfig();
  const result: FeedDrainResult = { configured: !!cfg, attempted: 0, sent: 0, retrying: 0, failed: 0 };
  if (!cfg) return result;
  const url = feedUrl(cfg.url);

  const { data: rows } = await supabaseAdmin
    .from("ces_feed_queue")
    .select("id, event_id, body, attempts")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const row of rows ?? []) {
    result.attempted++;
    const raw = JSON.stringify(row.body);
    const attempts = row.attempts + 1;
    if (new TextEncoder().encode(raw).byteLength > MAX_FEED_BYTES) {
      await supabaseAdmin.from("ces_feed_queue").update({ status: "failed", attempts, last_error: "body_too_large" }).eq("id", row.id);
      result.failed++;
      continue;
    }
    let status = 0;
    let errText: string | null = null;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: await signedHeaders(cfg.secret, row.event_id, raw),
        body: raw,
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      status = res.status;
      if (status !== 200 && status !== 201) {
        errText = (await res.text().catch(() => "")).slice(0, 300) || `http_${status}`;
      }
    } catch (err) {
      errText = err instanceof Error && /abort|timeout/i.test(err.name) ? "timeout" : "network_error";
    }

    if (status === 200 || status === 201) {
      await supabaseAdmin.from("ces_feed_queue")
        .update({ status: "sent", attempts, sent_at: new Date().toISOString(), last_status_code: status, last_error: null })
        .eq("id", row.id);
      result.sent++;
      continue;
    }
    const retryable = status === 0 || status === 429 || status >= 500 || (status >= 300 && status < 400);
    const giveUp = !retryable || attempts >= MAX_FEED_ATTEMPTS;
    await supabaseAdmin.from("ces_feed_queue").update({
      status: giveUp ? "failed" : "pending",
      attempts,
      last_status_code: status || null,
      last_error: errText,
      next_attempt_at: new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString(),
    }).eq("id", row.id);
    if (giveUp) result.failed++;
    else result.retrying++;
  }
  return result;
}

/** Read TikTok once, record today's figures, and queue one social_daily delivery. */
export async function queueTikTokDaily(): Promise<{ queued: boolean; reason?: string }> {
  const { runTikTokReport } = await import("@/lib/analytics/social.server");
  const p = await runTikTokReport();
  const readAt = new Date().toISOString();
  // Same "today" as the admin recorder (Georgetown, UTC-4).
  const day = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: existing } = await supabaseAdmin
    .from("social_daily_stats").select("id, source").eq("platform", "tiktok").eq("day", day).maybeSingle();
  if (p.followers !== null && p.followers !== undefined) {
    const values = { platform: "tiktok", day, followers: p.followers, posts: p.posts, likes: p.likes, source: "auto" };
    if (!existing) await supabaseAdmin.from("social_daily_stats").insert(values);
    else if (existing.source === "auto") await supabaseAdmin.from("social_daily_stats").update(values).eq("id", existing.id);
  }

  const https = (u: string | null | undefined) => (u && u.startsWith("https://") ? u : undefined);
  const videos = [...p.recent]
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, 12)
    .filter((v) => v.id)
    .map((v) => strip({
      id: v.id, title: v.caption, url: https(v.url), postedAt: v.publishedAt ?? undefined,
      views: v.views ?? undefined, likes: v.likes, comments: v.comments, shares: v.shares ?? undefined,
    }));

  const body = strip({
    kind: "social_daily", platform: "tiktok", day, readAt,
    followers: p.followers ?? undefined, likes: p.likes ?? undefined, posts: p.posts ?? undefined,
    videos: videos.length ? videos : undefined,
  });
  const eventId = `social_daily:tiktok:${day}:${Math.floor(Date.now() / 1000)}`;
  const { error } = await supabaseAdmin.from("ces_feed_queue").insert({ event_id: eventId, body: body as never });
  return error ? { queued: false, reason: "db_write_failed" } : { queued: true };
}

function strip<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as T;
}
