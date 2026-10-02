/** Daily (11:00 UTC) TikTok read → record → send to CES. Database-key callers only. */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ces/tiktok-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isAuthorizedDispatchCaller } = await import("@/lib/ces/drainAuth.server");
        if (!(await isAuthorizedDispatchCaller(request))) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        try {
          const { queueTikTokDaily, drainCesFeed } = await import("@/lib/ces/feed.server");
          const queued = await queueTikTokDaily();
          const sent = await drainCesFeed(50);
          return Response.json({ ok: true, queued, ...sent });
        } catch (err) {
          console.error("tiktok daily failed", err);
          await supabaseAdmin
            .from("ces_dispatch_status")
            .update({ last_error: "TikTok daily read failed on the server.", last_error_at: new Date().toISOString() })
            .eq("id", "default");
          return Response.json({ ok: false, reason: "tiktok_daily_error" });
        }
      },
    },
  },
});
