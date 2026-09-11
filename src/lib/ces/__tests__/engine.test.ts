import { describe, expect, it } from "vitest";
import {
  compareKeyset,
  decodeCursor,
  encodeCursor,
  isAfterCursor,
  runDrain,
  type ClaimedRow,
  type Completion,
  type DrainPorts,
  type SourceRow,
} from "../engine";

/* ── A tiny in-memory stand-in for the queue table ────────────────────────── */

type Row = ClaimedRow & { status: string; lease_token: string | null };

class FakeQueue {
  rows: Row[] = [];
  sends: Array<{ id: string; body: string; eventId: string }> = [];
  freezeFails = false;
  private seq = 0;

  add(partial: Partial<Row> = {}): Row {
    const n = ++this.seq;
    const row: Row = {
      id: `row-${n}`,
      event_id: `service_request:${n}`,
      delivery_event_id: `del-${n}`,
      entity_type: "service_request",
      entity_id: `req-${n}`,
      reference: `REF-${n}`,
      mode: "live",
      attempts: 0,
      request_body: null,
      status: "pending",
      lease_token: null,
      ...partial,
    } as Row;
    this.rows.push(row);
    return row;
  }

  /** Atomic claim: a leased row is invisible to any other drain. */
  claim = async (limit: number): Promise<ClaimedRow[]> => {
    const token = `lease-${Math.random().toString(36).slice(2)}`;
    const due = this.rows.filter((r) => r.status === "pending" || r.status === "failed").slice(0, limit);
    for (const r of due) {
      r.status = "sending";
      r.lease_token = token;
    }
    return due.map((r) => ({ ...r, lease_token: token }));
  };

  freezeBody = async (row: ClaimedRow, body: string): Promise<boolean> => {
    if (this.freezeFails) return false;
    const live = this.rows.find((r) => r.id === row.id);
    if (!live || live.lease_token !== row.lease_token) return false;
    live.request_body = body;
    return true;
  };

  complete = async (row: ClaimedRow, c: Completion): Promise<boolean> => {
    const live = this.rows.find((r) => r.id === row.id);
    if (!live || live.lease_token !== row.lease_token) return false; // lease lost
    live.lease_token = null;
    live.status = c.kind === "release" ? "pending" : c.kind;
    if (c.kind !== "release") live.attempts = c.attempts;
    return true;
  };
}

function ports(q: FakeQueue, over: Partial<DrainPorts> = {}): DrainPorts {
  return {
    configured: () => true,
    claim: q.claim,
    loadRecord: async (entityType, entityId) =>
      ({
        id: entityId,
        entity_type: entityType,
        name: "Test Person",
        created_at: "2026-09-01T00:00:00.000Z",
      }) as never,
    freezeBody: q.freezeBody,
    deliver: async (body, eventId) => {
      q.sends.push({ id: eventId, body, eventId });
      return { ok: true, status: 201, duplicate: false, retryable: false };
    },
    complete: q.complete,
    ...over,
  };
}

describe("drain concurrency", () => {
  it("two concurrent drains never work the same row twice", async () => {
    const q = new FakeQueue();
    q.add();
    q.add();

    const [a, b] = await Promise.all([runDrain(ports(q), 25), runDrain(ports(q), 25)]);

    expect(a.attempted + b.attempted).toBe(2);
    expect(q.sends.length).toBe(2);
    expect(new Set(q.sends.map((s) => s.eventId)).size).toBe(2);
    expect(q.rows.every((r) => r.status === "sent")).toBe(true);
  });

  it("a drain whose lease was stolen cannot overwrite the winner's status", async () => {
    const q = new FakeQueue();
    const row = q.add();

    const stealing = ports(q, {
      deliver: async (body, eventId) => {
        // Another worker takes over mid-flight (expired lease recovery).
        row.lease_token = "someone-else";
        row.status = "sent";
        q.sends.push({ id: eventId, body, eventId });
        return { ok: true, status: 201, duplicate: false, retryable: false };
      },
    });

    const result = await runDrain(stealing, 25);
    expect(result.sent).toBe(0);
    expect(result.lost).toBe(1);
    expect(row.status).toBe("sent");
  });

  it("retries reuse the frozen body and the same delivery event id", async () => {
    const q = new FakeQueue();
    const row = q.add();
    let first = true;
    const p = ports(q, {
      deliver: async (body, eventId) => {
        q.sends.push({ id: eventId, body, eventId });
        if (first) {
          first = false;
          return { ok: false, status: 503, duplicate: false, retryable: true, error: "upstream_503" };
        }
        return { ok: true, status: 200, duplicate: true, retryable: false };
      },
    });

    await runDrain(p, 25);
    expect(row.status).toBe("failed");
    await runDrain(p, 25);

    expect(q.sends).toHaveLength(2);
    expect(q.sends[0]!.body).toBe(q.sends[1]!.body);
    expect(q.sends[0]!.eventId).toBe(q.sends[1]!.eventId);
    expect(row.status).toBe("sent");
  });
});

