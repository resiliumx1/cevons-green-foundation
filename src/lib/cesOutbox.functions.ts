/**
 * Admin-only controls for the CES Marketing Inbox delivery queue.
 *
 * Every function verifies the caller is an owner or admin through their own
 * RLS-scoped session before any privileged work happens. No secret, endpoint
 * URL or payload is ever returned to the browser — only counts, statuses and
 * short error strings.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CesQueueStatus = {
  config: { urlConfigured: boolean; secretConfigured: boolean; host: string | null; ready: boolean };
  counts: { pending: number; failed: number; sent: number; dead: number; total: number };
  retained: { serviceRequests: number; contactMessages: number };
  recentFailures: Array<{
    reference: string | null;
    entityType: string;
    attempts: number;
    lastError: string | null;
    lastStatusCode: number | null;
    nextAttemptAt: string | null;
  }>;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("is_admin", {
    _user_id: context.userId,
  });
  if (error) throw new Error("Could not verify your access.");
  if (!isAdmin) throw new Error("Only an owner or admin can manage the CES connection.");
}

export const getCesQueueStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CesQueueStatus> => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { cesConfigStatus } = await import("./ces/delivery.server");

    const countFor = async (status: string) => {
      const { count } = await supabaseAdmin
        .from("ces_outbox")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return count ?? 0;
    };
    const totalOf = async (table: "service_requests" | "contact_messages") => {
      const { count } = await supabaseAdmin.from(table).select("id", { count: "exact", head: true });
      return count ?? 0;
    };

    const [pending, failed, sent, dead, serviceRequests, contactMessages] = await Promise.all([
      countFor("pending"),
      countFor("failed"),
      countFor("sent"),
      countFor("dead"),
      totalOf("service_requests"),
      totalOf("contact_messages"),
    ]);

    const { data: failures } = await supabaseAdmin
      .from("ces_outbox")
      .select("reference, entity_type, attempts, last_error, last_status_code, next_attempt_at")
      .in("status", ["failed", "dead"])
      .order("updated_at", { ascending: false })
      .limit(10);

    return {
      config: cesConfigStatus(),
      counts: {
        pending,
        failed,
        sent,
        dead,
        total: pending + failed + sent + dead,
      },
      retained: { serviceRequests, contactMessages },
      recentFailures: (failures ?? []).map((f) => ({
        reference: f.reference,
        entityType: f.entity_type,
        attempts: f.attempts,
        lastError: f.last_error,
        lastStatusCode: f.last_status_code,
        nextAttemptAt: f.next_attempt_at,
      })),
    };
  });

/** Queue one page of retained history as `backfill` (CES must not notify). */
export const runCesBackfillPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entityType?: string; after?: string | null; pageSize?: number }) => ({
    entityType: input?.entityType === "contact_message" ? "contact_message" : "service_request",
    after: input?.after ?? null,
    pageSize: Math.min(Math.max(Number(input?.pageSize ?? 50), 1), 100),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { enqueueBackfillPage } = await import("./ces/outbox.server");
    return enqueueBackfillPage(data.entityType as never, data.after, data.pageSize);
  });

/** Attempt delivery of due rows. Refuses to run until CES is configured. */
export const runCesDrain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number }) => ({
    limit: Math.min(Math.max(Number(input?.limit ?? 25), 1), 100),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { drainCesOutbox } = await import("./ces/outbox.server");
    return drainCesOutbox(data.limit);
  });

/** Put failed rows back in line immediately (does not reset `sent`). */
export const retryCesFailures = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ces_outbox")
      .update({ status: "pending", next_attempt_at: new Date().toISOString() })
      .in("status", ["failed", "dead"])
      .select("id");
    if (error) throw new Error(error.message);
    return { reset: (data ?? []).length };
  });
