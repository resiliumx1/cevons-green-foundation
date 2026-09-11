/**
 * CES delivery outbox — SERVER ONLY.
 *
 * Design contract:
 *  - Queue rows are written by a database trigger in the SAME transaction as
 *    the website record, so a request can never be saved without being queued.
 *  - `event_id` is deterministic (`type:id`), so a repeated submission path,
 *    a retry, or a rerun of the backfill consolidates onto one queue row.
 *  - `delivery_event_id` is the CES delivery id: identical across retries
 *    (same body too — the body is frozen on first attempt); regenerated only
 *    for a deliberate resend, which keeps the same `externalId`.
 *  - Nothing in this module is reachable from the browser.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  cesEventId,
  type CesEntityType,
  type CesMode,
  type CesSourceRecord,
} from "./contract";
import { deliverToCes, readCesConfig, reconcileWithCes } from "./delivery.server";
import {
  MAX_ATTEMPTS,
  compareKeyset,
  decodeCursor,
  encodeCursor,
  runDrain,
  type ClaimedRow,
  type Completion,
  type DrainResult,
  type SourceRow,
} from "./engine";

export type { DrainResult } from "./engine";
export { MAX_ATTEMPTS } from "./engine";

const LEASE_SECONDS = 180;

export type EnqueueInput = {
  entityType: CesEntityType;
  entityId: string;
  reference?: string | null;
  mode?: CesMode;
};

export function newDeliveryEventId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** Short, safe error code — raw exception objects are never logged or stored. */
function safeCode(err: unknown): string {
  if (err instanceof Error && /abort|timeout/i.test(err.name)) return "timeout";
  return "unexpected_error";
}

/**
 * Insert (or consolidate onto) one queue row. Never throws.
 * The database trigger already does this for new rows; this stays as a safe
 * belt-and-braces path for the notify dispatcher and the backfill.
 */
export async function enqueueCesEvent(input: EnqueueInput): Promise<{ queued: boolean; reason?: string }> {
  try {
    const mode = input.mode ?? "live";
    const { error } = await supabaseAdmin.from("ces_outbox").upsert(
      {
        event_id: cesEventId(input.entityType, input.entityId),
        entity_type: input.entityType,
        entity_id: input.entityId,
        reference: input.reference ?? null,
        mode,
        payload: {} as never,
      },
      { onConflict: "event_id", ignoreDuplicates: true },
    );
    if (error) {
      console.error("ces outbox enqueue rejected (submission unaffected): db_write_failed");
      return { queued: false, reason: "db_write_failed" };
    }
    return { queued: true };
  } catch (err) {
    console.error(`ces outbox enqueue failed (submission unaffected): ${safeCode(err)}`);
    return { queued: false, reason: "enqueue_error" };
  }
}


/** Re-read the live row so the first attempt always carries current data. */
async function loadRecord(
  entityType: CesEntityType,
  entityId: string,
): Promise<CesSourceRecord | null> {
  const table = entityType === "service_request" ? "service_requests" : "contact_messages";
  const { data } = await supabaseAdmin.from(table).select("*").eq("id", entityId).maybeSingle();
  if (!data) return null;
  return { ...(data as Record<string, unknown>), entity_type: entityType } as CesSourceRecord;
}

/**
 * Send up to `limit` due rows. Safe to call repeatedly and concurrently: rows
 * are claimed atomically with a lease (SKIP LOCKED), the body is frozen before
 * any send, and every completion is conditional on still holding the lease.
 */
export async function drainCesOutbox(limit = 25): Promise<DrainResult> {
  return runDrain(
    {
      configured: () => !!readCesConfig(),

      claim: async (n) => {
        const { data, error } = await supabaseAdmin.rpc("ces_outbox_claim", {
          _limit: n,
          _lease_seconds: LEASE_SECONDS,
        } as never);
        if (error) {
          console.error("ces outbox claim failed: db_claim_failed");
          return [];
        }
        return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
          id: String(r["id"]),
          event_id: String(r["event_id"]),
          delivery_event_id: String(r["delivery_event_id"]),
          entity_type: r["entity_type"] as CesEntityType,
          entity_id: String(r["entity_id"]),
          reference: (r["reference"] as string | null) ?? null,
          mode: r["mode"] as CesMode,
          attempts: Number(r["attempts"] ?? 0),
          request_body: (r["request_body"] as string | null) ?? null,
          lease_token: String(r["lease_token"] ?? ""),
        })) satisfies ClaimedRow[];
      },

      loadRecord,

      freezeBody: async (row, rawBody, issues) => {
        try {
          const { data, error } = await supabaseAdmin
            .from("ces_outbox")
            .update({ request_body: rawBody as never, issues: issues as never })
            .eq("id", row.id)
            .eq("lease_token", row.lease_token as never)
            .select("id");
          if (error) {
            console.error("ces outbox freeze failed: db_write_failed");
            return false;
          }
          return (data?.length ?? 0) > 0;
        } catch (err) {
          console.error(`ces outbox freeze failed: ${safeCode(err)}`);
          return false;
        }
      },

      deliver: async (rawBody, deliveryEventId) => {
        const outcome = await deliverToCes(rawBody, { eventId: deliveryEventId });
        return {
          ok: outcome.ok,
          status: outcome.status,
          duplicate: !!outcome.duplicate,
          error: outcome.error,
          retryable: !!outcome.retryable,
        };
      },

      complete: (row, completion) => applyCompletion(row, completion),
    },
    limit,
  );
}

