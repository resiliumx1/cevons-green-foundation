import { describe, expect, it } from "vitest";
import {
  MAX_BODY_BYTES,
  buildCesBody,
  byteLength,
  cesEventId,
  landingPathname,
  toBranchCode,
  toPipeline,
  type CesSourceRecord,
} from "../contract";
import { backoffSeconds, hmacSha256Hex, signingBase } from "../delivery.server";

const base: CesSourceRecord = {
  id: "11111111-2222-3333-4444-555555555555",
  reference: "SR-2026-0001",
  created_at: "2026-09-01T10:20:30+00:00",
  entity_type: "service_request",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+592 218 1455",
  service: "Skip bin rental",
  region: "Georgetown",
  status: "new",
  message: "Need a bin",
  customer_type: "Commercial",
  service_branch: "gt-main",
  landing_page: "https://cevons.com/services?gclid=abc123",
  referrer: "https://google.com",
  utm_source: "google",
  utm_medium: "cpc",
};

describe("CES body contract", () => {
  it("emits only known camelCase keys with required fields", () => {
    const { body } = buildCesBody(base, "live");
    expect(body.externalId).toBe(base.id);
    expect(body.name).toBe("Jane Doe");
    expect(body.submittedAt).toBe("2026-09-01T10:20:30.000Z");
    expect(body.reference).toBe("SR-2026-0001");
    expect(body.pipeline).toBe("commercial");
    expect(body.branchCode).toBe("GTMAIN");
    expect(body.utm).toEqual({ source: "google", medium: "cpc" });
    expect(body.sourceUrl).toBe("https://cevons.com/services?gclid=abc123");
    expect(body.backfill).toBeUndefined();

    const allowed = new Set([
      "externalId", "name", "submittedAt", "reference", "email", "phone", "service",
      "region", "address", "message", "landingPage", "referrer", "sourceUrl", "status",
      "utm", "pipeline", "branchCode", "backfill",
    ]);
    for (const key of Object.keys(body)) expect(allowed.has(key)).toBe(true);
  });

  it("marks backfill deliveries so CES stays quiet", () => {
    expect(buildCesBody(base, "backfill").body.backfill).toBe(true);
  });

  it("truncates oversized fields and reports them without touching the record", () => {
    const long = "x".repeat(6000);
    const { body, issues } = buildCesBody({ ...base, message: long }, "live");
    expect(body.message).toHaveLength(5000);
    expect(issues.some((i) => i.field === "message")).toBe(true);
    expect(long).toHaveLength(6000);
  });

  it("keeps the body under the 64 kB ceiling", () => {
    const { body, bytes } = buildCesBody({ ...base, message: "y".repeat(200000) }, "live");
    expect(bytes).toBeLessThanOrEqual(MAX_BODY_BYTES);
    expect(byteLength(JSON.stringify(body))).toBeLessThanOrEqual(MAX_BODY_BYTES);
  });

  it("drops non-http source URLs and invalid branch codes", () => {
    const issues: Array<{ field: string; reason: string }> = [];
    expect(toBranchCode("12", issues)).toBeUndefined();
    expect(issues).toHaveLength(1);
    const { body } = buildCesBody({ ...base, landing_page: "javascript:alert(1)" }, "live");
    expect(body.sourceUrl).toBeUndefined();
  });

  it("falls back to a safe name when the record has none", () => {
    const { body } = buildCesBody({ ...base, name: null }, "live");
    expect(body.name).toBe("Website enquiry");
  });

  it("maps pipelines and groups landing pages by path", () => {
    expect(toPipeline("Residential")).toBe("residential");
    expect(toPipeline(null, "Industrial services")).toBe("industrial");
    expect(landingPathname("https://cevons.com/services/skip-bin?gclid=x")).toBe("/services/skip-bin");
  });
});

describe("dedupe and retry rules", () => {
  it("uses one stable dedupe key per website record", () => {
    expect(cesEventId("service_request", "abc")).toBe("service_request:abc");
    expect(cesEventId("service_request", "abc")).toBe(cesEventId("service_request", "abc"));
  });

  it("backs off exponentially and caps at six hours", () => {
    expect(backoffSeconds(1)).toBe(60);
    expect(backoffSeconds(2)).toBe(240);
    expect(backoffSeconds(3)).toBe(960);
    expect(backoffSeconds(9)).toBe(21600);
  });
});

describe("signature", () => {
  it("signs exactly `${timestamp}.${eventId}.${rawBody}`", async () => {
    expect(signingBase("1700000000", "evt", '{"a":1}')).toBe('1700000000.evt.{"a":1}');
    const sig = await hmacSha256Hex("secret", "1700000000.evt.{\"a\":1}");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    // Known-answer check: HMAC-SHA256 of "message" with key "key".
    expect(await hmacSha256Hex("key", "message")).toBe(
      "6e9ef29b75fffc5b7abae527d58fdadb2fe42e7219011976917343065f58ed4a",
    );
  });

  it("changes when the delivery event id changes (deliberate resend)", async () => {
    const a = await hmacSha256Hex("s", signingBase("1", "evt-a", "{}"));
    const b = await hmacSha256Hex("s", signingBase("1", "evt-b", "{}"));
    expect(a).not.toBe(b);
  });
});
