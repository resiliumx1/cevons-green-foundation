/** CES request-status lookup — SERVER ONLY. Never logs bodies, secret or signature. */
import { readCesConfig, signedHeaders } from "./delivery.server";

const STAGES = ["new", "contacted", "quoted", "scheduled", "won", "lost"] as const;
export type CesStage = (typeof STAGES)[number];
export type CesStatus = {
  found: boolean;
  stage: CesStage | null;
  events: { stage: CesStage; at: string }[];
  visit: { date: string; window: string | null } | null;
};

const isStage = (v: unknown): v is CesStage => typeof v === "string" && (STAGES as readonly string[]).includes(v);
const isIso = (v: unknown) => typeof v === "string" && !Number.isNaN(Date.parse(v));

function validate(b: unknown): CesStatus | null {
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  if (typeof o["found"] !== "boolean") return null;
  const stage = o["stage"];
  if (stage !== null && !isStage(stage)) return null;
  if (!Array.isArray(o["events"])) return null;
  const events: CesStatus["events"] = [];
  for (const e of o["events"] as unknown[]) {
    const r = e as Record<string, unknown> | null;
    if (!r || !isStage(r["stage"]) || !isIso(r["at"])) return null;
    events.push({ stage: r["stage"], at: r["at"] as string });
  }
  let visit: CesStatus["visit"] = null;
  const v = o["visit"];
  if (v !== null) {
    const r = v as Record<string, unknown> | undefined;
    if (!r || typeof r !== "object") return null;
    if (typeof r["date"] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r["date"])) return null;
    const w = r["window"];
    if (w !== null && w !== undefined && typeof w !== "string") return null;
    visit = { date: r["date"], window: (w as string | null | undefined) ?? null };
  }
  return { found: o["found"], stage: (stage as CesStage | null) ?? null, events, visit };
}

export async function askCesStatus(input: { externalId: string; salesExternalIds: string[] }): Promise<CesStatus | null> {
  const config = readCesConfig();
  if (!config) return null;
  const url = config.url.replace(/\/intake\/?$/, "/status");
  const payload: Record<string, unknown> = { externalId: input.externalId };
  const ids = input.salesExternalIds.slice(0, 5);
  if (ids.length) payload["salesExternalIds"] = ids;
  const raw = JSON.stringify(payload);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: await signedHeaders(config.secret, `status:${crypto.randomUUID()}`, raw),
      body: raw,
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    if (res.status !== 200 || !(res.headers.get("content-type") ?? "").includes("application/json")) {
      try { await res.body?.cancel(); } catch { /* ignore */ }
      return null;
    }
    return validate(await res.json());
  } catch {
    return null;
  }
}
