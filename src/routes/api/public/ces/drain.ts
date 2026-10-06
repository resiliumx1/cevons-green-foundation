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
        const { isAuthorizedDispatchCaller } = await import("@/lib/ces/drainAuth.server");
        if (!(await isAuthorizedDispatchCaller(request))) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

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
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const summary = {
            configured: result.configured,
            attempted: result.attempted,
            sent: result.sent,
            duplicates: result.duplicates,
            failed: result.failed,
          };
          const drainError = !result.configured
            ? "CES address or shared key not configured on the server."
            : result.failed > 0
              ? `${result.failed} of ${result.attempted} could not be delivered.`
              : null;
          await supabaseAdmin
            .from("ces_dispatch_status")
            .update({
              last_drain_at: new Date().toISOString(),
              last_drain_result: summary,
              ...(drainError
                ? { last_error: drainError, last_error_at: new Date().toISOString() }
                : {}),
            })
            .eq("id", "default");

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

          // Independent Sales inbox delivery — its failure never affects Marketing.
          let sales: unknown = { configured: false, attempted: 0, sent: 0, failed: 0, dead: 0 };
          try {
            const { drainSalesOutbox } = await import("@/lib/ces/sales.server");
            sales = await drainSalesOutbox(limit);
          } catch (err) {
            console.error("ces sales drain failed", err instanceof Error ? err.message : "error");
            sales = { error: "sales_drain_error" };
          }

          return Response.json({ ok: true, ...summary, reviewFollowups, sales });
        } catch (err) {
          console.error("ces drain failed", err);
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("ces_dispatch_status")
              .update({ last_error: "Drain crashed on the server.", last_error_at: new Date().toISOString() })
              .eq("id", "default");
          } catch {
            /* ignore */
          }
          return Response.json({ ok: false, reason: "drain_error" });
        }
      },
    },
  },
});
