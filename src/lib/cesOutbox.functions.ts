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
  dispatch: {
    lastDispatchAt: string | null;
    lastDrainAt: string | null;
    lastError: string | null;
    lastErrorAt: string | null;
  };
  config: {
    urlConfigured: boolean;
    secretConfigured: boolean;
    host: string | null;
    secureOrigin: boolean;
    ready: boolean;
  };
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
  feed: {
    pending: number;
    sent: number;
    failed: number;
    failures: Array<{ kind: string; attempts: number; lastError: string | null; lastStatusCode: number | null }>;
  };
  sales: {
    counts: { pending: number; sent: number; failed: number; dead: number };
    lastError: string | null;
    lastErrorAt: string | null;
    recentFailures: Array<{
      reference: string | null;
      attempts: number;
      lastStatusCode: number | null;
      lastError: string | null;
      status: string;
    }>;
  };
};

async function salesStatus(supabaseAdmin: any): Promise<CesQueueStatus["sales"]> {
  const c = async (statuses: string[]) =>
    (
      await supabaseAdmin
        .from("ces_outbox")
        .select("id", { count: "exact", head: true })
        .eq("entity_type", "service_request")
        .in("sales_status", statuses)
    ).count ?? 0;
  const [pending, sent, failed, dead] = await Promise.all([
    c(["pending", "sending"]),
    c(["sent"]),
    c(["failed"]),
    c(["dead"]),
  ]);
  const { data } = await supabaseAdmin
    .from("ces_outbox")
    .select("reference, sales_status, sales_attempts, sales_last_status_code, sales_last_error, updated_at")
    .eq("entity_type", "service_request")
    .in("sales_status", ["failed", "dead"])
    .order("sales_next_attempt_at", { ascending: false })
    .limit(10);
  const rows = (data ?? []) as Array<Record<string, any>>;
  const { data: last } = await supabaseAdmin
    .from("ces_outbox")
    .select("sales_last_error, sales_next_attempt_at, updated_at")
    .eq("entity_type", "service_request")
    .not("sales_last_error", "is", null)
    .in("sales_status", ["failed", "dead"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    counts: { pending, sent, failed, dead },
    lastError: last?.sales_last_error ?? null,
    lastErrorAt: last?.updated_at ?? null,
    recentFailures: rows.map((r) => ({
      reference: r.reference ?? null,
      attempts: r.sales_attempts ?? 0,
      lastStatusCode: r.sales_last_status_code ?? null,
      lastError: r.sales_last_error ?? null,
      status: r.sales_status,
    })),
  };
}

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

    const { data: disp } = await supabaseAdmin
      .from("ces_dispatch_status")
      .select("last_dispatch_at, last_drain_at, last_error, last_error_at")
      .eq("id", "default")
      .maybeSingle();

    return {
      dispatch: {
        lastDispatchAt: disp?.last_dispatch_at ?? null,
        lastDrainAt: disp?.last_drain_at ?? null,
        lastError: disp?.last_error ?? null,
        lastErrorAt: disp?.last_error_at ?? null,
      },
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
      feed: await (async () => {
        const c = async (s: string) =>
          (await supabaseAdmin.from("ces_feed_queue").select("id", { count: "exact", head: true }).eq("status", s)).count ?? 0;
        const [fp, fs, ff] = await Promise.all([c("pending"), c("sent"), c("failed")]);
        const { data: ffail } = await supabaseAdmin
          .from("ces_feed_queue")
          .select("event_id, attempts, last_error, last_status_code")
          .eq("status", "failed")
          .order("created_at", { ascending: false })
          .limit(5);
        return {
          pending: fp,
          sent: fs,
          failed: ff,
          failures: (ffail ?? []).map((r) => ({
            kind: r.event_id.split(":")[0],
            attempts: r.attempts,
            lastError: r.last_error,
            lastStatusCode: r.last_status_code,
          })),
        };
      })(),
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

/** Compare the whole queue against CES, in pages. */
export const runCesReconcile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { maxRows?: number; requeueMissing?: boolean }) => ({
    maxRows: Math.min(Math.max(Number(input?.maxRows ?? 5000), 1), 20000),
    requeueMissing: !!input?.requeueMissing,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { reconcileCes } = await import("./ces/outbox.server");
    return reconcileCes(data);
  });


/** Deliberate resend of one item: new delivery id, same website request id. */
export const resendCesItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { outboxId: string }) => ({ outboxId: String(input?.outboxId ?? "") }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { resendCesEvent } = await import("./ces/outbox.server");
    return resendCesEvent(data.outboxId);
  });
