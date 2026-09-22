/**
 * Scheduled CES delivery endpoint.
 *
 * Called server-to-server by the database (immediately on enqueue, plus an
 * hourly catch-up for retries) so waiting requests are delivered even when no
 * browser is open. Requires the project service-role key as a bearer token,
 * so it is not callable from a browser. Returns counts only — never payloads,
 * customer details or credentials.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ces/drain")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!serviceKey) {
          return Response.json({ ok: false, reason: "server_misconfigured" }, { status: 500 });
        }

        const auth = request.headers.get("Authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        const dispatchSecret = process.env["NOTIFY_DISPATCH_SECRET"];
        const authorized = token === serviceKey || (!!dispatchSecret && token === dispatchSecret);
        if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let limit = 25;
        try {
          const body = (await request.json()) as { limit?: number };
          if (body?.limit) limit = Math.min(Math.max(Number(body.limit), 1), 100);
        } catch {
          /* body is optional */
        }

        try {
          const { drainCesOutbox } = await import("@/lib/ces/outbox.server");
          const result = await drainCesOutbox(limit);

          // Same schedule also releases any due Google review follow-ups.
          let reviewFollowups = {
            configured: false,
            attempted: 0,
            sent: 0,
            skipped: 0,
            failed: 0,
            whatsappSent: 0,
          };
          try {
            const { drainReviewFollowups } = await import("@/lib/reviews/followups.server");
            reviewFollowups = await drainReviewFollowups(25);
          } catch (err) {
            console.error("review followup drain failed", err);
          }

          return Response.json({
            ok: true,
            configured: result.configured,
            attempted: result.attempted,
            sent: result.sent,
            duplicates: result.duplicates,
            failed: result.failed,
            reviewFollowups,
          });
        } catch (err) {
          console.error("ces drain failed", err);
          return Response.json({ ok: false, reason: "drain_error" });
        }
      },
    },
  },
});
