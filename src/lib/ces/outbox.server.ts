/**
 * CES delivery outbox — SERVER ONLY.
 *
 * Design contract:
 *  - The website submission is committed FIRST. Enqueueing is a separate,
 *    best-effort write; if it fails, the customer's request is untouched.
 *  - `event_id` is deterministic (`type:id`), so enqueueing twice, retrying,
 *    or rerunning the backfill can never create a duplicate CES event.
 *  - Delivery attempts are recorded on the row: status, attempts, last error,
 *    last HTTP status and the next retry time (exponential backoff).
 *  - Nothing in this module is reachable from the browser.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildCesPayload,
  cesEventId,
  type CesEntityType,
  type CesMode,
  type CesSourceRecord,
} from "./contract";
import { backoffSeconds, deliverToCes, readCesConfig } from "./delivery.server";

const MAX_ATTEMPTS = 8;

export type EnqueueInput = {
  entityType: CesEntityType;
  entityId: string;
  reference?: string | null;
  mode?: CesMode;
  /** The committed row; the payload is rebuilt from it at send time if absent. */
  record?: Record<string, unknown> | null;
};

/** Insert (or leave alone) one queue row. Never throws. */
export async function enqueueCesEvent(input: EnqueueInput): Promise<{ queued: boolean; reason?: string }> {
  try {
    const mode = input.mode ?? "live";
    const { error } = await supabaseAdmin
      .from("ces_outbox")
      .upsert(
        {
          event_id: cesEventId(input.entityType, input.entityId),
          entity_type: input.entityType,
          entity_id: input.entityId,
          reference: input.reference ?? null,
          mode,
          payload: (input.record ?? {}) as never,
        },
        { onConflict: "event_id", ignoreDuplicates: true },
      );
    if (error) return { queued: false, reason: error.message };
    return { queued: true };
  } catch (err) {
    console.error("ces outbox enqueue failed (submission unaffected)", err);
    return { queued: false, reason: "enqueue_error" };
  }
}

/** Re-read the live row so a send always carries current data. */
async function loadRecord(
  entityType: CesEntityType,
  entityId: string,
): Promise<CesSourceRecord | null> {
  const table = entityType === "service_request" ? "service_requests" : "contact_messages";
  const { data } = await supabaseAdmin.from(table).select("*").eq("id", entityId).maybeSingle();
  if (!data) return null;
  return { ...(data as Record<string, unknown>), entity_type: entityType } as CesSourceRecord;
}

export type DrainResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  configured: boolean;
  failures: Array<{ reference: string | null; error: string }>;
};

/**
 * Send up to `limit` due rows. Safe to call repeatedly and concurrently:
 * every send is idempotent on CES's side through the stable event id.
 */
export async function drainCesOutbox(limit = 25): Promise<DrainResult> {
  const result: DrainResult = {
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    configured: !!readCesConfig(),
    failures: [],
  };
  if (!result.configured) return result;

  const { data: rows } = await supabaseAdmin
    .from("ces_outbox")
    .select("*")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const row of rows ?? []) {
    result.attempted++;
    const record =
      (await loadRecord(row.entity_type as CesEntityType, row.entity_id)) ??
      ({ ...(row.payload as Record<string, unknown>), entity_type: row.entity_type } as CesSourceRecord);

    const payload = buildCesPayload(
      { ...record, id: row.entity_id, reference: row.reference, entity_type: row.entity_type as CesEntityType },
      row.mode as CesMode,
    );

    const outcome = await deliverToCes(payload, {
      eventId: row.event_id,
      mode: row.mode as CesMode,
    });
    const attempts = row.attempts + 1;

    if (outcome.ok) {
      result.sent++;
      await supabaseAdmin
        .from("ces_outbox")
        .update({
          status: "sent",
          attempts,
          sent_at: new Date().toISOString(),
          last_error: null,
          last_status_code: outcome.status,
        })
        .eq("id", row.id);
      continue;
    }

    result.failed++;
    result.failures.push({ reference: row.reference, error: outcome.error ?? "Unknown error" });
    const dead = !outcome.retryable || attempts >= MAX_ATTEMPTS;
    await supabaseAdmin
      .from("ces_outbox")
      .update({
        status: dead ? "dead" : "failed",
        attempts,
        last_error: (outcome.error ?? "Unknown error").slice(0, 500),
        last_status_code: outcome.status,
        next_attempt_at: new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString(),
      })
      .eq("id", row.id);
  }

  return result;
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
 * Queue historical requests in pages, marked `backfill` so CES stays quiet.
 * Rerunnable: existing event ids are left untouched.
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
      .select("id")
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
