/** Sends waiting CES feed rows (sign-ups, TikTok days). Database-key callers only; returns counts only. */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ces/feed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isAuthorizedDispatchCaller } = await import("@/lib/ces/drainAuth.server");
        if (!(await isAuthorizedDispatchCaller(request))) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const { drainCesFeed } = await import("@/lib/ces/feed.server");
          return Response.json({ ok: true, ...(await drainCesFeed(50)) });
        } catch (err) {
          console.error("ces feed drain failed", err);
          return Response.json({ ok: false, reason: "feed_error" });
        }
      },
    },
  },
});
