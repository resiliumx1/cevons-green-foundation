import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REQUEST_TIMEOUT_MS,
  deliverToCes,
  externalIdOf,
  isSecureCesUrl,
  reconcileWithCes,
  validateIntakeResponse,
  validateReconcileResponse,
} from "../delivery.server";

const BODY = JSON.stringify({ externalId: "req-1", name: "Jane", submittedAt: "2026-09-01T00:00:00Z" });

function configure(url = "https://ces.example.com/api/integrations/website/intake") {
  process.env["CES_INTAKE_URL"] = url;
  process.env["WEBSITE_INTAKE_SECRET"] = "test-secret";
}

function reply(status: number, contentType: string, body: string, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { "content-type": contentType, ...headers } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env["CES_INTAKE_URL"];
  delete process.env["WEBSITE_INTAKE_SECRET"];
});

describe("intake response validation", () => {
  it("accepts the documented recorded/duplicate/replayed states", () => {
    for (const [state, dup] of [
      ["recorded", false],
      ["duplicate", true],
      ["replayed", true],
    ] as const) {
      const v = validateIntakeResponse({
        status: 200,
        contentType: "application/json",
        text: JSON.stringify({ status: state, externalId: "req-1" }),
        eventId: "ev-1",
        externalId: "req-1",
      });
      expect(v).toEqual({ ok: true, duplicate: dup, state });
    }
  });

  it("rejects an HTTP 200 login/HTML page", () => {
    const v = validateIntakeResponse({
      status: 200,
      contentType: "text/html; charset=utf-8",
      text: "<!doctype html><title>Sign in</title>",
      eventId: "ev-1",
      externalId: "req-1",
    });
    expect(v).toEqual({ ok: false, code: "response.contentType:not_json" });
  });

  it("rejects JSON without the documented status", () => {
    expect(
      validateIntakeResponse({
        status: 201,
        contentType: "application/json",
        text: JSON.stringify({ message: "thanks" }),
        eventId: "ev-1",
        externalId: "req-1",
      }),
    ).toEqual({ ok: false, code: "response.status:missing" });

    expect(
      validateIntakeResponse({
        status: 200,
        contentType: "application/json",
        text: JSON.stringify({ status: "queued" }),
        eventId: "ev-1",
        externalId: "req-1",
      }),
    ).toEqual({ ok: false, code: "response.status:unrecognised" });
  });

  it("rejects a reply about a different record", () => {
    expect(
      validateIntakeResponse({
        status: 201,
        contentType: "application/json",
        text: JSON.stringify({ status: "recorded", externalId: "someone-else" }),
        eventId: "ev-1",
        externalId: "req-1",
      }),
    ).toEqual({ ok: false, code: "response.externalId:mismatch" });

    expect(
      validateIntakeResponse({
        status: 201,
        contentType: "application/json",
        text: JSON.stringify({ status: "recorded", eventId: "other" }),
        eventId: "ev-1",
        externalId: null,
      }),
    ).toEqual({ ok: false, code: "response.eventId:mismatch" });
  });

  it("reads externalId out of the frozen body", () => {
    expect(externalIdOf(BODY)).toBe("req-1");
    expect(externalIdOf("not json")).toBeNull();
  });
});

describe("deliverToCes transport", () => {
  it("refuses a non-https endpoint", async () => {
    configure("http://ces.example.com/api/integrations/website/intake");
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res).toMatchObject({ ok: false, error: "endpoint_not_https" });
    expect(isSecureCesUrl("http://x.test")).toBe(false);
  });

  it("marks sent only on a validated success JSON", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => reply(201, "application/json", JSON.stringify({ status: "recorded", externalId: "req-1" }))));
    await expect(deliverToCes(BODY, { eventId: "ev-1" })).resolves.toMatchObject({
      ok: true,
      status: 201,
      duplicate: false,
    });
  });

  it("treats an HTTP 200 HTML page as a retryable failure, not a delivery", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => reply(200, "text/html", "<html>login</html>")));
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res.ok).toBe(false);
    expect(res.retryable).toBe(true);
    expect(res.error).toBe("response.contentType:not_json");
  });

  it("treats an HTTP 200 with the wrong JSON as a failure", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => reply(200, "application/json", JSON.stringify({ ok: true }))));
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("response.status:missing");
  });

  it("does not follow redirects", async () => {
    configure();
    const fetchMock = vi.fn(async (_url: unknown, _init?: RequestInit) =>
      reply(302, "text/html", "", { location: "https://login.test" }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res).toMatchObject({ ok: false, status: 302, error: "redirect_blocked", retryable: false });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ redirect: "manual" });
  });

  it("bounds the request and reports a timeout as a safe retryable code", async () => {
    configure();
    const fetchMock = vi.fn(async () => {
      const err = new Error("The operation was aborted due to timeout");
      err.name = "TimeoutError";
      throw err;
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res).toMatchObject({ ok: false, status: null, error: "timeout", retryable: true });
    expect(fetchMock.mock.calls[0]![1]!.signal).toBeDefined();
    expect(REQUEST_TIMEOUT_MS).toBeLessThan(180_000);
  });

  it("returns only safe codes for error statuses — never the response body", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => reply(401, "application/json", '{"secretHint":"do-not-store-me"}')));
    const res = await deliverToCes(BODY, { eventId: "ev-1" });
    expect(res.error).toBe("http_401:signature_rejected");
    expect(res.error).not.toContain("do-not-store-me");
  });
});

describe("reconcile response validation", () => {
  it("accepts the documented shape", () => {
    const v = validateReconcileResponse({
      status: 200,
      contentType: "application/json",
      text: JSON.stringify({
        count: 1,
        enquiries: [{ externalId: "req-1", reference: "SR-1", leadId: null, stage: "new" }],
        missing: ["req-2"],
        nextCursor: null,
      }),
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.data.enquiries[0]).toMatchObject({ externalId: "req-1", stage: "new", submittedAt: null });
      expect(v.data.missing).toEqual(["req-2"]);
    }
  });

  it("rejects malformed reconciliation payloads with a field path", () => {
    expect(
      validateReconcileResponse({ status: 200, contentType: "text/html", text: "<html></html>" }),
    ).toEqual({ ok: false, code: "response.contentType:not_json" });

    expect(
      validateReconcileResponse({
        status: 200,
        contentType: "application/json",
        text: JSON.stringify({ enquiries: {} }),
      }),
    ).toEqual({ ok: false, code: "response.enquiries:not_array" });

    expect(
      validateReconcileResponse({
        status: 200,
        contentType: "application/json",
        text: JSON.stringify({ enquiries: [{ reference: "SR-1" }] }),
      }),
    ).toEqual({ ok: false, code: "response.enquiries[0].externalId:missing" });

    expect(
      validateReconcileResponse({
        status: 200,
        contentType: "application/json",
        text: "{not json",
      }),
    ).toEqual({ ok: false, code: "response.body:invalid_json" });
  });

  it("surfaces malformed reconcile replies through the transport", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => reply(200, "application/json", JSON.stringify({ enquiries: "nope" }))));
    const res = await reconcileWithCes({ externalIds: ["req-1"] });
    expect(res).toMatchObject({ ok: false, error: "response.enquiries:not_array" });
  });
});
