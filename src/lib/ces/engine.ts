/**
 * CES outbox engine — pure orchestration, no database or network of its own.
 *
 * Every side effect arrives as a port, so the real server module wires the
 * database and HTTP transport while tests wire fakes. The rules enforced here:
 *
 *  - A row is only worked on after the database has CLAIMED it (lease token).
 *    A second drain running at the same time gets nothing, so two senders can
 *    never build two different bodies under one delivery id.
 *  - The body is FROZEN durably before any send. If freezing fails, we do not
 *    send at all — an unrecorded body could differ on the next attempt.
 *  - Every completion is CONDITIONAL on the lease token, so a drain whose
 *    lease expired can never overwrite the status written by the drain that
 *    took over.
 *  - Errors are reported as short safe strings; raw exception objects are
 *    never logged.
 */
import { buildCesBody, type CesEntityType, type CesMode, type CesSourceRecord } from "./contract";
import { backoffSeconds } from "./delivery.server";

export const MAX_ATTEMPTS = 8;

export type ClaimedRow = {
  id: string;
  event_id: string;
  delivery_event_id: string;
  entity_type: CesEntityType;
  entity_id: string;
  reference: string | null;
  mode: CesMode;
  attempts: number;
  request_body: string | null;
  lease_token: string;
};

export type Completion =
  | { kind: "sent"; attempts: number; statusCode: number | null }
  | { kind: "failed"; attempts: number; statusCode: number | null; error: string; nextAttemptAt: string }
  | { kind: "dead"; attempts: number; statusCode: number | null; error: string }
  | { kind: "release"; error: string; nextAttemptAt: string };

export type DeliveryOutcome = {
  ok: boolean;
  status: number | null;
  duplicate: boolean;
  error?: string;
  retryable: boolean;
};

export type DrainPorts = {
  configured: () => boolean;
  /** Atomic claim with lease (SKIP LOCKED in the database). */
  claim: (limit: number) => Promise<ClaimedRow[]>;
  loadRecord: (entityType: CesEntityType, entityId: string) => Promise<CesSourceRecord | null>;
  /** Durable freeze; returns false when the body could not be persisted. */
  freezeBody: (
    row: ClaimedRow,
    rawBody: string,
    issues: Array<{ field: string; reason: string }>,
  ) => Promise<boolean>;
  deliver: (rawBody: string, deliveryEventId: string) => Promise<DeliveryOutcome>;
  /** Conditional on the lease token; false when another worker took over. */
  complete: (row: ClaimedRow, completion: Completion) => Promise<boolean>;
  now?: () => number;
};

export type DrainResult = {
  attempted: number;
  sent: number;
  duplicates: number;
  failed: number;
  skipped: number;
  lost: number;
  configured: boolean;
  failures: Array<{ reference: string | null; error: string }>;
};

export async function runDrain(ports: DrainPorts, limit = 25): Promise<DrainResult> {
  const now = ports.now ?? (() => Date.now());
  const result: DrainResult = {
    attempted: 0,
    sent: 0,
    duplicates: 0,
    failed: 0,
    skipped: 0,
    lost: 0,
    configured: ports.configured(),
    failures: [],
  };
  if (!result.configured) return result;

  const rows = await ports.claim(limit);

  for (const row of rows) {
    result.attempted++;

    let rawBody = typeof row.request_body === "string" && row.request_body ? row.request_body : null;

    if (!rawBody) {
      const record = await ports.loadRecord(row.entity_type, row.entity_id);
      if (!record) {
        result.skipped++;
        await ports.complete(row, {
          kind: "dead",
          attempts: row.attempts,
          statusCode: null,
          error: "source_record_missing",
        });
        continue;
      }
      const built = buildCesBody(record, row.mode);
      const candidate = JSON.stringify(built.body);
      const frozen = await ports.freezeBody(row, candidate, built.issues);
      if (!frozen) {
        // Never send a body we could not record: a retry must repeat it byte
        // for byte, and we cannot promise that from memory alone.
        result.skipped++;
        result.failures.push({ reference: row.reference, error: "freeze_failed" });
        await ports.complete(row, {
          kind: "release",
          error: "freeze_failed",
          nextAttemptAt: new Date(now() + backoffSeconds(row.attempts + 1) * 1000).toISOString(),
        });
        continue;
      }
      rawBody = candidate;
    }

    const outcome = await ports.deliver(rawBody, row.delivery_event_id);
    const attempts = row.attempts + 1;

    if (outcome.ok) {
      const won = await ports.complete(row, {
        kind: "sent",
        attempts,
        statusCode: outcome.status,
      });
      if (!won) {
        result.lost++;
        continue;
      }
      result.sent++;
      if (outcome.duplicate) result.duplicates++;
      continue;
    }

    const error = (outcome.error ?? "delivery_failed").slice(0, 500);
    const dead = !outcome.retryable || attempts >= MAX_ATTEMPTS;
    const won = await ports.complete(
      row,
      dead
        ? { kind: "dead", attempts, statusCode: outcome.status, error }
        : {
            kind: "failed",
            attempts,
            statusCode: outcome.status,
            error,
            nextAttemptAt: new Date(now() + backoffSeconds(attempts) * 1000).toISOString(),
          },
    );
    if (!won) {
      result.lost++;
      continue;
    }
    result.failed++;
    result.failures.push({ reference: row.reference, error });
  }

  return result;
}

/* ── Stable keyset pagination for the backfill ────────────────────────────── */

export type SourceRow = { id: string; reference: string | null; created_at: string };

/** Cursor is `${created_at}|${id}` so records sharing a timestamp are never skipped. */
export function encodeCursor(row: SourceRow): string {
  return `${row.created_at}|${row.id}`;
}

export function decodeCursor(cursor: string | null): { createdAt: string; id: string } | null {
  if (!cursor) return null;
  const at = cursor.lastIndexOf("|");
  if (at <= 0) return { createdAt: cursor, id: "" }; // tolerate the old created_at-only cursor
  return { createdAt: cursor.slice(0, at), id: cursor.slice(at + 1) };
}

/** Order used by both the query and the tie tests. */
export function compareKeyset(a: SourceRow, b: SourceRow): number {
  if (a.created_at !== b.created_at) return a.created_at < b.created_at ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function isAfterCursor(row: SourceRow, cursor: string | null): boolean {
  const c = decodeCursor(cursor);
  if (!c) return true;
  if (row.created_at !== c.createdAt) return row.created_at > c.createdAt;
  return row.id > c.id;
}