describe("failed freeze", () => {
  it("never sends when the body could not be persisted, and re-queues the row", async () => {
    const q = new FakeQueue();
    const row = q.add();
    q.freezeFails = true;

    const result = await runDrain(ports(q), 25);

    expect(q.sends).toHaveLength(0);
    expect(result.sent).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.failures[0]!.error).toBe("freeze_failed");
    expect(row.status).toBe("pending");
    expect(row.request_body).toBeNull();
    expect(row.attempts).toBe(0);
  });
});

describe("stable keyset pagination", () => {
  const tied: SourceRow[] = [
    { id: "b", reference: "B", created_at: "2026-08-01T10:00:00Z" },
    { id: "a", reference: "A", created_at: "2026-08-01T10:00:00Z" },
    { id: "c", reference: "C", created_at: "2026-08-01T10:00:00Z" },
    { id: "d", reference: "D", created_at: "2026-08-02T10:00:00Z" },
  ];

  it("pages through records sharing a timestamp without skipping any", () => {
    const ordered = [...tied].sort(compareKeyset);
    const pageSize = 2;
    const seen: string[] = [];
    let cursor: string | null = null;

    for (let guard = 0; guard < 10; guard++) {
      const page = ordered.filter((r) => isAfterCursor(r, cursor)).slice(0, pageSize);
      if (page.length === 0) break;
      seen.push(...page.map((r) => r.id));
      cursor = page.length === pageSize ? encodeCursor(page[page.length - 1]!) : null;
      if (!cursor) break;
    }

    expect(seen).toEqual(["a", "b", "c", "d"]);
    expect(new Set(seen).size).toBe(4);
  });

  it("a created_at-only cursor would drop the tied records", () => {
    const ordered = [...tied].sort(compareKeyset);
    const firstPage = ordered.slice(0, 2);
    const legacy = firstPage[firstPage.length - 1]!.created_at; // old behaviour
    const next = ordered.filter((r) => r.created_at > legacy);
    expect(next.map((r) => r.id)).toEqual(["d"]); // "c" is lost
    expect(decodeCursor(legacy)).toEqual({ createdAt: legacy, id: "" });
  });
});

describe("reconcile paging", () => {
  it("compares more than 200 rows in 200-id pages and separates unsent items", async () => {
    const PAGE = 200;
    const all = Array.from({ length: 450 }, (_, i) => ({
      entity_id: `req-${i}`,
      reference: `REF-${i}`,
      status: i % 100 === 0 ? "failed" : "sent",
    }));

    const calls: number[] = [];
    let from = 0;
    let checked = 0;
    const unsent: string[] = [];

    for (;;) {
      const page = all.slice(from, from + PAGE);
      if (page.length === 0) break;
      const sent = page.filter((r) => r.status === "sent");
      unsent.push(...page.filter((r) => r.status !== "sent").map((r) => r.entity_id));
      if (sent.length) {
        calls.push(sent.length);
        checked += sent.length;
      }
      if (page.length < PAGE) break;
      from += PAGE;
    }

    expect(calls.length).toBe(3);
    expect(calls.every((n) => n <= 200)).toBe(true);
    expect(checked + unsent.length).toBe(450);
    expect(unsent).toEqual(["req-0", "req-100", "req-200", "req-300", "req-400"]);
  });
});