/** Conditional write: only the worker still holding the lease may finish a row. */
async function applyCompletion(row: ClaimedRow, completion: Completion): Promise<boolean> {
  const patch: Record<string, unknown> = { lease_token: null, lease_expires_at: null };

  if (completion.kind === "sent") {
    Object.assign(patch, {
      status: "sent",
      attempts: completion.attempts,
      sent_at: new Date().toISOString(),
      last_error: null,
      last_status_code: completion.statusCode,
    });
  } else if (completion.kind === "failed") {
    Object.assign(patch, {
      status: "failed",
      attempts: completion.attempts,
      last_error: completion.error,
      last_status_code: completion.statusCode,
      next_attempt_at: completion.nextAttemptAt,
    });
  } else if (completion.kind === "dead") {
    Object.assign(patch, {
      status: "dead",
      attempts: completion.attempts,
      last_error: completion.error,
      last_status_code: completion.statusCode,
    });
  } else {
    // Freeze failed: put the row back in line untouched apart from the retry time.
    Object.assign(patch, {
      status: "pending",
      last_error: completion.error,
      next_attempt_at: completion.nextAttemptAt,
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("ces_outbox")
      .update(patch as never)
      .eq("id", row.id)
      .eq("lease_token", row.lease_token as never)
      .select("id");
    if (error) {
      console.error("ces outbox completion failed: db_write_failed");
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error(`ces outbox completion failed: ${safeCode(err)}`);
    return false;
  }
}


/**
 * Deliberate resend: fresh delivery event id, unchanged externalId, rebuilt
 * body from the current record. CES records it as a new delivery event.
 */
export async function resendCesEvent(outboxId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: row } = await supabaseAdmin
    .from("ces_outbox")
    .select("id")
    .eq("id", outboxId)
    .maybeSingle();
  if (!row) return { ok: false, error: "Queue item not found." };

  const { error } = await supabaseAdmin
    .from("ces_outbox")
    .update({
      delivery_event_id: newDeliveryEventId(),
      request_body: null,
      status: "pending",
      attempts: 0,
      last_error: null,
      last_status_code: null,
      sent_at: null,
      next_attempt_at: new Date().toISOString(),
    })
    .eq("id", outboxId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type BackfillPage = {
  scanned: number;
  queued: number;
  alreadyQueued: number;
  /** Pass back as `after` to continue; null when the history is exhausted. */
  nextCursor: string | null;
  totalRetained: number;
};

/**
 * Queue historical requests in pages, marked `backfill` so CES raises no alert
 * and sends no customer email. Rerunnable: existing event ids are left alone.
 */
export async function enqueueBackfillPage(
  entityType: CesEntityType,
  after: string | null,
  pageSize = 50,
): Promise<BackfillPage> {
  const table = entityType === "service_request" ? "service_requests" : "contact_messages";

  const { count } = await supabaseAdmin.from(table).select("id", { count: "exact", head: true });

  let query = supabaseAdmin
    .from(table)
    .select("id, reference, created_at")
    .order("created_at", { ascending: true })
    .limit(pageSize);
  if (after) query = query.gt("created_at", after);

  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);

  const list = (rows ?? []) as Array<{ id: string; reference: string | null; created_at: string }>;
  let queued = 0;
  let alreadyQueued = 0;

  for (const row of list) {
    const eventId = cesEventId(entityType, row.id);
    const { data: existing } = await supabaseAdmin
      .from("ces_outbox")
      .select("id, mode, status")
      .eq("event_id", eventId)
      .maybeSingle();
    if (existing) {
      alreadyQueued++;
      continue;
    }
    const res = await enqueueCesEvent({
      entityType,
      entityId: row.id,
      reference: row.reference,
      mode: "backfill",
    });
    if (res.queued) queued++;
  }

  return {
    scanned: list.length,
    queued,
    alreadyQueued,
    nextCursor: list.length === pageSize ? (list[list.length - 1]?.created_at ?? null) : null,
    totalRetained: count ?? 0,
  };
}

export type ReconcileReport = {
  checked: number;
  matched: number;
  missing: Array<{ externalId: string; reference: string | null }>;
  requeued: number;
  error?: string;
};

/**
 * Ask CES what it holds for our recently sent items and requeue anything it
 * does not have. Read-mostly: the only local write is putting a missing item
 * back in line for delivery.
 */
export async function reconcileCes(opts: { limit?: number; requeueMissing?: boolean } = {}): Promise<ReconcileReport> {
  const limit = Math.min(Math.max(opts.limit ?? 200, 1), 200);
  const report: ReconcileReport = { checked: 0, matched: 0, missing: [], requeued: 0 };

  const { data: rows } = await supabaseAdmin
    .from("ces_outbox")
    .select("id, entity_id, reference, status")
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(limit);

  const list = rows ?? [];
  if (list.length === 0) return report;
  report.checked = list.length;

  const res = await reconcileWithCes({ externalIds: list.map((r) => r.entity_id), limit: 500 });
  if (!res.ok || !res.data) {
    report.error = res.error ?? "Reconcile call failed.";
    return report;
  }

  const known = new Map(res.data.enquiries.map((e) => [e.externalId, e]));
  const missingIds = new Set(res.data.missing ?? []);

  for (const row of list) {
    const hit = known.get(row.entity_id);
    if (hit && !missingIds.has(row.entity_id)) {
      report.matched++;
      await supabaseAdmin
        .from("ces_outbox")
        .update({
          reconciled_at: new Date().toISOString(),
          remote_stage: hit.stage ?? null,
          remote_lead_id: hit.leadId ?? null,
        })
        .eq("id", row.id);
      continue;
    }
    report.missing.push({ externalId: row.entity_id, reference: row.reference });
    if (opts.requeueMissing) {
      const r = await resendCesEvent(row.id);
      if (r.ok) report.requeued++;
    }
  }

  return report;
}
