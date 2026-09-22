/**
 * ManyChat API helper — SERVER ONLY.
 *
 * Reads MANYCHAT_API_KEY inside each call (never at module scope) and talks to
 * the public ManyChat API. Every failure surfaces the status and the provider's
 * own error body so problems are readable instead of a generic 500.
 */

const API_BASE = "https://api.manychat.com";
const TIMEOUT_MS = 10_000;

export class ManyChatError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`ManyChat request failed [${status}]: ${body.slice(0, 300)}`);
    this.name = "ManyChatError";
    this.status = status;
    this.body = body;
  }
}

export function manychatConfigured(): boolean {
  return Boolean(process.env["MANYCHAT_API_KEY"]);
}

async function call<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const apiKey = process.env["MANYCHAT_API_KEY"];
  if (!apiKey) throw new Error("MANYCHAT_API_KEY is not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new ManyChatError(res.status, text);
    let parsed: unknown = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      throw new ManyChatError(res.status, "Unreadable response body");
    }
    // ManyChat reports some failures inside a 200 body.
    const status = (parsed as { status?: string }).status;
    if (status && status !== "success") {
      throw new ManyChatError(res.status, text);
    }
    return parsed as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface ManyChatSubscriber {
  id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
}

/** Looks a customer up by phone number (digits only, no plus). */
export async function findSubscriberByPhone(
  phone: string,
): Promise<ManyChatSubscriber | null> {
  try {
    const out = await call<{ data?: ManyChatSubscriber | ManyChatSubscriber[] | null }>(
      `/fb/subscriber/findBySystemField?phone=${encodeURIComponent(phone)}`,
      { method: "GET" },
    );
    const data = out.data;
    const found = Array.isArray(data) ? data[0] : data;
    return found && found.id ? { ...found, id: String(found.id) } : null;
  } catch (err) {
    if (err instanceof ManyChatError && err.status === 404) return null;
    throw err;
  }
}

/** Runs an approved ManyChat flow for one subscriber (template-safe path). */
export async function sendFlow(subscriberId: string, flowNs: string): Promise<void> {
  await call("/fb/sending/sendFlow", {
    method: "POST",
    body: { subscriber_id: subscriberId, flow_ns: flowNs },
  });
}

/**
 * Sends a plain WhatsApp text through ManyChat. Only valid inside the 24-hour
 * customer service window; outside it, use an approved flow instead.
 */
export async function sendText(subscriberId: string, text: string): Promise<void> {
  await call("/fb/sending/sendContent", {
    method: "POST",
    body: {
      subscriber_id: subscriberId,
      data: {
        version: "v2",
        content: {
          type: "whatsapp",
          messages: [{ type: "text", text }],
        },
      },
      message_tag: "ACCOUNT_UPDATE",
    },
  });
}
